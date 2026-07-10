"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { useEffect } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import {
  useSavingsFlow,
  savingsService,
  formatRupiah,
} from "@/features/savings";
import type { MandatoryInvoice } from "@/features/savings/types/savings";
import { SavingsStatusBadge } from "@/features/savings/components/savings-status-badge";

export default function MandatoryPage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();

  // Load mandatory invoices
  useEffect(() => {
    if (
      state.mandatoryInvoices.length === 0 &&
      state.submissionStatus !== "LOADING"
    ) {
      dispatch({ type: "SET_SUBMISSION_STATUS", status: "LOADING" });
      savingsService
        .getMandatoryInvoices(state.memberId || "AGT-0042")
        .then((invoices) => {
          dispatch({ type: "SET_MANDATORY_INVOICES", invoices });
          dispatch({ type: "SET_SUBMISSION_STATUS", status: "IDLE" });
        })
        .catch((err: Error) => {
          dispatch({
            type: "SET_SUBMISSION_STATUS",
            status: "ERROR",
            error: err.message ?? "Gagal memuat daftar tagihan",
          });
        });
    }
  }, [
    state.mandatoryInvoices.length,
    state.submissionStatus,
    state.memberId,
    dispatch,
  ]);

  const isPayable = (inv: MandatoryInvoice) =>
    inv.status === "UNPAID" ||
    inv.status === "PARTIALLY_PAID" ||
    inv.status === "OVERDUE";

  function handleBayar(invoice: MandatoryInvoice) {
    dispatch({ type: "SELECT_MANDATORY_INVOICE", invoice });
    router.push("/simpanan/mandatory/payment");
  }

  function handleKembali() {
    router.push("/simpanan");
  }

  const isLoading =
    state.submissionStatus === "LOADING" && state.mandatoryInvoices.length === 0;
  const isError = state.submissionError && state.mandatoryInvoices.length === 0;

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

  // ── Loading state ──
  if (isLoading) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Memuat daftar tagihan...</p>
        </div>
      </KioskPage>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-destructive">{state.submissionError}</p>
          <Button
            variant="outline"
            size="kiosk"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </Button>
        </div>
      </KioskPage>
    );
  }

  // ── Empty state ──
  if (state.mandatoryInvoices.length === 0) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full flex-col items-center justify-center gap-5 animate-foundation-in">
          <span className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CalendarCheck aria-hidden="true" className="size-10" />
          </span>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Tidak Ada Tagihan
          </h1>
          <p className="max-w-md text-center text-lg text-muted-foreground">
            Semua tagihan Simpanan Wajib sudah lunas.
          </p>
        </div>
      </KioskPage>
    );
  }

  // ── Content state ──
  return (
    <KioskPage footer={footer}>
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Tagihan Simpanan Wajib
          </h1>
          <p className="text-muted-foreground">
            Daftar tagihan Simpanan Wajib bulanan
          </p>
        </div>

        {/* Invoice Cards */}
        <div className="flex flex-col gap-4">
          {state.mandatoryInvoices.map((inv) => {
            const payable = isPayable(inv);
            return (
              <section
                key={inv.id}
                className={`rounded-3xl border-2 p-5 shadow-sm sm:p-6 ${
                  payable
                    ? "border-border bg-white"
                    : "border-green-200 bg-green-50/30"
                }`}
              >
                <div className="flex flex-col gap-4">
                  {/* Top row: period + status */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold sm:text-2xl">
                      {inv.period}
                    </h2>
                    <SavingsStatusBadge status={inv.status} />
                  </div>

                  {/* Detail rows */}
                  <div className="divide-y divide-border">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Jumlah Tagihan
                      </span>
                      <span className="text-sm font-bold">
                        {formatRupiah(inv.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Sudah Dibayar
                      </span>
                      <span className="text-sm font-bold">
                        {formatRupiah(inv.paidAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Sisa Tagihan
                      </span>
                      <span className="text-lg font-extrabold text-primary">
                        {formatRupiah(inv.remainingAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Jatuh Tempo
                      </span>
                      <span className="text-sm font-bold">{inv.dueDate}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  {payable && (
                    <Button
                      size="kiosk"
                      onClick={() => handleBayar(inv)}
                      className="mt-2 w-full"
                    >
                      Bayar Tagihan
                    </Button>
                  )}
                  {inv.status === "PAID" && (
                    <p className="text-center text-sm font-medium text-green-700">
                      Tagihan lunas
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </KioskPage>
  );
}
