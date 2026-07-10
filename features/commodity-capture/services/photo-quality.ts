import { capturedPhotoSchema } from "../schemas/commodity-capture";
import type {
  CapturedPhoto,
  PhotoQualityIssue,
  PhotoQualityResult,
} from "../types/commodity-capture";

export const PHOTO_QUALITY_LIMITS = {
  minWidth: 640,
  minHeight: 480,
  minBrightness: 0.15,
  maxBrightness: 0.9,
  minSharpness: 0.05,
} as const;

export function validatePhotoQuality(photo: CapturedPhoto): PhotoQualityResult {
  const parsedPhoto = capturedPhotoSchema.parse(photo);
  const issues: PhotoQualityIssue[] = [];
  const { metrics } = parsedPhoto;

  if (
    metrics.width < PHOTO_QUALITY_LIMITS.minWidth ||
    metrics.height < PHOTO_QUALITY_LIMITS.minHeight
  ) {
    issues.push("RESOLUTION_TOO_LOW");
  }
  if (metrics.brightness < PHOTO_QUALITY_LIMITS.minBrightness) {
    issues.push("TOO_DARK");
  }
  if (metrics.brightness > PHOTO_QUALITY_LIMITS.maxBrightness) {
    issues.push("TOO_BRIGHT");
  }
  if (metrics.sharpness < PHOTO_QUALITY_LIMITS.minSharpness) {
    issues.push("TOO_BLURRY");
  }

  return { valid: issues.length === 0, issues };
}

export const PHOTO_QUALITY_MESSAGES: Record<PhotoQualityIssue, string> = {
  RESOLUTION_TOO_LOW: "Resolusi foto terlalu rendah.",
  TOO_DARK: "Foto terlalu gelap.",
  TOO_BRIGHT: "Foto terlalu terang.",
  TOO_BLURRY: "Foto kurang tajam. Stabilkan kamera lalu coba lagi.",
};

