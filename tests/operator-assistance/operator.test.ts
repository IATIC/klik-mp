import { describe, expect, it } from "vitest";

import {
  approveAiReview,
  approveReferencePrice,
  correctAiReview,
  createAiReview,
  createReferencePriceDraft,
  resolveAssessment,
} from "@/features/operator-assistance";
import { MockMarketPriceAdapter } from "@/features/pricing-negotiation";

const now = "2026-07-10T08:00:00.000Z";
const assessment = {
  commodityType: "Gabah",
  qualityGrade: "B",
  classificationConfidence: 0.95,
  qualityConfidence: 0.7,
  verifiedByOfficer: false,
};

function review() {
  return createAiReview({
    reviewId: "review-1",
    sessionId: "intake-1",
    assessment,
    auditId: "audit-create",
    actorId: "operator-1",
    occurredAt: now,
  });
}

describe("operator AI review", () => {
  it("mewajibkan alasan saat mengoreksi hasil AI", () => {
    expect(() =>
      correctAiReview(review(), {
        auditId: "audit-correct",
        actorId: "operator-1",
        occurredAt: now,
        field: "QUALITY_GRADE",
        correctedValue: "A",
        reason: "",
      }),
    ).toThrow();
  });

  it("menyimpan koreksi, approval, dan audit trail lalu menghasilkan assessment tervalidasi", () => {
    const corrected = correctAiReview(review(), {
      auditId: "audit-correct",
      actorId: "operator-1",
      occurredAt: now,
      field: "QUALITY_GRADE",
      correctedValue: "A",
      reason: "Butir utuh dan kadar kotoran rendah",
    });
    const approved = approveAiReview(corrected, {
      auditId: "audit-approve",
      actorId: "supervisor-1",
      occurredAt: now,
    });
    const resolved = resolveAssessment(approved);

    expect(resolved).toMatchObject({
      qualityGrade: "A",
      verifiedByOfficer: true,
      correctionReason: "Butir utuh dan kadar kotoran rendah",
    });
    expect(approved.auditTrail).toHaveLength(3);
  });
});

describe("reference price management", () => {
  it("mengambil harga melalui adapter lalu membutuhkan approval petugas", async () => {
    const adapter = new MockMarketPriceAdapter({
      references: [
        {
          referencePrice: 12_000,
          commodityType: "Gabah",
          qualityGrade: "A",
          market: "Pasar Induk",
          unit: "kg",
          currency: "IDR",
          observedAt: now,
          source: "Mock development",
        },
      ],
    });
    const draft = await createReferencePriceDraft(adapter, {
      referenceId: "ref-1",
      query: { commodityType: "Gabah", qualityGrade: "A", market: "Pasar Induk", unit: "kg" },
      auditId: "audit-ref",
      actorId: "operator-1",
      occurredAt: now,
    });
    expect(draft.status).toBe("DRAFT");
    const active = approveReferencePrice(draft, {
      auditId: "audit-ref-approve",
      actorId: "operator-2",
      occurredAt: now,
    });
    expect(active.status).toBe("ACTIVE");
    expect(active.approvedBy).toBe("operator-2");
  });
});
