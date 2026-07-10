import type {
  CommodityVisionAdapter,
  CommodityVisionPrediction,
} from "../types/commodity-assessment";

const DEFAULT_PREDICTION: CommodityVisionPrediction = {
  commodityType: "Gabah Kering Panen",
  qualityGrade: "Grade B",
  classificationConfidence: 0.94,
  qualityConfidence: 0.87,
};

export type MockCommodityVisionOptions = {
  prediction?: CommodityVisionPrediction;
  error?: Error;
};

export class MockCommodityVisionAdapter implements CommodityVisionAdapter {
  constructor(private readonly options: MockCommodityVisionOptions = {}) {}

  async assess(): Promise<CommodityVisionPrediction> {
    if (this.options.error) throw this.options.error;
    return this.options.prediction ?? DEFAULT_PREDICTION;
  }
}
