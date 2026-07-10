"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleUserRound,
  Fingerprint,
  ScanFace,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import type {
  FaceRecognitionAdapter,
  FingerprintAdapter,
} from "../adapters/contracts";
import {
  toIdentityMembershipError,
  verifyIdentityMembership,
} from "../services/verify-identity-membership";
import type {
  BiometricVerification,
  IdentityCorrection,
  IdentityMembershipError,
  IdentityMembershipWorkflowState,
  MembershipStatus,
  SavingsSettlement,
  VerifiedSeller,
} from "../types/identity-membership";

export type IdentityMembershipWorkflowProps = {
  sessionId: string;
  membershipStatus: MembershipStatus;
  fingerprintAdapter: FingerprintAdapter;
  faceRecognitionAdapter: FaceRecognitionAdapter;
  sellerIdHint?: string;
  initialSettlement?: SavingsSettlement;
  correction?: IdentityCorrection;
  onVerified?: (seller: VerifiedSeller) => void;
  onError?: (error: IdentityMembershipError) => void;
  className?: string;
};

type BiometricEvidence = {
  fingerprint: BiometricVerification;
  face: BiometricVerification;
};

const stateLabels: Record<IdentityMembershipWorkflowState, string> = {
  IDLE: "Belum dimulai",
  VERIFYING_IDENTITY: "Memverifikasi",
  AWAITING_SETTLEMENT: "Perlu pilihan simpanan",
  VERIFIED: "Identitas siap",
  ERROR: "Perlu ditinjau",
};

const settlementLabels: Record<SavingsSettlement, string> = {
  DIRECT_PAYMENT: "Setor langsung",
  DEDUCT_FROM_MARGIN: "Potong dari margin transaksi",
};

export function IdentityMembershipWorkflow({
  sessionId,
  membershipStatus,
  fingerprintAdapter,
  faceRecognitionAdapter,
  sellerIdHint,
  initialSettlement,
  correction,
  onVerified,
  onError,
  className = "",
}: IdentityMembershipWorkflowProps) {
  const [state, setState] = useState<IdentityMembershipWorkflowState>("IDLE");
  const [settlement, setSettlement] = useState<SavingsSettlement | undefined>(
    initialSettlement,
  );
  const [evidence, setEvidence] = useState<BiometricEvidence | null>(null);
  const [verifiedSeller, setVerifiedSeller] = useState<VerifiedSeller | null>(
    null,
  );
  const [error, setError] = useState<IdentityMembershipError | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const titleId = useId();

  useEffect(() => {
    return () => activeRequest.current?.abort();
  }, []);

  function publishError(nextError: IdentityMembershipError) {
    setError(nextError);
    setState("ERROR");
    onError?.(nextError);
  }

  function completeVerification(
    nextEvidence: BiometricEvidence,
    nextSettlement?: SavingsSettlement,
  ) {
    const result = verifyIdentityMembership({
      expectedSellerId: sellerIdHint,
      membershipStatus,
      fingerprint: nextEvidence.fingerprint,
      face: nextEvidence.face,
      savingsSettlement: nextSettlement,
      correction,
    });

    if (!result.ok) {
      if (result.error.code === "SETTLEMENT_REQUIRED") {
        setError(null);
        setState("AWAITING_SETTLEMENT");
        return;
      }

      publishError(result.error);
      return;
    }

    setError(null);
    setVerifiedSeller(result.seller);
    setState("VERIFIED");
    onVerified?.(result.seller);
  }

  async function startVerification() {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setError(null);
    setVerifiedSeller(null);
    setEvidence(null);
    setState("VERIFYING_IDENTITY");

    try {
      const request = {
        sessionId,
        sellerIdHint,
        signal: controller.signal,
      };
      const [fingerprint, face] = await Promise.all([
        fingerprintAdapter.verify(request),
        faceRecognitionAdapter.verify(request),
      ]);

      if (controller.signal.aborted) {
        return;
      }

      const nextEvidence = { fingerprint, face };
      setEvidence(nextEvidence);
      completeVerification(nextEvidence, settlement);
    } catch (caughtError) {
      if (controller.signal.aborted) {
        return;
      }

      const nextError = toIdentityMembershipError(caughtError);
      controller.abort();
      publishError(nextError);
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
      }
    }
  }

  function confirmSettlement() {
    if (!evidence) {
      publishError({
        code: "INVALID_INPUT",
        message: "Verifikasi biometrik perlu dilakukan sebelum memilih simpanan.",
        retryable: true,
      });
      return;
    }

    completeVerification(evidence, settlement);
  }

  const isVerifying = state === "VERIFYING_IDENTITY";

  return (
    <section
      aria-labelledby={titleId}
      className={`overflow-hidden rounded-xl border border-border bg-background ${className}`}
    >
      <header className="flex flex-col gap-4 border-b border-border bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2
              id={titleId}
              className="text-lg font-bold text-foreground"
            >
              Identitas & keanggotaan
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cocokkan sidik jari dan wajah sebelum melanjutkan transaksi.
            </p>
          </div>
        </div>
        <span
          aria-live="polite"
          className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-institutional-teal"
        >
          {stateLabels[state]}
        </span>
      </header>

      <div className="px-5 py-5 sm:px-6">
        <div className="grid gap-0 sm:grid-cols-2">
          <BiometricStatus
            icon={Fingerprint}
            label="Sidik jari"
            description="Pemindaian fingerprint scanner"
            complete={evidence?.fingerprint.verified === true}
          />
          <BiometricStatus
            icon={ScanFace}
            label="Pengenalan wajah"
            description="Pencocokan wajah dari kamera"
            complete={evidence?.face.verified === true}
            borderOnDesktop
          />
        </div>

        {state === "AWAITING_SETTLEMENT" ? (
          <fieldset className="mt-6 border-t border-border pt-6">
            <legend className="flex items-center gap-2 text-sm font-bold text-foreground">
              <WalletCards aria-hidden="true" className="size-4 text-primary" />
              Pilih penyelesaian simpanan pokok
            </legend>
            <p className="mt-2 text-sm text-muted-foreground">
              Keanggotaan wajib diselesaikan sebelum transaksi dapat diteruskan.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                ["DIRECT_PAYMENT", "DEDUCT_FROM_MARGIN"] as const
              ).map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors focus-within:ring-3 focus-within:ring-ring/30 ${
                    settlement === option
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-surface"
                  }`}
                >
                  <input
                    checked={settlement === option}
                    className="mt-1 size-4 accent-primary"
                    name="savings-settlement"
                    onChange={() => setSettlement(option)}
                    type="radio"
                    value={option}
                  />
                  <span>
                    <span className="block text-sm font-bold text-foreground">
                      {settlementLabels[option]}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {option === "DIRECT_PAYMENT"
                        ? "Simpanan dibayarkan sebelum transaksi dilanjutkan."
                        : "Simpanan dicatat untuk dipotong saat margin transaksi tersedia."}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <Button
              className="mt-4 w-full sm:w-auto"
              disabled={!settlement}
              onClick={confirmSettlement}
              type="button"
            >
              Konfirmasi pilihan
            </Button>
          </fieldset>
        ) : null}

        {state === "VERIFIED" && verifiedSeller ? (
          <div
            aria-live="polite"
            className="mt-6 flex items-start gap-3 border-t border-border pt-6"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-success"
            />
            <div>
              <p className="font-bold text-foreground">Identitas terverifikasi</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Penjual {verifiedSeller.sellerId} siap melanjutkan proses.
              </p>
              {verifiedSeller.savingsSettlement ? (
                <p className="mt-2 text-xs font-semibold text-institutional-teal">
                  Penyelesaian simpanan: {settlementLabels[verifiedSeller.savingsSettlement]}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {state === "ERROR" && error ? (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 border-t border-destructive/30 bg-destructive/5 px-4 py-4"
          >
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-destructive"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground">Verifikasi tidak dapat dilanjutkan</p>
              <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
              <p className="mt-2 text-xs font-bold text-destructive">{error.code}</p>
              {error.retryable ? (
                <Button
                  className="mt-3"
                  onClick={startVerification}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Coba lagi
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {state === "IDLE" ? (
          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleUserRound aria-hidden="true" className="size-4" />
              <span>
                Status anggota: {membershipStatus === "ACTIVE" ? "Aktif" : "Menunggu pembayaran"}
              </span>
            </div>
            <Button onClick={startVerification} type="button">
              Mulai verifikasi
            </Button>
          </div>
        ) : null}

        {isVerifying ? (
          <div
            aria-live="polite"
            className="mt-6 flex items-center gap-3 border-t border-border pt-6 text-sm font-semibold text-institutional-teal"
          >
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
            />
            Menunggu hasil sidik jari dan kamera…
          </div>
        ) : null}
      </div>
    </section>
  );
}

type BiometricStatusProps = {
  icon: typeof Fingerprint;
  label: string;
  description: string;
  complete: boolean;
  borderOnDesktop?: boolean;
};

function BiometricStatus({
  icon: Icon,
  label,
  description,
  complete,
  borderOnDesktop = false,
}: BiometricStatusProps) {
  return (
    <div
      className={`flex items-center gap-3 py-3 ${
        borderOnDesktop
          ? "border-t border-border sm:border-l sm:border-t-0 sm:pl-5"
          : "sm:pr-5"
      }`}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <span
        className={`text-xs font-bold ${
          complete ? "text-success" : "text-muted-foreground"
        }`}
      >
        {complete ? "Sesuai" : "Menunggu"}
      </span>
    </div>
  );
}
