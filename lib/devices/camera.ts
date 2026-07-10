import type { CapturedCommodityPhoto } from "@/features/kiosk-flow";
import { waitForMock } from "@/lib/services/mock-utils";

export type FaceCaptureResult =
  | { ok: true; captured: true }
  | { ok: false; error: string };

export type CommodityCaptureResult =
  | { ok: true; photo: CapturedCommodityPhoto }
  | { ok: false; error: string };

export interface CameraAdapter {
  checkReady(): Promise<boolean>;
  captureFace(outcome?: "success" | "failed"): Promise<FaceCaptureResult>;
  captureCommodity(label: string, outcome?: "success" | "failed"): Promise<CommodityCaptureResult>;
}

export class MockCameraAdapter implements CameraAdapter {
  async checkReady() {
    await waitForMock(180);
    return true;
  }

  async captureFace(outcome: "success" | "failed" = "success"): Promise<FaceCaptureResult> {
    await waitForMock(560);
    return outcome === "failed"
      ? { ok: false, error: "Wajah belum terlihat jelas. Periksa posisi dan pencahayaan." }
      : { ok: true, captured: true };
  }

  async captureCommodity(
    label: string,
    outcome: "success" | "failed" = "success",
  ): Promise<CommodityCaptureResult> {
    await waitForMock(480);
    return outcome === "failed"
      ? { ok: false, error: "Kamera gagal mengambil foto. Periksa area dropbox lalu coba lagi." }
      : { ok: true, photo: { reference: "mock://commodity-photo/current", label } };
  }
}

export const cameraAdapter: CameraAdapter = new MockCameraAdapter();

