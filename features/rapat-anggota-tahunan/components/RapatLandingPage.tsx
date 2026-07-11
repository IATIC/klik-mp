"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, FileText } from "lucide-react";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { LargeActionCard } from "@/components/kiosk/large-action-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function RapatLandingPage() {
  const router = useRouter();

  return (
    <KioskPage
      footer={
        <KioskFooterActions
          start={
            <Button variant="outline" size="kiosk" onClick={() => router.push("/kiosk")}>
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="flex h-full flex-col items-center justify-center gap-8 animate-foundation-in">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Rapat Anggota Tahunan</h1>
          <p className="mt-2 text-muted-foreground">Pilih salah satu opsi di bawah</p>
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-5 sm:flex-row">
          <LargeActionCard
            title="Konfirmasi Kehadiran"
            description="Konfirmasi kehadiran Anda dalam RAT"
            href="/erat/kehadiran"
            icon={CalendarCheck}
            accent
          />
          <LargeActionCard
            title="Akses Laporan Rapat"
            description="Lihat laporan keuangan, LPJ, dan dokumen RAT"
            href="/erat/laporan"
            icon={FileText}
          />
        </div>
      </div>
    </KioskPage>
  );
}
