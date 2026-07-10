"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-6">
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
        {/* Simple shape cluster representing building/scale/plant */}
        <div className="flex items-center gap-5" aria-hidden="true">
          <div className="size-16 rounded-2xl border-2 border-primary/30 bg-primary/5 p-3 sm:size-20">
            <div className="h-full w-full rounded-md border border-primary/20" />
          </div>
          <div className="size-16 rounded-full border-2 border-primary/30 bg-primary/5 sm:size-20">
            <div className="mx-auto mt-3 h-1/2 w-3/5 rounded border border-primary/20" />
          </div>
          <div className="size-16 rounded-2xl border-2 border-primary/30 bg-primary/5 p-3 sm:size-20">
            <div className="mx-auto h-3/4 w-2/5 rounded-full border border-primary/20" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-[-0.04em] text-deep-teal sm:text-6xl">
            KLIK-MP
          </h1>
          <p className="mt-3 text-sm font-semibold tracking-[0.12em] text-primary sm:text-base">
            Kios Layanan Intake Komoditas
          </p>
          <p className="mx-auto mt-4 max-w-sm text-balance text-base leading-7 text-muted-foreground sm:text-lg">
            Satu alur untuk identitas, mutu, dan kesepakatan harga
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
