import type {
  CommodityAssessment,
  IntakeSessionStatus,
} from "@/features/intake-transaction";
import type {
  MarketPriceQuery,
  MarketPriceReference,
} from "@/features/pricing-negotiation";

export type OperatorAuditEntry = {
  id: string;
  entityType: "AI_REVIEW" | "REFERENCE_PRICE";
  entityId: string;
  action: string;
  actorId: string;
  reason?: string;
  occurredAt: string;
};

export type AssessmentCorrection = {
  field: "COMMODITY_TYPE" | "QUALITY_GRADE";
  previousValue: string;
  correctedValue: string;
  reason: string;
  correctedBy: string;
  correctedAt: string;
};

export type AiReview = {
  reviewId: string;
  sessionId: string;
  originalAssessment: CommodityAssessment;
  correction?: AssessmentCorrection;
  status: "PENDING" | "CORRECTED" | "APPROVED";
  approvedBy?: string;
  approvedAt?: string;
  auditTrail: OperatorAuditEntry[];
};

export type ManagedReferencePrice = {
  referenceId: string;
  query: MarketPriceQuery;
  reference: MarketPriceReference;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  approvedBy?: string;
  approvedAt?: string;
  auditTrail: OperatorAuditEntry[];
};

export type OperatorTransactionSummary = {
  transactionId: string;
  sellerName: string;
  commodityType: string;
  netWeight: number;
  totalPrice: number;
  status: IntakeSessionStatus;
  updatedAt: string;
};
