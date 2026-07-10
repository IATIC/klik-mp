"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, Printer } from "lucide-react";
import { useEffect } from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import {
  useSavingsFlow,
  savingsService,
  formatRupiah,
} from "@/features/savings";
import { SavingsStatusBadge } from "@/features/savings/components/savings-status-badge";
import { MOCK_MEMBER_NAME, MOCK_MEMBER_NUMBER } from "@/features/savings/mocks/savings-mock-data";

export default function PrincipalDetailPage() {
  const router = useRouter();
  const { state, dispatch } = useSavingsFlow();

  // Load summary if not loaded yet
  useEffect(() => {
    if (!state.summary && !state.summaryLoading && !state.summaryError) {
      dispatch({ type: "SET_SUMMARY_LOADING", loading: true });
      savingsService
        .getSummary(state.memberId || "AGT-0042")
        .then((summary) => dispatch({ type: "SET_SUMMARY", summary }))
        .catch((err: Error) =>
          dispatch({
            type: "SET_SUMMARY_ERROR",
            error: err.message ?? "Gagal memuat data simpanan",
          }),
        );
    }
  }, [state.summary, state.summaryLoading, state.summaryError, state.memberId, dispatch]);

  const principal = state.summary?.principal;
  const status = principal?.status ?? "UNPAID";

  function handleAjukanPembayaran() {
    router.push("/simpanan/principal/payment");
  }

  function handleCetakUlang() {
    // Navigate to invoice page if there's an existing document
    if (state.currentDocument) {
      router.push("/simpanan/principal/invoice");
    }
  }

  function handleKembali() {
    router.push("/simpanan");
  }

  const footer = (
    <KioskFooterActions
      start={
        <Button variant="outline" size="kiosk" onClick={handleKembali}>
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali
        </Button>
      }
      end={
        status === "UNPAID" ? (
          <Button size="kiosk" onClick={handleAjukanPembayaran}>
            Ajukan Pembayaran
          </Button>
        ) : null
      }
    />
  );

  if (state.summaryLoading) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </KioskPage>
    );
  }

  if (state.summaryError) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-destructive">{state.summaryError}</p>
          <Button variant="outline" size="kiosk" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </KioskPage>
    );
  }

  if (!principal) {
    return (
      <KioskPage footer={footer}>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Data tidak tersedia</p>
        </div>
      </KioskPage>
    );
  }

  return (
    <KioskPage footer={footer}>
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Simpanan Pokok</h1>
          <p className="text-muted-foreground">
            Pembayaran satu kali sebagai bagian keanggotaan koperasi
          </p>
        </div>

        {/* Member Info */}
        <section className="rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-7">
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">Nama Anggota</span>
              <span className="font-extrabold">{MOCK_MEMBER_NAME}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">Nomor Anggota</span>
              <span className="font-extrabold">{MOCK_MEMBER_NUMBER}</span>
            </div>
          </div>
        </section>

        {/* Principal Detail Card */}
        <section className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm sm:p-8">
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Status</span>
              <SavingsStatusBadge status={status} />
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="text-2xl font-extrabold sm:text-3xl">
                {formatRupiah(principal.amount)}
              </span>
            </div>
            {principal.paidAt && (
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Tanggal Pelunasan</span>
                <span className="font-extrabold">{principal.paidAt}</span>
              </div>
            )}
            {principal.activeInvoiceNumber && (
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">No. Invoice</span>
                <span className="font-extrabold">{principal.activeInvoiceNumber}</span>
              </div>
            )}
          </div>
        </section>

        {/* Status-specific content */}
        {status === "PENDING_PAYMENT" && state.currentDocument && (
          <section className="rounded-3xl border-2 border-blue-200 bg-blue-50/50 p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
              <FileText aria-hidden="true" className="size-5 text-primary" />
              Invoice Terbit
            </h2>
            <div className="divide-y divide-blue-100">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted-foreground">No. Dokumen</span>
                <span className="text-sm font-extrabold">
                  {state.currentDocument.documentNumber}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted-foreground">Tanggal</span>
                <span className="text-sm font-extrabold">
                  {state.currentDocument.createdAt}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="kiosk"
              onClick={handleCetakUlang}
              className="mt-4 w-full"
            >
              <Printer aria-hidden="true" className="size-5" />
              Cetak Ulang
            </Button>
          </section>
        )}

        {status === "PAID" && (
          <section className="flex flex-col items-center gap-4 rounded-3xl border-2 border-green-200 bg-green-50/50 p-8 text-center shadow-sm">
            <span className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 aria-hidden="true" className="size-8" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold">Pembayaran Lunas</h2>
              <p className="mt-1 text-muted-foreground">
                Simpanan Pokok sudah dibayarkan. Terima kasih.
              </p>
            </div>
          </section>
        )}
      </div>
    </KioskPage>
  );
}
