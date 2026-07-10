import type {
  BiometricModality,
  BiometricVerification,
  BiometricVerificationRequest,
} from "../types/identity-membership";
import {
  DeviceBridgeError,
  type FaceRecognitionAdapter,
  type FingerprintAdapter,
} from "./contracts";

export type MockBiometricAdapterOptions = {
  sellerId?: string;
  verified?: boolean;
  confidence?: number;
  deviceId?: string;
  delayMs?: number;
  error?: DeviceBridgeError;
  resultFactory?: (
    request: BiometricVerificationRequest,
  ) => BiometricVerification | Promise<BiometricVerification>;
};

async function wait(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    throw new DeviceBridgeError(
      "DEVICE_REQUEST_ABORTED",
      "Permintaan mock dibatalkan.",
      true,
    );
  }

  if (delayMs <= 0) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      signal?.removeEventListener("abort", abort);
    };

    function abort() {
      clearTimeout(timeout);
      cleanup();
      reject(
        new DeviceBridgeError(
          "DEVICE_REQUEST_ABORTED",
          "Permintaan mock dibatalkan.",
          true,
        ),
      );
    }

    signal?.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);
  });
}

class MockBiometricAdapter {
  constructor(
    private readonly modality: BiometricModality,
    private readonly options: MockBiometricAdapterOptions,
  ) {}

  async verify(
    request: BiometricVerificationRequest,
  ): Promise<BiometricVerification> {
    await wait(this.options.delayMs ?? 0, request.signal);

    if (this.options.error) {
      throw this.options.error;
    }

    if (this.options.resultFactory) {
      return this.options.resultFactory(request);
    }

    const verified = this.options.verified ?? true;
    const sellerId =
      this.options.sellerId ?? request.sellerIdHint ?? "seller-demo-001";

    return {
      modality: this.modality,
      verified,
      ...(verified ? { sellerId } : {}),
      captureId: `mock-${this.modality.toLowerCase()}-${request.sessionId}`,
      confidence: this.options.confidence ?? 0.99,
      verifiedAt: new Date().toISOString(),
      deviceId:
        this.options.deviceId ?? `mock-${this.modality.toLowerCase()}-device`,
    };
  }
}

export class MockFingerprintAdapter implements FingerprintAdapter {
  private readonly mock: MockBiometricAdapter;

  constructor(options: MockBiometricAdapterOptions = {}) {
    this.mock = new MockBiometricAdapter("FINGERPRINT", options);
  }

  verify(request: BiometricVerificationRequest): Promise<BiometricVerification> {
    return this.mock.verify(request);
  }
}

export class MockFaceRecognitionAdapter implements FaceRecognitionAdapter {
  private readonly mock: MockBiometricAdapter;

  constructor(options: MockBiometricAdapterOptions = {}) {
    this.mock = new MockBiometricAdapter("FACE", options);
  }

  verify(request: BiometricVerificationRequest): Promise<BiometricVerification> {
    return this.mock.verify(request);
  }
}

export function createMatchingMockBiometricAdapters(
  sellerId = "seller-demo-001",
): {
  fingerprintAdapter: FingerprintAdapter;
  faceRecognitionAdapter: FaceRecognitionAdapter;
} {
  return {
    fingerprintAdapter: new MockFingerprintAdapter({ sellerId }),
    faceRecognitionAdapter: new MockFaceRecognitionAdapter({ sellerId }),
  };
}
