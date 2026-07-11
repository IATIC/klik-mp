import { describe, expect, it } from "vitest";
import {
  maskNik,
  maskMemberNumber,
  validateComplaintSummary,
  validateConsent,
  validateRequiredDocuments,
  isReadyToSubmit,
} from "@/features/clinic/validations/clinic-validation";
import { CLINIC_CONSTANTS } from "@/features/clinic/constants/clinic-constants";
import type { DocumentRequirement } from "@/features/clinic/types/clinic";

describe("maskNik", () => {
  it("menampilkan 4 digit pertama dan 4 digit terakhir, sisanya •", () => {
    expect(maskNik("3273014205890004")).toBe("3273••••••••0004");
  });

  it("menangani NIK pendek dengan baik", () => {
    expect(maskNik("12345")).toBe("12345");
  });

  it("mengembalikan string kosong untuk input kosong", () => {
    expect(maskNik("")).toBe("");
  });
});

describe("maskMemberNumber", () => {
  it("menampilkan 4 digit terakhir saja", () => {
    expect(maskMemberNumber("AGT-0042")).toBe("••••0042");
  });

  it("menangani nomor pendek", () => {
    expect(maskMemberNumber("AGT")).toBe("AGT");
  });

  it("mengembalikan string kosong untuk input kosong", () => {
    expect(maskMemberNumber("")).toBe("");
  });
});

describe("validateComplaintSummary", () => {
  it("menerima keluhan valid", () => {
    expect(
      validateComplaintSummary("Saya mengalami sakit kepala selama 3 hari"),
    ).toEqual({ valid: true });
  });

  it("menolak keluhan terlalu pendek", () => {
    const result = validateComplaintSummary("ab");
    expect(result.valid).toBe(false);
  });

  it("menolak keluhan kosong", () => {
    const result = validateComplaintSummary("");
    expect(result.valid).toBe(false);
  });

  it("menolak keluhan hanya spasi", () => {
    const result = validateComplaintSummary("     ");
    expect(result.valid).toBe(false);
  });

  it("menolak keluhan melebihi maksimum", () => {
    const longText = "x".repeat(CLINIC_CONSTANTS.MAX_COMPLAINT_LENGTH + 1);
    const result = validateComplaintSummary(longText);
    expect(result.valid).toBe(false);
  });

  it("menerima keluhan tepat di batas minimum", () => {
    const text = "x".repeat(CLINIC_CONSTANTS.MIN_COMPLAINT_LENGTH);
    expect(validateComplaintSummary(text)).toEqual({ valid: true });
  });

  it("menerima keluhan dengan karakter spesial", () => {
    expect(validateComplaintSummary("Sakit kepala & demam sejak 2 hari yang lalu")).toEqual({
      valid: true,
    });
  });
});

describe("validateConsent", () => {
  it("menerima consent true", () => {
    expect(validateConsent(true)).toEqual({ valid: true });
  });

  it("menolak consent false", () => {
    const result = validateConsent(false);
    expect(result.valid).toBe(false);
  });
});

describe("validateRequiredDocuments", () => {
  it("menerima semua dokumen wajib tersedia", () => {
    const docs: DocumentRequirement[] = [
      { id: "ktp", label: "KTP", description: "Kartu Tanda Penduduk", available: true, status: "AVAILABLE" },
      { id: "kk", label: "KK", description: "Kartu Keluarga", available: true, status: "AVAILABLE" },
    ];
    expect(validateRequiredDocuments(docs).valid).toBe(true);
  });

  it("menolak jika ada dokumen dengan status MISSING tidak tersedia", () => {
    const docs: DocumentRequirement[] = [
      { id: "ktp", label: "KTP", description: "Kartu Tanda Penduduk", available: true, status: "AVAILABLE" },
      { id: "kk", label: "KK", description: "Kartu Keluarga", available: false, status: "MISSING" },
    ];
    const result = validateRequiredDocuments(docs);
    expect(result.valid).toBe(false);
    expect(result.missingIds).toContain("kk");
  });

  it("mengabaikan dokumen opsional", () => {
    const docs: DocumentRequirement[] = [
      { id: "ktp", label: "KTP", description: "Kartu Tanda Penduduk", available: true, status: "AVAILABLE" },
      { id: "bpjs", label: "BPJS", description: "Kartu BPJS", available: false, status: "OPTIONAL" },
    ];
    expect(validateRequiredDocuments(docs).valid).toBe(true);
  });

  it("menerima daftar dokumen kosong", () => {
    expect(validateRequiredDocuments([]).valid).toBe(true);
  });
});

describe("isReadyToSubmit", () => {
  it("mengembalikan true jika semua kondisi terpenuhi", () => {
    expect(isReadyToSubmit(true, true, true)).toBe(true);
  });

  it("mengembalikan false jika complaint tidak valid", () => {
    expect(isReadyToSubmit(false, true, true)).toBe(false);
  });

  it("mengembalikan false jika dokumen belum lengkap", () => {
    expect(isReadyToSubmit(true, false, true)).toBe(false);
  });

  it("mengembalikan false jika consent belum disetujui", () => {
    expect(isReadyToSubmit(true, true, false)).toBe(false);
  });
});
