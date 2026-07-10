"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, Camera, CheckCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { useKioskFlow } from "@/features/kiosk-flow";
import { cameraAdapter } from "@/lib/devices/camera";

type FaceStatus = "idle" | "capturing" | "success" | "failed";

export default function RegisterFacePage() {
  const router = useRouter();
  const { dispatch, state } = useKioskFlow();
  const [status, setStatus] = useState<FaceStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const faceCaptured = state.registration.faceCaptured || status === "success";

  const handleCapture = useCallback(async () => {
    if (status === "capturing") return;

    setStatus("capturing");
    setError(null);

    try {
      const result = await cameraAdapter.captureFace();

      if (!result.ok) {
        setStatus("failed");
        setError(result.error);
        return;
      }

      dispatch({ type: "SET_FACE_CAPTURED", captured: true });
      setStatus("success");
    } catch {
      setStatus("failed");
      setError("Kamera tidak merespons. Silakan coba lagi.");
    }
  }, [status, dispatch]);

  return (
    <KioskPage
      progress={{ label: "Pendaftaran", current: 3, total: 5 }}
      showExit
      onExit={() => router.push("/")}
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/register/identity")}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
          end={
            <Button
              size="kiosk"
              disabled={!faceCaptured}
              onClick={() => router.push("/register/password")}
            >
              Lanjutkan
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Verifikasi Wajah
        </h1>

        <p className="max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
          Ambil foto wajah Anda untuk verifikasi identitas. Pastikan wajah
          terlihat jelas dan pencahayaan cukup.
        </p>

        <div className="flex w-full max-w-sm items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface py-16 sm:py-20">
          {faceCaptured ? (
            <span className="flex flex-col items-center gap-3">
              <CheckCircle
                aria-hidden="true"
                className="size-16 text-green-600"
                strokeWidth={1.5}
              />
              <span className="text-base font-bold text-green-700">
                Foto berhasil diambil
              </span>
            </span>
          ) : (
            <Camera
              aria-hidden="true"
              className="size-16 text-muted-foreground/50"
              strokeWidth={1.2}
            />
          )}
        </div>

        {status === "failed" ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="kiosk" onClick={handleCapture}>
              <RefreshCw aria-hidden="true" className="size-5" />
              Coba lagi
            </Button>
          </div>
        ) : (
          <Button
            size="kiosk"
            className="min-w-64 sm:min-w-72"
            disabled={status === "capturing" || faceCaptured}
            onClick={handleCapture}
          >
            {status === "capturing" ? (
              <>Mengambil foto…</>
            ) : (
              <>
                <Camera aria-hidden="true" className="size-5" />
                Ambil foto
              </>
            )}
          </Button>
        )}
      </div>
    </KioskPage>
  );
}
