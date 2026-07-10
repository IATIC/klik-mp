"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";
import { useKioskFlow, validateLogin } from "@/features/kiosk-flow";
import { authAdapter } from "@/lib/services/mock-auth";
import { cn } from "@/lib/utils";

export default function ManualLoginPage() {
  const router = useRouter();
  const { dispatch } = useKioskFlow();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ account?: string; password?: string }>(
    {},
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const fieldErrors = validateLogin(account, password);
    if (fieldErrors.account || fieldErrors.password) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const result = await authAdapter.login(account, password);

      if (result.ok) {
        dispatch({ type: "AUTHENTICATE", user: result.user });
        router.push("/kiosk");
      } else {
        setSubmitError(result.error);
        setLoading(false);
      }
    } catch {
      setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <KioskPage
      progress={{ label: "Login", current: 2, total: 2 }}
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/login")}
            >
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="flex min-h-full flex-col items-center justify-center gap-8 py-8">
        <header className="animate-foundation-in text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Masuk</h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Masukkan akun Anda
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="animate-foundation-in-delayed w-full max-w-md space-y-6"
        >
          {/* NIK / Nomor Anggota */}
          <div>
            <label
              htmlFor="account"
              className="mb-2 block text-sm font-bold sm:text-base"
            >
              NIK atau nomor anggota
            </label>
            <input
              id="account"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className={cn(
                "min-h-14 w-full rounded-xl border-2 bg-background px-4 text-base outline-none transition focus-visible:ring-4 focus-visible:ring-ring/25 disabled:opacity-50 sm:text-lg",
                errors.account
                  ? "border-destructive"
                  : "border-border focus:border-primary",
              )}
              placeholder="3273000000000042"
              disabled={loading}
            />
            {errors.account ? (
              <p className="mt-1.5 text-sm text-destructive" role="alert">
                {errors.account}
              </p>
            ) : null}
          </div>

          {/* Kata Sandi */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold sm:text-base"
            >
              Kata sandi
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "min-h-14 w-full rounded-xl border-2 bg-background px-4 text-base outline-none transition focus-visible:ring-4 focus-visible:ring-ring/25 disabled:opacity-50 sm:text-lg",
                  errors.password
                    ? "border-destructive"
                    : "border-border focus:border-primary",
                )}
                placeholder="Masukkan kata sandi"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 flex min-h-14 -translate-y-1/2 items-center px-2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={
                  showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1.5 text-sm text-destructive" role="alert">
                {errors.password}
              </p>
            ) : null}
          </div>

          {/* Submit error */}
          {submitError ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {submitError}
            </div>
          ) : null}

          {/* Submit */}
          <Button
            type="submit"
            size="kiosk"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <p className="animate-foundation-in-delayed max-w-md text-center text-sm text-muted-foreground">
          Demo:{" "}
          <span className="font-mono font-medium">
            3273000000000042 / Klikmp123
          </span>
        </p>
      </div>
    </KioskPage>
  );
}
