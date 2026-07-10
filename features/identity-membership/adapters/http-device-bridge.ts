import {
  biometricVerificationRequestSchema,
  deviceBridgeResponseSchema,
} from "../schemas/identity-membership";
import type {
  BiometricModality,
  BiometricVerification,
  BiometricVerificationRequest,
} from "../types/identity-membership";
import {
  DeviceBridgeError,
  type DeviceBridgeAdapterConfig,
  type DeviceBridgeRequest,
  type FaceRecognitionAdapter,
  type FingerprintAdapter,
} from "./contracts";

type BridgeOperation = DeviceBridgeRequest["operation"];

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_FINGERPRINT_ENDPOINT = "/api/devices/fingerprint";
const DEFAULT_FACE_RECOGNITION_ENDPOINT = "/api/devices/face-recognition";

type ResolvedDeviceBridgeAdapterConfig = Omit<
  DeviceBridgeAdapterConfig,
  "endpoint" | "timeoutMs" | "fetchImpl" | "requestIdFactory"
> & {
  endpoint: string;
  timeoutMs: number;
  fetchImpl: typeof fetch;
  requestIdFactory: () => string;
};

function joinUrl(baseUrl: string, endpoint: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

function createRequestId(): string {
  return globalThis.crypto.randomUUID();
}

class HttpBiometricBridgeAdapter {
  private readonly config: ResolvedDeviceBridgeAdapterConfig;

  constructor(
    config: DeviceBridgeAdapterConfig,
    defaultEndpoint: string,
    private readonly operation: BridgeOperation,
    private readonly modality: BiometricModality,
  ) {
    this.config = {
      ...config,
      endpoint: config.endpoint ?? defaultEndpoint,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      fetchImpl: config.fetchImpl ?? globalThis.fetch,
      requestIdFactory: config.requestIdFactory ?? createRequestId,
    };
  }

  async verify(
    request: BiometricVerificationRequest,
  ): Promise<BiometricVerification> {
    const requestResult = biometricVerificationRequestSchema.safeParse(request);

    if (!requestResult.success) {
      throw new DeviceBridgeError(
        "INVALID_DEVICE_REQUEST",
        "Permintaan verifikasi biometrik tidak valid.",
        false,
      );
    }

    const requestId = this.config.requestIdFactory();
    const payload: DeviceBridgeRequest = {
      protocolVersion: "1.0",
      requestId,
      operation: this.operation,
      sessionId: requestResult.data.sessionId,
      ...(requestResult.data.sellerIdHint
        ? { sellerIdHint: requestResult.data.sellerIdHint }
        : {}),
      ...(requestResult.data.metadata
        ? { metadata: requestResult.data.metadata }
        : {}),
    };

    const controller = new AbortController();
    const abortFromCaller = () => controller.abort(request.signal?.reason);
    request.signal?.addEventListener("abort", abortFromCaller, { once: true });
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await this.config.fetchImpl(
        joinUrl(this.config.baseUrl, this.config.endpoint),
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...this.config.headers,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new DeviceBridgeError(
          "DEVICE_UNAVAILABLE",
          `Device bridge merespons HTTP ${response.status}.`,
          response.status >= 500 || response.status === 408 || response.status === 429,
        );
      }

      const responseResult = deviceBridgeResponseSchema.safeParse(
        await response.json(),
      );

      if (!responseResult.success || responseResult.data.requestId !== requestId) {
        throw new DeviceBridgeError(
          "DEVICE_RESPONSE_INVALID",
          "Respons device bridge tidak sesuai dengan protokol.",
          false,
        );
      }

      const bridgeResponse = responseResult.data;

      if (bridgeResponse.status === "ERROR") {
        throw new DeviceBridgeError(
          bridgeResponse.error?.code ?? "DEVICE_UNAVAILABLE",
          bridgeResponse.error?.message ?? "Device bridge gagal memproses verifikasi.",
          bridgeResponse.error?.retryable ?? true,
        );
      }

      if (!bridgeResponse.result) {
        throw new DeviceBridgeError(
          "DEVICE_RESPONSE_INVALID",
          "Respons device bridge tidak memuat hasil verifikasi.",
          false,
        );
      }

      if (bridgeResponse.status === "VERIFIED" && !bridgeResponse.result.sellerId) {
        throw new DeviceBridgeError(
          "DEVICE_RESPONSE_INVALID",
          "Respons verifikasi berhasil tidak memuat seller ID.",
          false,
        );
      }

      return {
        modality: this.modality,
        verified: bridgeResponse.status === "VERIFIED",
        ...(bridgeResponse.result.sellerId
          ? { sellerId: bridgeResponse.result.sellerId }
          : {}),
        ...(bridgeResponse.result.captureId
          ? { captureId: bridgeResponse.result.captureId }
          : {}),
        ...(bridgeResponse.result.confidence !== undefined
          ? { confidence: bridgeResponse.result.confidence }
          : {}),
        verifiedAt: bridgeResponse.result.verifiedAt,
        ...(bridgeResponse.result.deviceId
          ? { deviceId: bridgeResponse.result.deviceId }
          : {}),
      };
    } catch (error) {
      if (error instanceof DeviceBridgeError) {
        throw error;
      }

      if (controller.signal.aborted) {
        throw new DeviceBridgeError(
          "DEVICE_REQUEST_ABORTED",
          request.signal?.aborted
            ? "Permintaan verifikasi dibatalkan."
            : "Waktu tunggu perangkat habis.",
          true,
        );
      }

      throw new DeviceBridgeError(
        "DEVICE_UNAVAILABLE",
        "Device bridge tidak dapat dihubungi.",
        true,
      );
    } finally {
      clearTimeout(timeout);
      request.signal?.removeEventListener("abort", abortFromCaller);
    }
  }
}

export class HttpFingerprintAdapter implements FingerprintAdapter {
  private readonly bridge: HttpBiometricBridgeAdapter;

  constructor(config: DeviceBridgeAdapterConfig) {
    this.bridge = new HttpBiometricBridgeAdapter(
      config,
      DEFAULT_FINGERPRINT_ENDPOINT,
      "VERIFY_FINGERPRINT",
      "FINGERPRINT",
    );
  }

  verify(request: BiometricVerificationRequest): Promise<BiometricVerification> {
    return this.bridge.verify(request);
  }
}

export class HttpFaceRecognitionAdapter implements FaceRecognitionAdapter {
  private readonly bridge: HttpBiometricBridgeAdapter;

  constructor(config: DeviceBridgeAdapterConfig) {
    this.bridge = new HttpBiometricBridgeAdapter(
      config,
      DEFAULT_FACE_RECOGNITION_ENDPOINT,
      "VERIFY_FACE",
      "FACE",
    );
  }

  verify(request: BiometricVerificationRequest): Promise<BiometricVerification> {
    return this.bridge.verify(request);
  }
}
