"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { useKioskFlow, validatePassword } from "@/features/kiosk-flow";

export default function RegisterPasswordPage() {
  const router = useRouter();
  const { dispatch, state } = useKioskFlow();
  const identity = state.registration.identity;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validationErrors = validatePassword(password, confirmPassword, identity);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      setSubmitting(false);
      return;
    }

    dispatch({ type: "COMPLETE_REGISTRATION" });
    router.push("/register/success");
  };

  return (
    <KioskPage
      progress={{ label: "Pendaftaran", current: 4, total: 5 }}
      showExit
      onExit={() => router.push("/")}
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/register/face")}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-xl flex-col justify-center gap-6">
        <div className="text-center">
          <span className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10 sm:size-24">
            <Lock
              aria-hidden="true"
              className="size-10 text-primary sm:size-12"
              strokeWidth={1.5}
            />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Buat Kata Sandi
          </h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground sm:text-lg">
            Buat kata sandi untuk melindungi akun Anda.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-border bg-background p-6 sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-bold"
              >
                Buat kata sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors([]);
                  }}
                  placeholder="Minimal 8 karakter"
                  className="flex h-14 w-full rounded-xl border border-border bg-surface pr-14 pl-4 text-base font-medium outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20 disabled:opacity-50"
                  disabled={submitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  tabIndex={-1}
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
                className="mb-1.5 block text-sm font-bold"
              >
                Ulangi kata sandi
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors([]);
                  }}
                  placeholder="Masukkan ulang kata sandi"
                  className="flex h-14 w-full rounded-xl border border-border bg-surface pr-14 pl-4 text-base font-medium outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20 disabled:opacity-50"
                  disabled={submitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
                  aria-label={showConfirm ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff aria-hidden="true" className="size-5" />
                  ) : (
                    <Eye aria-hidden="true" className="size-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {errors.length > 0 ? (
            <ul className="mt-4 space-y-1 rounded-xl bg-destructive/5 p-4">
              {errors.map((err, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm font-medium text-destructive"
                >
                  <span aria-hidden="true" className="mt-0.5 shrink-0">•</span>
                  {err}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 rounded-xl bg-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Persyaratan
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                Minimal 8 karakter
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                Kombinasi huruf dan angka
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                Tidak boleh sama dengan NIK
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            size="kiosk"
            className="mt-6 w-full"
            disabled={submitting}
          >
            {submitting ? "Memproses…" : "Selesai"}
          </Button>
        </form>
      </div>
    </KioskPage>
  );
}
