import type { SavingsTransaction } from "../types/savings";
import { formatRupiah } from "../validations/savings-validation";
import { SavingsStatusBadge } from "./savings-status-badge";

const TRANSACTION_LABELS: Record<string, string> = {
  PRINCIPAL_PAYMENT: "Simpanan Pokok",
  MANDATORY_PAYMENT: "Simpanan Wajib",
  VOLUNTARY_DEPOSIT: "Setoran Sukarela",
  VOLUNTARY_WITHDRAWAL: "Pencairan Sukarela",
};

export function TransactionHistoryList({
  transactions,
  emptyLabel = "Belum ada riwayat transaksi.",
}: {
  transactions: SavingsTransaction[];
  emptyLabel?: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50">
        <p className="text-base text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((txn) => (
        <div
          key={txn.id}
          className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 sm:p-5"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold sm:text-base">
              {TRANSACTION_LABELS[txn.type] ?? txn.type}
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {new Date(txn.date).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-base font-extrabold sm:text-lg">
              {formatRupiah(txn.amount)}
            </p>
            <SavingsStatusBadge status={txn.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
