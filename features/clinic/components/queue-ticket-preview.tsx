"use client";

import { Printer, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { ClinicQueueTicket, PrinterStatus, SubmissionStatus } from "../types/clinic";
import { maskMemberNumber } from "../validations/clinic-validation";
import { PRINTER_STATUS_LABELS } from "../constants/clinic-constants";

type QueueTicketPreviewProps = {
  ticket: ClinicQueueTicket;
  printerStatus: PrinterStatus;
  printStatus: SubmissionStatus;
  printError?: string | null;
  onPrint: () => void;
  onReprint: () => void;
  disabled?: boolean;
};

export function QueueTicketPreview({
  ticket,
  printerStatus,
  printStatus,
  printError,
  onPrint,
  onReprint,
  disabled = false,
}: QueueTicketPreviewProps) {
  const isPrinting = printStatus === "LOADING";
  const isPrinted = printStatus === "SUCCESS";
  const hasError = printStatus === "ERROR";
  const printerLabel = PRINTER_STATUS_LABELS[printerStatus] ?? printerStatus;
  const printerConnected = printerStatus === "READY" || printerStatus === "SUCCESS";

  return (
    <div className="space-y-6">
      {/* Printer status */}
      <div
        className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 sm:px-6"
        aria-live="polite"
      >
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
            isPrinting
              ? "bg-blue-50 text-blue-600"
              : isPrinted
                ? "bg-green-50 text-green-600"
                : hasError
                  ? "bg-red-50 text-red-600"
                  : printerConnected
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
          }`}
        >
          {isPrinting ? (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          ) : isPrinted || printerConnected ? (
            <CheckCircle aria-hidden="true" className="size-5" />
          ) : (
            <AlertCircle aria-hidden="true" className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{printerLabel}</p>
          {isPrinted && (
            <p className="text-xs text-green-600">
              Tiket sudah dicetak ({ticket.printedCount}x)
            </p>
          )}
          {hasError && printError && (
            <p className="text-xs text-red-600">{printError}</p>
          )}
        </div>
      </div>

      {/* Print actions */}
      {!isPrinted ? (
        <button
          type="button"
          onClick={onPrint}
          disabled={disabled || isPrinting || !printerConnected}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-lg font-bold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPrinting ? (
            <>
              <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              Sedang mencetak...
            </>
          ) : (
            <>
              <Printer aria-hidden="true" className="size-5" />
              Cetak Tiket Antrean
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onReprint}
          disabled={disabled || isPrinting || !printerConnected}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-white px-8 py-5 text-lg font-bold text-primary shadow-sm transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Printer aria-hidden="true" className="size-5" />
          Cetak Ulang
        </button>
      )}

      {hasError && (
        <button
          type="button"
          onClick={onPrint}
          disabled={disabled || isPrinting}
          className="flex w-full items-center justify-center gap-2 text-sm font-bold text-destructive hover:underline"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

/** Preview of the ticket content for display */
export function TicketContent({ ticket }: { ticket: ClinicQueueTicket }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-white p-6 text-center sm:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        KLINIKDESA KLIK-MP
      </p>
      <div className="my-4 border-t border-dashed border-muted-foreground/20" />
      <p className="text-sm font-medium text-muted-foreground">Nomor Antrean</p>
      <p className="mt-1 text-3xl font-extrabold tracking-widest text-primary sm:text-4xl">
        {ticket.queueNumber}
      </p>
      <div className="my-4 border-t border-dashed border-muted-foreground/20" />
      <p className="text-sm font-bold">{ticket.serviceName}</p>
      <p className="text-xs text-muted-foreground">{ticket.visitDate}</p>
      <p className="text-xs text-muted-foreground">{ticket.location}</p>
      <div className="my-4 border-t border-dashed border-muted-foreground/20" />
      <p className="text-xs text-muted-foreground">
        Nama: {ticket.serviceName.includes("Dokter") ? "Siti R." : "Anggota"}
      </p>
      <p className="text-xs text-muted-foreground">
        No. Anggota: {maskMemberNumber("AGT-0042")}
      </p>
      <div className="my-4 border-t border-dashed border-muted-foreground/20" />
      <p className="text-xs italic text-muted-foreground">
        Harap menunggu hingga nomor dipanggil.
      </p>
    </div>
  );
}
