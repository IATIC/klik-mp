import { weightInputSchema } from "../schemas/commodity-capture";
import type { ScaleAdapter, WeightSnapshot } from "../types/commodity-capture";

export function calculateNetWeight(
  grossWeight: number,
  tareWeight: number,
): WeightSnapshot {
  const weights = weightInputSchema.parse({ grossWeight, tareWeight });

  return {
    ...weights,
    netWeight: weights.grossWeight - weights.tareWeight,
  };
}

export async function readWeightSnapshot(
  scale: ScaleAdapter,
): Promise<WeightSnapshot> {
  const grossWeight = await scale.readGrossWeight();
  const tareWeight = await scale.readTareWeight();

  return calculateNetWeight(grossWeight, tareWeight);
}

