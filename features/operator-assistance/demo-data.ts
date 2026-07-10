import type {
  AiReview,
  ManagedReferencePrice,
  OperatorTransactionSummary,
} from "./types/contracts";

const observedAt = "2026-07-10T08:00:00.000Z";

export function createDemoAiReview(sessionId: string): AiReview {
  return {
    reviewId: `review-${sessionId}`,
    sessionId,
    originalAssessment: {
      commodityType: "Gabah Kering Panen",
      qualityGrade: "Grade B",
      classificationConfidence: 0.94,
      qualityConfidence: 0.87,
      verifiedByOfficer: false,
    },
    status: "PENDING",
    auditTrail: [
      {
        id: `audit-${sessionId}`,
        entityType: "AI_REVIEW",
        entityId: `review-${sessionId}`,
        action: "AI_REVIEW_CREATED",
        actorId: "system-demo",
        occurredAt: observedAt,
      },
    ],
  };
}

export const demoOperatorTransactions: OperatorTransactionSummary[] = [
  {
    transactionId: "TRX-DEMO-001",
    sellerName: "Anggota Demo 001",
    commodityType: "Gabah Kering Panen",
    netWeight: 24,
    totalPrice: 140_400,
    status: "COMPLETED",
    updatedAt: observedAt,
  },
  {
    transactionId: "TRX-DEMO-002",
    sellerName: "Anggota Demo 002",
    commodityType: "Jagung Pipil",
    netWeight: 18.5,
    totalPrice: 92_500,
    status: "COMMODITY_ASSESSED",
    updatedAt: observedAt,
  },
];

export const demoReferencePrices: ManagedReferencePrice[] = [
  {
    referenceId: "REF-DEMO-001",
    query: {
      commodityType: "Gabah Kering Panen",
      qualityGrade: "Grade B",
      market: "Pasar acuan development",
      unit: "kg",
    },
    reference: {
      referencePrice: 6_500,
      commodityType: "Gabah Kering Panen",
      qualityGrade: "Grade B",
      market: "Pasar acuan development",
      unit: "kg",
      currency: "IDR",
      observedAt,
      source: "Fixture development KLIK-MP",
    },
    status: "DRAFT",
    auditTrail: [
      {
        id: "AUDIT-REF-001",
        entityType: "REFERENCE_PRICE",
        entityId: "REF-DEMO-001",
        action: "REFERENCE_PRICE_FETCHED",
        actorId: "system-demo",
        occurredAt: observedAt,
      },
    ],
  },
];
