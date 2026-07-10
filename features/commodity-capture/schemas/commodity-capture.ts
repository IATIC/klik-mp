import { z } from "zod";

export const weightInputSchema = z
  .object({
    grossWeight: z.number().finite().positive("Berat gross harus lebih dari 0 kg."),
    tareWeight: z.number().finite().positive("Berat tare harus lebih dari 0 kg."),
  })
  .refine(({ grossWeight, tareWeight }) => grossWeight > tareWeight, {
    message: "Berat gross harus lebih besar daripada berat tare.",
    path: ["grossWeight"],
  });

export const photoQualityMetricsSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  brightness: z.number().finite().min(0).max(1),
  sharpness: z.number().finite().min(0).max(1),
});

export const capturedPhotoSchema = z.object({
  imageUrl: z.string().trim().min(1, "Bukti foto wajib tersedia."),
  metrics: photoQualityMetricsSchema,
});

export const commodityCaptureSchema = z
  .object({
    captureId: z.string().trim().min(1),
    grossWeight: z.number().finite().positive(),
    tareWeight: z.number().finite().positive(),
    netWeight: z.number().finite().positive(),
    imageUrl: z.string().trim().min(1),
    capturedAt: z.string().datetime({ offset: true }),
  })
  .refine(
    ({ grossWeight, tareWeight, netWeight }) =>
      Math.abs(netWeight - (grossWeight - tareWeight)) < 1e-9,
    {
      message: "Berat net harus sama dengan gross dikurangi tare.",
      path: ["netWeight"],
    },
  );

export const createCommodityCaptureInputSchema = z.object({
  captureId: z.string().trim().min(1),
  grossWeight: z.number(),
  tareWeight: z.number(),
  photo: capturedPhotoSchema,
  capturedAt: z.string().datetime({ offset: true }),
});

export type CreateCommodityCaptureInput = z.infer<
  typeof createCommodityCaptureInputSchema
>;

