import type { CameraAdapter, CapturedPhoto } from "../types/commodity-capture";

const DEFAULT_PHOTO: CapturedPhoto = {
  imageUrl: "data:image/jpeg;base64,bW9jay1jb21tb2RpdHk=",
  metrics: { width: 1280, height: 720, brightness: 0.55, sharpness: 0.2 },
};

export type MockCameraOptions = {
  photo?: CapturedPhoto;
  error?: Error;
};

export class MockCameraAdapter implements CameraAdapter {
  private started = false;

  constructor(private readonly options: MockCameraOptions = {}) {}

  async startPreview(): Promise<void> {
    if (this.options.error) throw this.options.error;
    this.started = true;
  }

  async capture(): Promise<CapturedPhoto> {
    if (!this.started) throw new Error("Mock kamera belum aktif.");
    return this.options.photo ?? DEFAULT_PHOTO;
  }

  async stop(): Promise<void> {
    this.started = false;
  }
}

