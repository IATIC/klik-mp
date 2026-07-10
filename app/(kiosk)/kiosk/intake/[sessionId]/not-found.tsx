import Link from "next/link";

export default function IntakeSessionNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Sesi tidak ditemukan</p>
      <h1 className="mt-3 text-2xl font-bold">Session ID tidak terdaftar</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sesi hanya dapat dibuat melalui entry point kios dan dapat hilang ketika server restart.</p>
      <Link href="/kiosk" className="mt-6 inline-block font-bold text-primary">Kembali ke beranda kios</Link>
    </main>
  );
}
