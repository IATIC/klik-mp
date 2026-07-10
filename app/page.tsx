import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Blocks,
  ScanLine,
  ShieldCheck,
  Store,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pilih mode layanan",
};

const entryPoints = [
  {
    href: "/intake",
    icon: ScanLine,
    eyebrow: "Kios mandiri",
    title: "Mulai penerimaan komoditas",
    description:
      "Verifikasi anggota, timbang komoditas, nilai kualitas, dan sepakati harga.",
    action: "Buka kios",
  },
  {
    href: "/operator/transactions",
    icon: ShieldCheck,
    eyebrow: "Petugas koperasi",
    title: "Buka ruang operator",
    description:
      "Dampingi proses, tinjau hasil sistem, dan kelola transaksi penerimaan.",
    action: "Buka operator",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-svh bg-surface px-5 py-6 text-foreground sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-7xl flex-col rounded-2xl border border-border bg-background shadow-sm sm:min-h-[calc(100svh-4rem)]">
        <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-deep-teal text-white">
              <Store aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="font-bold tracking-[-0.02em]">KLIK-MP</p>
              <p className="text-xs text-muted-foreground">
                Kios Layanan Intake Komoditas
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground sm:flex">
            <span className="size-2 rounded-full bg-accent-green" />
            Workflow MVP tersedia
          </span>
        </header>

        <section className="grid flex-1 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-between border-b border-border bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-12 lg:border-r lg:border-b-0 lg:px-12 lg:py-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/62">
                Penerimaan koperasi
              </p>
              <h1 className="mt-5 max-w-xl text-balance text-4xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
                Satu alur untuk identitas, mutu, dan kesepakatan harga.
              </h1>
              <p className="mt-6 max-w-md text-pretty leading-7 text-white/72">
                Gunakan kios secara mandiri atau minta pendampingan petugas pada
                tahap mana pun.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-white/15 pt-6 text-sm text-white/70">
              <Blocks aria-hidden="true" className="size-4" />
              Alur terhubung, keputusan tetap transparan
            </div>
          </div>

          <div className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Pilih mode
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
                Bagaimana Anda ingin melanjutkan?
              </h2>
            </div>

            <div className="divide-y divide-border border-y border-border">
              {entryPoints.map(
                ({ href, icon: Icon, eyebrow, title, description, action }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group grid gap-5 py-7 outline-none transition-colors hover:bg-surface/70 focus-visible:bg-surface/70 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:px-4"
                  >
                    <span className="flex size-12 items-center justify-center rounded-xl bg-surface text-primary transition-transform group-hover:-translate-y-0.5">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {eyebrow}
                      </span>
                      <span className="mt-1 block text-lg font-bold tracking-[-0.02em]">
                        {title}
                      </span>
                      <span className="mt-2 block max-w-lg text-sm leading-6 text-muted-foreground">
                        {description}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-sm font-bold text-primary">
                      {action}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
