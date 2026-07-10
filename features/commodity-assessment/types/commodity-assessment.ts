export type CommodityAssessment = {
  commodityType: string;
  qualityGrade: string;
  classificationConfidence: number;
  qualityConfidence: number;
  verifiedByOfficer: boolean;
  correctedValue?: string;
  correctionReason?: string;
};

export type CommodityVisionInput = {
  captureId: string;
  imageUrl: string;
};

export type CommodityVisionPrediction = Pick<
  CommodityAssessment,
  | "commodityType"
  | "qualityGrade"
  | "classificationConfidence"
  | "qualityConfidence"
>;

export type AssessmentCorrection = {
  correctedValue: string;
  correctionReason: string;
};

export interface CommodityVisionAdapter {
  assess(input: CommodityVisionInput): Promise<CommodityVisionPrediction>;
}

