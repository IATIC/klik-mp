import type { AssessmentResult, Commodity } from "@/features/kiosk-flow";
import { waitForMock } from "./mock-utils";

const prices = {
  chili: 52_000,
  shallot: 38_000,
  tomato: 14_000,
  rice: 15_500,
  corn: 8_200,
  other: 10_000,
} as const;

export interface AssessmentAdapter {
  assess(commodity: Commodity, outcome?: "success" | "failed"): Promise<AssessmentResult>;
}

export class MockAssessmentAdapter implements AssessmentAdapter {
  async assess(commodity: Commodity, outcome: "success" | "failed" = "success") {
    await waitForMock(360);
    if (outcome === "failed") throw new Error("Penilaian tidak dapat diselesaikan. Foto dapat diambil ulang atau proses dicoba lagi.");
    return {
      commodityId: commodity.id,
      commodityName: commodity.name,
      grade: "Grade A" as const,
      qualityLabel: "Segar dan seragam",
      referencePrice: prices[commodity.id],
      confidence: 0.94,
    };
  }
}

export const assessmentAdapter: AssessmentAdapter = new MockAssessmentAdapter();

