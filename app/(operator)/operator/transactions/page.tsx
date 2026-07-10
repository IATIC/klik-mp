import type { Metadata } from "next";

import {
  demoOperatorTransactions,
  OperatorTransactionList,
} from "@/features/operator-assistance";

export const metadata: Metadata = {
  title: "Transaksi penerimaan",
};

export default function OperatorTransactionsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 lg:px-10">
      <OperatorTransactionList transactions={demoOperatorTransactions} />
    </main>
  );
}
