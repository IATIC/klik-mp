export type MembershipStatus = "ACTIVE" | "PENDING_PAYMENT";

export type SavingsSettlement = "DIRECT_PAYMENT" | "DEDUCT_FROM_MARGIN";

export type BiometricModality = "FINGERPRINT" | "FACE";

export type VerifiedSeller = {
  sellerId: string;
  membershipStatus: MembershipStatus;
  fingerprintVerified: boolean;
  faceVerified: boolean;
  savingsSettlement?: SavingsSettlement;
};

export type BiometricVerificationRequest = {
  sessionId: string;
  sellerIdHint?: string;
  metadata?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
};

export type BiometricVerification = {
  modality: BiometricModality;
  verified: boolean;
  sellerId?: string;
  captureId?: string;
  confidence?: number;
  verifiedAt: string;
  deviceId?: string;
};

export type IdentityCorrection = {
  field: "FINGERPRINT_IDENTITY" | "FACE_IDENTITY" | "MEMBERSHIP_STATUS";
  previousValue: string;
  correctedValue: string;
  reason: string;
  correctedBy: string;
};

export type VerifyIdentityMembershipInput = {
  expectedSellerId?: string;
  membershipStatus: MembershipStatus;
  fingerprint: BiometricVerification;
  face: BiometricVerification;
  savingsSettlement?: SavingsSettlement;
  correction?: IdentityCorrection;
};

export type IdentityMembershipErrorCode =
  | "INVALID_INPUT"
  | "FINGERPRINT_NOT_VERIFIED"
  | "FACE_NOT_VERIFIED"
  | "IDENTITY_MISMATCH"
  | "SETTLEMENT_REQUIRED"
  | "CORRECTION_REASON_REQUIRED"
  | "DEVICE_UNAVAILABLE"
  | "DEVICE_RESPONSE_INVALID"
  | "DEVICE_REQUEST_ABORTED"
  | "UNEXPECTED_ERROR";

export type IdentityMembershipError = {
  code: IdentityMembershipErrorCode;
  message: string;
  retryable: boolean;
  details?: Record<string, string>;
};

export type VerifyIdentityMembershipResult =
  | {
      ok: true;
      seller: VerifiedSeller;
      correction?: IdentityCorrection;
    }
  | {
      ok: false;
      error: IdentityMembershipError;
    };

export type IdentityMembershipWorkflowState =
  | "IDLE"
  | "VERIFYING_IDENTITY"
  | "AWAITING_SETTLEMENT"
  | "VERIFIED"
  | "ERROR";
