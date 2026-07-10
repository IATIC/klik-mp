import { z } from "zod";

export const intakeSessionStatusSchema = z.enum([
  "DRAFT",
  "IDENTITY_VERIFIED",
  "MEMBERSHIP_READY",
  "COMMODITY_CAPTURED",
  "COMMODITY_ASSESSED",
  "OFFER_CREATED",
  "NEGOTIATING",
  "AGREED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);

export const verifiedSellerSchema = z
  .object({
    sellerId: z.string().trim().min(1),
    membershipStatus: z.enum(["ACTIVE", "PENDING_PAYMENT"]),
    fingerprintVerified: z.boolean(),
    faceVerified: z.boolean(),
    savingsSettlement: z
      .enum(["DIRECT_PAYMENT", "DEDUCT_FROM_MARGIN"])
      .optional(),
  })
  .superRefine((seller, context) => {
    if (!seller.fingerprintVerified || !seller.faceVerified) {
      context.addIssue({
        code: "custom",
        message: "Fingerprint dan wajah penjual harus terverifikasi.",
      });
    }
    if (
      seller.membershipStatus === "PENDING_PAYMENT" &&
      !seller.savingsSettlement
    ) {
      context.addIssue({
        code: "custom",
        path: ["savingsSettlement"],
        message: "Metode penyelesaian simpanan pokok wajib dipilih.",
      });
    }
  });

export const commodityCaptureSchema = z.object({
  captureId: z.string().trim().min(1),
  grossWeight: z.number().finite().nonnegative(),
  tareWeight: z.number().finite().nonnegative(),
  netWeight: z.number().finite().positive(),
  imageUrl: z.url(),
  capturedAt: z.iso.datetime(),
});

export const commodityAssessmentSchema = z
  .object({
    commodityType: z.string().trim().min(1),
    qualityGrade: z.string().trim().min(1),
    classificationConfidence: z.number().finite().min(0).max(1),
    qualityConfidence: z.number().finite().min(0).max(1),
    verifiedByOfficer: z.boolean(),
    correctedValue: z.string().trim().min(1).optional(),
    correctionReason: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((assessment, context) => {
    if (assessment.correctedValue && !assessment.correctionReason) {
      context.addIssue({
        code: "custom",
        path: ["correctionReason"],
        message: "Alasan wajib diisi saat hasil AI dikoreksi.",
      });
    }
  });

export const agreedPriceSchema = z.object({
  referencePrice: z.number().finite().positive(),
  qualityFactor: z.number().finite().positive(),
  initialOffer: z.number().finite().positive(),
  finalUnitPrice: z.number().finite().positive(),
  finalTotalPrice: z.number().finite().positive(),
  negotiationStatus: z.enum(["ACCEPTED", "REJECTED", "NEGOTIATING"]),
});

export const auditContextSchema = z.object({
  auditId: z.string().trim().min(1),
  actorId: z.string().trim().min(1),
  occurredAt: z.iso.datetime(),
  note: z.string().trim().min(1).max(500).optional(),
});

export const finalApprovalSchema = auditContextSchema.extend({
  party: z.enum(["BUYER", "SELLER"]),
});

export const settlementInputSchema = z.object({
  savingsRequiredAmount: z.number().finite().nonnegative(),
  directPaymentReceived: z.boolean().default(false),
});

export const completionContextSchema = auditContextSchema.extend({
  transactionId: z.string().trim().min(1),
  receiptNumber: z.string().trim().min(1),
  stockReceiptId: z.string().trim().min(1),
});

export type AuditContext = z.infer<typeof auditContextSchema>;
export type FinalApprovalInput = z.infer<typeof finalApprovalSchema>;
export type SettlementInput = z.input<typeof settlementInputSchema>;
export type CompletionContext = z.infer<typeof completionContextSchema>;
