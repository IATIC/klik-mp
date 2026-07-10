"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Home, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import { receiptPrinterAdapter } from "@/lib/services/mock-receipt";
import { useKioskFlow } from "@/features/kiosk-flow";

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default function SuccessPage() {
  const router = useRouter();
  const { state, dispatch } = useKioskFlow();

  const [reprintError, setReprintError] = useState("");

  useEffect(() => {
    if (!state.receipt) {
      router.replace("/intake/commodity");
    }
  }, [state.receipt, router]);

  if (!state.receipt) return null;

  const receipt = state.receipt;

  async function handleReprint() {
    setReprintError("");
    try {
      await receiptPrinterAdapter.reprint(receipt);
      dispatch({ type: "INCREMENT_RECEIPT_PRINT" });
    } catch (err) {
      setReprintError(err instanceof Error ? err.message : "Gagal mencetak ulang");
    }
  }

  function handleFinish() {
    dispatch({ type: "RESET_INTAKE" });
    dispatch({ type: "RESET_SESSION" });
    router.push("/");
  }

  const footer = (
    <KioskFooterActions
      end={
        <Button size="kiosk" onClick={handleFinish}>
          <Home aria-hidden="true" className="size-5" />
          Selesai
        </Button>
      }
    />
  );

  return (
    <KioskPage
      progress={{ label: "Penerimaan", current: 5, total: 5 }}
      footer={footer}
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-6 animate-foundation-in">
        {/* Success Icon */}
        <span className="flex size-24 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 aria-hidden="true" className="size-12 text-success" />
        </span>

        <h1 className="text-3xl font-extrabold sm:text-4xl">Transaksi berhasil!</h1>

        {/* Receipt Card */}
        <section className="w-full rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold">
            <Printer aria-hidden="true" className="size-5 text-primary" />
            Receipt Transaksi
          </h2>

          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">No. Transaksi</span>
              <span className="font-extrabold">{receipt.transactionNumber}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Komoditas</span>
              <span className="font-extrabold">{receipt.commodityName}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Grade</span>
              <span className="font-extrabold">{receipt.grade}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Berat Netto</span>
              <span className="font-extrabold">{receipt.netWeight.toFixed(1)} kg</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Harga satuan</span>
              <span className="font-extrabold">{formatIDR(receipt.agreedUnitPrice)}</span>
            </div>
            <div className="flex items-center justify-between py-3 pt-4">
              <span className="text-lg font-extrabold text-foreground">Total</span>
              <span className="text-2xl font-extrabold text-primary">{formatIDR(receipt.total)}</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              size="kiosk"
              onClick={handleReprint}
              className="w-full"
            >
              <Printer aria-hidden="true" className="size-5" />
              Cetak ulang
            </Button>

            {reprintError && (
              <p className="mt-2 text-sm text-destructive">{reprintError}</p>
            )}
          </div>
        </section>
      </div>
    </KioskPage>
  );
}
