"use client";

import { AlertTriangle, BadgeCheck, RadioTower, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  CommodityAssessmentPanel,
  HttpCommodityVisionAdapter,
  MockCommodityVisionAdapter,
  type CommodityAssessment,
} from "@/features/commodity-assessment";
import {
  BrowserMediaCameraAdapter,
  CommodityCapturePanel,
  HttpScaleDeviceBridgeAdapter,
  MockCameraAdapter,
  MockScaleAdapter,
  type CommodityCapture,
} from "@/features/commodity-capture";
import {
  createMatchingMockBiometricAdapters,
  HttpFaceRecognitionAdapter,
  HttpFingerprintAdapter,
  IdentityMembershipWorkflow,
  type MembershipStatus,
  type VerifiedSeller,
} from "@/features/identity-membership";
import {
  acceptBySeller,
  acceptCounterByBuyer,
  approveInitialOfferByBuyer,
  counterBySeller,
  createLocalMarketPriceAdapter,
  createNegotiation,
  MockMarketPriceAdapter,
  PricingNegotiationPanel,
  rejectNegotiation,
  toAgreedPrice,
  type MarketPriceAdapter,
  type NegotiationSession,
} from "@/features/pricing-negotiation";
import { Button } from "@/components/ui/button";

import {
  agreePriceForSession,
  approveIntakeForSession,
  assessCommodityForSession,
  beginNegotiationForSession,
  cancelIntakeForSession,
  captureCommodityForSession,
  completeIntakeForSession,
  createOfferForSession,
  rejectOfferForSession,
  verifySellerForSession,
} from "../actions/session-actions";
import type {
  IntakeCompletion,
  IntakeSession,
} from "../types/contracts";
import { IntakeWorkflow } from "./IntakeWorkflow";

export type KioskDeviceMode = "mock" | "real";

export type KioskIntakeExperienceProps = {
  initialSession: IntakeSession;
  deviceMode: KioskDeviceMode;
  membershipStatus: MembershipStatus;
  savingsRequiredAmount: number;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function uniqueId(prefix: string) {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  return `${prefix}-${id}`;
}

function negotiationContext(action: string) {
  return {
    historyId: uniqueId(action.toLowerCase()),
    occurredAt: new Date().toISOString(),
  };
}

function restoreNegotiation(session: IntakeSession): NegotiationSession | null {
  if (!session.price || !session.capture) return null;
  const status =
    session.status === "NEGOTIATING"
      ? "NEGOTIATING"
      : session.status === "AGREED" || session.status === "COMPLETED"
        ? "ACCEPTED"
        : "OFFER_CREATED";
  const quantity = session.capture.netWeight;
  return {
    negotiationId: `restored-${session.sessionId}`,
    referencePrice: session.price.referencePrice,
    qualityFactor: session.price.qualityFactor,
    quantity,
    initialOffer: session.price.initialOffer,
    currentUnitPrice: session.price.finalUnitPrice,
    currentTotalPrice: session.price.finalTotalPrice,
    buyerApproved: status === "ACCEPTED",
    sellerApproved: status !== "OFFER_CREATED",
    status,
    history: [
      {
        id: `restored-${session.sessionId}`,
        actor: "SYSTEM",
        action: "INITIAL_OFFER_CREATED",
        unitPrice: session.price.finalUnitPrice,
        totalPrice: session.price.finalTotalPrice,
        occurredAt: session.auditTrail.at(-1)?.occurredAt ?? new Date().toISOString(),
      },
    ],
  };
}

function createMockMarketAdapter(): MarketPriceAdapter {
  return new MockMarketPriceAdapter({
    references: [],
    fallback: {
      referencePrice: 6_500,
      commodityType: "Gabah Kering Panen",
      qualityGrade: "Grade B",
      market: "Pasar acuan development",
      unit: "kg",
      currency: "IDR",
      observedAt: "2026-07-10T00:00:00.000Z",
      source: "Mock development KLIK-MP",
    },
  });
}

export function KioskIntakeExperience({
  initialSession,
  deviceMode,
  membershipStatus,
  savingsRequiredAmount,
}: KioskIntakeExperienceProps) {
  const router = useRouter();
  const [session, setSession] = useState<IntakeSession>(initialSession);
  const [negotiation, setNegotiation] =
    useState<NegotiationSession | null>(() =>
      restoreNegotiation(initialSession),
    );
  const [qualityFactor, setQualityFactor] = useState("1");
  const [counterPrice, setCounterPrice] = useState("");
  const [directPaymentReceived, setDirectPaymentReceived] = useState(false);
  const [completion, setCompletion] = useState<IntakeCompletion | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adapters = useMemo(() => {
    if (deviceMode === "real") {
      return {
        fingerprint: new HttpFingerprintAdapter({ baseUrl: "" }),
        face: new HttpFaceRecognitionAdapter({ baseUrl: "" }),
        scale: new HttpScaleDeviceBridgeAdapter(),
        camera: new BrowserMediaCameraAdapter(),
        vision: new HttpCommodityVisionAdapter(),
        market: createLocalMarketPriceAdapter(),
      };
    }

    const biometric = createMatchingMockBiometricAdapters("seller-demo-001");
    return {
      fingerprint: biometric.fingerprintAdapter,
      face: biometric.faceRecognitionAdapter,
      scale: new MockScaleAdapter({ grossWeight: 25, tareWeight: 1 }),
      camera: new MockCameraAdapter(),
      vision: new MockCommodityVisionAdapter(),
      market: createMockMarketAdapter(),
    };
  }, [deviceMode]);

  function publishError(caught: unknown) {
    setError(
      caught instanceof Error
        ? caught.message
        : "Terjadi kendala yang tidak diketahui.",
    );
  }

  async function handleVerifiedSeller(seller: VerifiedSeller) {
    setError(null);
    try {
      setSession(await verifySellerForSession(session.sessionId, seller));
    } catch (caught) {
      publishError(caught);
    }
  }

  async function handleCaptured(capture: CommodityCapture) {
    setError(null);
    try {
      setSession(
        await captureCommodityForSession(session.sessionId, capture),
      );
    } catch (caught) {
      publishError(caught);
    }
  }

  async function handleAssessed(assessment: CommodityAssessment) {
    setError(null);
    try {
      setSession(
        await assessCommodityForSession(session.sessionId, assessment),
      );
    } catch (caught) {
      publishError(caught);
    }
  }

  async function createOffer() {
    if (!session.capture || !session.assessment) return;

    setBusy(true);
    setError(null);
    try {
      const factor = Number(qualityFactor);
      const reference = await adapters.market.getReferencePrice({
        commodityType: session.assessment.commodityType,
        qualityGrade: session.assessment.qualityGrade,
        unit: "kg",
      });
      const nextNegotiation = createNegotiation({
        negotiationId: uniqueId("negotiation"),
        referencePrice: reference.referencePrice,
        qualityFactor: factor,
        quantity: session.capture.netWeight,
        occurredAt: new Date().toISOString(),
      });

      const nextSession = await createOfferForSession(
        session.sessionId,
        toAgreedPrice(nextNegotiation),
      );
      setNegotiation(nextNegotiation);
      setCounterPrice(String(nextNegotiation.currentUnitPrice));
      setSession(nextSession);
    } catch (caught) {
      publishError(caught);
    } finally {
      setBusy(false);
    }
  }

  async function handleBuyerApproval() {
    if (!negotiation) return;
    setError(null);
    try {
      if (negotiation.status === "NEGOTIATING") {
        const accepted = acceptCounterByBuyer(
          negotiation,
          negotiationContext("buyer-accepted-counter"),
        );
        const nextSession = await agreePriceForSession(
          session.sessionId,
          toAgreedPrice(accepted),
        );
        setNegotiation(accepted);
        setSession(nextSession);
        return;
      }

      setNegotiation(
        approveInitialOfferByBuyer(
          negotiation,
          negotiationContext("buyer-approved-offer"),
        ),
      );
    } catch (caught) {
      publishError(caught);
    }
  }

  async function handleSellerAcceptance() {
    if (!negotiation) return;
    setError(null);
    try {
      const accepted = acceptBySeller(
        negotiation,
        negotiationContext("seller-accepted-offer"),
      );
      const nextSession = await agreePriceForSession(
        session.sessionId,
        toAgreedPrice(accepted),
      );
      setNegotiation(accepted);
      setSession(nextSession);
    } catch (caught) {
      publishError(caught);
    }
  }

  async function handleSellerCounter() {
    if (!negotiation) return;
    setError(null);
    try {
      const countered = counterBySeller(negotiation, {
        ...negotiationContext("seller-countered"),
        unitPrice: Number(counterPrice),
      });
      const nextSession = await beginNegotiationForSession(session.sessionId);
      setNegotiation(countered);
      setSession(nextSession);
    } catch (caught) {
      publishError(caught);
    }
  }

  async function handleReject() {
    if (!negotiation) return;
    setError(null);
    try {
      const rejected = rejectNegotiation(
        negotiation,
        "SELLER",
        negotiationContext("seller-rejected"),
      );
      const nextSession = await rejectOfferForSession(session.sessionId);
      setNegotiation(rejected);
      setSession(nextSession);
    } catch (caught) {
      publishError(caught);
    }
  }

  async function handleFinalApproval(party: "BUYER" | "SELLER") {
    setError(null);
    try {
      setSession(await approveIntakeForSession(session.sessionId, party));
    } catch (caught) {
      publishError(caught);
    }
  }

  async function handleComplete() {
    setBusy(true);
    setError(null);
    try {
      const result = await completeIntakeForSession(
        session.sessionId,
        savingsRequiredAmount,
        directPaymentReceived,
      );
      setSession(result.session);
      setCompletion(result);
      router.replace(`/kiosk/intake/${session.sessionId}/receipt`);
    } catch (caught) {
      publishError(caught);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setError(null);
    try {
      setSession(await cancelIntakeForSession(session.sessionId));
    } catch (caught) {
      publishError(caught);
    }
  }

  const identityStep = (
    <IdentityMembershipWorkflow
      sessionId={session.sessionId}
      membershipStatus={membershipStatus}
      fingerprintAdapter={adapters.fingerprint}
      faceRecognitionAdapter={adapters.face}
      sellerIdHint={deviceMode === "mock" ? "seller-demo-001" : undefined}
      onVerified={handleVerifiedSeller}
      onError={(identityError) => setError(identityError.message)}
    />
  );

  const captureStep = (
    <CommodityCapturePanel
      scaleAdapter={adapters.scale}
      cameraAdapter={adapters.camera}
      onCaptured={handleCaptured}
    />
  );

  const assessmentStep = session.capture ? (
    <CommodityAssessmentPanel
      input={{
        captureId: session.capture.captureId,
        imageUrl: session.capture.imageUrl,
      }}
      visionAdapter={adapters.vision}
      onAssessed={handleAssessed}
    />
  ) : null;

  const pricingStep = (
    <PricingStage
      session={session}
      negotiation={negotiation}
      qualityFactor={qualityFactor}
      counterPrice={counterPrice}
      busy={busy}
      onQualityFactorChange={setQualityFactor}
      onCounterPriceChange={setCounterPrice}
      onCreateOffer={createOffer}
      onBuyerApprove={handleBuyerApproval}
      onSellerAccept={handleSellerAcceptance}
      onSellerCounter={handleSellerCounter}
      onReject={handleReject}
    />
  );

  return (
    <main className="mx-auto w-full max-w-[96rem] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Sesi penerimaan
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em]">
            Intake komoditas
          </h1>
        </div>
        <span className="flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
          <RadioTower aria-hidden="true" className="size-3.5 text-primary" />
          {deviceMode === "real" ? "Perangkat nyata" : "Mock development"}
        </span>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 flex gap-3 border border-error/30 bg-error/5 p-4 text-sm text-error"
        >
          <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {session.status === "AGREED" &&
      session.seller?.membershipStatus === "PENDING_PAYMENT" &&
      session.seller.savingsSettlement === "DIRECT_PAYMENT" ? (
        <label className="mb-5 flex cursor-pointer items-start gap-3 border border-border bg-background p-4">
          <input
            type="checkbox"
            checked={directPaymentReceived}
            onChange={(event) => setDirectPaymentReceived(event.target.checked)}
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <span className="block text-sm font-bold">
              Simpanan pokok telah diterima langsung
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              Konfirmasi penerimaan {rupiah.format(savingsRequiredAmount)}
              diperlukan sebelum transaksi diselesaikan.
            </span>
          </span>
        </label>
      ) : null}

      <IntakeWorkflow
        session={session}
        identityStep={identityStep}
        captureStep={captureStep}
        assessmentStep={assessmentStep}
        pricingStep={pricingStep}
        onApproveBuyer={() => handleFinalApproval("BUYER")}
        onApproveSeller={() => handleFinalApproval("SELLER")}
        onComplete={busy ? undefined : handleComplete}
        onCancel={handleCancel}
      />

      {completion ? (
        <section className="mt-6 border border-primary/25 bg-primary/5 p-5" aria-live="polite">
          <div className="flex items-start gap-3">
            <BadgeCheck aria-hidden="true" className="mt-0.5 size-6 text-primary" />
            <div>
              <h2 className="font-bold">Preview bukti transaksi tersedia</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {completion.receipt.receiptNumber} · Payout penjual {rupiah.format(completion.receipt.sellerPayout)}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-institutional-teal">
                <ReceiptText aria-hidden="true" className="size-4" />
                Belum dipersistensikan sampai schema dan migration terkoordinasi.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

type PricingStageProps = {
  session: IntakeSession;
  negotiation: NegotiationSession | null;
  qualityFactor: string;
  counterPrice: string;
  busy: boolean;
  onQualityFactorChange: (value: string) => void;
  onCounterPriceChange: (value: string) => void;
  onCreateOffer: () => void;
  onBuyerApprove: () => void;
  onSellerAccept: () => void;
  onSellerCounter: () => void;
  onReject: () => void;
};

function PricingStage({
  session,
  negotiation,
  qualityFactor,
  counterPrice,
  busy,
  onQualityFactorChange,
  onCounterPriceChange,
  onCreateOffer,
  onBuyerApprove,
  onSellerAccept,
  onSellerCounter,
  onReject,
}: PricingStageProps) {
  if (!negotiation) {
    return (
      <section aria-labelledby="offer-title" className="py-2">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Penawaran awal
        </p>
        <h2 id="offer-title" className="mt-2 text-xl font-bold">
          Ambil referensi harga pasar
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Faktor kualitas ditetapkan petugas berdasarkan hasil assessment yang
          sudah diverifikasi.
        </p>
        <label className="mt-5 block max-w-xs text-sm font-bold">
          Faktor kualitas
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={qualityFactor}
            onChange={(event) => onQualityFactorChange(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 font-normal outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </label>
        <Button className="mt-5" onClick={onCreateOffer} disabled={busy}>
          {busy ? "Mengambil referensi…" : "Buat penawaran"}
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {session.status === "OFFER_CREATED" && negotiation.buyerApproved ? (
        <div className="flex flex-col gap-3 border border-border bg-surface p-4 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-bold">
            Counteroffer penjual per kg
            <input
              type="number"
              min="1"
              step="100"
              value={counterPrice}
              onChange={(event) => onCounterPriceChange(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 font-normal"
            />
          </label>
          <Button variant="outline" onClick={onSellerCounter}>
            Ajukan counteroffer
          </Button>
        </div>
      ) : null}
      <PricingNegotiationPanel
        session={negotiation}
        onBuyerApprove={onBuyerApprove}
        onSellerAccept={onSellerAccept}
        onSellerCounter={onSellerCounter}
        onReject={onReject}
      />
    </div>
  );
}
