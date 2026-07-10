import type { MarketPriceAdapter } from "@/features/pricing-negotiation";

import {
  correctAiReviewSchema,
  createAiReviewSchema,
  createReferencePriceSchema,
  operatorContextSchema,
  type CorrectAiReviewInput,
  type CreateAiReviewInput,
  type CreateReferencePriceInput,
  type OperatorContext,
} from "../schemas/operator";
import type {
  AiReview,
  ManagedReferencePrice,
  OperatorAuditEntry,
} from "../types/contracts";

function appendAudit<T extends { auditTrail: OperatorAuditEntry[] }>(
  entity: T,
  entry: OperatorAuditEntry,
): T {
  if (entity.auditTrail.some(({ id }) => id === entry.id)) {
    throw new Error(`Audit ${entry.id} sudah tercatat.`);
  }
  return { ...entity, auditTrail: [...entity.auditTrail, entry] };
}

export function createAiReview(unsafeInput: CreateAiReviewInput): AiReview {
  const input = createAiReviewSchema.parse(unsafeInput);
  return {
    reviewId: input.reviewId,
    sessionId: input.sessionId,
    originalAssessment: input.assessment,
    status: "PENDING",
    auditTrail: [
      {
        id: input.auditId,
        entityType: "AI_REVIEW",
        entityId: input.reviewId,
        action: "AI_REVIEW_CREATED",
        actorId: input.actorId,
        occurredAt: input.occurredAt,
      },
    ],
  };
}

export function correctAiReview(
  review: AiReview,
  unsafeInput: CorrectAiReviewInput,
): AiReview {
  if (review.status === "APPROVED") {
    throw new Error("Review yang telah disetujui tidak dapat dikoreksi.");
  }
  const input = correctAiReviewSchema.parse(unsafeInput);
  const previousValue =
    input.field === "COMMODITY_TYPE"
      ? review.originalAssessment.commodityType
      : review.originalAssessment.qualityGrade;
  if (previousValue === input.correctedValue) {
    throw new Error("Nilai koreksi harus berbeda dari hasil AI.");
  }

  const corrected: AiReview = {
    ...review,
    correction: {
      field: input.field,
      previousValue,
      correctedValue: input.correctedValue,
      reason: input.reason,
      correctedBy: input.actorId,
      correctedAt: input.occurredAt,
    },
    status: "CORRECTED",
  };
  return appendAudit(corrected, {
    id: input.auditId,
    entityType: "AI_REVIEW",
    entityId: review.reviewId,
    action: "AI_RESULT_CORRECTED",
    actorId: input.actorId,
    reason: input.reason,
    occurredAt: input.occurredAt,
  });
}

export function approveAiReview(
  review: AiReview,
  unsafeContext: OperatorContext,
): AiReview {
  if (review.status === "APPROVED") {
    throw new Error("Review AI sudah disetujui.");
  }
  const context = operatorContextSchema.parse(unsafeContext);
  const approved: AiReview = {
    ...review,
    status: "APPROVED",
    approvedBy: context.actorId,
    approvedAt: context.occurredAt,
  };
  return appendAudit(approved, {
    id: context.auditId,
    entityType: "AI_REVIEW",
    entityId: review.reviewId,
    action: "AI_REVIEW_APPROVED",
    actorId: context.actorId,
    occurredAt: context.occurredAt,
  });
}

export function resolveAssessment(review: AiReview) {
  if (review.status !== "APPROVED") {
    throw new Error("Review AI harus disetujui sebelum dipakai oleh intake.");
  }
  if (!review.correction) {
    return { ...review.originalAssessment, verifiedByOfficer: true };
  }

  return {
    ...review.originalAssessment,
    ...(review.correction.field === "COMMODITY_TYPE"
      ? { commodityType: review.correction.correctedValue }
      : { qualityGrade: review.correction.correctedValue }),
    verifiedByOfficer: true,
    correctedValue: review.correction.correctedValue,
    correctionReason: review.correction.reason,
  };
}

export async function createReferencePriceDraft(
  adapter: MarketPriceAdapter,
  unsafeInput: CreateReferencePriceInput,
): Promise<ManagedReferencePrice> {
  const input = createReferencePriceSchema.parse(unsafeInput);
  const reference = await adapter.getReferencePrice(input.query);
  return {
    referenceId: input.referenceId,
    query: input.query,
    reference,
    status: "DRAFT",
    auditTrail: [
      {
        id: input.auditId,
        entityType: "REFERENCE_PRICE",
        entityId: input.referenceId,
        action: "REFERENCE_PRICE_FETCHED",
        actorId: input.actorId,
        occurredAt: input.occurredAt,
      },
    ],
  };
}

export function approveReferencePrice(
  price: ManagedReferencePrice,
  unsafeContext: OperatorContext,
): ManagedReferencePrice {
  if (price.status !== "DRAFT") {
    throw new Error("Hanya referensi harga DRAFT yang dapat disetujui.");
  }
  const context = operatorContextSchema.parse(unsafeContext);
  return appendAudit(
    {
      ...price,
      status: "ACTIVE",
      approvedBy: context.actorId,
      approvedAt: context.occurredAt,
    },
    {
      id: context.auditId,
      entityType: "REFERENCE_PRICE",
      entityId: price.referenceId,
      action: "REFERENCE_PRICE_APPROVED",
      actorId: context.actorId,
      occurredAt: context.occurredAt,
    },
  );
}

export function archiveReferencePrice(
  price: ManagedReferencePrice,
  unsafeContext: OperatorContext,
): ManagedReferencePrice {
  if (price.status !== "ACTIVE") {
    throw new Error("Hanya referensi harga ACTIVE yang dapat diarsipkan.");
  }
  const context = operatorContextSchema.parse(unsafeContext);
  return appendAudit(
    { ...price, status: "ARCHIVED" },
    {
      id: context.auditId,
      entityType: "REFERENCE_PRICE",
      entityId: price.referenceId,
      action: "REFERENCE_PRICE_ARCHIVED",
      actorId: context.actorId,
      occurredAt: context.occurredAt,
    },
  );
}
