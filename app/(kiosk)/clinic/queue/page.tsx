"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { useState } from "react";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";
import { QueueNumberCard } from "@/features/clinic/components/queue-number-card";
import { QueueTicketPreview, TicketContent } from "@/features/clinic/components/queue-ticket-preview";
import { useClinicFlow } from "@/features/clinic/context/clinic-flow-context";
import { queuePrintService } from "@/features/clinic/services/print-service";
import { SUCCESS_MESSAGES } from "@/features/clinic/constants/clinic-constants";

export default function ClinicQueuePage() {
  const router = useRouter();
  const { state, dispatch } = useClinicFlow();
  const [printStatus, setPrintStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [printError, setPrintError] = useState<string | null>(null);

  const ticket = state.queueTicket;

  // Redirect if no ticket
  if (!ticket) {
    return (
      <KioskPage
        footer={
          <KioskFooterActions
            start={
              <Button
                variant="outline"
                size="kiosk"
                onClick={() => router.push("/kiosk")}
              >
                <Home aria-hidden="true" className="size-5" />
                Beranda
              </Button>
            }
          />
        }
      >
        <div className="flex h-full flex-col items-center justify-center gap-5 animate-foundation-in">
          <p className="text-xl font-bold text-muted-foreground">
            Tidak ada antrean aktif
          </p>
          <Button size="kiosk" onClick={() => router.push("/clinic")}>
            Mulai Pengajuan Baru
          </Button>
        </div>
      </KioskPage>
    );
  }

  const handlePrint = async () => {
    setPrintStatus("LOADING");
    setPrintError(null);

    try {
      const result = await queuePrintService.printQueueTicket(ticket);
      if (result.success) {
        setPrintStatus("SUCCESS");
      } else {
        setPrintStatus("ERROR");
        setPrintError(result.message || "Gagal mencetak tiket");
      }
    } catch {
      setPrintStatus("ERROR");
      setPrintError("Terjadi kesalahan saat mencetak");
    }
  };

  const handleReprint = async () => {
    setPrintStatus("LOADING");
    setPrintError(null);

    try {
      const result = await queuePrintService.reprintQueueTicket(ticket);
      if (result.success) {
        setPrintStatus("SUCCESS");
      } else {
        setPrintStatus("ERROR");
        setPrintError(result.message || "Gagal mencetak ulang");
      }
    } catch {
      setPrintStatus("ERROR");
      setPrintError("Terjadi kesalahan saat mencetak");
    }
  };

  const handleFinish = () => {
    dispatch({ type: "RESET_FLOW" });
    router.push("/kiosk");
  };

  return (
    <KioskPage
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/clinic/review")}
              disabled={printStatus === "LOADING"}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
          end={
            <Button size="kiosk" onClick={handleFinish}>
              <Home aria-hidden="true" className="size-5" />
              Selesai
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Success message */}
        <div className="rounded-2xl bg-green-50 px-5 py-4 text-center text-sm font-bold text-green-700">
          {SUCCESS_MESSAGES.APPLICATION_SUBMITTED}
        </div>

        {/* Queue number */}
        <QueueNumberCard ticket={ticket} />

        {/* Ticket preview */}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold sm:text-xl">Tiket Antrean</h2>
          <TicketContent ticket={ticket} />
          <QueueTicketPreview
            ticket={ticket}
            printerStatus={state.printerStatus}
            printStatus={printStatus}
            printError={printError}
            onPrint={handlePrint}
            onReprint={handleReprint}
          />
        </section>

        {/* Info */}
        <section className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <p className="font-bold">Informasi</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
            <li>Harap menunggu hingga nomor antrean dipanggil.</li>
            <li>Tiket dapat dicetak ulang jika diperlukan.</li>
            <li>Simpan tiket untuk pemeriksaan di loket.</li>
          </ul>
        </section>
      </div>
    </KioskPage>
  );
}
