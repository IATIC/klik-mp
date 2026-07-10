import {
  commodityCaptureSchema,
  createCommodityCaptureInputSchema,
  type CreateCommodityCaptureInput,
} from "../schemas/commodity-capture";
import type { CommodityCapture } from "../types/commodity-capture";
import { validatePhotoQuality } from "./photo-quality";
import { calculateNetWeight } from "./weight";

export class PhotoQualityError extends Error {
  readonly code = "PHOTO_QUALITY_INVALID";

  constructor(readonly issues: string[]) {
    super("Foto belum memenuhi standar kualitas.");
    this.name = "PhotoQualityError";
  }
}

export function createCommodityCapture(
  input: CreateCommodityCaptureInput,
): CommodityCapture {
  const parsedInput = createCommodityCaptureInputSchema.parse(input);
  const photoQuality = validatePhotoQuality(parsedInput.photo);

  if (!photoQuality.valid) {
    throw new PhotoQualityError(photoQuality.issues);
  }

  const weights = calculateNetWeight(
    parsedInput.grossWeight,
    parsedInput.tareWeight,
  );

  return commodityCaptureSchema.parse({
    captureId: parsedInput.captureId,
    ...weights,
    imageUrl: parsedInput.photo.imageUrl,
    capturedAt: parsedInput.capturedAt,
  });
}

