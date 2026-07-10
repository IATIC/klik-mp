export type CommodityCapture = {
  captureId: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  imageUrl: string;
  capturedAt: string;
};

export type WeightSnapshot = {
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
};

export type PhotoQualityMetrics = {
  width: number;
  height: number;
  brightness: number;
  sharpness: number;
};

export type CapturedPhoto = {
  imageUrl: string;
  metrics: PhotoQualityMetrics;
};

export type PhotoQualityIssue =
  | "RESOLUTION_TOO_LOW"
  | "TOO_DARK"
  | "TOO_BRIGHT"
  | "TOO_BLURRY";

export type PhotoQualityResult = {
  valid: boolean;
  issues: PhotoQualityIssue[];
};

export interface ScaleAdapter {
  connect(): Promise<void>;
  readGrossWeight(): Promise<number>;
  readTareWeight(): Promise<number>;
  disconnect(): Promise<void>;
}

export interface CameraAdapter {
  startPreview(videoElement: HTMLVideoElement): Promise<void>;
  capture(): Promise<CapturedPhoto>;
  stop(): Promise<void>;
}

