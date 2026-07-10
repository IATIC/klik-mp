"use client";

import Link from "next/link";
import { ChevronLeft, LogIn, UserPlus } from "lucide-react";
import { KioskPage } from "@/components/kiosk/kiosk-page";

export default function AccessPage() {
  return (
    <KioskPage>
      <div className="flex min-h-full flex-col items-center justify-center">
        <div className="flex w-full max-w-2xl flex-col items-center gap-10 py-8">
          {/* Header */}
          <div className="text-center animate-foundation-in">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Selamat datang
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-foreground">
              Bagaimana Anda ingin melanjutkan?
            </h2>
          </div>

          {/* Cards */}
          <div className="grid w-full grid-cols-2 gap-5 animate-foundation-in-delayed">
            <Link
              href="/register/fingerprint"
              className="group flex min-h-52 flex-col items-center justify-center gap-5 rounded-2xl bg-primary px-6 py-14 text-primary-foreground shadow-sm outline-none transition-all hover:brightness-110 focus-visible:ring-4 focus-visible:ring-ring/50"
            >
              <UserPlus
                aria-hidden="true"
                className="size-14 transition-transform group-hover:scale-110"
              />
              <div className="text-center">
                <p className="text-3xl font-extrabold tracking-[-0.03em]">
                  Daftar
                </p>
                <p className="mt-2 text-sm text-white/72">Buat akun baru</p>
              </div>
            </Link>

            <Link
              href="/login"
              className="group flex min-h-52 flex-col items-center justify-center gap-5 rounded-2xl bg-primary px-6 py-14 text-primary-foreground shadow-sm outline-none transition-all hover:brightness-110 focus-visible:ring-4 focus-visible:ring-ring/50"
            >
              <LogIn
                aria-hidden="true"
                className="size-14 transition-transform group-hover:scale-110"
              />
              <div className="text-center">
                <p className="text-3xl font-extrabold tracking-[-0.03em]">
                  Masuk
                </p>
                <p className="mt-2 text-sm text-white/72">Sudah punya akun</p>
              </div>
            </Link>
          </div>

          {/* Back button */}
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/30"
          >
            <ChevronLeft
              aria-hidden="true"
              className="size-4 transition-transform group-hover:-translate-x-0.5"
            />
            Kembali
          </Link>
        </div>
      </div>
    </KioskPage>
  );
}
