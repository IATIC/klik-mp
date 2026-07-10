import Link from "next/link";

export default function OperatorNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-center">
      <h1 className="text-2xl font-bold">Data operator tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted-foreground">Session ID tidak tersedia pada registry server.</p>
      <Link href="/operator/intakes" className="mt-6 inline-block font-bold text-primary">Kembali ke daftar intake</Link>
    </main>
  );
}
