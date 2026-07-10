"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  PiggyBank,
  CalendarCheck,
  Wallet,
  ScrollText,
  UserRound,
} from "lucide-react";

import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";
import { LoadingPanel } from "@/components/kiosk/loading-panel";
import { savingsService } from "@/features/savings";
import {
  SavingsSummaryCard,
  PrincipalSummaryCard,
  MandatorySummaryCard,
  VoluntarySummaryCard,
} from "@/features/savings/components/savings-summary-card";
import { TransactionHistoryList } from "@/features/savings/components/transaction-history-list";
import {
  MOCK_MEMBER_NAME,
  MOCK_MEMBER_NUMBER,
} from "@/features/savings/mocks/savings-mock-data";
import type { SavingsSummary, SavingsTransaction } from "@/features/savings/types/savings";

const MOCK_MEMBER_ID = "AGT-0042";

export default function SimpananPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [summaryData, txnData] = await Promise.all([
          savingsService.getSummary(MOCK_MEMBER_ID),
          savingsService.getTransactions(MOCK_MEMBER_ID),
        ]);
        if (!cancelled) {
          setSummary(summaryData);
          setTransactions(txnData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat data simpanan. Silakan coba lagi.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadData = useCallback(() => {
    setError(null);
    setLoading(true);
    setSummary(null);
    setTransactions([]);
    (async () => {
      try {
        const [summaryData, txnData] = await Promise.all([
          savingsService.getSummary(MOCK_MEMBER_ID),
          savingsService.getTransactions(MOCK_MEMBER_ID),
        ]);
        setSummary(summaryData);
        setTransactions(txnData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat data simpanan. Silakan coba lagi.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Footer shared across all states ──

  const footer = (
    <KioskFooterActions
      start={
        <Button
          variant="outline"
          size="kiosk"
          onClick={() => router.push("/kiosk")}
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali
        </Button>
      }
    />
  );

  // ── Loading state ──

  if (loading) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full items-center justify-center animate-foundation-in">
          <LoadingPanel
            title="Memuat Data Simpanan"
            description="Mohon tunggu, sedang mengambil informasi simpanan Anda..."
          />
        </div>
      </KioskPage>
    );
  }

  // ── Error state ──

  if (error) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full flex-col items-center justify-center gap-6 animate-foundation-in">
          <span className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <span className="text-4xl font-extrabold">!</span>
          </span>
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Gagal Memuat Data
          </h2>
          <p className="max-w-md text-center text-base text-muted-foreground">
            {error}
          </p>
          <Button
            variant="default"
            size="kiosk"
            onClick={loadData}
            className="min-w-48"
          >
            Coba Lagi
          </Button>
        </div>
      </KioskPage>
    );
  }

  // ── Data state (including empty transactions) ──

  return (
    <KioskPage footer={footer}>
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-5 sm:gap-6 animate-foundation-in">
        {/* Member greeting strip — mirrors kiosk home page pattern */}
        <section className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
            <UserRound
              aria-hidden="true"
              className="size-6 sm:size-7"
              strokeWidth={1.7}
            />
          </span>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-sm font-medium text-muted-foreground">Halo,</p>
            <h1 className="text-xl font-extrabold sm:text-2xl">
              {MOCK_MEMBER_NAME}
            </h1>
            <span className="rounded-md bg-deep-teal/10 px-2.5 py-0.5 text-xs font-bold text-deep-teal">
              {MOCK_MEMBER_NUMBER}
            </span>
          </div>
        </section>

        {/* Three savings type cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Principal — Simpanan Pokok */}
          <SavingsSummaryCard
            title="Simpanan Pokok"
            icon={PiggyBank}
            href="/simpanan/principal"
            accentColor="bg-teal-600"
          >
            <PrincipalSummaryCard
              amount={summary!.principal.amount}
              status={summary!.principal.status}
            />
          </SavingsSummaryCard>

          {/* Mandatory — Simpanan Wajib */}
          <SavingsSummaryCard
            title="Simpanan Wajib"
            icon={CalendarCheck}
            href="/simpanan/mandatory"
            accentColor="bg-amber-600"
          >
            <MandatorySummaryCard
              tagihan={summary!.mandatory.totalBills}
              sudahDibayar={summary!.mandatory.paidAmount}
              sisa={summary!.mandatory.outstandingAmount}
              status={summary!.mandatory.status}
            />
          </SavingsSummaryCard>

          {/* Voluntary — Simpanan Sukarela */}
          <SavingsSummaryCard
            title="Simpanan Sukarela"
            icon={Wallet}
            href="/simpanan/voluntary"
            accentColor="bg-emerald-600"
          >
            <VoluntarySummaryCard
              saldo={summary!.voluntary.availableBalance}
              totalSetoran={summary!.voluntary.totalDeposits}
              totalPencairan={summary!.voluntary.totalWithdrawals}
            />
          </SavingsSummaryCard>
        </section>

        {/* Recent transaction history (max 5) */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ScrollText
                aria-hidden="true"
                className="size-5"
                strokeWidth={1.7}
              />
            </span>
            <h2 className="text-lg font-extrabold sm:text-xl">
              Riwayat Transaksi
            </h2>
          </div>
          <TransactionHistoryList
            transactions={transactions}
            emptyLabel="Belum ada riwayat transaksi simpanan."
          />
        </section>
      </div>
    </KioskPage>
  );
}
