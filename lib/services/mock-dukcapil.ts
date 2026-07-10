import { DEMO_IDENTITY, type IdentityRecord } from "@/features/kiosk-flow";
import { waitForMock } from "./mock-utils";

export interface DukcapilAdapter {
  lookupByFingerprint(
    fingerprintReference: string,
    outcome?: "found" | "not-found" | "failed",
  ): Promise<{ status: "found"; identity: IdentityRecord } | { status: "not-found" | "failed"; error: string }>;
}

export class MockDukcapilAdapter implements DukcapilAdapter {
  async lookupByFingerprint(
    fingerprintReference: string,
    outcome: "found" | "not-found" | "failed" = "found",
  ) {
    await waitForMock(440);
    if (!fingerprintReference || outcome === "failed") {
      return { status: "failed" as const, error: "Layanan data identitas sedang tidak tersedia." };
    }
    if (outcome === "not-found") {
      return { status: "not-found" as const, error: "Data belum ditemukan. Silakan masukkan data sesuai KTP." };
    }
    return { status: "found" as const, identity: DEMO_IDENTITY };
  }
}

export const dukcapilAdapter: DukcapilAdapter = new MockDukcapilAdapter();

