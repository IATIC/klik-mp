"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-green-50 via-white to-green-50 px-6">
      {/* Decorative CSS shapes - no SVGs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-12 size-56 rounded-full border-2 border-primary/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 right-4 size-48 rounded-3xl border-2 border-primary/10 -rotate-12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-12 top-20 size-36 rounded-xl border-2 border-primary/10 rotate-45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-28 left-10 size-28 rounded-full border-2 border-primary/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/3 top-1/4 size-20 rounded-lg border-2 border-primary/5 -rotate-12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 bottom-1/3 size-16 rounded-full border-2 border-primary/5"
      />

      {/* Decorative icon-like shapes in center area */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[15%] top-[30%] hidden size-24 rounded-2xl border-2 border-primary/10 rotate-12 sm:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[18%] top-[28%] hidden size-20 rounded-[2rem] border-2 border-primary/10 -rotate-6 sm:block"
      />

      {/* Content */}
      <div className="flex flex-col items-center gap-4 animate-foundation-in">
        {/* KLIK-MP logo */}
        <Image
          src="/assets/KLIK-MP_logo.png"
          alt="KLIK-MP"
          width={180}
          height={180}
          className="h-auto w-[8.4rem] sm:w-[13.2rem]"
          priority
        />

        <div className="mt-12 text-center">
          <p className="text-sm font-semibold tracking-[0.12em] text-primary sm:text-base">
            Kios Layanan Integrasi Koperasi Merah Putih
          </p>
          <p className="mx-auto mt-4 max-w-sm text-balance text-base leading-7 text-muted-foreground sm:text-lg">
            Anggota mudah. Petugas ringan. Koperasi terintegrasi.
          </p>
        </div>
      </div>

      <div className="mt-14 animate-foundation-in-delayed">
        <Button
          size="kiosk"
          onClick={() => router.push("/access")}
          className="gap-3 rounded-2xl px-12 text-lg"
        >
          Mulai
          <ArrowRight aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </main>
  );
}
