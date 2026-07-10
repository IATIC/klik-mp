"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CalendarCheck } from "lucide-react";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";
import { useKioskFlow } from "@/features/kiosk-flow";

export function RapatKehadiranPage() {
  const router = useRouter();
  const { state } = useKioskFlow();
  const [confirmed, setConfirmed] = useState(false);

  const nama = state.authenticatedUser?.fullName ?? "Anggota Koperasi";

  return (
    <KioskPage
      footer={
        <KioskFooterActions
          start={
            <Button variant="outline" size="kiosk" onClick={() => router.push("/erat")}>
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="flex h-full flex-col items-center justify-center gap-6 animate-foundation-in">
        {!confirmed ? (
          <>
            <span className="flex size-20 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <CalendarCheck aria-hidden="true" className="size-10" />
            </span>
            <div className="text-center">
              <h1 className="text-3xl font-extrabold sm:text-4xl">Konfirmasi Kehadiran</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {nama}, apakah Anda akan hadir pada Rapat Anggota Tahunan?
              </p>
            </div>
            <Button
              size="kiosk"
              className="gap-3 rounded-2xl px-12 text-lg"
              onClick={() => setConfirmed(true)}
            >
              <CheckCircle2 aria-hidden="true" className="size-5" />
              Konfirmasi Kehadiran Saya
            </Button>
          </>
        ) : (
          <>
            <span className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 aria-hidden="true" className="size-10" />
            </span>
            <div className="text-center">
              <h1 className="text-3xl font-extrabold sm:text-4xl">Kehadiran Terkonfirmasi</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Terima kasih, {nama}. Kehadiran Anda telah dicatat.
              </p>
            </div>
          </>
        )}
      </div>
    </KioskPage>
  );
}
