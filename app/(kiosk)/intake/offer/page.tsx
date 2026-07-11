"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageSquareText, Printer } from "lucide-react";
import * as React from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { LoadingPanel } from "@/components/kiosk/loading-panel";
import { Button } from "@/components/ui/button";
import { pricingAdapter } from "@/lib/services/mock-pricing";
import { receiptPrinterAdapter } from "@/lib/services/mock-receipt";
import { useKioskFlow, validateCounteroffer } from "@/features/kiosk-flow";

type OfferFlowState = "offered" | "negotiating" | "reviewing" | "agreed";

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default function OfferPage() {
  const router = useRouter();
  const { state, dispatch } = useKioskFlow();

  const isAgreedFromState = state.offer?.status === "agreed";

  const [flowState, setFlowState] = React.useState<OfferFlowState>(
    isAgreedFromState ? "agreed" : "offered"
  );
  const [counteroffer, setCounteroffer] = React.useState<number>(state.offer?.total ?? 0);
  const [reason, setReason] = React.useState(state.offer?.negotiationReason ?? "");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [agreedTotal, setAgreedTotal] = React.useState<number | null>(
    isAgreedFromState ? (state.offer?.agreedTotal ?? null) : null
  );
  const [receiptError, setReceiptError] = React.useState("");

  const isReviewing = flowState === "reviewing" && isSubmitting;

  React.useEffect(() => {
    if (!isReviewing) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await pricingAdapter.reviewCounteroffer(counteroffer);
        if (cancelled) return;

        const finalTotal = result.agreedTotal;
        setAgreedTotal(finalTotal);
        dispatch({
          type: "SET_NEGOTIATION",
          counteroffer,
          reason,
          status: "agreed",
          agreedTotal: finalTotal,
        });
        setFlowState("agreed");
      } catch (err) {
        if (cancelled) return;
        setErrors([err instanceof Error ? err.message : "Negosiasi gagal"]);
        setFlowState("negotiating");
      } finally {
        if (!cancelled) setIsSubmitting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviewing]);

  const hasRequiredData = state.offer && state.assessment && state.weight;
  React.useEffect(() => {
    if (!hasRequiredData) {
      router.replace("/intake/capture");
    }
  }, [hasRequiredData, router]);

  if (!hasRequiredData) return null;

  const savedOffer = state.offer!;
  const savedAssessment = state.assessment!;
  const savedWeight = state.weight!;

  function handleAccept() {
    const total = savedOffer.total;
    setAgreedTotal(total);
    dispatch({
      type: "SET_NEGOTIATION",
      counteroffer: total,
      reason: "Menerima penawaran awal",
      status: "agreed",
      agreedTotal: total,
    });
    setFlowState("agreed");
  }

  function handleStartNegotiation() {
    setCounteroffer(savedOffer.total);
    setReason("");
    setErrors([]);
    setFlowState("negotiating");
  }

  function handleSubmitNegotiation() {
    const validationErrors = validateCounteroffer(counteroffer, reason, savedOffer.total);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setIsSubmitting(true);
    setFlowState("reviewing");
  }

  async function handlePrintReceipt() {
    setReceiptError("");
    try {
      const receipt = await receiptPrinterAdapter.print({
        assessment: savedAssessment,
        offer: { ...savedOffer, agreedTotal: agreedTotal ?? savedOffer.total, status: "agreed" },
        weight: savedWeight,
      });
      dispatch({ type: "SET_RECEIPT", receipt });
      router.push("/intake/success");
    } catch (err) {
      setReceiptError(err instanceof Error ? err.message : "Gagal mencetak receipt");
    }
  }

  function handleBack() {
    if (flowState === "negotiating") {
      setFlowState("offered");
      setErrors([]);
    } else {
      router.push("/intake/assessment");
    }
  }

  const showBackButton = flowState !== "reviewing" && flowState !== "agreed";
  const showNextButton = flowState === "agreed";

  const footer = (
    <KioskFooterActions
      start={
        showBackButton ? (
          <Button variant="outline" size="kiosk" onClick={handleBack}>
            <ArrowLeft aria-hidden="true" className="size-5" />
            {flowState === "negotiating" ? "Batal" : "Kembali"}
          </Button>
        ) : null
      }
      end={
        showNextButton ? (
          <Button size="kiosk" onClick={handlePrintReceipt}>
            <Printer aria-hidden="true" className="size-5" />
            Cetak receipt
          </Button>
        ) : null
      }
    />
  );

  return (
    <KioskPage
      progress={{ label: "Penerimaan", current: 4, total: 5 }}
      footer={footer}
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center animate-foundation-in">
        {flowState === "offered" && (
          <section className="w-full rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 rounded-2xl bg-surface p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Komoditas</p>
                  <p className="mt-1 text-lg font-extrabold">{savedAssessment.commodityName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="mt-1 text-lg font-extrabold">{savedAssessment.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Berat</p>
                  <p className="mt-1 text-lg font-extrabold">{savedWeight.net.toFixed(1)} kg</p>
                </div>
              </div>
            </div>

            <div className="mb-8 text-center">
              <p className="text-base text-muted-foreground">Penawaran awal</p>
              <p className="mt-2 text-4xl font-extrabold text-deep-teal sm:text-5xl">
                {formatIDR(savedOffer.total)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="kiosk" onClick={handleAccept} className="flex-1">
                <CheckCircle2 aria-hidden="true" className="size-5" />
                Terima penawaran
              </Button>
              <Button variant="outline" size="kiosk" onClick={handleStartNegotiation} className="flex-1">
                <MessageSquareText aria-hidden="true" className="size-5" />
                Ajukan harga lain
              </Button>
            </div>
          </section>
        )}

        {flowState === "negotiating" && (
          <section className="w-full rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-2 text-2xl font-extrabold">Ajukan harga</h2>
            <p className="mb-6 text-base text-muted-foreground">
              Penawaran awal: {formatIDR(savedOffer.total)}
            </p>

            <div className="space-y-5">
              <div>
                <label htmlFor="counteroffer" className="mb-2 block text-base font-bold">
                  Harga negosiasi
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">Rp</span>
                  <input
                    id="counteroffer"
                    type="text"
                    inputMode="numeric"
                    value={counteroffer || ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const num = raw ? parseInt(raw, 10) : 0;
                      setCounteroffer(num);
                      setErrors([]);
                    }}
                    placeholder="0"
                    className="min-h-16 w-full rounded-xl border-2 border-border bg-background pl-12 pr-4 text-right text-2xl font-extrabold outline-none focus:border-primary focus:ring-4 focus:ring-ring/15"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="mb-2 block text-base font-bold">
                  Alasan negosiasi
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setErrors([]);
                  }}
                  placeholder="Jelaskan alasan pengajuan harga..."
                  className="min-h-[5rem] w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-4 focus:ring-ring/15"
                />
                <p className="mt-1 text-sm text-muted-foreground">Minimal 5 karakter</p>
              </div>

              {errors.length > 0 && (
                <ul className="space-y-1 rounded-xl bg-destructive/5 p-4">
                  {errors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-destructive">
                      <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                      {err}
                    </li>
                  ))}
                </ul>
              )}

              <Button
                size="kiosk"
                className="w-full"
                onClick={handleSubmitNegotiation}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : "Kirim negosiasi"}
              </Button>
            </div>
          </section>
        )}

        {flowState === "reviewing" && (
          <LoadingPanel
            title="Meninjau negosiasi"
            description="Petugas sedang meninjau pengajuan harga Anda"
          />
        )}

        {flowState === "agreed" && (
          <section className="w-full rounded-3xl border border-border bg-white p-6 text-center shadow-sm sm:p-8">
            <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 aria-hidden="true" className="size-10 text-success" />
            </span>

            <h2 className="mt-6 text-3xl font-extrabold">Kesepakatan tercapai!</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Harga telah disetujui oleh kedua belah pihak
            </p>

            <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-deep-teal p-6 text-white">
              <p className="text-sm text-white/70">Total harga</p>
              <p className="mt-1 text-3xl font-extrabold">
                {formatIDR(agreedTotal ?? savedOffer.total)}
              </p>
            </div>

            {receiptError && (
              <p className="mt-4 text-sm text-destructive">{receiptError}</p>
            )}
          </section>
        )}
      </div>
    </KioskPage>
  );
}
