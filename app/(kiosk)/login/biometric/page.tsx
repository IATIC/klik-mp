"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, ScanFace } from "lucide-react";

import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { DeviceStatus } from "@/components/kiosk/device-status";
import { Button } from "@/components/ui/button";
import { useKioskFlow, DEMO_IDENTITY } from "@/features/kiosk-flow";
import type { DeviceStatus as DeviceStatusType, AuthenticatedUser } from "@/features/kiosk-flow";
import { fingerprintAdapter } from "@/lib/devices/fingerprint";


type BiometricMode = "fingerprint" | "face";

export default function BiometricLoginPage() {
  const router = useRouter();
  const { dispatch } = useKioskFlow();

  const [scanning, setScanning] = useState(false);
  const [activeMode, setActiveMode] = useState<BiometricMode | null>(null);
  const [fpStatus, setFpStatus] = useState<DeviceStatusType>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFingerprint() {
    setScanning(true);
    setActiveMode("fingerprint");
    setError(null);
    setFpStatus("reading");

    try {
      const result = await fingerprintAdapter.scan();

      if (result.status === "success") {
        setFpStatus("success");

        const user: AuthenticatedUser = {
          memberNumber: DEMO_IDENTITY.memberNumber,
          fullName: DEMO_IDENTITY.fullName,
          nikMasked: "3273••••••••0042",
          loginMethod: "fingerprint",
        };

        dispatch({ type: "AUTHENTICATE", user });
        await new Promise((r) => setTimeout(r, 600));
        router.push("/kiosk");
      } else {
        setFpStatus("failed");
        setError(result.error ?? "Pemindaian sidik jari gagal.");
        setScanning(false);
      }
    } catch {
      setFpStatus("failed");
      setError("Terjadi kesalahan pada pemindai sidik jari.");
      setScanning(false);
    }
  }

  function handleFace() {
    router.push("/login/biometric/face");
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
              onClick={() => router.push("/login")}
            >
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="flex min-h-full flex-col items-center justify-center gap-8 py-8">
        <header className="animate-foundation-in text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Verifikasi Biometrik
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Pilih metode verifikasi
          </p>
        </header>

        <div className="animate-foundation-in-delayed grid w-full max-w-2xl grid-cols-2 gap-6">
          {/* Fingerprint */}
          <button
            type="button"
            onClick={handleFingerprint}
            disabled={scanning && activeMode !== "fingerprint"}
            className={`group flex min-h-52 flex-col items-center justify-center rounded-3xl border-2 p-7 text-center outline-none transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-ring/25 disabled:opacity-40 [&:not(:disabled)]:cursor-pointer ${
              activeMode === "fingerprint" && fpStatus === "reading"
                ? "border-primary bg-primary/5"
                : activeMode === "fingerprint" && fpStatus === "success"
                  ? "border-green-500 bg-green-50"
                  : activeMode === "fingerprint" && fpStatus === "failed"
                    ? "border-destructive bg-destructive/5"
                    : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <Fingerprint
              aria-hidden="true"
              className={`size-14 sm:size-16 ${
                fpStatus === "reading" ? "animate-pulse text-primary" : "text-primary"
              }`}
              strokeWidth={1.7}
            />
            <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">
              Sidik Jari
            </h2>
            <p className="mt-2 max-w-sm text-base leading-6 text-muted-foreground sm:text-lg">
              Tempelkan jari pada pemindai
            </p>
          </button>

          {/* Face */}
          <button
            type="button"
            onClick={handleFace}
            disabled={scanning && activeMode !== "face"}
            className="group flex min-h-52 flex-col items-center justify-center rounded-3xl border-2 border-border bg-background p-7 text-center outline-none transition duration-200 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-ring/25 disabled:opacity-40 [&:not(:disabled)]:cursor-pointer"
          >
            <ScanFace
              aria-hidden="true"
              className="size-14 text-primary sm:size-16"
              strokeWidth={1.7}
            />
            <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">
              Pengenalan Wajah
            </h2>
            <p className="mt-2 max-w-sm text-base leading-6 text-muted-foreground sm:text-lg">
              Arahkan wajah ke kamera
            </p>
          </button>
        </div>

        {/* Device status feedback */}
        <div className="w-full max-w-2xl">
          {activeMode === "fingerprint" && fpStatus !== "idle" ? (
            <div className="animate-foundation-in">
              <DeviceStatus
                status={fpStatus}
                label={
                  fpStatus === "reading"
                    ? "Memindai sidik jari..."
                    : fpStatus === "success"
                      ? "Sidik jari terverifikasi"
                      : "Pemindaian gagal"
                }
                detail={
                  fpStatus === "failed" && error ? error : undefined
                }
              />
            </div>
          ) : null}

        </div>

        {/* Fallback link */}
        {!scanning ? (
          <p className="animate-foundation-in-delayed text-center text-sm text-muted-foreground">
            Tidak bisa menggunakan biometrik?{" "}
            <a
              href="/login/manual"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Masuk dengan akun &amp; kata sandi
            </a>
          </p>
        ) : null}
      </div>
    </KioskPage>
  );
}
