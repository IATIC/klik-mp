import { z } from "zod";

import {
  commodityAssessmentSchema,
  intakeSessionStatusSchema,
} from "@/features/intake-transaction";
import { marketPriceQuerySchema } from "@/features/pricing-negotiation";

export const operatorContextSchema = z.object({
  auditId: z.string().trim().min(1),
  actorId: z.string().trim().min(1),
  occurredAt: z.iso.datetime(),
});

export const createAiReviewSchema = operatorContextSchema.extend({
  reviewId: z.string().trim().min(1),
  sessionId: z.string().trim().min(1),
  assessment: commodityAssessmentSchema,
});

export const correctAiReviewSchema = operatorContextSchema.extend({
  field: z.enum(["COMMODITY_TYPE", "QUALITY_GRADE"]),
  correctedValue: z.string().trim().min(1, "Nilai koreksi wajib diisi."),
  reason: z
    .string()
    .trim()
    .min(5, "Alasan koreksi minimal 5 karakter.")
    .max(500),
});

export const createReferencePriceSchema = operatorContextSchema.extend({
  referenceId: z.string().trim().min(1),
  query: marketPriceQuerySchema,
});

export const operatorTransactionSummarySchema = z.object({
  transactionId: z.string().trim().min(1),
  sellerName: z.string().trim().min(1),
  commodityType: z.string().trim().min(1),
  netWeight: z.number().finite().positive(),
  totalPrice: z.number().finite().positive(),
  status: intakeSessionStatusSchema,
  updatedAt: z.iso.datetime(),
});

export type OperatorContext = z.infer<typeof operatorContextSchema>;
export type CreateAiReviewInput = z.infer<typeof createAiReviewSchema>;
export type CorrectAiReviewInput = z.infer<typeof correctAiReviewSchema>;
export type CreateReferencePriceInput = z.infer<
  typeof createReferencePriceSchema
>;
