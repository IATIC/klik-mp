"use client";

import { useRouter } from "next/navigation";
import { PiggyBank, ArrowLeft, HandCoins } from "lucide-react";
import { useEffect } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import { LargeActionCard } from "@/components/kiosk/large-action-card";
import {
  useSavingsFlow,
  savingsService,
} from "@/features/savings";
import { VoluntarySummaryCard } from "@/features/savings/components/savings-summary-card";
import { TransactionHistoryList } from "@/features/savings/components/transaction-history-list";

export default function VoluntaryDashboardPage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();

  // Load summary if not loaded yet
  useEffect(() => {
    if (!state.summary && !state.summaryLoading && !state.summaryError) {
      dispatch({ type: "SET_SUMMARY_LOADING", loading: true });
      savingsService
        .getSummary(state.memberId || "AGT-0042")
        .then((summary) => dispatch({ type: "SET_SUMMARY", summary }))
        .catch((err: Error) =>
          dispatch({
            type: "SET_SUMMARY_ERROR",
            error: err.message ?? "Gagal memuat data simpanan",
          }),
        );
    }
  }, [state.summary, state.summaryLoading, state.summaryError, state.memberId, dispatch]);

  // Load transactions
  useEffect(() => {
    if (state.transactions.length === 0 && !state.summaryLoading) {
      savingsService
        .getTransactions(state.memberId || "AGT-0042")
        .then((transactions) =>
          dispatch({ type: "SET_TRANSACTIONS", transactions }),
        )
        .catch(() => {
          // Silently fail for transactions
        });
    }
  }, [state.transactions.length, state.summaryLoading, state.memberId, dispatch]);

  const voluntary = state.summary?.voluntary;
  const availableBalance = voluntary?.availableBalance ?? 0;
  const totalDeposits = voluntary?.totalDeposits ?? 0;
  const totalWithdrawals = voluntary?.totalWithdrawals ?? 0;

  function handleKembali() {
    router.push("/simpanan");
  }

  const footer = (
    <KioskFooterActions
      start={
        <Button variant="outline" size="kiosk" onClick={handleKembali}>
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali
        </Button>
      }
    />
  );

  if (state.summaryLoading) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </KioskPage>
    );
  }

  if (state.summaryError) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-destructive">{state.summaryError}</p>
          <Button variant="outline" size="kiosk" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </KioskPage>
    );
  }

  if (!state.summary) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Data tidak tersedia</p>
        </div>
      </KioskPage>
    );
  }

  return (
    <KioskPage footer={footer}>
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Simpanan Sukarela</h1>
          <p className="text-muted-foreground">
            Kelola simpanan sukarela Anda dengan mudah
          </p>
        </div>

        {/* Balance Card */}
        <section className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm sm:p-8">
          <VoluntarySummaryCard
            saldo={availableBalance}
            totalSetoran={totalDeposits}
            totalPencairan={totalWithdrawals}
          />
        </section>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <LargeActionCard
            title="Setor Simpanan"
            description="Tambahkan simpanan sukarela"
            href="/simpanan/voluntary/deposit"
            icon={PiggyBank}
          />
          <LargeActionCard
            title="Ajukan Pencairan"
            description="Tarik dana simpanan sukarela"
            href="/simpanan/voluntary/withdraw"
            icon={HandCoins}
          />
        </div>

        {/* Recent Transactions */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold sm:text-2xl">Riwayat Transaksi</h2>
          <TransactionHistoryList
            transactions={state.transactions}
            emptyLabel="Belum ada riwayat transaksi simpanan sukarela."
          />
        </section>
      </div>
    </KioskPage>
  );
}
