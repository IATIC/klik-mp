"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import {
  useSavingsFlow,
  savingsService,
  formatRupiah,
  validateMandatoryFullPayment,
  validateMandatoryPartialPayment,
} from "@/features/savings";
import { MoneyInput } from "@/features/savings/components/money-input";
import { PaymentSummary } from "@/features/savings/components/payment-summary";
import type { PaymentMode } from "@/features/savings/types/savings";

export default function MandatoryPaymentPage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();
  const [selectedMode, setSelectedMode] = useState<PaymentMode | null>(
    state.paymentMode,
  );
  const [amount, setAmount] = useState(state.enteredAmount || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const invoice = state.selectedMandatoryInvoice;

  // Redirect if no selected invoice
  useEffect(() => {
    if (!invoice) {
      router.replace("/simpanan/mandatory");
    }
  }, [invoice, router]);

  if (!invoice) return null;

  const inv = invoice;
  const remainingAmount = inv.remainingAmount;

  function handleModeChange(mode: PaymentMode) {
    setSelectedMode(mode);
    dispatch({ type: "SET_PAYMENT_MODE", mode });
    setValidationError(null);

    if (mode === "FULL") {
      setAmount(remainingAmount);
      dispatch({ type: "SET_ENTERED_AMOUNT", amount: remainingAmount });
    } else {
      setAmount(0);
      dispatch({ type: "SET_ENTERED_AMOUNT", amount: 0 });
    }
  }

  function handleAmountChange(value: number) {
    setAmount(value);
    dispatch({ type: "SET_ENTERED_AMOUNT", amount: value });
    setValidationError(null);
  }

  async function handleBuatInvoice() {
    if (isSubmitting) return;

    // Validate based on mode
    if (selectedMode === "FULL") {
      const result = validateMandatoryFullPayment(remainingAmount);
      if (!result.valid) {
        setValidationError(result.error);
        return;
      }
    } else if (selectedMode === "PARTIAL") {
      const result = validateMandatoryPartialPayment(amount, remainingAmount);
      if (!result.valid) {
        setValidationError(result.error);
        return;
      }
    } else {
      setValidationError("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalAmount = selectedMode === "FULL" ? remainingAmount : amount;

      const document = await savingsService.createMandatoryPaymentInvoice({
        memberId: state.memberId || "AGT-0042",
        memberName: inv.period,
        memberNumber: state.memberId || "AGT-0042",
        invoiceId: inv.id,
        period: inv.period,
        amount: finalAmount,
        paymentMode: selectedMode,
      });

      dispatch({ type: "SET_DOCUMENT", document });
      router.push("/simpanan/mandatory/invoice");
    } catch (err) {
      console.error("Gagal membuat invoice:", err);
      setValidationError(
        err instanceof Error ? err.message : "Gagal membuat invoice",
      );
      setIsSubmitting(false);
    }
  }

  function handleBatal() {
    router.push("/simpanan/mandatory");
  }

  const isFullMode = selectedMode === "FULL";
  const isPartialMode = selectedMode === "PARTIAL";
  const displayAmount = isFullMode ? remainingAmount : amount;
  const hasValidAmount = displayAmount > 0;

  const summaryItems = [
    { label: "Periode", value: invoice.period },
    { label: "Sisa Tagihan", value: formatRupiah(remainingAmount) },
    {
      label: "Metode Pembayaran",
      value: isFullMode ? "Bayar Penuh" : isPartialMode ? "Bayar Sebagian" : "-",
    },
  ];

  const footer = (
    <KioskFooterActions
      start={
        <Button variant="outline" size="kiosk" onClick={handleBatal}>
          <ArrowLeft aria-hidden="true" className="size-5" />
          Batal
        </Button>
      }
      end={
        <Button
          size="kiosk"
          onClick={handleBuatInvoice}
          disabled={isSubmitting || !selectedMode || !hasValidAmount}
        >
          {isSubmitting ? (
            "Memproses..."
          ) : (
            "Buat Invoice Pembayaran"
          )}
        </Button>
      }
    />
  );

  return (
    <KioskPage footer={footer}>
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Pembayaran Simpanan Wajib
          </h1>
          <p className="text-muted-foreground">
            Pilih metode pembayaran untuk tagihan periode {invoice.period}
          </p>
        </div>

        {/* Selected Invoice Info */}
        <section className="rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">Periode</span>
              <span className="font-extrabold">{invoice.period}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">Sisa Tagihan</span>
              <span className="text-2xl font-extrabold text-primary">
                {formatRupiah(remainingAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">Jatuh Tempo</span>
              <span className="font-bold">{invoice.dueDate}</span>
            </div>
          </div>
        </section>

        {/* Payment Mode Selection */}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold">Metode Pembayaran</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleModeChange("FULL")}
              className={`rounded-3xl border-2 p-6 text-center transition-colors ${
                isFullMode
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-foreground hover:border-primary/50"
              }`}
            >
              <p className="text-xl font-extrabold">Bayar Penuh</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatRupiah(remainingAmount)}
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("PARTIAL")}
              className={`rounded-3xl border-2 p-6 text-center transition-colors ${
                isPartialMode
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-foreground hover:border-primary/50"
              }`}
            >
              <p className="text-xl font-extrabold">Bayar Sebagian</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Masukkan nominal
              </p>
            </button>
          </div>
        </section>

        {/* Amount Input (only for PARTIAL) */}
        {isPartialMode && (
          <MoneyInput
            value={amount}
            onChange={handleAmountChange}
            label="Nominal Pembayaran"
            placeholder="Masukkan jumlah"
            error={validationError || undefined}
            min={1}
            max={remainingAmount}
            quickAmounts={[
              Math.min(25_000, remainingAmount),
              Math.min(50_000, remainingAmount),
              Math.min(75_000, remainingAmount),
              remainingAmount,
            ].filter((v, i, a) => a.indexOf(v) === i)}
          />
        )}

        {/* Validation error for FULL mode */}
        {validationError && isFullMode && (
          <p className="text-sm text-destructive" role="alert">
            {validationError}
          </p>
        )}

        {/* Summary */}
        {selectedMode && hasValidAmount && (
          <PaymentSummary
            title="Ringkasan Pembayaran"
            items={summaryItems}
            total={formatRupiah(displayAmount)}
            variant={isFullMode ? "success" : "warning"}
          />
        )}

        {/* Info */}
        <section className="rounded-3xl border border-border bg-amber-50/50 p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-amber-800">
            Pembayaran diselesaikan melalui petugas koperasi
          </p>
        </section>
      </div>
    </KioskPage>
  );
}
