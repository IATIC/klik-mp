"use client";

import { Camera, CheckCircle, LoaderCircle, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type LivenessStatus = "loading" | "detecting" | "success" | "error";

const HOLD_SECONDS = 3;
const DETECTION_FPS = 30;
const REQUIRED_FRAMES = HOLD_SECONDS * DETECTION_FPS;
const FRAME_THROTTLE = 3;
const RESET_AFTER_FRAMES = 10;

export function FaceLivenessDetector({
  onSuccess,
  onError,
  onBack,
}: {
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const faceapiRef = useRef<typeof import("@vladmandic/face-api") | null>(null);
  const mountedRef = useRef(true);
  const detectionStateRef = useRef({
    faceCount: 0,
    lostCount: 0,
    frameCount: 0,
  });
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const [status, setStatus] = useState<LivenessStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(HOLD_SECONDS);
  const [noFace, setNoFace] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      try {
        const tf = await import("@tensorflow/tfjs-core");
        await import("@tensorflow/tfjs-backend-webgl");
        await tf.ready();
        await tf.setBackend("webgl");

        if (!mountedRef.current) return;

        const faceapi = await import("@vladmandic/face-api");
        faceapiRef.current = faceapi;
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models/face-api/");

        if (!mountedRef.current) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });

        if (!mountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (!mountedRef.current) return;
        cleanup();
        const msg =
          err instanceof Error
            ? err.message
            : "Gagal mengakses kamera";
        setErrorMsg(msg);
        setStatus("error");
        onErrorRef.current(msg);
      }
    }

    init();

    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onVideoReady() {
      if (!mountedRef.current) return;
      setStatus("detecting");
      startDetection();
    }

    video.addEventListener("loadeddata", onVideoReady);
    return () => {
      video.removeEventListener("loadeddata", onVideoReady);
      cancelAnimationFrame(rafRef.current);
    };

    function startDetection() {
      async function tick() {
        if (!mountedRef.current) return;

        const faceapi = faceapiRef.current;
        if (!faceapi) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
        });

        const s = detectionStateRef.current;
        s.frameCount++;

        if (s.frameCount % FRAME_THROTTLE !== 0) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        try {
          const detection = await faceapi.detectSingleFace(video, options);

          if (detection) {
            s.faceCount++;
            s.lostCount = 0;

            const pct = Math.min(
              (s.faceCount / REQUIRED_FRAMES) * 100,
              100,
            );
            setProgress(pct);
            setNoFace(false);

            const remaining = Math.max(
              HOLD_SECONDS - Math.floor(s.faceCount / DETECTION_FPS),
              0,
            );
            setCountdown(remaining);

            if (s.faceCount >= REQUIRED_FRAMES) {
              setStatus("success");
              setProgress(100);
              setTimeout(() => onSuccessRef.current(), 600);
              cleanup();
              return;
            }
          } else {
            s.lostCount++;
            if (s.lostCount >= RESET_AFTER_FRAMES) {
              s.faceCount = 0;
              setProgress(0);
              setCountdown(HOLD_SECONDS);
              setNoFace(true);
            }
          }
        } catch {
          /* frame error - skip */
        }

        rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    }
  }, [cleanup]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-80 w-full max-w-md scale-x-[-1] object-cover"
        />

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center text-white">
              <LoaderCircle className="mx-auto size-10 animate-spin" />
              <p className="mt-3 text-sm">Memuat kamera...</p>
            </div>
          </div>
        )}

        {status === "detecting" && noFace && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center text-white">
              <Camera className="mx-auto mb-2 size-12" />
              <p className="text-sm font-medium">
                Arahkan wajah ke kamera
              </p>
            </div>
          </div>
        )}

        {status === "detecting" && !noFace && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
            <div className="overflow-hidden rounded-full bg-white/30">
              <div
                className="h-2 rounded-full bg-teal-400 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-center text-xs font-medium text-white/90">
              Tahan posisi wajah
              {countdown > 0 ? ` ${countdown}...` : ""}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-600/40 backdrop-blur-sm">
            <div className="text-center text-white">
              <CheckCircle className="mx-auto size-16" />
              <p className="mt-2 text-lg font-bold">
                Wajah terverifikasi!
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center text-white">
              <TriangleAlert className="mx-auto mb-2 size-10 text-red-400" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {status === "error" && (
        <Button onClick={onBack} variant="outline" size="kiosk">
          Kembali
        </Button>
      )}
    </div>
  );
}
