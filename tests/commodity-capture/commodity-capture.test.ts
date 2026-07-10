import { describe, expect, it } from "vitest";

import {
  calculateNetWeight,
  createCommodityCapture,
  PhotoQualityError,
  validatePhotoQuality,
} from "@/features/commodity-capture";

describe("commodity capture services", () => {
  it("menghitung net dari gross dikurangi tare", () => {
    expect(calculateNetWeight(25.5, 1.25)).toEqual({
      grossWeight: 25.5,
      tareWeight: 1.25,
      netWeight: 24.25,
    });
  });

  it.each([
    [0, 1],
    [10, 0],
    [5, 5],
    [4, 5],
  ])("menolak kombinasi berat tidak positif (%s, %s)", (gross, tare) => {
    expect(() => calculateNetWeight(gross, tare)).toThrow();
  });

  it("menolak foto yang gelap dan buram", () => {
    const photo = {
      imageUrl: "data:image/jpeg;base64,dGVzdA==",
      metrics: { width: 1280, height: 720, brightness: 0.05, sharpness: 0.01 },
    };

    expect(validatePhotoQuality(photo)).toEqual({
      valid: false,
      issues: ["TOO_DARK", "TOO_BLURRY"],
    });
    expect(() =>
      createCommodityCapture({
        captureId: "capture-1",
        grossWeight: 25,
        tareWeight: 1,
        photo,
        capturedAt: "2026-07-10T08:00:00.000Z",
      }),
    ).toThrow(PhotoQualityError);
  });

  it("menghasilkan kontrak capture saat sensor dan foto valid", () => {
    expect(
      createCommodityCapture({
        captureId: "capture-1",
        grossWeight: 25,
        tareWeight: 1,
        photo: {
          imageUrl: "https://evidence.example/capture-1.jpg",
          metrics: { width: 1280, height: 720, brightness: 0.5, sharpness: 0.2 },
        },
        capturedAt: "2026-07-10T08:00:00.000Z",
      }),
    ).toEqual({
      captureId: "capture-1",
      grossWeight: 25,
      tareWeight: 1,
      netWeight: 24,
      imageUrl: "https://evidence.example/capture-1.jpg",
      capturedAt: "2026-07-10T08:00:00.000Z",
    });
  });
});

