import { describe, expect, it, vi } from "vitest";

import {
  approveFinalIntake,
  cancelIntake,
  completeIntake,
  createIntakeSession,
  markMembershipReady,
  recordAgreement,
  recordCommodityAssessment,
  recordCommodityCapture,
  recordOfferCreated,
  recordVerifiedSeller,
  settleSavings,
  type IntakeCompletionPort,
  type IntakeSession,
} from "@/features/intake-transaction";

const now = "2026-07-10T08:00:00.000Z";
let auditSequence = 0;

function audit() {
  auditSequence += 1;
  return { auditId: `audit-${auditSequence}`, actorId: "operator-1", occurredAt: now };
}

const pendingSeller = {
  sellerId: "seller-1",
  membershipStatus: "PENDING_PAYMENT" as const,
  fingerprintVerified: true,
  faceVerified: true,
  savingsSettlement: "DEDUCT_FROM_MARGIN" as const,
};
const capture = {
  captureId: "capture-1",
  grossWeight: 105,
  tareWeight: 5,
  netWeight: 100,
  imageUrl: "https://example.test/capture.jpg",
  capturedAt: now,
};
const assessment = {
  commodityType: "Gabah",
  qualityGrade: "A",
  classificationConfidence: 0.98,
  qualityConfidence: 0.92,
  verifiedByOfficer: true,
};
const negotiatingPrice = {
  referencePrice: 10_000,
  qualityFactor: 0.9,
  initialOffer: 9_000,
  finalUnitPrice: 9_500,
  finalTotalPrice: 950_000,
  negotiationStatus: "NEGOTIATING" as const,
};
const agreedPrice = { ...negotiatingPrice, negotiationStatus: "ACCEPTED" as const };

function agreedSession(): IntakeSession {
  let session = createIntakeSession("intake-1");
  session = recordVerifiedSeller(session, pendingSeller, audit());
  session = markMembershipReady(session, audit());
  session = recordCommodityCapture(session, capture, audit());
  session = recordCommodityAssessment(session, assessment, audit());
  session = recordOfferCreated(session, negotiatingPrice, audit());
  session = recordAgreement(session, agreedPrice, audit());
  return session;
}

describe("intake orchestration", () => {
  it("hanya mengorkestrasi output tervalidasi sesuai urutan status", () => {
    const session = agreedSession();
    expect(session.status).toBe("AGREED");
    expect(session.capture).toEqual(capture);
    expect(session.price).toEqual(agreedPrice);
    expect(session.auditTrail.map(({ toStatus }) => toStatus)).toEqual([
      "IDENTITY_VERIFIED",
      "MEMBERSHIP_READY",
      "COMMODITY_CAPTURED",
      "COMMODITY_ASSESSED",
      "OFFER_CREATED",
      "AGREED",
    ]);
  });

  it("menolak output assessment yang belum diverifikasi petugas", () => {
    let session = createIntakeSession("intake-invalid");
    session = recordVerifiedSeller(session, pendingSeller, audit());
    session = markMembershipReady(session, audit());
    session = recordCommodityCapture(session, capture, audit());
    expect(() =>
      recordCommodityAssessment(
        session,
        { ...assessment, verifiedByOfficer: false },
        audit(),
      ),
    ).toThrow("harus diverifikasi petugas");
  });

  it("menyelesaikan transaksi, bukti, stok, dan potongan simpanan secara atomik", async () => {
    let session = agreedSession();
    session = approveFinalIntake(session, { ...audit(), party: "BUYER" });
    session = approveFinalIntake(session, { ...audit(), party: "SELLER" });
    const completeAtomically = vi.fn<IntakeCompletionPort["completeAtomically"]>();

    const result = await completeIntake(
      session,
      { completeAtomically },
      {
        ...audit(),
        transactionId: "trx-1",
        receiptNumber: "RCP-1",
        stockReceiptId: "stock-1",
      },
      { savingsRequiredAmount: 100_000, directPaymentReceived: false },
    );

    expect(result.session.status).toBe("COMPLETED");
    expect(result.transaction.savingsSettlement).toMatchObject({
      method: "DEDUCT_FROM_MARGIN",
      deductedAmount: 100_000,
      sellerPayout: 850_000,
    });
    expect(result.stockReceipt.quantity).toBe(100);
    expect(completeAtomically).toHaveBeenCalledOnce();
  });

  it("tidak mengubah sesi bila persistence atomik gagal", async () => {
    let session = agreedSession();
    session = approveFinalIntake(session, { ...audit(), party: "BUYER" });
    session = approveFinalIntake(session, { ...audit(), party: "SELLER" });
    const original = session;
    const port: IntakeCompletionPort = {
      completeAtomically: vi.fn().mockRejectedValue(new Error("database unavailable")),
    };

    await expect(
      completeIntake(
        session,
        port,
        {
          ...audit(),
          transactionId: "trx-fail",
          receiptNumber: "RCP-fail",
          stockReceiptId: "stock-fail",
        },
        { savingsRequiredAmount: 100_000 },
      ),
    ).rejects.toThrow("database unavailable");
    expect(original.status).toBe("AGREED");
  });

  it("memvalidasi penyelesaian simpanan langsung dan kecukupan margin", () => {
    expect(() =>
      settleSavings(
        { ...pendingSeller, savingsSettlement: "DIRECT_PAYMENT" },
        950_000,
        { savingsRequiredAmount: 100_000, directPaymentReceived: false },
      ),
    ).toThrow("belum diterima");
    expect(() =>
      settleSavings(pendingSeller, 50_000, {
        savingsRequiredAmount: 100_000,
        directPaymentReceived: false,
      }),
    ).toThrow("tidak cukup");
  });

  it("membatalkan secara idempoten dan menolak pembatalan setelah selesai", async () => {
    const draft = createIntakeSession("intake-cancel");
    const cancelled = cancelIntake(draft, audit());
    expect(cancelIntake(cancelled, audit())).toBe(cancelled);

    let session = agreedSession();
    session = approveFinalIntake(session, { ...audit(), party: "BUYER" });
    session = approveFinalIntake(session, { ...audit(), party: "SELLER" });
    const completed = await completeIntake(
      session,
      { completeAtomically: vi.fn() },
      {
        ...audit(),
        transactionId: "trx-done",
        receiptNumber: "RCP-done",
        stockReceiptId: "stock-done",
      },
      { savingsRequiredAmount: 100_000 },
    );
    expect(() => cancelIntake(completed.session, audit())).toThrow(
      "tidak dapat dibatalkan",
    );
  });
});
