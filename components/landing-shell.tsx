"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LogIn, UserPlus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BuildingSketch,
  ScaleSketch,
  PlantSketch,
  HandshakeSketch,
} from "@/components/landing-illustrations";

type View = "welcome" | "choice";

export function LandingShell() {
  const [view, setView] = useState<View>("welcome");

  if (view === "choice") {
    return <ChoiceView onBack={() => setView("welcome")} />;
  }

  return <WelcomeView onStart={() => setView("choice")} />;
}

function WelcomeView({ onStart }: { onStart: () => void }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-surface px-6">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <BuildingSketch className="absolute -left-10 top-10 size-56 text-primary" />
        <ScaleSketch className="absolute -bottom-10 right-0 size-48 text-primary" />
        <PlantSketch className="absolute -top-5 right-10 size-44 text-primary" />
        <HandshakeSketch className="absolute bottom-20 left-6 size-44 text-primary" />
      </div>

      <div className="flex flex-col items-center gap-6 animate-foundation-in">
        <div className="grid grid-cols-3 gap-5">
          <BuildingSketch className="size-28 text-primary" />
          <ScaleSketch className="size-28 text-primary" />
          <PlantSketch className="size-28 text-primary" />
        </div>

        <div className="mt-4 text-center">
          <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            KLIK-MP
          </h1>
          <p className="mt-3 max-w-sm text-balance text-base leading-7 text-muted-foreground">
            Satu alur untuk identitas, mutu, dan kesepakatan harga
            dalam layanan intake komoditas koperasi.
          </p>
        </div>
      </div>

      <div className="mt-14 animate-foundation-in-delayed">
        <Button
          size="lg"
          onClick={onStart}
          className="gap-3 rounded-2xl px-10 py-7 text-lg"
        >
          Mulai
          <ArrowRight aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </main>
  );
}

function ChoiceView({ onBack }: { onBack: () => void }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-surface px-6">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <BuildingSketch className="absolute left-6 top-10 size-48 text-primary" />
        <HandshakeSketch className="absolute -right-4 top-28 size-52 text-primary" />
        <PlantSketch className="absolute -bottom-6 left-16 size-44 text-primary" />
        <ScaleSketch className="absolute bottom-10 right-10 size-44 text-primary" />
        <ScaleSketch className="absolute left-1/3 top-1/3 size-36 -translate-x-1/2 -translate-y-1/2 text-primary" />
        <BuildingSketch className="absolute right-1/4 top-2/3 size-40 text-primary" />
      </div>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-10">
        <div className="text-center animate-foundation-in">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Selamat datang
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">
            Bagaimana Anda ingin melanjutkan?
          </h2>
        </div>

        <div className="grid w-full grid-cols-2 gap-5 animate-foundation-in-delayed">
          <Link
            href="/register"
            className="group flex flex-col items-center justify-center gap-5 rounded-2xl bg-primary px-6 py-20 text-primary-foreground shadow-sm outline-none transition-all hover:brightness-110 focus-visible:ring-4 focus-visible:ring-primary/50"
          >
            <UserPlus
              aria-hidden="true"
              className="size-12 transition-transform group-hover:scale-110"
            />
            <div className="text-center">
              <p className="text-3xl font-bold tracking-[-0.03em]">Register</p>
              <p className="mt-2 text-sm text-white/72">Buat akun baru</p>
            </div>
          </Link>
          <Link
            href="/login"
            className="group flex flex-col items-center justify-center gap-5 rounded-2xl bg-primary px-6 py-20 text-primary-foreground shadow-sm outline-none transition-all hover:brightness-110 focus-visible:ring-4 focus-visible:ring-primary/50"
          >
            <LogIn
              aria-hidden="true"
              className="size-12 transition-transform group-hover:scale-110"
            />
            <div className="text-center">
              <p className="text-3xl font-bold tracking-[-0.03em]">Login</p>
              <p className="mt-2 text-sm text-white/72">Masuk ke akun</p>
            </div>
          </Link>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-4 transition-transform group-hover:-translate-x-0.5"
          />
          Kembali
        </button>
      </div>
    </main>
  );
}
