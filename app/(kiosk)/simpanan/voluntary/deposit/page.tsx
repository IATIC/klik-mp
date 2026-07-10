"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { useState } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/features/savings/components/money-input";
import { PaymentSummary } from "@/features/savings/components/payment-summary";
import {
  useSavingsFlow,
  savingsService,
  formatRupiah,
  validateVoluntaryDeposit,
  SAVINGS_CONSTANTS,
} from "@/features/savings";
import { MOCK_MEMBER_NAME, MOCK_MEMBER_NUMBER } from "@/features/savings/mocks/savings-mock-data";

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000];

export default function VoluntaryDepositPage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();
  const [amount, setAmount] = useState(state.enteredAmount || 0);
  const [amountError, setAmountError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleBuatInvoice() {
    if (isSubmitting) return;

    // Validate
    const validation = validateVoluntaryDeposit(amount);
    if (!validation.valid) {
      setAmountError(validation.error);
      return;
    }
    setAmountError(undefined);

    setIsSubmitting(true);
    dispatch({ type: "SET_ENTERED_AMOUNT", amount });

    try {
      const document = await savingsService.createVoluntaryDepositInvoice({
        memberId: state.memberId || "AGT-0042",
        memberName: MOCK_MEMBER_NAME,
        memberNumber: MOCK_MEMBER_NUMBER,
        amount,
      });

      dispatch({ type: "SET_DOCUMENT", document });
      router.push("/simpanan/voluntary/result");
    } catch (err) {
      console.error("Gagal membuat invoice:", err);
      setIsSubmitting(false);
    }
  }

  function handleBatal() {
    router.push("/simpanan/voluntary");
  }

  function handleAmountChange(value: number) {
    setAmount(value);
    if (amountError) setAmountError(undefined);
  }

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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Memproses..."
          ) : (
            <>
              <FileText aria-hidden="true" className="size-5" />
              Buat Invoice
            </>
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
          <h1 className="text-3xl font-extrabold sm:text-4xl">Setoran Sukarela</h1>
          <p className="text-muted-foreground">
            Masukkan nominal setoran simpanan sukarela
          </p>
        </div>

        {/* Amount Input */}
        <MoneyInput
          value={amount}
          onChange={handleAmountChange}
          label="Nominal Setoran"
          placeholder="Masukkan nominal"
          error={amountError}
          min={SAVINGS_CONSTANTS.MIN_DEPOSIT}
          max={SAVINGS_CONSTANTS.MAX_DEPOSIT}
          disabled={isSubmitting}
          quickAmounts={QUICK_AMOUNTS}
        />

        {/* Payment Summary */}
        {amount > 0 && !amountError && (
          <PaymentSummary
            title="Ringkasan Setoran"
            items={[
              { label: "Nama Anggota", value: MOCK_MEMBER_NAME },
              { label: "Nomor Anggota", value: MOCK_MEMBER_NUMBER },
              { label: "Jenis Simpanan", value: "Simpanan Sukarela" },
            ]}
            total={formatRupiah(amount)}
          />
        )}

        {/* Info Text */}
        <section className="rounded-3xl border border-border bg-amber-50/50 p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-amber-800">
            Setoran dapat dilakukan minimal {formatRupiah(SAVINGS_CONSTANTS.MIN_DEPOSIT)} dan maksimal{" "}
            {formatRupiah(SAVINGS_CONSTANTS.MAX_DEPOSIT)} per transaksi
          </p>
        </section>
      </div>
    </KioskPage>
  );
}
