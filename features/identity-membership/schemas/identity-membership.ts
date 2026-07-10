import { z } from "zod";

export const membershipStatusSchema = z.enum(["ACTIVE", "PENDING_PAYMENT"]);

export const savingsSettlementSchema = z.enum([
  "DIRECT_PAYMENT",
  "DEDUCT_FROM_MARGIN",
]);

export const biometricModalitySchema = z.enum(["FINGERPRINT", "FACE"]);

export const bridgeMetadataSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()]),
);

export const biometricVerificationRequestSchema = z.object({
  sessionId: z.string().trim().min(1, "Session ID wajib diisi."),
  sellerIdHint: z.string().trim().min(1).optional(),
  metadata: bridgeMetadataSchema.optional(),
});

export const biometricVerificationSchema = z
  .object({
    modality: biometricModalitySchema,
    verified: z.boolean(),
    sellerId: z.string().trim().min(1).optional(),
    captureId: z.string().trim().min(1).optional(),
    confidence: z.number().min(0).max(1).optional(),
    verifiedAt: z.string().datetime({ offset: true }),
    deviceId: z.string().trim().min(1).optional(),
  })
  .superRefine((value, context) => {
    if (value.verified && !value.sellerId) {
      context.addIssue({
        code: "custom",
        path: ["sellerId"],
        message: "Seller ID wajib tersedia untuk verifikasi yang berhasil.",
      });
    }
  });

export const identityCorrectionSchema = z.object({
  field: z.enum([
    "FINGERPRINT_IDENTITY",
    "FACE_IDENTITY",
    "MEMBERSHIP_STATUS",
  ]),
  previousValue: z.string().trim().min(1),
  correctedValue: z.string().trim().min(1),
  reason: z.string().trim().min(5, "Alasan koreksi minimal 5 karakter."),
  correctedBy: z.string().trim().min(1),
});

export const verifyIdentityMembershipInputSchema = z.object({
  expectedSellerId: z.string().trim().min(1).optional(),
  membershipStatus: membershipStatusSchema,
  fingerprint: biometricVerificationSchema,
  face: biometricVerificationSchema,
  savingsSettlement: savingsSettlementSchema.optional(),
  correction: identityCorrectionSchema.optional(),
});

export const verifiedSellerSchema = z
  .object({
    sellerId: z.string().trim().min(1),
    membershipStatus: membershipStatusSchema,
    fingerprintVerified: z.literal(true),
    faceVerified: z.literal(true),
    savingsSettlement: savingsSettlementSchema.optional(),
  })
  .superRefine((value, context) => {
    if (
      value.membershipStatus === "PENDING_PAYMENT" &&
      !value.savingsSettlement
    ) {
      context.addIssue({
        code: "custom",
        path: ["savingsSettlement"],
        message: "Metode penyelesaian simpanan pokok wajib dipilih.",
      });
    }

    if (value.membershipStatus === "ACTIVE" && value.savingsSettlement) {
      context.addIssue({
        code: "custom",
        path: ["savingsSettlement"],
        message: "Anggota aktif tidak memerlukan penyelesaian simpanan pokok.",
      });
    }
  });

export const deviceBridgeResponseSchema = z.object({
  protocolVersion: z.literal("1.0"),
  requestId: z.string().trim().min(1),
  status: z.enum(["VERIFIED", "NOT_VERIFIED", "ERROR"]),
  result: z
    .object({
      sellerId: z.string().trim().min(1).optional(),
      captureId: z.string().trim().min(1).optional(),
      confidence: z.number().min(0).max(1).optional(),
      verifiedAt: z.string().datetime({ offset: true }),
      deviceId: z.string().trim().min(1).optional(),
    })
    .optional(),
  error: z
    .object({
      code: z.string().trim().min(1),
      message: z.string().trim().min(1),
      retryable: z.boolean(),
    })
    .optional(),
});
