"use client";

import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { useKioskFlow } from "@/features/kiosk-flow";
import { FaceLivenessDetector } from "@/features/identity-membership";

export default function RegisterFacePage() {
  const router = useRouter();
  const { dispatch, state } = useKioskFlow();
  const [captured, setCaptured] = useState(state.registration.faceCaptured);
  const [error, setError] = useState<string | null>(null);

  function handleSuccess() {
    dispatch({ type: "SET_FACE_CAPTURED", captured: true });
    setCaptured(true);
  }

  function handleError(msg: string) {
    setError(msg);
  }

  function handleBack() {
    router.push("/register/identity");
  }

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
              onClick={handleBack}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
          end={
            <Button
              size="kiosk"
              disabled={!captured}
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
          Arahkan wajah ke kamera dan tahan selama 3 detik untuk verifikasi
          identitas.
        </p>

        {captured ? (
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border-2 border-green-200 bg-green-50 py-16 sm:py-20">
            <CheckCircle
              aria-hidden="true"
              className="size-16 text-green-600"
              strokeWidth={1.5}
            />
            <span className="text-base font-bold text-green-700">
              Foto berhasil diambil
            </span>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <FaceLivenessDetector
              onSuccess={handleSuccess}
              onError={handleError}
              onBack={handleBack}
            />
          </div>
        )}

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}
      </div>
    </KioskPage>
  );
}
