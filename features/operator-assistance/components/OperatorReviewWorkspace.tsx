"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { approveAiReview, correctAiReview } from "../services/operator";
import type { AiReview } from "../types/contracts";
import { OperatorAssistancePanel } from "./OperatorAssistancePanel";

export type OperatorReviewWorkspaceProps = {
  initialReview: AiReview;
};

function context(prefix: string) {
  return {
    auditId: `${prefix}-${globalThis.crypto.randomUUID()}`,
    actorId: "operator-demo",
    occurredAt: new Date().toISOString(),
  };
}

export function OperatorReviewWorkspace({
  initialReview,
}: OperatorReviewWorkspaceProps) {
  const [review, setReview] = useState(initialReview);
  const [error, setError] = useState<string | null>(null);

  function correct(input: {
    field: "COMMODITY_TYPE" | "QUALITY_GRADE";
    correctedValue: string;
    reason: string;
  }) {
    setError(null);
    try {
      setReview((current) =>
        correctAiReview(current, {
          ...input,
          ...context("correction"),
        }),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Koreksi gagal.");
    }
  }

  function approve() {
    setError(null);
    try {
      setReview((current) =>
        approveAiReview(current, context("approval")),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Approval gagal.");
    }
  }

  return (
    <div>
      {error ? (
        <p
          role="alert"
          className="mb-4 flex gap-2 border border-error/30 bg-error/5 p-4 text-sm text-error"
        >
          <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
          {error}
        </p>
      ) : null}
      <OperatorAssistancePanel
        review={review}
        onCorrect={correct}
        onApprove={approve}
      />
    </div>
  );
}
