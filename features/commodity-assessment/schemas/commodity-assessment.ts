import { z } from "zod";

const confidenceSchema = z
  .number()
  .finite()
  .min(0, "Confidence tidak boleh kurang dari 0.")
  .max(1, "Confidence tidak boleh lebih dari 1.");

export const commodityVisionInputSchema = z.object({
  captureId: z.string().trim().min(1, "Capture ID wajib tersedia."),
  imageUrl: z.string().trim().min(1, "Bukti foto wajib tersedia."),
});

export const commodityVisionPredictionSchema = z.object({
  commodityType: z.string().trim().min(1, "Jenis komoditas wajib tersedia."),
  qualityGrade: z.string().trim().min(1, "Grade kualitas wajib tersedia."),
  classificationConfidence: confidenceSchema,
  qualityConfidence: confidenceSchema,
});

export const assessmentCorrectionSchema = z.object({
  correctedValue: z.string().trim().min(1, "Nilai koreksi wajib diisi."),
  correctionReason: z
    .string()
    .trim()
    .min(5, "Alasan koreksi minimal 5 karakter."),
});

export const commodityAssessmentSchema = commodityVisionPredictionSchema
  .extend({
    verifiedByOfficer: z.boolean(),
    correctedValue: z.string().trim().min(1).optional(),
    correctionReason: z.string().trim().min(5).optional(),
  })
  .superRefine((assessment, context) => {
    const hasCorrectedValue = assessment.correctedValue !== undefined;
    const hasCorrectionReason = assessment.correctionReason !== undefined;

    if (hasCorrectedValue !== hasCorrectionReason) {
      context.addIssue({
        code: "custom",
        message: "Nilai dan alasan koreksi wajib dicatat bersama.",
        path: hasCorrectedValue ? ["correctionReason"] : ["correctedValue"],
      });
    }
    if ((hasCorrectedValue || hasCorrectionReason) && !assessment.verifiedByOfficer) {
      context.addIssue({
        code: "custom",
        message: "Koreksi wajib diverifikasi petugas.",
        path: ["verifiedByOfficer"],
      });
    }
  });

