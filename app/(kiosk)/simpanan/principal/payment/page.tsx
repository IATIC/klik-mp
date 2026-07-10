"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { useState } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import {
  useSavingsFlow,
  savingsService,
  formatRupiah,
  SAVINGS_CONSTANTS,
} from "@/features/savings";
import { PaymentSummary } from "@/features/savings/components/payment-summary";
import { MOCK_MEMBER_NAME, MOCK_MEMBER_NUMBER } from "@/features/savings/mocks/savings-mock-data";

export default function PrincipalPaymentPage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleBuatInvoice() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const document = await savingsService.createPrincipalPaymentInvoice({
        memberId: state.memberId || "AGT-0042",
        memberName: MOCK_MEMBER_NAME,
        memberNumber: MOCK_MEMBER_NUMBER,
      });

      dispatch({ type: "SET_DOCUMENT", document });
      router.push("/simpanan/principal/invoice");
    } catch (err) {
      console.error("Gagal membuat invoice:", err);
      setIsSubmitting(false);
    }
  }

  function handleBatal() {
    router.push("/simpanan/principal");
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
              Buat Invoice Pembayaran
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
          <h1 className="text-3xl font-extrabold sm:text-4xl">Konfirmasi Pembayaran</h1>
          <p className="text-muted-foreground">
            Periksa detail pembayaran Simpanan Pokok sebelum membuat invoice
          </p>
        </div>

        {/* Payment Summary */}
        <PaymentSummary
          title="Ringkasan Pembayaran"
          items={[
            { label: "Nama Anggota", value: MOCK_MEMBER_NAME },
            { label: "Nomor Anggota", value: MOCK_MEMBER_NUMBER },
            { label: "Jenis Simpanan", value: "Simpanan Pokok" },
          ]}
          total={formatRupiah(SAVINGS_CONSTANTS.PRINCIPAL_AMOUNT)}
        />

        {/* Info Text */}
        <section className="rounded-3xl border border-border bg-amber-50/50 p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-amber-800">
            Pembayaran diselesaikan melalui petugas
          </p>
        </section>
      </div>
    </KioskPage>
  );
}
