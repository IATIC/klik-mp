import { describe, expect, it } from "vitest";

import {
  assessCommodity,
  correctCommodityAssessment,
  MockCommodityVisionAdapter,
  verifyCommodityAssessment,
} from "@/features/commodity-assessment";

describe("commodity assessment services", () => {
  it("menghasilkan assessment AI dengan confidence valid", async () => {
    const result = await assessCommodity(new MockCommodityVisionAdapter(), {
      captureId: "capture-1",
      imageUrl: "https://evidence.example/capture-1.jpg",
    });

    expect(result).toEqual({
      commodityType: "Gabah Kering Panen",
      qualityGrade: "Grade B",
      classificationConfidence: 0.94,
      qualityConfidence: 0.87,
      verifiedByOfficer: false,
    });
  });

  it("menolak confidence di luar rentang 0 sampai 1", async () => {
    const adapter = new MockCommodityVisionAdapter({
      prediction: {
        commodityType: "Jagung",
        qualityGrade: "Grade A",
        classificationConfidence: 1.2,
        qualityConfidence: 0.8,
      },
    });

    await expect(
      assessCommodity(adapter, {
        captureId: "capture-2",
        imageUrl: "https://evidence.example/capture-2.jpg",
      }),
    ).rejects.toThrow();
  });

  it("memverifikasi prediksi tanpa mengubah hasil AI", () => {
    expect(
      verifyCommodityAssessment({
        commodityType: "Jagung",
        qualityGrade: "Grade A",
        classificationConfidence: 0.9,
        qualityConfidence: 0.8,
        verifiedByOfficer: false,
      }),
    ).toMatchObject({
      commodityType: "Jagung",
      qualityGrade: "Grade A",
      verifiedByOfficer: true,
    });
  });

  it("mewajibkan alasan saat petugas mengoreksi hasil", () => {
    const assessment = {
      commodityType: "Jagung",
      qualityGrade: "Grade B",
      classificationConfidence: 0.9,
      qualityConfidence: 0.8,
      verifiedByOfficer: false,
    };

    expect(() =>
      correctCommodityAssessment(assessment, {
        correctedValue: "Jagung — Grade A",
        correctionReason: "",
      }),
    ).toThrow(/alasan koreksi/i);

    expect(
      correctCommodityAssessment(assessment, {
        correctedValue: "Jagung — Grade A",
        correctionReason: "Biji utuh dan warna merata.",
      }),
    ).toMatchObject({
      correctedValue: "Jagung — Grade A",
      correctionReason: "Biji utuh dan warna merata.",
      verifiedByOfficer: true,
    });
  });
});

