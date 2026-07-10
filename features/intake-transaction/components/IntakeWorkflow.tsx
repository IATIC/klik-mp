"use client";

import { Check, Circle, CircleDollarSign, PackageCheck, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import type { IntakeSession, IntakeSessionStatus } from "../types/contracts";

const steps: { status: IntakeSessionStatus; label: string }[] = [
  { status: "IDENTITY_VERIFIED", label: "Identitas" },
  { status: "MEMBERSHIP_READY", label: "Keanggotaan" },
  { status: "COMMODITY_CAPTURED", label: "Timbang & foto" },
  { status: "COMMODITY_ASSESSED", label: "Penilaian" },
  { status: "OFFER_CREATED", label: "Penawaran" },
  { status: "AGREED", label: "Kesepakatan" },
  { status: "COMPLETED", label: "Selesai" },
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
  onApproveBuyer,
  onApproveSeller,
  onComplete,
  onCancel,
}: IntakeWorkflowProps) {
  const currentIndex = statusOrder.indexOf(session.status);
  const buyerApproved = session.approvals.some(({ party }) => party === "BUYER");
  const sellerApproved = session.approvals.some(({ party }) => party === "SELLER");
  const canFinalize = session.status === "AGREED";
  const terminal = ["COMPLETED", "REJECTED", "CANCELLED"].includes(
    session.status,
  );
  const activeModule = getActiveModule(session.status, {
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
          const stepIndex = statusOrder.indexOf(step.status);
          const done = currentIndex >= stepIndex && currentIndex >= 0;
          return (
            <li
              key={step.status}
              className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-xs font-semibold"
            >
              {done ? (
                <Check aria-hidden="true" className="size-4 text-success" />
              ) : (
                <Circle aria-hidden="true" className="size-4 text-muted-foreground" />
              )}
              {step.label}
            </li>
          );
        })}
      </ol>

      {activeModule ? (
        <div aria-label="Modul aktif" className="rounded-2xl border border-border bg-background p-5">
          {activeModule}
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
              disabled={buyerApproved || !onApproveBuyer}
            >
              <Check aria-hidden="true" />
              {buyerApproved ? "Pembeli sudah setuju" : "Persetujuan pembeli"}
            </Button>
            <Button
              variant={sellerApproved ? "outline" : "default"}
              onClick={onApproveSeller}
              disabled={sellerApproved || !onApproveSeller}
            >
              <Check aria-hidden="true" />
              {sellerApproved ? "Penjual sudah setuju" : "Persetujuan penjual"}
            </Button>
            <Button
              onClick={onComplete}
              disabled={!buyerApproved || !sellerApproved || !onComplete}
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
