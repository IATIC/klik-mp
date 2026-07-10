import type {
  CameraAdapter,
  CapturedPhoto,
  PhotoQualityMetrics,
} from "../types/commodity-capture";

export type BrowserMediaCameraOptions = {
  width?: number;
  height?: number;
  facingMode?: "environment" | "user";
  jpegQuality?: number;
};

export class BrowserMediaCameraAdapter implements CameraAdapter {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  constructor(private readonly options: BrowserMediaCameraOptions = {}) {}

  async startPreview(videoElement: HTMLVideoElement): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Kamera browser tidak tersedia pada perangkat ini.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: this.options.width ?? 1280 },
        height: { ideal: this.options.height ?? 720 },
        facingMode: { ideal: this.options.facingMode ?? "environment" },
      },
      audio: false,
    });
    this.videoElement = videoElement;
    videoElement.srcObject = this.stream;
    await videoElement.play();
  }

  async capture(): Promise<CapturedPhoto> {
    const video = this.videoElement;
    if (!video || !this.stream) {
      throw new Error("Pratinjau kamera belum aktif.");
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (width <= 0 || height <= 0) {
      throw new Error("Kamera belum siap mengambil gambar.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Kanvas kamera tidak dapat dibuat.");

    context.drawImage(video, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height);

    return {
      imageUrl: canvas.toDataURL(
        "image/jpeg",
        this.options.jpegQuality ?? 0.88,
      ),
      metrics: calculateImageMetrics(pixels),
    };
  }

  async stop(): Promise<void> {
    this.stream?.getTracks().forEach((track) => track.stop());
    if (this.videoElement) this.videoElement.srcObject = null;
    this.stream = null;
    this.videoElement = null;
  }
}

function calculateImageMetrics(image: ImageData): PhotoQualityMetrics {
  const { data, width, height } = image;
  let totalLuminance = 0;
  let totalDifference = 0;
  let previousLuminance = 0;
  const pixelCount = width * height;

  for (let index = 0; index < data.length; index += 4) {
    const luminance =
      (0.2126 * data[index] +
        0.7152 * data[index + 1] +
        0.0722 * data[index + 2]) /
      255;
    totalLuminance += luminance;
    if (index > 0) totalDifference += Math.abs(luminance - previousLuminance);
    previousLuminance = luminance;
  }

  return {
    width,
    height,
    brightness: totalLuminance / pixelCount,
    sharpness: pixelCount > 1 ? totalDifference / (pixelCount - 1) : 0,
  };
}

