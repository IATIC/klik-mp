"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginSchema } from "../schemas/registration";
import { loginUser, fingerprintLogin } from "../actions/login";
import { FingerprintButton } from "./FingerprintButton";

export function LoginForm() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleFingerprintLogin = useCallback(async () => {
    const demoNIK = "3201123456789012";
    setNik(demoNIK);
    setError(null);
    setSubmitting(true);

    const result = await fingerprintLogin(demoNIK);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/kiosk");
  }, [router]);

  const handleNIKChange = useCallback((value: string) => {
    setNik(value);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ nik, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.set("nik", nik);
    formData.set("password", password);

    const result = await loginUser(formData);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/kiosk");
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary">
          <LockKeyhole aria-hidden="true" className="size-8 text-primary-foreground" />
        </span>
        <h1 className="text-3xl font-bold tracking-[-0.03em]">
          Login
        </h1>
        <p className="text-base text-muted-foreground">
          Masuk ke akun e-Kiosk
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-base font-medium text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-5">
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
            </div>
            <div className="sm:w-56">
              <FingerprintButton onScan={handleFingerprintLogin} />
            </div>
          </div>
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
              placeholder="Masukkan password"
              className="w-full rounded-xl border border-border bg-background px-5 py-4 pr-12 text-base outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/10"
              autoComplete="current-password"
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
      </div>

      <Button
        type="submit"
        className="w-full rounded-xl py-6 text-lg"
        size="lg"
        disabled={submitting}
      >
        {submitting && (
          <Loader2 aria-hidden="true" className="size-5 animate-spin" />
        )}
        {submitting ? "Memproses…" : "Login"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <a
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Register
        </a>
      </p>
    </form>
  );
}
