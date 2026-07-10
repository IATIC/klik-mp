"use client";

import { Camera, CheckCircle2, RefreshCw, Scale, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { createCommodityCapture } from "../services/create-commodity-capture";
import {
  PHOTO_QUALITY_MESSAGES,
  validatePhotoQuality,
} from "../services/photo-quality";
import { readWeightSnapshot } from "../services/weight";
import type {
  CameraAdapter,
  CapturedPhoto,
  CommodityCapture,
  ScaleAdapter,
  WeightSnapshot,
} from "../types/commodity-capture";

type CaptureStep =
  | "idle"
  | "connecting"
  | "ready"
  | "reading"
  | "capturing"
  | "validation_error"
  | "saving"
  | "success"
  | "error";

export type CommodityCapturePanelProps = {
  scaleAdapter: ScaleAdapter;
  cameraAdapter: CameraAdapter;
  onCaptured?: (capture: CommodityCapture) => void;
  createCaptureId?: () => string;
};

function defaultCaptureId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `capture-${Date.now()}`;
}

function readableError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Terjadi kendala yang tidak diketahui. Silakan coba lagi.";
}

export function CommodityCapturePanel({
  scaleAdapter,
  cameraAdapter,
  onCaptured,
  createCaptureId = defaultCaptureId,
}: CommodityCapturePanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState<CaptureStep>("idle");
  const [weights, setWeights] = useState<WeightSnapshot | null>(null);
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [capture, setCapture] = useState<CommodityCapture | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const busy = ["connecting", "reading", "capturing", "saving"].includes(step);

  useEffect(
    () => () => {
      void Promise.allSettled([
        scaleAdapter.disconnect(),
        cameraAdapter.stop(),
      ]);
    },
    [cameraAdapter, scaleAdapter],
  );

  async function activateDevices() {
    if (!videoRef.current) return;
    setMessage(null);
    setStep("connecting");

    try {
      await Promise.all([
        scaleAdapter.connect(),
        cameraAdapter.startPreview(videoRef.current),
      ]);
      setStep("ready");
    } catch (error) {
      await Promise.allSettled([
        scaleAdapter.disconnect(),
        cameraAdapter.stop(),
      ]);
      setMessage(readableError(error));
      setStep("error");
    }
  }

  async function readWeight() {
    setMessage(null);
    setStep("reading");
    try {
      setWeights(await readWeightSnapshot(scaleAdapter));
      setStep("ready");
    } catch (error) {
      setMessage(readableError(error));
      setStep("error");
    }
  }

  async function capturePhoto() {
    setMessage(null);
    setStep("capturing");
    try {
      const nextPhoto = await cameraAdapter.capture();
      const quality = validatePhotoQuality(nextPhoto);
      setPhoto(nextPhoto);

      if (!quality.valid) {
        setMessage(
          quality.issues.map((issue) => PHOTO_QUALITY_MESSAGES[issue]).join(" "),
        );
        setStep("validation_error");
        return;
      }

      setStep("ready");
    } catch (error) {
      setMessage(readableError(error));
      setStep("error");
    }
  }

  function finishCapture() {
    if (!weights || !photo) return;
    setMessage(null);
    setStep("saving");

    try {
      const result = createCommodityCapture({
        captureId: createCaptureId(),
        grossWeight: weights.grossWeight,
        tareWeight: weights.tareWeight,
        photo,
        capturedAt: new Date().toISOString(),
      });
      setCapture(result);
      setStep("success");
      onCaptured?.(result);
    } catch (error) {
      setMessage(readableError(error));
      setStep("error");
    }
  }

  function startAgain() {
    setWeights(null);
    setPhoto(null);
    setCapture(null);
    setMessage(null);
    setStep("ready");
  }

  return (
    <section
      aria-labelledby="commodity-capture-title"
      className="overflow-hidden rounded-2xl border border-border bg-background"
    >
      <header className="border-b border-border bg-surface px-5 py-5 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Tahap penangkapan data
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="commodity-capture-title"
              className="text-xl font-bold text-foreground"
            >
              Timbang dan foto komoditas
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pastikan kemasan stabil di timbangan dan seluruh permukaan komoditas
              terlihat jelas.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            {step === "success" ? "Data siap" : "Belum disimpan"}
          </span>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-h-72 bg-[#082f3a] p-4 sm:p-6">
          <video
            ref={videoRef}
            aria-label="Pratinjau kamera komoditas"
            className="aspect-video h-full max-h-[430px] w-full rounded-xl bg-black/30 object-cover"
            autoPlay
            muted
            playsInline
          />
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <Camera aria-hidden="true" className="size-4" /> Kamera komoditas
            </span>
            {photo ? `${photo.metrics.width} × ${photo.metrics.height} px` : "Menunggu foto"}
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-7">
          {step === "success" && capture ? (
            <div className="flex flex-1 flex-col justify-between gap-8" role="status">
              <div>
                <CheckCircle2 className="size-9 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  Data komoditas siap dilanjutkan
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Bukti berat dan foto telah lolos validasi lokal.
                </p>
                <dl className="mt-6 divide-y divide-border border-y border-border">
                  <WeightRow label="Gross" value={capture.grossWeight} />
                  <WeightRow label="Tare" value={capture.tareWeight} />
                  <WeightRow label="Net" value={capture.netWeight} emphasized />
                </dl>
              </div>
              <Button type="button" variant="outline" onClick={startAgain}>
                <RefreshCw aria-hidden="true" /> Ambil ulang
              </Button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                <Scale className="size-5 text-primary" aria-hidden="true" />
                Hasil timbangan
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <WeightMetric label="Gross" value={weights?.grossWeight} />
                <WeightMetric label="Tare" value={weights?.tareWeight} />
                <WeightMetric label="Net" value={weights?.netWeight} emphasized />
              </dl>

              {message ? (
                <div
                  role="alert"
                  className="mt-5 flex gap-3 rounded-lg border border-error/30 bg-error/5 p-3 text-sm leading-5 text-error"
                >
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {message}
                </div>
              ) : null}

              <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
                {step === "idle" || step === "error" || step === "connecting" ? (
                  <Button
                    type="button"
                    className="sm:col-span-2"
                    disabled={busy}
                    onClick={activateDevices}
                  >
                    {step === "connecting" ? "Menghubungkan…" : "Aktifkan perangkat"}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={readWeight}
                    >
                      <Scale aria-hidden="true" />
                      {step === "reading" ? "Membaca…" : "Baca berat"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={capturePhoto}
                    >
                      <Camera aria-hidden="true" />
                      {step === "capturing" ? "Mengambil…" : photo ? "Ambil ulang foto" : "Ambil foto"}
                    </Button>
                    <Button
                      type="button"
                      className="sm:col-span-2"
                      disabled={busy || !weights || !photo || step === "validation_error"}
                      onClick={finishCapture}
                    >
                      {step === "saving" ? "Memvalidasi…" : "Simpan hasil penangkapan"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WeightMetric({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value?: number;
  emphasized?: boolean;
}) {
  return (
    <div className={emphasized ? "rounded-lg bg-primary p-3 text-white" : "rounded-lg bg-surface p-3"}>
      <dt className={emphasized ? "text-xs text-white/75" : "text-xs text-muted-foreground"}>
        {label}
      </dt>
      <dd className="mt-1 text-base font-bold tabular-nums">
        {value === undefined ? "—" : `${value.toFixed(2)} kg`}
      </dd>
    </div>
  );
}

function WeightRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={emphasized ? "font-bold text-primary" : "font-semibold text-foreground"}>
        {value.toFixed(2)} kg
      </dd>
    </div>
  );
}
