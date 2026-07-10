import {
  assessmentCorrectionSchema,
  commodityAssessmentSchema,
} from "../schemas/commodity-assessment";
import type {
  AssessmentCorrection,
  CommodityAssessment,
} from "../types/commodity-assessment";

export function verifyCommodityAssessment(
  assessment: CommodityAssessment,
): CommodityAssessment {
  const parsedAssessment = commodityAssessmentSchema.parse(assessment);

  return commodityAssessmentSchema.parse({
    ...parsedAssessment,
    verifiedByOfficer: true,
  });
}

export function correctCommodityAssessment(
  assessment: CommodityAssessment,
  correction: AssessmentCorrection,
): CommodityAssessment {
  const parsedAssessment = commodityAssessmentSchema.parse(assessment);
  const parsedCorrection = assessmentCorrectionSchema.parse(correction);

  return commodityAssessmentSchema.parse({
    ...parsedAssessment,
    ...parsedCorrection,
    verifiedByOfficer: true,
  });
}

