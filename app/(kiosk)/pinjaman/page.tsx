"use client";

import { Construction, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";

export default function PinjamanPage() {
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
      <div className="flex h-full flex-col items-center justify-center gap-5 animate-foundation-in">
        <span className="flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Construction aria-hidden="true" className="size-10" />
        </span>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Pinjaman</h1>
        <p className="max-w-md text-center text-lg text-muted-foreground">
          Fitur pinjaman akan segera tersedia.
        </p>
      </div>
    </KioskPage>
  );
}
