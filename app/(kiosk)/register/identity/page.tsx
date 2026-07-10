"use client";

import { useEffect } from "react";
import { ArrowLeft, Check, FileEdit, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { useKioskFlow } from "@/features/kiosk-flow";

export default function RegisterIdentityPage() {
  const router = useRouter();
  const { dispatch, state } = useKioskFlow();
  const identity = state.registration.identity;

  useEffect(() => {
    if (!identity) {
      router.replace("/register/fingerprint");
    }
  }, [identity, router]);

  if (!identity) return null;

  const handleCorrect = () => {
    dispatch({ type: "SET_REGISTRATION_SOURCE", source: "manual" });
    router.push("/register/manual");
  };

  return (
    <KioskPage
      progress={{ label: "Pendaftaran", current: 2, total: 5 }}
      showExit
      onExit={() => router.push("/")}
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/register/fingerprint")}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Konfirmasi Data Identitas
        </h1>

        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          Data berikut diperoleh dari data kependudukan. Pastikan data sudah
          sesuai.
        </p>

        <div className="rounded-3xl border border-border bg-background p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <User
                aria-hidden="true"
                className="size-6 text-primary"
                strokeWidth={1.7}
              />
            </span>
            <span className="text-lg font-bold">Data Anggota</span>
          </div>

          <dl className="grid gap-4 sm:gap-5">
            <div className="rounded-xl bg-surface px-4 py-3 sm:px-5 sm:py-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                NIK
              </dt>
              <dd className="mt-1 text-lg font-bold tracking-wide">
                {identity.nik}
              </dd>
            </div>
            <div className="rounded-xl bg-surface px-4 py-3 sm:px-5 sm:py-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nama Lengkap
              </dt>
              <dd className="mt-1 text-lg font-bold">{identity.fullName}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <div className="rounded-xl bg-surface px-4 py-3 sm:px-5 sm:py-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tempat Lahir
                </dt>
                <dd className="mt-1 text-lg font-bold">
                  {identity.birthPlace}
                </dd>
              </div>
              <div className="rounded-xl bg-surface px-4 py-3 sm:px-5 sm:py-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tanggal Lahir
                </dt>
                <dd className="mt-1 text-lg font-bold">
                  {identity.birthDate}
                </dd>
              </div>
            </div>
            <div className="rounded-xl bg-surface px-4 py-3 sm:px-5 sm:py-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alamat
              </dt>
              <dd className="mt-1 text-lg font-bold leading-relaxed">
                {identity.address}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            size="kiosk"
            onClick={handleCorrect}
          >
            <FileEdit aria-hidden="true" className="size-5" />
            Koreksi data
          </Button>
          <Button
            size="kiosk"
            onClick={() => router.push("/register/face")}
          >
            <Check aria-hidden="true" className="size-5" />
            Konfirmasi
          </Button>
        </div>
      </div>
    </KioskPage>
  );
}
