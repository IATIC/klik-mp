"use client";

import { Check, Circle, CircleDollarSign, PackageCheck, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";

import type { IntakeSession, IntakeSessionStatus } from "../types/contracts";

const steps: {
  completionStatus: IntakeSessionStatus;
  previewStatus: IntakeSessionStatus;
  label: string;
  featurePath: string;
}[] = [
  { completionStatus: "IDENTITY_VERIFIED", previewStatus: "DRAFT", label: "Identitas", featurePath: "features/identity-membership" },
  { completionStatus: "MEMBERSHIP_READY", previewStatus: "IDENTITY_VERIFIED", label: "Keanggotaan", featurePath: "features/identity-membership" },
  { completionStatus: "COMMODITY_CAPTURED", previewStatus: "MEMBERSHIP_READY", label: "Timbang & foto", featurePath: "features/commodity-capture" },
  { completionStatus: "COMMODITY_ASSESSED", previewStatus: "COMMODITY_CAPTURED", label: "Penilaian", featurePath: "features/commodity-assessment" },
  { completionStatus: "OFFER_CREATED", previewStatus: "COMMODITY_ASSESSED", label: "Penawaran", featurePath: "features/pricing-negotiation" },
  { completionStatus: "AGREED", previewStatus: "AGREED", label: "Kesepakatan", featurePath: "features/pricing-negotiation + intake-transaction" },
  { completionStatus: "COMPLETED", previewStatus: "COMPLETED", label: "Selesai", featurePath: "features/intake-transaction" },
];

const statusOrder: IntakeSessionStatus[] = [
  "DRAFT",
  "IDENTITY_VERIFIED",
  "MEMBERSHIP_READY",
  "COMMODITY_CAPTURED",
  "COMMODITY_ASSESSED",
  "OFFER_CREATED",
  "NEGOTIATING",
  "AGREED",
  "COMPLETED",
];

export type IntakeWorkflowProps = {
  session: IntakeSession;
  identityStep?: ReactNode;
  captureStep?: ReactNode;
  assessmentStep?: ReactNode;
  pricingStep?: ReactNode;
  allowStagePreview?: boolean;
  onApproveBuyer?: () => void;
  onApproveSeller?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
};

export function IntakeWorkflow({
  session,
  identityStep,
  captureStep,
  assessmentStep,
  pricingStep,
  allowStagePreview = false,
  onApproveBuyer,
  onApproveSeller,
  onComplete,
  onCancel,
}: IntakeWorkflowProps) {
  const [previewSelection, setPreviewSelection] = useState<{
    previewStatus: IntakeSessionStatus;
    serverStatus: IntakeSessionStatus;
  } | null>(null);
  const previewStatus =
    previewSelection?.serverStatus === session.status
      ? previewSelection.previewStatus
      : null;

  const displayedStatus = previewStatus ?? session.status;
  const activeStepStatus = toPreviewStatus(displayedStatus);
  const previewing = previewStatus !== null && previewStatus !== session.status;
  const currentIndex = statusOrder.indexOf(session.status);
  const buyerApproved = session.approvals.some(({ party }) => party === "BUYER");
  const sellerApproved = session.approvals.some(({ party }) => party === "SELLER");
  const canFinalize = displayedStatus === "AGREED";
  const terminal = ["COMPLETED", "REJECTED", "CANCELLED"].includes(
    session.status,
  );
  const activeModule = getActiveModule(displayedStatus, {
    identityStep,
    captureStep,
    assessmentStep,
    pricingStep,
  });

  return (
    <section aria-labelledby="intake-title" className="space-y-5">
      <header className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <p className="text-sm font-semibold text-primary-foreground/75">
          Sesi {session.sessionId}
        </p>
        <h2 id="intake-title" className="mt-1 text-2xl font-bold">
          Penerimaan komoditas
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-primary-foreground/80">
          Setiap hasil diperiksa pada modul asal sebelum transaksi diselesaikan.
        </p>
      </header>

      <ol aria-label="Tahapan penerimaan" className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {steps.map((step) => {
          const stepIndex = statusOrder.indexOf(step.completionStatus);
          const done = currentIndex >= stepIndex && currentIndex >= 0;
          const selected = activeStepStatus === step.previewStatus;
          return (
            <li key={step.completionStatus}>
              <button
                type="button"
                disabled={!allowStagePreview}
                title={allowStagePreview ? `Preview · ${step.featurePath}` : undefined}
                aria-current={selected ? "step" : undefined}
                onClick={() =>
                  setPreviewSelection(
                    step.previewStatus === session.status
                      ? null
                      : {
                          previewStatus: step.previewStatus,
                          serverStatus: session.status,
                        },
                  )
                }
                className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background"
                } ${allowStagePreview ? "cursor-pointer hover:border-primary/40 hover:bg-surface" : "cursor-default"}`}
              >
                {done ? (
                  <Check aria-hidden="true" className="size-4 text-success" />
                ) : (
                  <Circle aria-hidden="true" className="size-4 text-muted-foreground" />
                )}
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>

      {previewing ? (
        <div className="border border-info/25 bg-info/5 px-4 py-3 text-sm text-info">
          Preview development: status server tetap {session.status}. Kontrol pada
          panel preview dinonaktifkan.
        </div>
      ) : null}

      {activeModule ? (
        <div
          aria-label={previewing ? "Preview modul" : "Modul aktif"}
          inert={previewing}
          className={`rounded-2xl border border-border bg-background p-5 ${previewing ? "opacity-75" : ""}`}
        >
          {activeModule}
        </div>
      ) : null}

      {previewing && displayedStatus === "COMPLETED" ? (
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="font-bold">Preview receipt</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Receipt nyata hanya tersedia setelah status server COMPLETED.
          </p>
        </div>
      ) : null}

      {canFinalize ? (
        <div className="rounded-2xl border border-border bg-background p-5">
          <h3 className="flex items-center gap-2 font-bold text-foreground">
            <CircleDollarSign aria-hidden="true" className="size-5 text-primary" />
            Persetujuan akhir transaksi
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pembeli dan penjual harus menyetujui hasil yang sama.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={buyerApproved ? "outline" : "default"}
              onClick={onApproveBuyer}
              disabled={previewing || buyerApproved || !onApproveBuyer}
            >
              <Check aria-hidden="true" />
              {buyerApproved ? "Pembeli sudah setuju" : "Persetujuan pembeli"}
            </Button>
            <Button
              variant={sellerApproved ? "outline" : "default"}
              onClick={onApproveSeller}
              disabled={previewing || sellerApproved || !onApproveSeller}
            >
              <Check aria-hidden="true" />
              {sellerApproved ? "Penjual sudah setuju" : "Persetujuan penjual"}
            </Button>
            <Button
              onClick={onComplete}
              disabled={previewing || !buyerApproved || !sellerApproved || !onComplete}
            >
              <PackageCheck aria-hidden="true" /> Selesaikan penerimaan
            </Button>
          </div>
        </div>
      ) : null}

      {!terminal ? (
        <Button variant="ghost" onClick={onCancel} disabled={!onCancel}>
          <X aria-hidden="true" /> Batalkan sesi dengan aman
        </Button>
      ) : (
        <p role="status" className="rounded-xl bg-surface p-4 text-sm font-semibold text-foreground">
          Status sesi: {session.status.replaceAll("_", " ")}
        </p>
      )}
    </section>
  );
}

function getActiveModule(
  status: IntakeSessionStatus,
  slots: Pick<
    IntakeWorkflowProps,
    "identityStep" | "captureStep" | "assessmentStep" | "pricingStep"
  >,
) {
  if (["DRAFT", "IDENTITY_VERIFIED"].includes(status)) {
    return slots.identityStep;
  }
  if (status === "MEMBERSHIP_READY") return slots.captureStep;
  if (status === "COMMODITY_CAPTURED") return slots.assessmentStep;
  if (["COMMODITY_ASSESSED", "OFFER_CREATED", "NEGOTIATING"].includes(status)) {
    return slots.pricingStep;
  }
  return null;
}

function toPreviewStatus(status: IntakeSessionStatus): IntakeSessionStatus {
  if (["OFFER_CREATED", "NEGOTIATING"].includes(status)) {
    return "COMMODITY_ASSESSED";
  }
  return status;
}
