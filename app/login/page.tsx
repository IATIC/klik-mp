import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-surface px-5 py-10">
      <section className="w-full max-w-md border border-border bg-background p-7">
        <LockKeyhole aria-hidden="true" className="size-8 text-primary" />
        <h1 className="mt-5 text-2xl font-bold">Login KLIK-MP</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Authentication belum diaktifkan pada fase routing ini.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-bold text-primary">
          Kembali ke landing
        </Link>
      </section>
    </main>
  );
}
