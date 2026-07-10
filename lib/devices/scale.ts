import type { CommodityId, WeightSnapshot } from "@/features/kiosk-flow";
import { calculateNetWeight } from "@/features/kiosk-flow";
import { waitForMock } from "@/lib/services/mock-utils";

export interface ScaleAdapter {
  read(commodityId: CommodityId, outcome?: "success" | "disconnected"): Promise<WeightSnapshot>;
}

const readings: Record<CommodityId, [number, number]> = {
  chili: [12.8, 0.4],
  shallot: [18.6, 0.6],
  tomato: [14.2, 0.5],
  rice: [25.5, 0.5],
  corn: [21.4, 0.7],
  other: [10.5, 0.5],
};

export class MockScaleAdapter implements ScaleAdapter {
  async read(commodityId: CommodityId, outcome: "success" | "disconnected" = "success") {
    await waitForMock(420);
    if (outcome === "disconnected") throw new Error("Timbangan tidak terhubung. Panggil petugas untuk memeriksa kabel perangkat.");
    const [gross, tare] = readings[commodityId];
    return { gross, tare, net: calculateNetWeight(gross, tare) };
  }
}

export const scaleAdapter: ScaleAdapter = new MockScaleAdapter();

