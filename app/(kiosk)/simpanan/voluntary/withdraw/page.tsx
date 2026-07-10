"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/features/savings/components/money-input";
import { WithdrawalReasonInput } from "@/features/savings/components/withdrawal-reason-input";
import { PaymentSummary } from "@/features/savings/components/payment-summary";
import {
  useSavingsFlow,
  savingsService,
  formatRupiah,
  validateVoluntaryWithdrawal,
} from "@/features/savings";
import { MOCK_MEMBER_NAME, MOCK_MEMBER_NUMBER } from "@/features/savings/mocks/savings-mock-data";

export default function VoluntaryWithdrawPage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();
  const [amount, setAmount] = useState(state.enteredAmount || 0);
  const [reason, setReason] = useState(state.withdrawalReason || "");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBalance = state.summary?.voluntary?.availableBalance ?? 0;

  async function handleAjukanPencairan() {
    if (isSubmitting) return;

    // Validate
    const validation = validateVoluntaryWithdrawal(amount, reason, availableBalance);

    if (!validation.amount.valid) {
      setAmountError(validation.amount.error);
    } else {
      setAmountError(undefined);
    }

    if (!validation.reason.valid) {
      setReasonError(validation.reason.error);
    } else {
      setReasonError(undefined);
    }

    if (!validation.amount.valid || !validation.reason.valid) return;

    setIsSubmitting(true);
    dispatch({ type: "SET_ENTERED_AMOUNT", amount });
    dispatch({ type: "SET_WITHDRAWAL_REASON", reason });

    try {
      const document = await savingsService.submitVoluntaryWithdrawal({
        memberId: state.memberId || "AGT-0042",
        memberName: MOCK_MEMBER_NAME,
        memberNumber: MOCK_MEMBER_NUMBER,
        amount,
        reason,
      });

      dispatch({ type: "SET_DOCUMENT", document });
      router.push("/simpanan/voluntary/result");
    } catch (err) {
      console.error("Gagal mengajukan pencairan:", err);
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

  function handleReasonChange(value: string) {
    setReason(value);
    if (reasonError) setReasonError(undefined);
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
          onClick={handleAjukanPencairan}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Memproses..."
          ) : (
            <>
              <Send aria-hidden="true" className="size-5" />
              Ajukan Pencairan
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
          <h1 className="text-3xl font-extrabold sm:text-4xl">Pencairan Sukarela</h1>
          <p className="text-muted-foreground">
            Ajukan pencairan dana simpanan sukarela Anda
          </p>
        </div>

        {/* Balance Info */}
        <section className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-muted-foreground">Saldo tersedia</p>
          <p className="text-3xl font-extrabold text-primary sm:text-4xl">
            {formatRupiah(availableBalance)}
          </p>
        </section>

        {/* Amount Input */}
        <MoneyInput
          value={amount}
          onChange={handleAmountChange}
          label="Nominal Pencairan"
          placeholder="Masukkan nominal"
          error={amountError}
          min={0}
          max={availableBalance}
          disabled={isSubmitting}
        />

        {/* Reason Input */}
        <WithdrawalReasonInput
          value={reason}
          onChange={handleReasonChange}
          error={reasonError}
          disabled={isSubmitting}
        />

        {/* Payment Summary */}
        {amount > 0 && reason.trim().length > 0 && !amountError && !reasonError && (
          <PaymentSummary
            title="Ringkasan Pencairan"
            items={[
              { label: "Nama Anggota", value: MOCK_MEMBER_NAME },
              { label: "Nomor Anggota", value: MOCK_MEMBER_NUMBER },
              { label: "Jenis Simpanan", value: "Simpanan Sukarela" },
              { label: "Alasan", value: reason },
            ]}
            total={formatRupiah(amount)}
          />
        )}

        {/* Info Text */}
        <section className="rounded-3xl border border-border bg-amber-50/50 p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-amber-800">
            Pengajuan pencairan akan ditinjau oleh petugas sebelum disetujui
          </p>
        </section>
      </div>
    </KioskPage>
  );
}
