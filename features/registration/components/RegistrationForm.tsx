"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registrationSchema } from "../schemas/registration";
import { registerUser, lookupNIK } from "../actions/register";
import { FingerprintButton } from "./FingerprintButton";

const KOPERASI_INFO =
  process.env.NEXT_PUBLIC_KOPERASI_INFO ??
  "Koperasi Desa Kebonturi, Kecamatan Arjawinangun, Kabupaten Cirebon, Jawa Barat";

export function RegistrationForm() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dukcapilAutoFill, setDukcapilAutoFill] = useState(false);
  const [namaDisabled, setNamaDisabled] = useState(false);
  const [nikLookupLoading, setNikLookupLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleFingerprintScan = useCallback(async () => {
    const demoNIK = "3201123456789012";
    setNik(demoNIK);
    setNikLookupLoading(true);

    const result = await lookupNIK(demoNIK);
    if (result) {
      setNamaLengkap(result.namaLengkap);
      setNamaDisabled(true);
      setDukcapilAutoFill(true);
    }
    setNikLookupLoading(false);
  }, []);

  const handleNIKChange = useCallback(
    async (value: string) => {
      setNik(value);
      if (value.length === 16 && /^\d{16}$/.test(value)) {
        setNikLookupLoading(true);
        const result = await lookupNIK(value);
        if (result) {
          setNamaLengkap(result.namaLengkap);
          setNamaDisabled(true);
          setDukcapilAutoFill(true);
        } else {
          setNamaDisabled(false);
          setDukcapilAutoFill(false);
        }
        setNikLookupLoading(false);
      } else {
        setNamaDisabled(false);
        setDukcapilAutoFill(false);
      }
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = registrationSchema.safeParse({
      nik,
      namaLengkap,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.set("nik", nik);
    formData.set("namaLengkap", namaLengkap);
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);

    const result = await registerUser(formData);

    if (!result.ok) {
      setError(result.error);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      setSubmitting(false);
      return;
    }

    router.push("/login");
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex h-full flex-col"
    >
      <div className="shrink-0">
        <div className="flex flex-col items-center gap-3">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary">
            <UserPlus aria-hidden="true" className="size-8 text-primary-foreground" />
          </span>
          <h1 className="text-3xl font-bold tracking-[-0.03em]">
            Daftar Akun Baru
          </h1>
          <p className="text-base text-muted-foreground">
            Isi data diri untuk membuat akun e-Kiosk
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-6 overflow-y-auto py-6"
      >
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-base font-medium text-destructive"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="nik"
            className="mb-2 block text-base font-semibold"
          >
            NIK
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                id="nik"
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={nik}
                onChange={(e) => handleNIKChange(e.target.value)}
                placeholder="16 digit nomor induk kependudukan"
                className="w-full rounded-xl border border-border bg-background px-5 py-4 text-base outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/10"
                autoComplete="off"
              />
              {nikLookupLoading && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <Loader2
                    aria-hidden="true"
                    className="size-5 animate-spin text-muted-foreground"
                  />
                </div>
              )}
            </div>
            <div className="sm:w-56">
              <FingerprintButton onScan={handleFingerprintScan} />
            </div>
          </div>
          {dukcapilAutoFill && (
            <p className="mt-2 text-sm text-accent-green">
              Data ditemukan di Dukcapil
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="namaLengkap"
            className="mb-2 block text-base font-semibold"
          >
            Nama Lengkap
          </label>
          <input
            id="namaLengkap"
            type="text"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            placeholder="Nama sesuai KTP"
            disabled={namaDisabled}
            className="w-full rounded-xl border border-border bg-background px-5 py-4 text-base outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
            autoComplete="name"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-base font-semibold"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-xl border border-border bg-background px-5 py-4 pr-12 text-base outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-base font-semibold"
          >
            Konfirmasi Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password"
            className="w-full rounded-xl border border-border bg-background px-5 py-4 text-base outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/10"
            autoComplete="new-password"
          />
        </div>

        <div>
          <span className="mb-2 block text-base font-semibold">
            Informasi Koperasi
          </span>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-surface/50 px-5 py-4">
            <Building2
              aria-hidden="true"
              className="mt-0.5 size-6 shrink-0 text-primary"
            />
            <p className="text-base leading-7 text-muted-foreground">
              {KOPERASI_INFO}
            </p>
          </div>
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
          {submitting ? "Mendaftarkan…" : "Daftar"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </form>
  );
}
