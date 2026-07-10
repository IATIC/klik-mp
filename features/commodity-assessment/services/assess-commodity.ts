import {
  commodityAssessmentSchema,
  commodityVisionInputSchema,
  commodityVisionPredictionSchema,
} from "../schemas/commodity-assessment";
import type {
  CommodityAssessment,
  CommodityVisionAdapter,
  CommodityVisionInput,
} from "../types/commodity-assessment";

export async function assessCommodity(
  adapter: CommodityVisionAdapter,
  input: CommodityVisionInput,
): Promise<CommodityAssessment> {
  const parsedInput = commodityVisionInputSchema.parse(input);
  const prediction = commodityVisionPredictionSchema.parse(
    await adapter.assess(parsedInput),
  );

  return commodityAssessmentSchema.parse({
    ...prediction,
    verifiedByOfficer: false,
  });
}

