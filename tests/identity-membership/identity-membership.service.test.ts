import { describe, expect, it } from "vitest";

import {
  validateIdentityCorrection,
  verifyIdentityMembership,
  type BiometricVerification,
} from "@/features/identity-membership";

const fingerprint: BiometricVerification = {
  modality: "FINGERPRINT",
  verified: true,
  sellerId: "seller-001",
  captureId: "fingerprint-capture-001",
  verifiedAt: "2026-07-10T08:00:00.000Z",
};

const face: BiometricVerification = {
  modality: "FACE",
  verified: true,
  sellerId: "seller-001",
  captureId: "face-capture-001",
  verifiedAt: "2026-07-10T08:00:01.000Z",
};

describe("verifyIdentityMembership", () => {
  it("menghasilkan VerifiedSeller untuk anggota aktif dengan dua biometrik yang cocok", () => {
    const result = verifyIdentityMembership({
      membershipStatus: "ACTIVE",
      fingerprint,
      face,
    });

    expect(result).toEqual({
      ok: true,
      seller: {
        sellerId: "seller-001",
        membershipStatus: "ACTIVE",
        fingerprintVerified: true,
        faceVerified: true,
      },
    });
  });

  it.each(["DIRECT_PAYMENT", "DEDUCT_FROM_MARGIN"] as const)(
    "menerima metode %s untuk anggota yang menunggu pembayaran",
    (savingsSettlement) => {
      const result = verifyIdentityMembership({
        membershipStatus: "PENDING_PAYMENT",
        fingerprint,
        face,
        savingsSettlement,
      });

      expect(result).toMatchObject({
        ok: true,
        seller: {
          membershipStatus: "PENDING_PAYMENT",
          savingsSettlement,
        },
      });
    },
  );

  it("menolak PENDING_PAYMENT tanpa metode penyelesaian simpanan", () => {
    const result = verifyIdentityMembership({
      membershipStatus: "PENDING_PAYMENT",
      fingerprint,
      face,
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: "SETTLEMENT_REQUIRED", retryable: true },
    });
  });

  it("menolak settlement yang tidak diperlukan oleh anggota aktif", () => {
    const result = verifyIdentityMembership({
      membershipStatus: "ACTIVE",
      fingerprint,
      face,
      savingsSettlement: "DIRECT_PAYMENT",
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: "INVALID_INPUT", retryable: false },
    });
  });

  it("menghasilkan error eksplisit ketika identitas fingerprint dan wajah berbeda", () => {
    const result = verifyIdentityMembership({
      membershipStatus: "ACTIVE",
      fingerprint,
      face: { ...face, sellerId: "seller-999" },
    });

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "IDENTITY_MISMATCH",
        retryable: false,
        details: {
          fingerprintSellerId: "seller-001",
          faceSellerId: "seller-999",
        },
      },
    });
  });

  it("menolak hasil fingerprint yang belum terverifikasi", () => {
    const result = verifyIdentityMembership({
      membershipStatus: "ACTIVE",
      fingerprint: {
        ...fingerprint,
        verified: false,
        sellerId: undefined,
      },
      face,
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: "FINGERPRINT_NOT_VERIFIED", retryable: true },
    });
  });
});

describe("validateIdentityCorrection", () => {
  it("mewajibkan alasan koreksi yang bermakna", () => {
    const result = validateIdentityCorrection({
      field: "FACE_IDENTITY",
      previousValue: "seller-002",
      correctedValue: "seller-001",
      reason: "",
      correctedBy: "officer-001",
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: "CORRECTION_REASON_REQUIRED" },
    });
  });
});
