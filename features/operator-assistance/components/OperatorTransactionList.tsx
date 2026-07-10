import { ClipboardList } from "lucide-react";

import type { OperatorTransactionSummary } from "../types/contracts";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export type OperatorTransactionListProps = {
  transactions: OperatorTransactionSummary[];
};

export function OperatorTransactionList({
  transactions,
}: OperatorTransactionListProps) {
  return (
    <section aria-labelledby="transaction-list-title" className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Operasional KDKMP</p>
        <h2 id="transaction-list-title" className="mt-1 text-xl font-bold text-foreground">
          Daftar transaksi penerimaan
        </h2>
      </div>
      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <ClipboardList aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold text-foreground">Belum ada transaksi</p>
          <p className="mt-1 text-sm text-muted-foreground">Transaksi intake akan muncul di sini.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
          {transactions.map((transaction) => (
            <li key={transaction.transactionId} className="grid gap-2 p-4 sm:grid-cols-4 sm:items-center">
              <div>
                <p className="font-bold text-foreground">{transaction.commodityType}</p>
                <p className="text-xs text-muted-foreground">{transaction.sellerName}</p>
              </div>
              <p className="text-sm text-foreground">{transaction.netWeight} kg</p>
              <p className="text-sm font-semibold text-foreground">{rupiah.format(transaction.totalPrice)}</p>
              <span className="w-fit rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
                {transaction.status.replaceAll("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
