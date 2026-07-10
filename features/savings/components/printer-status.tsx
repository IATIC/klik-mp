import { CheckCircle2, LoaderCircle, Printer, TriangleAlert, WifiOff } from "lucide-react";
import type { PrinterStatus as PrinterStatusType, SubmissionStatus } from "../types/savings";

type PrinterStatusProps = {
  printerStatus: PrinterStatusType;
  printStatus: SubmissionStatus;
  printError?: string | null;
};

export function PrinterStatusPanel({
  printerStatus,
  printStatus,
  printError,
}: PrinterStatusProps) {
  const printerIcon = () => {
    if (printerStatus === "DISCONNECTED") return <WifiOff className="size-5 text-destructive" />;
    if (printerStatus === "READY") return <Printer className="size-5 text-primary" />;
    return <Printer className="size-5 text-muted-foreground" />;
  };

  const printerLabel = () => {
    if (printerStatus === "DISCONNECTED") return "Printer tidak terhubung";
    if (printerStatus === "READY") return "Printer siap";
    if (printerStatus === "PRINTING") return "Sedang mencetak...";
    return "Printer siap";
  };

  const printStateIndicator = () => {
    if (printStatus === "LOADING") {
      return (
        <span className="flex items-center gap-2 text-sm text-info">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Sedang mencetak...
        </span>
      );
    }
    if (printStatus === "SUCCESS") {
      return (
        <span className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 aria-hidden="true" className="size-4" />
          Dokumen berhasil dicetak
        </span>
      );
    }
    if (printStatus === "ERROR" || printStatus === "DUPLICATE") {
      return (
        <span className="flex items-center gap-2 text-sm text-destructive">
          <TriangleAlert aria-hidden="true" className="size-4" />
          {printError ?? "Pencetakan gagal"}
        </span>
      );
    }
    return null;
  };

  return (
    <div
      aria-live="polite"
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        printerStatus === "DISCONNECTED"
          ? "bg-destructive/5 text-destructive"
          : printerStatus === "PRINTING"
            ? "bg-info/5 text-info"
            : "bg-green-50 text-green-800"
      }`}
    >
      {printerIcon()}
      <div>
        <p className="text-sm font-bold">{printerLabel()}</p>
        {printStateIndicator()}
      </div>
    </div>
  );
}
