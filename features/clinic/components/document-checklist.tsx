"use client";

import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import type { DocumentRequirement } from "../types/clinic";

type DocumentChecklistProps = {
  requirements: DocumentRequirement[];
  readOnly?: boolean;
  consentAccepted: boolean;
  onConsentChange?: (accepted: boolean) => void;
};

export function DocumentChecklist({
  requirements,
  readOnly = false,
  consentAccepted,
  onConsentChange,
}: DocumentChecklistProps) {
  const consentReq = requirements.find((r) => r.id === "consent");
  const otherReqs = requirements.filter((r) => r.id !== "consent");

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-extrabold sm:text-xl">Kelengkapan Administrasi</h2>
      <p className="text-sm text-muted-foreground">
        Pastikan data berikut sudah lengkap
      </p>

      <div className="space-y-3">
        {otherReqs.map((req) => {
          const isComplete = req.available;
          const isOptional = req.status === "OPTIONAL";
          return (
            <div
              key={req.id}
              className={`flex items-center gap-4 rounded-2xl border bg-white px-5 py-4 sm:px-6 sm:py-5 ${
                isComplete ? "border-green-200" : "border-border"
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                  isComplete
                    ? "bg-green-50 text-green-600"
                    : isOptional
                      ? "bg-muted text-muted-foreground"
                      : "bg-red-50 text-red-500"
                }`}
              >
                {isComplete ? (
                  <CheckCircle aria-hidden="true" className="size-5" />
                ) : isOptional ? (
                  <Circle aria-hidden="true" className="size-5" />
                ) : (
                  <AlertCircle aria-hidden="true" className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{req.label}</p>
                <p className="text-xs text-muted-foreground">{req.description}</p>
              </div>
              <span
                className={`shrink-0 text-xs font-bold ${
                  isComplete
                    ? "text-green-600"
                    : isOptional
                      ? "text-muted-foreground"
                      : "text-red-500"
                }`}
              >
                {isComplete ? "Tersedia" : isOptional ? "Opsional" : "Belum tersedia"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Consent checkbox */}
      {consentReq && (
        <label
          className={`flex cursor-pointer items-start gap-4 rounded-2xl border px-5 py-4 transition-colors sm:px-6 sm:py-5 ${
            consentAccepted ? "border-primary bg-primary/5" : "border-border bg-white"
          } ${readOnly ? "cursor-default" : ""}`}
        >
          <input
            type="checkbox"
            checked={consentAccepted}
            onChange={(e) => onConsentChange?.(e.target.checked)}
            disabled={readOnly}
            className="mt-1 size-5 accent-primary"
            aria-label={consentReq.label}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{consentReq.label}</p>
            <p className="text-xs text-muted-foreground">{consentReq.description}</p>
          </div>
        </label>
      )}
    </section>
  );
}
