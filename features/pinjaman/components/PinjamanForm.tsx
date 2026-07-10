"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  HandCoins, ArrowLeft, Loader2, CheckCircle2,
  Fingerprint, ScanFace, ShieldCheck, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { pinjamanSchema } from "../schemas/pinjaman";
import { ajukanPinjaman } from "../actions/pinjaman";
import type { PinjamanRecord } from "../types/pinjaman";

const TENOR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

type Step = "form" | "verify" | "success";

function formatRupiah(value: string): string {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

function unformatRupiah(value: string): string {
  return value.replace(/\D/g, "");
}

type PinjamanFormProps = {
  nik: string;
  namaLengkap: string;
  onBack: () => void;
};

export function PinjamanForm({ nik, namaLengkap, onBack }: PinjamanFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [jumlahDisplay, setJumlahDisplay] = useState("");
  const [tenor, setTenor] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<PinjamanRecord | null>(null);
  const [biometricStep, setBiometricStep] = useState<"idle" | "fingerprint" | "face" | "done">("idle");

  const jumlahRaw = unformatRupiah(jumlahDisplay);
  const jumlahNumber = jumlahRaw ? Number(jumlahRaw) : 0;

  const handleJumlahChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 8) return;
    setJumlahDisplay(formatRupiah(digits));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = pinjamanSchema.safeParse({
      jumlah: jumlahNumber,
      tenor: tenor ? Number(tenor) : undefined,
      tujuan: tujuan.trim(),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);

    const result = await ajukanPinjaman({
      jumlah: parsed.data.jumlah,
      tenor: parsed.data.tenor,
      tujuan: parsed.data.tujuan,
      nik,
      namaLengkap,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setRecord(result.record);
    setSubmitting(false);
    setStep("verify");
  };

  const handleVerification = async () => {
    setError(null);
    setBiometricStep("fingerprint");
    await new Promise((r) => setTimeout(r, 1200));
    setBiometricStep("face");
    await new Promise((r) => setTimeout(r, 1200));
    setBiometricStep("done");
    await new Promise((r) => setTimeout(r, 600));
    setStep("success");
  };

  function BiometricCard({
    icon: Icon,
    label,
    description,
    status,
  }: {
    icon: typeof Fingerprint;
    label: string;
    description: string;
    status: "idle" | "scanning" | "success";
  }) {
    const isScanning = status === "scanning";
    const isSuccess = status === "success";
    return (
      <div
        className={`flex flex-col items-center gap-4 rounded-2xl border bg-white p-8 transition-all duration-500 ${
          isScanning
            ? "border-primary shadow-lg shadow-primary/10 scale-105"
            : isSuccess
              ? "border-green-300 bg-green-50/50"
              : "border-border"
        }`}
      >
        <span
          className={`flex size-16 items-center justify-center rounded-full transition-all duration-500 ${
            isScanning
              ? "bg-primary/10 text-primary"
              : isSuccess
                ? "bg-green-100 text-green-700"
                : "bg-surface text-muted-foreground"
          }`}
        >
          {isSuccess ? (
            <Check aria-hidden="true" className="size-8" strokeWidth={2.5} />
          ) : (
            <Icon
              aria-hidden="true"
              className={`size-8 ${isScanning ? "animate-pulse" : ""}`}
            />
          )}
        </span>
        <div className="text-center">
          <p className="text-lg font-bold">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {isScanning && (
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Memindai…
          </span>
        )}
        {isSuccess && (
          <span className="flex items-center gap-2 text-sm font-semibold text-green-700">
            <Check aria-hidden="true" className="size-4" />
            Sesuai
          </span>
        )}
      </div>
    );
  }

  function getCardStatus(target: "fingerprint" | "face"): "idle" | "scanning" | "success" {
    const order = ["fingerprint", "face", "done"];
    const currentIdx = order.indexOf(biometricStep);
    const targetIdx = order.indexOf(target);
    if (targetIdx < currentIdx) return "success";
    if (targetIdx === currentIdx) return "scanning";
    return "idle";
  }

  if (step === "verify" && record) {
    const isRunning = biometricStep !== "idle";
    return (
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center gap-8 animate-foundation-in">
        <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck aria-hidden="true" className="size-10" />
        </span>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Verifikasi Identitas</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Konfirmasi identitas Anda sebelum pengajuan diproses
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="w-full rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-base font-medium text-destructive"
          >
            {error}
          </div>
        )}

        <div className="grid w-full gap-6 sm:grid-cols-2">
          <BiometricCard
            icon={Fingerprint}
            label="Sidik Jari"
            description="Tempelkan jari pada pemindai"
            status={getCardStatus("fingerprint")}
          />
          <BiometricCard
            icon={ScanFace}
            label="Wajah"
            description="Arahkan wajah ke kamera"
            status={getCardStatus("face")}
          />
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3">
          {biometricStep === "done" ? (
            <Button size="kiosk" disabled>
              <CheckCircle2 aria-hidden="true" className="size-5" />
              Verifikasi Berhasil
            </Button>
          ) : (
            <Button
              size="kiosk"
              onClick={handleVerification}
              disabled={isRunning}
            >
              {isRunning && (
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              )}
              {isRunning ? "Memverifikasi…" : "Mulai Verifikasi"}
            </Button>
          )}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="kiosk"
              type="button"
              disabled={isRunning}
              onClick={() => { setStep("form"); setBiometricStep("idle"); }}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success" && record) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 animate-foundation-in">
        <span className="flex size-20 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 aria-hidden="true" className="size-10" />
        </span>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Pengajuan Terkirim</h1>
        <div className="w-full max-w-lg space-y-3 rounded-2xl border border-border bg-white p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className="block text-sm text-muted-foreground">Jumlah Pinjaman</span>
              <span className="text-lg font-bold">Rp{new Intl.NumberFormat("id-ID").format(record.jumlah)}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Tenor</span>
              <span className="text-lg font-bold">{record.tenor} bulan</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Status</span>
              <span className="text-lg font-bold capitalize text-amber-600">{record.status}</span>
            </div>
          </div>
        </div>
        <p className="text-center text-base text-muted-foreground">
          Pengajuan pinjaman akan diproses oleh pihak koperasi.
        </p>
        <Button size="kiosk" onClick={() => router.push("/kiosk")}>
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex h-full w-full max-w-2xl flex-col"
    >
      <div className="shrink-0">
        <div className="flex flex-col items-center gap-3">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary">
            <HandCoins aria-hidden="true" className="size-8 text-primary-foreground" />
          </span>
          <h1 className="text-3xl font-bold tracking-[-0.03em]">
            Ajukan Pinjaman
          </h1>
          <p className="text-base text-muted-foreground">
            Isi data pengajuan pinjaman koperasi
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-base font-medium text-destructive"
          >
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="jumlah" className="mb-2 block text-base font-semibold">
              Jumlah Pinjaman
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                Rp
              </span>
              <input
                id="jumlah"
                type="text"
                inputMode="numeric"
                value={jumlahDisplay}
                onChange={(e) => handleJumlahChange(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-background px-5 py-4 pl-12 text-base outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/10"
                autoComplete="off"
              />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Maksimal Rp20.000.000
            </p>
          </div>

          <div>
            <label htmlFor="tenor" className="mb-2 block text-base font-semibold">
              Tenor Pinjaman
            </label>
            <select
              id="tenor"
              value={tenor}
              onChange={(e) => setTenor(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-5 py-4 text-base outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/10"
            >
              <option value="">Pilih tenor</option>
              {TENOR_OPTIONS.map((bulan) => (
                <option key={bulan} value={bulan}>
                  {bulan} bulan
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="tujuan" className="mb-2 block text-base font-semibold">
            Tujuan Pinjaman
          </label>
          <textarea
            id="tujuan"
            value={tujuan}
            onChange={(e) => setTujuan(e.target.value)}
            placeholder="Contoh: Modal usaha ternak, biaya pendidikan, renovasi rumah"
            rows={4}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-border bg-background px-5 py-4 text-base outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/10"
          />
          <p className="mt-1.5 text-right text-sm text-muted-foreground">
            {tujuan.length}/500
          </p>
        </div>
      </div>

      <div className="shrink-0 space-y-3 pt-2">
        <Button
          type="submit"
          className="w-full rounded-xl py-6 text-lg"
          size="lg"
          disabled={submitting}
        >
          {submitting && (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          )}
          {submitting ? "Mengirim…" : "Ajukan Pinjaman"}
        </Button>

        <div className="flex justify-center">
          <Button variant="outline" size="kiosk" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" className="size-5" />
            Kembali
          </Button>
        </div>
      </div>
    </form>
  );
}
