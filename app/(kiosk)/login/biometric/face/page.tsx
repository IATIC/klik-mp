"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { useKioskFlow, DEMO_IDENTITY } from "@/features/kiosk-flow";
import { FaceLivenessDetector } from "@/features/identity-membership";
import type { AuthenticatedUser } from "@/features/kiosk-flow";

export default function FaceLoginPage() {
  const router = useRouter();
  const { dispatch } = useKioskFlow();
  const [error, setError] = useState<string | null>(null);

  function handleSuccess() {
    const user: AuthenticatedUser = {
      memberNumber: DEMO_IDENTITY.memberNumber,
      fullName: DEMO_IDENTITY.fullName,
      nikMasked: "3273••••••••0042",
      loginMethod: "face",
    };

    dispatch({ type: "AUTHENTICATE", user });
    router.push("/kiosk");
  }

  function handleError(msg: string) {
    setError(msg);
  }

  function handleBack() {
    router.push("/login/biometric");
  }

  return (
    <KioskPage
      progress={{ label: "Login", current: 1, total: 2 }}
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={handleBack}
            >
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="flex min-h-full flex-col items-center justify-center gap-6 py-8">
        <header className="animate-foundation-in text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Pengenalan Wajah
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Arahkan wajah ke kamera dan tahan selama 3 detik
          </p>
        </header>

        <div className="animate-foundation-in-delayed w-full max-w-md">
          <FaceLivenessDetector
            onSuccess={handleSuccess}
            onError={handleError}
            onBack={handleBack}
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    </KioskPage>
  );
}
