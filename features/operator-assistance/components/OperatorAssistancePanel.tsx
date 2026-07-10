"use client";

import { Check, PencilLine, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { AiReview } from "../types/contracts";

export type OperatorAssistancePanelProps = {
  review: AiReview;
  onCorrect?: (input: {
    field: "COMMODITY_TYPE" | "QUALITY_GRADE";
    correctedValue: string;
    reason: string;
  }) => void;
  onApprove?: () => void;
};

export function OperatorAssistancePanel({
  review,
  onCorrect,
  onApprove,
}: OperatorAssistancePanelProps) {
  const [field, setField] = useState<"COMMODITY_TYPE" | "QUALITY_GRADE">(
    "QUALITY_GRADE",
  );
  const [correctedValue, setCorrectedValue] = useState("");
  const [reason, setReason] = useState("");
  const canSubmit = correctedValue.trim().length > 0 && reason.trim().length >= 5;

  return (
    <section
      aria-labelledby="operator-review-title"
      className="rounded-2xl border border-border bg-background p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Pendampingan petugas</p>
          <h2 id="operator-review-title" className="mt-1 text-xl font-bold text-foreground">
            Review hasil AI
          </h2>
        </div>
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
          {review.status}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <Result label="Komoditas" value={review.originalAssessment.commodityType} />
        <Result label="Grade kualitas" value={review.originalAssessment.qualityGrade} />
      </dl>

      {review.status !== "APPROVED" ? (
        <div className="mt-5 rounded-xl bg-surface p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <PencilLine aria-hidden="true" className="size-4 text-primary" /> Koreksi hasil
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-foreground">
              Bagian yang dikoreksi
              <select
                className="h-10 rounded-md border border-border bg-background px-3 font-normal"
                value={field}
                onChange={(event) =>
                  setField(event.target.value as "COMMODITY_TYPE" | "QUALITY_GRADE")
                }
              >
                <option value="QUALITY_GRADE">Grade kualitas</option>
                <option value="COMMODITY_TYPE">Jenis komoditas</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-foreground">
              Nilai koreksi
              <input
                className="h-10 rounded-md border border-border bg-background px-3 font-normal"
                value={correctedValue}
                onChange={(event) => setCorrectedValue(event.target.value)}
              />
            </label>
          </div>
          <label className="mt-3 grid gap-1 text-sm font-semibold text-foreground">
            Alasan koreksi (wajib)
            <textarea
              className="min-h-20 rounded-md border border-border bg-background p-3 font-normal"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Jelaskan bukti visual atau kondisi komoditas."
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!canSubmit || !onCorrect}
              onClick={() => onCorrect?.({ field, correctedValue, reason })}
            >
              <PencilLine aria-hidden="true" /> Simpan koreksi
            </Button>
            <Button onClick={onApprove} disabled={!onApprove}>
              <ShieldCheck aria-hidden="true" /> Setujui hasil
            </Button>
          </div>
        </div>
      ) : (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-surface p-4 text-sm font-semibold">
          <Check aria-hidden="true" className="size-5 text-success" /> Hasil telah disetujui petugas.
        </p>
      )}

      <details className="mt-5 border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-bold text-foreground">
          Audit trail ({review.auditTrail.length})
        </summary>
        <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
          {review.auditTrail.map((entry) => (
            <li key={entry.id}>{entry.action.replaceAll("_", " ")} · {entry.actorId}</li>
          ))}
        </ol>
      </details>
    </section>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-bold text-foreground">{value}</dd>
    </div>
  );
}
