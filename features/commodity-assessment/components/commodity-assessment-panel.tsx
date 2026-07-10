"use client";

import { Bot, CheckCircle2, PencilLine, ScanSearch, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { assessCommodity } from "../services/assess-commodity";
import {
  correctCommodityAssessment,
  verifyCommodityAssessment,
} from "../services/review-assessment";
import type {
  CommodityAssessment,
  CommodityVisionAdapter,
  CommodityVisionInput,
} from "../types/commodity-assessment";

type AssessmentStep =
  | "idle"
  | "analyzing"
  | "review"
  | "correcting"
  | "verified"
  | "error";

export type CommodityAssessmentPanelProps = {
  input: CommodityVisionInput;
  visionAdapter: CommodityVisionAdapter;
  onAssessed?: (assessment: CommodityAssessment) => void;
};

function readableError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Analisis gagal karena kendala yang tidak diketahui.";
}

export function CommodityAssessmentPanel({
  input,
  visionAdapter,
  onAssessed,
}: CommodityAssessmentPanelProps) {
  const [step, setStep] = useState<AssessmentStep>("idle");
  const [assessment, setAssessment] = useState<CommodityAssessment | null>(null);
  const [correctedValue, setCorrectedValue] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const busy = step === "analyzing" || step === "correcting";

  async function runAssessment() {
    setMessage(null);
    setStep("analyzing");
    try {
      const result = await assessCommodity(visionAdapter, input);
      setAssessment(result);
      setStep("review");
    } catch (error) {
      setMessage(readableError(error));
      setStep("error");
    }
  }

  function verifyPrediction() {
    if (!assessment) return;
    try {
      const result = verifyCommodityAssessment(assessment);
      setAssessment(result);
      setStep("verified");
      setMessage(null);
      onAssessed?.(result);
    } catch (error) {
      setMessage(readableError(error));
      setStep("error");
    }
  }

  function submitCorrection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment) return;
    setStep("correcting");
    setMessage(null);

    try {
      const result = correctCommodityAssessment(assessment, {
        correctedValue,
        correctionReason,
      });
      setAssessment(result);
      setStep("verified");
      onAssessed?.(result);
    } catch (error) {
      setMessage(readableError(error));
      setStep("review");
    }
  }

  return (
    <section
      aria-labelledby="commodity-assessment-title"
      className="overflow-hidden rounded-2xl border border-border bg-background"
    >
      <header className="border-b border-border bg-surface px-5 py-5 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Analisis komoditas
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="commodity-assessment-title"
              className="text-xl font-bold text-foreground"
            >
              Klasifikasi dan estimasi kualitas
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              AI memberi rekomendasi awal. Petugas tetap memverifikasi hasil sebelum
              transaksi dilanjutkan.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Bot aria-hidden="true" className="size-3.5" />
            {step === "verified" ? "Diverifikasi petugas" : "Menunggu verifikasi"}
          </span>
        </div>
      </header>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-border p-5 sm:p-7 lg:border-r lg:border-b-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface">
            <div
              role="img"
              aria-label="Bukti foto komoditas yang dianalisis"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${JSON.stringify(input.imageUrl)})` }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#082f3a]/90 to-transparent px-4 pb-4 pt-12 text-xs font-semibold text-white">
              Capture {input.captureId}
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Confidence adalah tingkat keyakinan model, bukan keputusan akhir kualitas.
          </p>
        </div>

        <div className="p-5 sm:p-7">
          {!assessment ? (
            <div className="flex min-h-64 flex-col items-start justify-center">
              <ScanSearch className="size-10 text-primary" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-bold text-foreground">
                Foto siap dianalisis
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Jalankan model klasifikasi untuk mendapatkan jenis dan estimasi grade
                komoditas.
              </p>
              {message ? <ErrorMessage message={message} /> : null}
              <Button
                type="button"
                className="mt-6"
                disabled={busy}
                onClick={runAssessment}
              >
                <ScanSearch aria-hidden="true" />
                {step === "analyzing" ? "Menganalisis…" : "Analisis foto"}
              </Button>
            </div>
          ) : (
            <div>
              {step === "verified" ? (
                <div
                  role="status"
                  className="mb-6 flex gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Hasil telah diverifikasi</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {assessment.correctedValue
                        ? "Koreksi dan alasan petugas telah dicatat."
                        : "Petugas menyetujui hasil prediksi AI."}
                    </p>
                  </div>
                </div>
              ) : null}

              <dl className="divide-y divide-border border-y border-border">
                <AssessmentRow label="Jenis komoditas" value={assessment.commodityType} />
                <AssessmentRow label="Grade kualitas" value={assessment.qualityGrade} />
              </dl>
              <div className="mt-6 space-y-5">
                <ConfidenceMeter
                  label="Confidence klasifikasi"
                  value={assessment.classificationConfidence}
                />
                <ConfidenceMeter
                  label="Confidence kualitas"
                  value={assessment.qualityConfidence}
                />
              </div>

              {assessment.correctedValue ? (
                <div className="mt-6 border-l-2 border-primary pl-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    Koreksi petugas
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {assessment.correctedValue}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {assessment.correctionReason}
                  </p>
                </div>
              ) : null}

              {step !== "verified" ? (
                <>
                  <div className="my-7 h-px bg-border" />
                  <Button type="button" className="w-full" onClick={verifyPrediction}>
                    <CheckCircle2 aria-hidden="true" /> Setujui hasil AI
                  </Button>

                  <form className="mt-6" onSubmit={submitCorrection} noValidate>
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <PencilLine className="size-4 text-primary" aria-hidden="true" />
                      Koreksi hasil
                    </div>
                    <div className="mt-4 space-y-4">
                      <label className="block text-sm font-semibold text-foreground">
                        Nilai yang benar
                        <input
                          value={correctedValue}
                          onChange={(event) => setCorrectedValue(event.target.value)}
                          className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                          placeholder="Contoh: Gabah Kering Giling — Grade A"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-foreground">
                        Alasan koreksi
                        <textarea
                          value={correctionReason}
                          onChange={(event) => setCorrectionReason(event.target.value)}
                          className="mt-2 min-h-24 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                          placeholder="Jelaskan indikator visual yang mendasari koreksi"
                        />
                      </label>
                    </div>
                    {message ? <ErrorMessage message={message} /> : null}
                    <Button
                      type="submit"
                      variant="outline"
                      className="mt-4 w-full"
                      disabled={busy}
                    >
                      {step === "correcting" ? "Mencatat…" : "Simpan koreksi dan verifikasi"}
                    </Button>
                  </form>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AssessmentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold text-foreground">{value}</dd>
    </div>
  );
}

function ConfidenceMeter({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums text-foreground">{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="h-2 overflow-hidden rounded-full bg-surface"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-5 flex gap-3 rounded-lg border border-error/30 bg-error/5 p-3 text-sm leading-5 text-error"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

