import { describe, expect, it } from "vitest";
import {
  formatRupiah,
  validateAmount,
  validatePrincipalPayment,
  validateMandatoryFullPayment,
  validateMandatoryPartialPayment,
  validateVoluntaryDeposit,
  validateVoluntaryWithdrawal,
} from "@/features/savings/validations/savings-validation";
import { SAVINGS_CONSTANTS } from "@/features/savings/constants/savings-constants";

describe("formatRupiah", () => {
  it("memformat angka 0", () => {
    // Intl.NumberFormat("id-ID") uses a non-breaking space (\u00a0) between Rp and number
    expect(formatRupiah(0)).toBe("Rp\u00a00");
  });

  it("memformat angka positif", () => {
    expect(formatRupiah(500_000)).toBe("Rp\u00a0500.000");
  });

  it("memformat angka dengan ribuan", () => {
    expect(formatRupiah(1_200_000)).toBe("Rp\u00a01.200.000");
  });

  it("mengembalikan Rp0 untuk NaN", () => {
    expect(formatRupiah(NaN)).toBe("Rp0");
  });

  it("mengembalikan Rp0 untuk angka negatif", () => {
    expect(formatRupiah(-100)).toBe("Rp0");
  });

  it("memformat angka tanpa pecahan", () => {
    expect(formatRupiah(1000)).toBe("Rp\u00a01.000");
  });

  it("menangani angka besar", () => {
    expect(formatRupiah(1_000_000_000)).toBe("Rp\u00a01.000.000.000");
  });
});

describe("validateAmount", () => {
  it("menerima angka valid", () => {
    expect(validateAmount(50_000)).toEqual({ valid: true });
  });

  it("menolak NaN", () => {
    const result = validateAmount(NaN);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("angka yang valid");
  });

  it("menolak angka nol", () => {
    const result = validateAmount(0);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("lebih dari nol");
  });

  it("menolak angka negatif", () => {
    const result = validateAmount(-1000);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("lebih dari nol");
  });

  it("menolak angka desimal", () => {
    const result = validateAmount(500.5);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("rupiah penuh");
  });

  it("menolak angka di bawah minimum", () => {
    const result = validateAmount(5_000, { min: 10_000, fieldName: "Setoran" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("minimal");
  });

  it("menolak angka di atas maksimum", () => {
    const result = validateAmount(20_000_000, { max: 10_000_000 });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("melebihi");
  });
});

describe("validatePrincipalPayment", () => {
  it("selalu valid karena pembayaran penuh", () => {
    expect(validatePrincipalPayment()).toEqual({ valid: true });
  });
});

describe("validateMandatoryFullPayment", () => {
  it("menerima sisa tagihan valid", () => {
    expect(validateMandatoryFullPayment(60_000)).toEqual({ valid: true });
  });

  it("menolak sisa tagihan nol", () => {
    const result = validateMandatoryFullPayment(0);
    expect(result.valid).toBe(false);
  });
});

describe("validateMandatoryPartialPayment", () => {
  it("menerima pembayaran sebagian valid", () => {
    expect(validateMandatoryPartialPayment(30_000, 60_000)).toEqual({
      valid: true,
    });
  });

  it("menolak pembayaran melebihi sisa tagihan", () => {
    const result = validateMandatoryPartialPayment(70_000, 60_000);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("melebihi");
  });

  it("menolak nominal nol", () => {
    const result = validateMandatoryPartialPayment(0, 60_000);
    expect(result.valid).toBe(false);
  });
});

describe("validateVoluntaryDeposit", () => {
  it("menerima setoran valid", () => {
    expect(validateVoluntaryDeposit(200_000)).toEqual({ valid: true });
  });

  it("menolak setoran di bawah minimum", () => {
    const result = validateVoluntaryDeposit(5_000);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("minimal");
  });

  it("menolak setoran di atas maksimum", () => {
    const result = validateVoluntaryDeposit(SAVINGS_CONSTANTS.MAX_DEPOSIT + 1);
    expect(result.valid).toBe(false);
  });
});

describe("validateVoluntaryWithdrawal", () => {
  it("menerima pencairan valid dengan alasan", () => {
    const result = validateVoluntaryWithdrawal(200_000, "Biaya pendidikan anak", 1_200_000);
    expect(result.amount).toEqual({ valid: true });
    expect(result.reason).toEqual({ valid: true });
  });

  it("menolak pencairan melebihi saldo", () => {
    const result = validateVoluntaryWithdrawal(2_000_000, "Biaya", 1_200_000);
    expect(result.amount.valid).toBe(false);
    if (!result.amount.valid) expect(result.amount.error).toContain("melebihi");
  });

  it("menolak alasan pencairan kosong", () => {
    const result = validateVoluntaryWithdrawal(200_000, "", 1_200_000);
    expect(result.reason.valid).toBe(false);
    if (!result.reason.valid) expect(result.reason.error).toContain("wajib diisi");
  });

  it("menolak alasan hanya spasi", () => {
    const result = validateVoluntaryWithdrawal(200_000, "   ", 1_200_000);
    expect(result.reason.valid).toBe(false);
  });

  it("menolak alasan terlalu pendek", () => {
    const result = validateVoluntaryWithdrawal(200_000, "ab", 1_200_000);
    expect(result.reason.valid).toBe(false);
    if (!result.reason.valid) expect(result.reason.error).toContain("minimal 5 karakter");
  });
});
