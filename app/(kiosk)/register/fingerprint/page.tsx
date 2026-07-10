"use client";

import { useCallback, useState } from "react";
import { Fingerprint, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DeviceStatus } from "@/components/kiosk/device-status";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { useKioskFlow } from "@/features/kiosk-flow";
import { fingerprintAdapter } from "@/lib/devices/fingerprint";
import { dukcapilAdapter } from "@/lib/services/mock-dukcapil";

type ScannerStatus = "idle" | "reading" | "success" | "failed";

export default function RegisterFingerprintPage() {
  const router = useRouter();
  const { dispatch } = useKioskFlow();
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    if (status === "reading") return;

    setStatus("reading");
    setError(null);

    try {
      const scanResult = await fingerprintAdapter.scan();

      if (scanResult.status === "failed") {
        setStatus("failed");
        setError(scanResult.error ?? "Sidik jari tidak terbaca.");
        return;
      }

      dispatch({ type: "SET_FINGERPRINT_VERIFIED", verified: true });
      setStatus("success");

      const lookupResult = await dukcapilAdapter.lookupByFingerprint(
        scanResult.reference ?? "mock-fingerprint-0042",
      );

      if (lookupResult.status === "found") {
        dispatch({
          type: "SET_REGISTRATION_IDENTITY",
          identity: lookupResult.identity,
          source: "dukcapil",
        });
        router.push("/register/identity");
      } else {
        router.push("/register/manual");
      }
    } catch {
      setStatus("failed");
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
  }, [status, dispatch, router]);

  return (
    <KioskPage
      progress={{ label: "Pendaftaran", current: 1, total: 5 }}
      showExit
      onExit={() => router.push("/")}
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/access")}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-6 text-center">
        <span className="flex size-28 items-center justify-center rounded-full bg-primary/10 sm:size-36">
          <Fingerprint
            aria-hidden="true"
            className="size-14 text-primary sm:size-20"
            strokeWidth={1.5}
          />
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Verifikasi Sidik Jari
        </h1>

        <p className="max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
          Tempelkan jari telunjuk Anda pada pemindai sidik jari untuk memulai
          pendaftaran. Pastikan jari dalam keadaan bersih dan kering.
        </p>

        <DeviceStatus
          status={status}
          label={
            status === "idle"
              ? "Pemindai siap"
              : status === "reading"
                ? "Memindai sidik jari…"
                : status === "success"
                  ? "Sidik jari terverifikasi"
                  : "Pemindaian gagal"
          }
          detail={error ?? undefined}
        />

        <Button
          size="kiosk"
          className="min-w-64 text-base sm:min-w-72 sm:text-lg"
          disabled={status === "reading" || status === "success"}
          onClick={handleScan}
        >
          {status === "reading" ? "Memindai…" : "Mulai pemindaian"}
        </Button>

        {status === "failed" ? (
          <p className="text-sm text-muted-foreground">
            Bersihkan jari atau gunakan jari lain, lalu coba lagi.
          </p>
        ) : null}
      </div>
    </KioskPage>
  );
}
