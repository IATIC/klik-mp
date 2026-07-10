"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import {
  useSavingsFlow,
  printService,
} from "@/features/savings";
import { InvoicePreview } from "@/features/savings/components/invoice-preview";
import { PrinterStatusPanel } from "@/features/savings/components/printer-status";

export default function PrincipalInvoicePage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();
  const [isPrinting, setIsPrinting] = useState(false);

  const document = state.currentDocument;

  // Redirect if no document
  useEffect(() => {
    if (!document) {
      router.replace("/simpanan/principal");
    }
  }, [document, router]);

  if (!document) return null;

  // Non-null local ref for TS closure narrowing
  const doc = document;
  const hasPrinted = doc.printedCount > 0;

  async function handlePrint() {
    if (isPrinting) return;
    setIsPrinting(true);

    dispatch({ type: "SET_PRINTER_STATUS", status: "PRINTING" });
    dispatch({ type: "SET_PRINT_STATUS", status: "LOADING" });

    try {
      const result = await printService.print(doc.documentNumber);

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
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Invoice Pembayaran</h1>
          <p className="text-muted-foreground">
            Invoice berhasil dibuat, silakan cetak untuk diserahkan ke petugas
          </p>
        </div>

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
              : "Cetak Invoice"}
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
