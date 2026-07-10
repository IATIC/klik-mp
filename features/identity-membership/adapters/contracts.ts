import type {
  BiometricVerification,
  BiometricVerificationRequest,
} from "../types/identity-membership";

export interface FingerprintAdapter {
  verify(request: BiometricVerificationRequest): Promise<BiometricVerification>;
}

export interface FaceRecognitionAdapter {
  verify(request: BiometricVerificationRequest): Promise<BiometricVerification>;
}

export type DeviceBridgeAdapterConfig = {
  baseUrl: string;
  endpoint?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  requestIdFactory?: () => string;
};

export type DeviceBridgeRequest = {
  protocolVersion: "1.0";
  requestId: string;
  operation: "VERIFY_FINGERPRINT" | "VERIFY_FACE";
  sessionId: string;
  sellerIdHint?: string;
  metadata?: Record<string, string | number | boolean>;
};

export class DeviceBridgeError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(code: string, message: string, retryable: boolean) {
    super(message);
    this.name = "DeviceBridgeError";
    this.code = code;
    this.retryable = retryable;
  }
}
