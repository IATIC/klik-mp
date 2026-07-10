import type { DeviceStatus } from "@/features/kiosk-flow";
import { waitForMock } from "@/lib/services/mock-utils";

export type FingerprintScanResult = {
  status: Extract<DeviceStatus, "success" | "failed">;
  reference?: "mock-fingerprint-0042";
  error?: string;
};

export interface FingerprintAdapter {
  scan(outcome?: "success" | "failed"): Promise<FingerprintScanResult>;
}

export class MockFingerprintAdapter implements FingerprintAdapter {
  async scan(outcome: "success" | "failed" = "success"): Promise<FingerprintScanResult> {
    await waitForMock(520);
    if (outcome === "failed") {
      return { status: "failed", error: "Sidik jari belum dapat dibaca. Bersihkan jari atau gunakan cara lain." };
    }
    return { status: "success", reference: "mock-fingerprint-0042" };
  }
}

export const fingerprintAdapter: FingerprintAdapter = new MockFingerprintAdapter();

