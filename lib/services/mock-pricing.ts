import type { AssessmentResult, OfferState, WeightSnapshot } from "@/features/kiosk-flow";
import { waitForMock } from "./mock-utils";

export interface PricingAdapter {
  createOffer(assessment: AssessmentResult, weight: WeightSnapshot): Promise<OfferState>;
  reviewCounteroffer(counteroffer: number): Promise<{ approved: true; agreedTotal: number }>;
}

export class MockPricingAdapter implements PricingAdapter {
  async createOffer(assessment: AssessmentResult, weight: WeightSnapshot) {
    await waitForMock(260);
    return {
      referencePrice: assessment.referencePrice,
      total: Math.round(assessment.referencePrice * weight.net),
      counteroffer: null,
      negotiationReason: "",
      agreedTotal: null,
      status: "offered" as const,
    };
  }

  async reviewCounteroffer(counteroffer: number) {
    await waitForMock(720);
    return { approved: true as const, agreedTotal: Math.round(counteroffer) };
  }
}

export const pricingAdapter: PricingAdapter = new MockPricingAdapter();

