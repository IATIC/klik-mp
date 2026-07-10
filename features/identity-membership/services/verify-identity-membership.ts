import {
  identityCorrectionSchema,
  verifyIdentityMembershipInputSchema,
  verifiedSellerSchema,
} from "../schemas/identity-membership";
import type {
  IdentityMembershipError,
  IdentityMembershipErrorCode,
  IdentityCorrection,
  VerifyIdentityMembershipResult,
} from "../types/identity-membership";

function failure(
  code: IdentityMembershipErrorCode,
  message: string,
  retryable: boolean,
  details?: Record<string, string>,
): VerifyIdentityMembershipResult {
  return {
    ok: false,
    error: { code, message, retryable, details },
  };
}

function getCorrection(input: unknown): unknown {
  if (typeof input !== "object" || input === null || !("correction" in input)) {
    return undefined;
  }

  return input.correction;
}

export function verifyIdentityMembership(
  input: unknown,
): VerifyIdentityMembershipResult {
  const rawCorrection = getCorrection(input);

  if (rawCorrection !== undefined) {
    const correctionResult = identityCorrectionSchema.safeParse(rawCorrection);

    if (!correctionResult.success) {
      return failure(
        "CORRECTION_REASON_REQUIRED",
        "Koreksi identitas harus menyertakan alasan dan petugas yang bertanggung jawab.",
        false,
      );
    }
  }

  const inputResult = verifyIdentityMembershipInputSchema.safeParse(input);

  if (!inputResult.success) {
    return failure(
      "INVALID_INPUT",
      "Data verifikasi identitas atau keanggotaan tidak valid.",
      false,
    );
  }

  const {
    expectedSellerId,
    membershipStatus,
    fingerprint,
    face,
    savingsSettlement,
    correction,
  } = inputResult.data;

  if (fingerprint.modality !== "FINGERPRINT") {
    return failure(
      "INVALID_INPUT",
      "Hasil fingerprint menggunakan jenis biometrik yang tidak sesuai.",
      false,
    );
  }

  if (face.modality !== "FACE") {
    return failure(
      "INVALID_INPUT",
      "Hasil pengenalan wajah menggunakan jenis biometrik yang tidak sesuai.",
      false,
    );
  }

  if (!fingerprint.verified || !fingerprint.sellerId) {
    return failure(
      "FINGERPRINT_NOT_VERIFIED",
      "Sidik jari belum dapat diverifikasi. Silakan pindai ulang.",
      true,
    );
  }

  if (!face.verified || !face.sellerId) {
    return failure(
      "FACE_NOT_VERIFIED",
      "Wajah belum dapat diverifikasi. Silakan ambil gambar ulang.",
      true,
    );
  }

  if (
    fingerprint.sellerId !== face.sellerId ||
    (expectedSellerId !== undefined &&
      fingerprint.sellerId !== expectedSellerId)
  ) {
    return failure(
      "IDENTITY_MISMATCH",
      "Identitas dari sidik jari dan wajah tidak cocok. Proses dihentikan untuk ditinjau petugas.",
      false,
      {
        fingerprintSellerId: fingerprint.sellerId,
        faceSellerId: face.sellerId,
        ...(expectedSellerId ? { expectedSellerId } : {}),
      },
    );
  }

  if (membershipStatus === "PENDING_PAYMENT" && !savingsSettlement) {
    return failure(
      "SETTLEMENT_REQUIRED",
      "Pilih setor langsung atau potong dari margin transaksi untuk menyelesaikan simpanan pokok.",
      true,
    );
  }

  if (membershipStatus === "ACTIVE" && savingsSettlement) {
    return failure(
      "INVALID_INPUT",
      "Anggota aktif tidak memerlukan metode penyelesaian simpanan pokok.",
      false,
    );
  }

  const sellerResult = verifiedSellerSchema.safeParse({
    sellerId: fingerprint.sellerId,
    membershipStatus,
    fingerprintVerified: true,
    faceVerified: true,
    ...(membershipStatus === "PENDING_PAYMENT"
      ? { savingsSettlement }
      : {}),
  });

  if (!sellerResult.success) {
    return failure(
      "INVALID_INPUT",
      "Hasil verifikasi penjual tidak memenuhi kontrak modul.",
      false,
    );
  }

  return {
    ok: true,
    seller: sellerResult.data,
    ...(correction ? { correction } : {}),
  };
}

export function toIdentityMembershipError(error: unknown): IdentityMembershipError {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "retryable" in error &&
    typeof error.code === "string" &&
    typeof error.message === "string" &&
    typeof error.retryable === "boolean"
  ) {
    const deviceCode: IdentityMembershipErrorCode =
      error.code === "DEVICE_RESPONSE_INVALID" ||
      error.code === "DEVICE_REQUEST_ABORTED"
        ? error.code
        : "DEVICE_UNAVAILABLE";

    return {
      code: deviceCode,
      message: error.message,
      retryable: error.retryable,
      details: { deviceCode: error.code },
    };
  }

  return {
    code: "UNEXPECTED_ERROR",
    message: "Terjadi kendala tak terduga saat memverifikasi identitas.",
    retryable: true,
  };
}

export function validateIdentityCorrection(
  input: unknown,
):
  | { ok: true; correction: IdentityCorrection }
  | { ok: false; error: IdentityMembershipError } {
  const result = identityCorrectionSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      error: {
        code: "CORRECTION_REASON_REQUIRED",
        message:
          "Koreksi identitas harus mencatat nilai awal, nilai baru, alasan, dan petugas.",
        retryable: false,
      },
    };
  }

  return { ok: true, correction: result.data };
}
