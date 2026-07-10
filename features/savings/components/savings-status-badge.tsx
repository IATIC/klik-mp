import type { PrincipalStatus, MandatoryInvoiceStatus, SavingsTransactionStatus } from "../types/savings";

type StatusType = PrincipalStatus | MandatoryInvoiceStatus | SavingsTransactionStatus;

const STATUS_STYLES: Record<string, string> = {
  UNPAID: "bg-amber-50 text-amber-800 border-amber-200",
  PENDING_PAYMENT: "bg-blue-50 text-blue-800 border-blue-200",
  PENDING_APPROVAL: "bg-purple-50 text-purple-800 border-purple-200",
  PAID: "bg-green-50 text-green-800 border-green-200",
  APPROVED: "bg-green-50 text-green-800 border-green-200",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
  CANCELLED: "bg-neutral-100 text-neutral-600 border-neutral-200",
  PARTIALLY_PAID: "bg-amber-50 text-amber-800 border-amber-200",
  OVERDUE: "bg-red-50 text-red-800 border-red-200",
  DRAFT: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

const STATUS_LABELS: Record<string, string> = {
  UNPAID: "Belum Lunas",
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PENDING_APPROVAL: "Menunggu Persetujuan",
  PAID: "Lunas",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
  PARTIALLY_PAID: "Sebagian Lunas",
  OVERDUE: "Jatuh Tempo",
  DRAFT: "Konsep",
};

export function SavingsStatusBadge({ status }: { status: StatusType }) {
  const style = STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-600 border-neutral-200";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-bold leading-tight ${style}`}
    >
      {label}
    </span>
  );
}
