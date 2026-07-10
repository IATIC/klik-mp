"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import * as React from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { LoadingPanel } from "@/components/kiosk/loading-panel";
import { Button } from "@/components/ui/button";
import { assessmentAdapter } from "@/lib/services/mock-assessment";
import { pricingAdapter } from "@/lib/services/mock-pricing";
import { useKioskFlow } from "@/features/kiosk-flow";

type AssessmentStage = "idle" | "loading" | "result" | "error";

type ProgressStage = {
  label: string;
  percent: number;
};

const PROGRESS_STAGES: ProgressStage[] = [
  { label: "Memeriksa foto...", percent: 25 },
  { label: "Mengenali komoditas...", percent: 50 },
  { label: "Menilai kualitas...", percent: 75 },
  { label: "Menghitung referensi harga...", percent: 100 },
];

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default function AssessmentPage() {
  const router = useRouter();
  const { state, dispatch } = useKioskFlow();

  const [stage, setStage] = React.useState<AssessmentStage>("idle");
  const [progressIndex, setProgressIndex] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [assessmentResult, setAssessmentResult] = React.useState<{
    result: {
      commodityName: string;
      grade: string;
      qualityLabel: string;
      netWeight: number;
      referencePrice: number;
      confidence: number;
    };
    offer: { referencePrice: number; total: number };
  } | null>(null);

  const isIdle = stage === "idle";

  React.useEffect(() => {
    if (!isIdle) return;
    const c = state.selectedCommodity;
    const w = state.weight;
    if (!c || !w) return;

    let cancelled = false;
    setStage("loading");

    (async () => {
      try {
        const result = await assessmentAdapter.assess(c);
        if (cancelled) return;
        setProgressIndex(3);

        const offer = await pricingAdapter.createOffer(result, w);

        if (cancelled) return;
        dispatch({ type: "SET_ASSESSMENT", assessment: result, offer });
        setAssessmentResult({
          result: {
            commodityName: result.commodityName,
            grade: result.grade,
            qualityLabel: result.qualityLabel,
            netWeight: w.net,
            referencePrice: result.referencePrice,
            confidence: result.confidence,
          },
          offer: { referencePrice: result.referencePrice, total: offer.total },
        });
        setStage("result");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : "Penilaian gagal diproses");
        setStage("error");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdle]);

  const hasCaptureData = state.selectedCommodity && state.weight && state.capturedPhoto;
  React.useEffect(() => {
    if (!hasCaptureData) {
      router.replace("/intake/capture");
    }
  }, [hasCaptureData, router]);

  if (!hasCaptureData) return null;

  function handleNext() {
    router.push("/intake/offer");
  }

  function handleBack() {
    router.push("/intake/capture");
  }

  function handleRetry() {
    setStage("idle");
    setProgressIndex(0);
    setErrorMessage("");
  }

  const footer = (
    <KioskFooterActions
      start={
        stage === "result" ? (
          <Button variant="outline" size="kiosk" onClick={handleBack}>
            <ArrowLeft aria-hidden="true" className="size-5" />
            Kembali
          </Button>
        ) : null
      }
      end={
        stage === "result" ? (
          <Button size="kiosk" onClick={handleNext}>
            Lanjut ke penawaran
            <ArrowRight aria-hidden="true" className="size-5" />
          </Button>
        ) : stage === "error" ? (
          <Button size="kiosk" onClick={handleRetry}>
            Coba lagi
          </Button>
        ) : null
      }
    />
  );

  return (
    <KioskPage
      progress={{ label: "Penerimaan", current: 3, total: 5 }}
      footer={footer}
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center animate-foundation-in">
        {stage === "loading" && (
          <LoadingPanel
            title="Menganalisis komoditas"
            description={PROGRESS_STAGES[progressIndex]?.label ?? "Memproses..."}
            progress={PROGRESS_STAGES[progressIndex]?.percent ?? 0}
          />
        )}

        {stage === "error" && (
          <section className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-border bg-background p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldCheck aria-hidden="true" className="size-8" />
            </span>
            <h2 className="mt-5 text-2xl font-bold">Penilaian gagal</h2>
            <p className="mt-2 max-w-xl text-base text-muted-foreground">{errorMessage}</p>
          </section>
        )}

        {stage === "result" && assessmentResult && (
          <section className="w-full rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
                <Sparkles aria-hidden="true" className="size-7" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold">Hasil Penilaian</h2>
                <p className="text-sm text-muted-foreground">Komoditas telah dinilai oleh sistem</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-5">
                <p className="text-sm text-muted-foreground">Komoditas</p>
                <p className="mt-1 text-xl font-extrabold">{assessmentResult.result.commodityName}</p>
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  {assessmentResult.result.grade}
                </span>
              </div>

              <div className="rounded-2xl bg-surface p-5">
                <p className="text-sm text-muted-foreground">Kualitas</p>
                <p className="mt-1 text-xl font-extrabold">{assessmentResult.result.qualityLabel}</p>
              </div>

              <div className="rounded-2xl bg-surface p-5">
                <p className="text-sm text-muted-foreground">Berat Netto</p>
                <p className="mt-1 text-xl font-extrabold">{assessmentResult.result.netWeight.toFixed(1)} kg</p>
              </div>

              <div className="rounded-2xl bg-surface p-5">
                <p className="text-sm text-muted-foreground">Harga Referensi</p>
                <p className="mt-1 text-xl font-extrabold">{formatIDR(assessmentResult.result.referencePrice)}</p>
              </div>

              <div className="rounded-2xl bg-surface p-5 sm:col-span-2">
                <p className="text-sm text-muted-foreground">Tingkat keyakinan</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.round(assessmentResult.result.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-lg font-extrabold">
                    {Math.round(assessmentResult.result.confidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-deep-teal p-5 text-white sm:col-span-2">
                <p className="text-sm text-white/70">Penawaran awal</p>
                <p className="mt-1 text-3xl font-extrabold">
                  {formatIDR(assessmentResult.offer.total)}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </KioskPage>
  );
}
