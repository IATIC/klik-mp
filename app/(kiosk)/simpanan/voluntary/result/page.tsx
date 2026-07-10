"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft, Printer, Home } from "lucide-react";
import { useEffect, useState } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import {
  useSavingsFlow,
  printService,
  SUCCESS_MESSAGES,
} from "@/features/savings";
import { InvoicePreview } from "@/features/savings/components/invoice-preview";
import { PrinterStatusPanel } from "@/features/savings/components/printer-status";

export default function VoluntaryResultPage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();
  const [isPrinting, setIsPrinting] = useState(false);

  const document = state.currentDocument;

  // Redirect if no document
  useEffect(() => {
    if (!document) {
      router.replace("/simpanan/voluntary");
    }
  }, [document, router]);

  if (!document) return null;

  const isInvoice = document.documentType === "INVOICE";
  const successMessage = isInvoice
    ? SUCCESS_MESSAGES.INVOICE_CREATED
    : SUCCESS_MESSAGES.WITHDRAWAL_SUBMITTED;
  const hasPrinted = document.printedCount > 0;

  async function handlePrint() {
    if (isPrinting) return;
    setIsPrinting(true);

    dispatch({ type: "SET_PRINTER_STATUS", status: "PRINTING" });
    dispatch({ type: "SET_PRINT_STATUS", status: "LOADING" });

    try {
      if (!document) return;
      const result = await printService.print(document.documentNumber);

      if (result.success) {
        dispatch({ type: "INCREMENT_DOCUMENT_PRINT" });
        dispatch({ type: "SET_PRINTER_STATUS", status: "SUCCESS" });
        dispatch({ type: "SET_PRINT_STATUS", status: "SUCCESS" });
      } else {
        dispatch({ type: "SET_PRINTER_STATUS", status: "FAILED" });
        dispatch({
          type: "SET_PRINT_STATUS",
          status: "ERROR",
          error: result.message,
        });
      }
    } catch (err) {
      dispatch({ type: "SET_PRINTER_STATUS", status: "FAILED" });
      dispatch({
        type: "SET_PRINT_STATUS",
        status: "ERROR",
        error: err instanceof Error ? err.message : "Pencetakan gagal",
      });
    } finally {
      setIsPrinting(false);
    }
  }

  function handleKembali() {
    router.push("/simpanan");
  }

  function handleSelesai() {
    dispatch({ type: "RESET_FLOW" });
    router.push("/kiosk");
  }

  const footer = (
    <KioskFooterActions
      start={
        <Button variant="outline" size="kiosk" onClick={handleKembali}>
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali ke Simpanan
        </Button>
      }
      end={
        <Button size="kiosk" onClick={handleSelesai}>
          <Home aria-hidden="true" className="size-5" />
          Selesai
        </Button>
      }
    />
  );

  return (
    <KioskPage footer={footer}>
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Success Header */}
        <section className="flex flex-col items-center gap-4 rounded-3xl border-2 border-green-200 bg-green-50/50 p-8 text-center shadow-sm">
          <span className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 aria-hidden="true" className="size-8" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{successMessage}</h1>
            <p className="mt-1 text-muted-foreground">
              {isInvoice
                ? "Silakan cetak invoice untuk diserahkan ke petugas"
                : "Pengajuan akan ditinjau oleh petugas koperasi"}
            </p>
          </div>
        </section>

        {/* Invoice Preview */}
        <InvoicePreview document={document} />

        {/* Printer Status */}
        <PrinterStatusPanel
          printerStatus={state.printerStatus}
          printStatus={state.printStatus}
          printError={state.printError}
        />

        {/* Print Button */}
        <Button
          size="kiosk"
          onClick={handlePrint}
          disabled={isPrinting}
          className="w-full"
        >
          <Printer aria-hidden="true" className="size-5" />
          {isPrinting
            ? "Mencetak..."
            : hasPrinted
              ? "Cetak Ulang"
              : isInvoice
                ? "Cetak Invoice"
                : "Cetak Bukti Pengajuan"}
        </Button>

        {/* Print error retry hint */}
        {state.printStatus === "ERROR" && (
          <p className="text-center text-sm text-muted-foreground">
            Pastikan printer terhubung dan coba lagi
          </p>
        )}
      </div>
    </KioskPage>
  );
}
