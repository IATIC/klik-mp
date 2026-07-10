"use client";

import { useRouter } from "next/navigation";
import { Fingerprint, KeyRound } from "lucide-react";

import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { LargeActionCard } from "@/components/kiosk/large-action-card";
import { Button } from "@/components/ui/button";

export default function LoginMethodPage() {
  const router = useRouter();

  return (
    <KioskPage showExit onExit={() => router.push("/")}>
      <div className="flex min-h-full flex-col items-center justify-center gap-10 py-12">
        <header className="animate-foundation-in text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Login</h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Pilih metode masuk
          </p>
        </header>

        <div className="animate-foundation-in-delayed flex w-full max-w-2xl gap-6">
          <LargeActionCard
            icon={Fingerprint}
            title="Sidik Jari / Wajah"
            description="Cepat tanpa perlu menghafal kata sandi"
            href="/login/biometric"
            accent
          />
          <LargeActionCard
            icon={KeyRound}
            title="Akun & Kata Sandi"
            description="Gunakan NIK atau nomor anggota"
            href="/login/manual"
          />
        </div>
      </div>

      <KioskFooterActions
        start={
          <Button
            variant="outline"
            size="kiosk"
            onClick={() => router.push("/access")}
          >
            Kembali
          </Button>
        }
      />
    </KioskPage>
  );
}
