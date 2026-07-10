import Link from "next/link";
import { AuthBackground } from "@/components/auth-background";

export default function NotFoundPage() {
  return (
    <AuthBackground>
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-muted-foreground">Periksa kembali alamat atau kembali ke entry point KLIK-MP.</p>
        <Link href="/" className="mt-6 inline-block font-bold text-primary">Kembali ke landing</Link>
      </div>
    </AuthBackground>
  );
}
