import { z } from "zod";

export const marketPriceQuerySchema = z.object({
  commodityType: z.string().trim().min(1, "Jenis komoditas wajib diisi."),
  qualityGrade: z.string().trim().min(1, "Grade kualitas wajib diisi."),
  market: z.string().trim().min(1).optional(),
  unit: z.string().trim().min(1).default("kg"),
});

export const marketPriceReferenceSchema = z.object({
  referencePrice: z.number().finite().positive(),
  commodityType: z.string().trim().min(1),
  qualityGrade: z.string().trim().min(1),
  market: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  currency: z.literal("IDR"),
  observedAt: z.iso.datetime(),
  source: z.string().trim().min(1),
});

export const createNegotiationSchema = z.object({
  negotiationId: z.string().trim().min(1),
  referencePrice: z.number().finite().positive(),
  qualityFactor: z.number().finite().min(0.5).max(1.5),
  quantity: z.number().finite().positive(),
  occurredAt: z.iso.datetime(),
});

export const negotiationDecisionSchema = z.object({
  historyId: z.string().trim().min(1),
  occurredAt: z.iso.datetime(),
  note: z.string().trim().min(1).max(500).optional(),
});

export const counterofferSchema = negotiationDecisionSchema.extend({
  unitPrice: z.number().finite().positive(),
});

export type CreateNegotiationInput = z.infer<typeof createNegotiationSchema>;
export type NegotiationDecisionInput = z.infer<
  typeof negotiationDecisionSchema
>;
export type CounterofferInput = z.infer<typeof counterofferSchema>;
