"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { useKioskFlow, DEMO_CREDENTIALS } from "@/features/kiosk-flow";

export default function RegisterSuccessPage() {
  const router = useRouter();
  const { state } = useKioskFlow();
  const identity = state.registration.identity;

  const displayName = identity?.fullName ?? DEMO_CREDENTIALS.account;
  const memberNumber = identity?.memberNumber ?? DEMO_CREDENTIALS.memberNumber;
  const nik = identity?.nik ?? DEMO_CREDENTIALS.account;

  return (
    <KioskPage
      progress={{ label: "Pendaftaran", current: 5, total: 5 }}
      showExit
      onExit={() => router.push("/")}
      footer={
        <KioskFooterActions
          end={
            <Button
              size="kiosk"
              className="min-w-48 sm:min-w-56"
              onClick={() => router.push("/login")}
            >
              Masuk
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-6 text-center">
        <span className="flex size-28 items-center justify-center rounded-full bg-[#25D366]/10 sm:size-36">
          <CheckCircle2
            aria-hidden="true"
            className="size-14 sm:size-20"
            strokeWidth={1.5}
            style={{ color: "#25D366" }}
          />
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Pendaftaran berhasil!
        </h1>

        <div className="rounded-3xl border border-border bg-background p-6 text-left sm:p-8">
          <dl className="grid gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nama Anggota
              </dt>
              <dd className="mt-0.5 text-lg font-bold">{displayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nomor Anggota
              </dt>
              <dd className="mt-0.5 text-lg font-bold tracking-wide">
                {memberNumber}
              </dd>
            </div>
          </dl>
        </div>

        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          Silakan gunakan akun yang sudah dibuat untuk masuk.
        </p>

        <div className="w-full rounded-3xl border border-accent-green/30 bg-accent-green/5 p-6 text-left sm:p-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-accent-green">
            Akun Demo
          </p>
          <dl className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-muted-foreground">NIK</dt>
              <dd className="font-mono font-bold">{nik}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-muted-foreground">Password</dt>
              <dd className="font-mono font-bold">{DEMO_CREDENTIALS.password}</dd>
            </div>
          </dl>
        </div>
      </div>
    </KioskPage>
  );
}
