"use client";

import { Button } from "@/components/ui/button";

export default function KioskError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-center">
      <h1 className="text-2xl font-bold">Kios tidak dapat dimuat</h1>
      <p className="mt-2 text-sm text-muted-foreground">Coba muat ulang route ini. Sesi in-memory dapat hilang jika server restart.</p>
      <Button className="mt-6" onClick={reset}>Coba lagi</Button>
    </main>
  );
}
