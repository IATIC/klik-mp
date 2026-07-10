import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { SavingsStatusBadge } from "./savings-status-badge";
import { formatRupiah } from "../validations/savings-validation";
import type { PrincipalStatus } from "../types/savings";

type SummaryCardProps = {
  title: string;
  icon: LucideIcon;
  href: string;
  accentColor: string;
  children: React.ReactNode;
};

export function SavingsSummaryCard({
  title,
  icon: Icon,
  href,
  accentColor,
  children,
}: SummaryCardProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-4 rounded-3xl border-2 border-border bg-white p-6 outline-none transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-ring/25 sm:p-7`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${accentColor}`}
        >
          <Icon aria-hidden="true" className="size-6 text-white" strokeWidth={1.7} />
        </span>
        <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
      </div>
      {children}
    </Link>
  );
}

// ── Principal card ──

export function PrincipalSummaryCard({
  amount,
  status,
}: {
  amount: number;
  status: PrincipalStatus;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-3xl font-extrabold sm:text-4xl">
          {formatRupiah(amount)}
        </span>
        <SavingsStatusBadge status={status} />
      </div>
      {status === "UNPAID" ? (
        <p className="text-sm text-muted-foreground">
          Pembayaran satu kali sebagai bagian keanggotaan koperasi
        </p>
      ) : null}
    </div>
  );
}

// ── Mandatory card ──

export function MandatorySummaryCard({
  tagihan,
  sudahDibayar,
  sisa,
  status,
}: {
  tagihan: number;
  sudahDibayar: number;
  sisa: number;
  status: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Tagihan bulan ini</p>
          <span className="text-3xl font-extrabold sm:text-4xl">
            {formatRupiah(tagihan)}
          </span>
        </div>
        <SavingsStatusBadge status={status as PrincipalStatus} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-surface p-3">
          <p className="text-muted-foreground">Sudah dibayar</p>
          <p className="font-extrabold">{formatRupiah(sudahDibayar)}</p>
        </div>
        <div className="rounded-xl bg-surface p-3">
          <p className="text-muted-foreground">Sisa tagihan</p>
          <p className="font-extrabold text-primary">{formatRupiah(sisa)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Voluntary card ──

export function VoluntarySummaryCard({
  saldo,
  totalSetoran,
  totalPencairan,
}: {
  saldo: number;
  totalSetoran: number;
  totalPencairan: number;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">Saldo tersedia</p>
        <span className="text-3xl font-extrabold sm:text-4xl text-primary">
          {formatRupiah(saldo)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-surface p-3">
          <p className="text-muted-foreground">Total setoran</p>
          <p className="font-extrabold text-green-700">{formatRupiah(totalSetoran)}</p>
        </div>
        <div className="rounded-xl bg-surface p-3">
          <p className="text-muted-foreground">Total pencairan</p>
          <p className="font-extrabold text-destructive">{formatRupiah(totalPencairan)}</p>
        </div>
      </div>
    </div>
  );
}
