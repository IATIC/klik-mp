"use client";

import { Printer, CheckCircle, AlertCircle, Loader2, WifiOff } from "lucide-react";
import type { PrinterStatus as PrinterStatusType, SubmissionStatus } from "../types/clinic";
import { PRINTER_STATUS_LABELS } from "../constants/clinic-constants";

type PrinterStatusPanelProps = {
  printerStatus: PrinterStatusType;
  printStatus: SubmissionStatus;
  printError?: string | null;
};

export function PrinterStatusPanel({
  printerStatus,
  printStatus,
  printError,
}: PrinterStatusPanelProps) {
  const label = PRINTER_STATUS_LABELS[printerStatus] ?? "Printer tidak dikenal";

  const IconComponent =
    printerStatus === "DISCONNECTED"
      ? WifiOff
      : printStatus === "LOADING"
        ? Loader2
        : printStatus === "SUCCESS"
          ? CheckCircle
          : printStatus === "ERROR"
            ? AlertCircle
            : Printer;

  const colorClass =
    printerStatus === "DISCONNECTED"
      ? "text-red-600 bg-red-50"
      : printStatus === "LOADING"
        ? "text-blue-600 bg-blue-50"
        : printStatus === "SUCCESS"
          ? "text-green-600 bg-green-50"
          : printStatus === "ERROR"
            ? "text-red-600 bg-red-50"
            : "text-green-600 bg-green-50";

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 sm:px-6"
      aria-live="polite"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
      >
        <IconComponent
          aria-hidden="true"
          className={`size-5 ${printStatus === "LOADING" ? "animate-spin" : ""}`}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        {printError && (
          <p className="text-xs text-red-600">{printError}</p>
        )}
      </div>
    </div>
  );
}
