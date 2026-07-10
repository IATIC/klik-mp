import type { AgreedPrice } from "@/features/pricing-negotiation";

import {
  agreedPriceSchema,
  auditContextSchema,
  commodityAssessmentSchema,
  commodityCaptureSchema,
  completionContextSchema,
  finalApprovalSchema,
  settlementInputSchema,
  verifiedSellerSchema,
  type AuditContext,
  type CompletionContext,
  type FinalApprovalInput,
  type SettlementInput,
} from "../schemas/intake";
import type {
  CommodityAssessment,
  CommodityCapture,
  IntakeAuditEntry,
  IntakeCompletion,
  IntakeCompletionPort,
  IntakeSession,
  IntakeSessionStatus,
  SavingsSettlement,
  VerifiedSeller,
} from "../types/contracts";

const ALLOWED_TRANSITIONS: Record<IntakeSessionStatus, IntakeSessionStatus[]> = {
  DRAFT: ["IDENTITY_VERIFIED", "CANCELLED"],
  IDENTITY_VERIFIED: ["MEMBERSHIP_READY", "CANCELLED"],
  MEMBERSHIP_READY: ["COMMODITY_CAPTURED", "CANCELLED"],
  COMMODITY_CAPTURED: ["COMMODITY_ASSESSED", "CANCELLED"],
  COMMODITY_ASSESSED: ["OFFER_CREATED", "CANCELLED"],
  OFFER_CREATED: ["NEGOTIATING", "AGREED", "REJECTED", "CANCELLED"],
  NEGOTIATING: ["AGREED", "REJECTED", "CANCELLED"],
  AGREED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: ["CANCELLED"],
  CANCELLED: [],
};

export function canTransition(
  from: IntakeSessionStatus,
  to: IntakeSessionStatus,
) {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

function transition(
  session: IntakeSession,
  toStatus: IntakeSessionStatus,
  action: string,
  unsafeContext: AuditContext,
): IntakeSession {
  const context = auditContextSchema.parse(unsafeContext);
  if (!canTransition(session.status, toStatus)) {
    throw new Error(`Transisi ${session.status} ke ${toStatus} tidak diizinkan.`);
  }
  if (session.auditTrail.some(({ id }) => id === context.auditId)) {
    throw new Error(`Audit ${context.auditId} sudah tercatat.`);
  }

  const auditEntry: IntakeAuditEntry = {
    id: context.auditId,
    action,
    actorId: context.actorId,
    occurredAt: context.occurredAt,
    fromStatus: session.status,
    toStatus,
    ...(context.note ? { note: context.note } : {}),
  };

  return {
    ...session,
    status: toStatus,
    auditTrail: [...session.auditTrail, auditEntry],
  };
}

export function createIntakeSession(sessionId: string): IntakeSession {
  if (!sessionId.trim()) throw new Error("ID sesi intake wajib diisi.");
  return {
    sessionId,
    status: "DRAFT",
    approvals: [],
    auditTrail: [],
  };
}

export function recordVerifiedSeller(
  session: IntakeSession,
  unsafeSeller: VerifiedSeller,
  context: AuditContext,
) {
  const seller = verifiedSellerSchema.parse(unsafeSeller);
  return {
    ...transition(session, "IDENTITY_VERIFIED", "IDENTITY_VERIFIED", context),
    seller,
  };
}

export function markMembershipReady(
  session: IntakeSession,
  context: AuditContext,
) {
  if (!session.seller) throw new Error("Identitas penjual belum tersedia.");
  return transition(session, "MEMBERSHIP_READY", "MEMBERSHIP_READY", context);
}

export function recordCommodityCapture(
  session: IntakeSession,
  unsafeCapture: CommodityCapture,
  context: AuditContext,
) {
  const capture = commodityCaptureSchema.parse(unsafeCapture);
  return {
    ...transition(session, "COMMODITY_CAPTURED", "COMMODITY_CAPTURED", context),
    capture,
  };
}

export function recordCommodityAssessment(
  session: IntakeSession,
  unsafeAssessment: CommodityAssessment,
  context: AuditContext,
) {
  const assessment = commodityAssessmentSchema.parse(unsafeAssessment);
  if (!assessment.verifiedByOfficer) {
    throw new Error("Assessment komoditas harus diverifikasi petugas.");
  }
  return {
    ...transition(session, "COMMODITY_ASSESSED", "COMMODITY_ASSESSED", context),
    assessment,
  };
}

export function recordOfferCreated(
  session: IntakeSession,
  unsafePrice: AgreedPrice,
  context: AuditContext,
) {
  const price = agreedPriceSchema.parse(unsafePrice);
  if (price.negotiationStatus === "REJECTED") {
    throw new Error("Penawaran yang ditolak tidak dapat dicatat sebagai penawaran aktif.");
  }
  return {
    ...transition(session, "OFFER_CREATED", "OFFER_CREATED", context),
    price,
  };
}

export function markNegotiating(session: IntakeSession, context: AuditContext) {
  return transition(session, "NEGOTIATING", "NEGOTIATION_STARTED", context);
}

export function recordAgreement(
  session: IntakeSession,
  unsafePrice: AgreedPrice,
  context: AuditContext,
) {
  const price = agreedPriceSchema.parse(unsafePrice);
  if (price.negotiationStatus !== "ACCEPTED") {
    throw new Error("Hanya harga yang telah disepakati yang dapat diterima intake.");
  }
  return {
    ...transition(session, "AGREED", "PRICE_AGREED", context),
    price,
  };
}

export function rejectIntake(session: IntakeSession, context: AuditContext) {
  return transition(session, "REJECTED", "OFFER_REJECTED", context);
}

export function approveFinalIntake(
  session: IntakeSession,
  unsafeApproval: FinalApprovalInput,
) {
  if (session.status !== "AGREED") {
    throw new Error("Persetujuan akhir hanya dapat diberikan pada sesi AGREED.");
  }
  const approval = finalApprovalSchema.parse(unsafeApproval);
  if (session.approvals.some(({ party }) => party === approval.party)) {
    throw new Error(`Persetujuan akhir ${approval.party} sudah tercatat.`);
  }
  return {
    ...session,
    approvals: [
      ...session.approvals,
      {
        party: approval.party,
        approvedBy: approval.actorId,
        approvedAt: approval.occurredAt,
      },
    ],
  };
}

export function settleSavings(
  seller: VerifiedSeller,
  finalTotalPrice: number,
  unsafeInput: SettlementInput,
): SavingsSettlement {
  const input = settlementInputSchema.parse(unsafeInput);
  if (seller.membershipStatus === "ACTIVE") {
    return {
      method: "NOT_REQUIRED",
      requiredAmount: 0,
      deductedAmount: 0,
      sellerPayout: finalTotalPrice,
    };
  }

  if (seller.savingsSettlement === "DIRECT_PAYMENT") {
    if (!input.directPaymentReceived) {
      throw new Error("Pembayaran langsung simpanan pokok belum diterima.");
    }
    return {
      method: "DIRECT_PAYMENT",
      requiredAmount: input.savingsRequiredAmount,
      deductedAmount: 0,
      sellerPayout: finalTotalPrice,
    };
  }

  if (seller.savingsSettlement !== "DEDUCT_FROM_MARGIN") {
    throw new Error("Metode penyelesaian simpanan pokok belum dipilih.");
  }
  if (finalTotalPrice < input.savingsRequiredAmount) {
    throw new Error("Margin transaksi tidak cukup untuk simpanan pokok.");
  }
  return {
    method: "DEDUCT_FROM_MARGIN",
    requiredAmount: input.savingsRequiredAmount,
    deductedAmount: input.savingsRequiredAmount,
    sellerPayout: finalTotalPrice - input.savingsRequiredAmount,
  };
}

export async function completeIntake(
  session: IntakeSession,
  port: IntakeCompletionPort,
  unsafeContext: CompletionContext,
  unsafeSettlement: SettlementInput,
): Promise<IntakeCompletion> {
  if (session.status !== "AGREED") {
    throw new Error("Hanya sesi AGREED yang dapat diselesaikan.");
  }
  if (
    !session.seller ||
    !session.capture ||
    !session.assessment ||
    !session.price
  ) {
    throw new Error("Output modul tervalidasi belum lengkap.");
  }
  if (
    !session.approvals.some(({ party }) => party === "BUYER") ||
    !session.approvals.some(({ party }) => party === "SELLER")
  ) {
    throw new Error("Persetujuan akhir pembeli dan penjual wajib lengkap.");
  }

  const context = completionContextSchema.parse(unsafeContext);
  const settlement = settleSavings(
    session.seller,
    session.price.finalTotalPrice,
    unsafeSettlement,
  );
  const completed = transition(session, "COMPLETED", "INTAKE_COMPLETED", context);
  const auditEntry = completed.auditTrail.at(-1);
  if (!auditEntry) throw new Error("Audit penyelesaian gagal dibuat.");

  const transaction = {
    transactionId: context.transactionId,
    sessionId: session.sessionId,
    sellerId: session.seller.sellerId,
    captureId: session.capture.captureId,
    commodityType: session.assessment.commodityType,
    qualityGrade: session.assessment.qualityGrade,
    netWeight: session.capture.netWeight,
    finalUnitPrice: session.price.finalUnitPrice,
    finalTotalPrice: session.price.finalTotalPrice,
    savingsSettlement: settlement,
    completedAt: context.occurredAt,
  };
  const receipt = {
    receiptNumber: context.receiptNumber,
    transactionId: context.transactionId,
    sellerPayout: settlement.sellerPayout,
    savingsDeduction: settlement.deductedAmount,
    issuedAt: context.occurredAt,
  };
  const stockReceipt = {
    stockReceiptId: context.stockReceiptId,
    transactionId: context.transactionId,
    commodityType: session.assessment.commodityType,
    qualityGrade: session.assessment.qualityGrade,
    quantity: session.capture.netWeight,
    receivedAt: context.occurredAt,
  };

  await port.completeAtomically({ transaction, receipt, stockReceipt, auditEntry });
  return { session: completed, transaction, receipt, stockReceipt };
}

export function cancelIntake(session: IntakeSession, context: AuditContext) {
  if (session.status === "CANCELLED") return session;
  if (session.status === "COMPLETED") {
    throw new Error("Transaksi yang selesai tidak dapat dibatalkan.");
  }
  return transition(session, "CANCELLED", "INTAKE_CANCELLED", context);
}
