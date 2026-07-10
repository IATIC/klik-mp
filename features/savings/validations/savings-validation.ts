import { SAVINGS_CONSTANTS } from "../constants/savings-constants";

export type ValidationResult = { valid: true } | { valid: false; error: string };

// ── Formatters ──

export function formatRupiah(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Generic amount validation ──

export function validateAmount(
  amount: number,
  options?: {
    min?: number;
    max?: number;
    fieldName?: string;
  },
): ValidationResult {
  const fieldName = options?.fieldName ?? "Nominal";

  if (!Number.isFinite(amount) || isNaN(amount)) {
    return { valid: false, error: `${fieldName} harus berupa angka yang valid.` };
  }
  if (amount <= 0) {
    return { valid: false, error: `${fieldName} harus lebih dari nol.` };
  }
  if (!Number.isInteger(amount)) {
    return { valid: false, error: `${fieldName} harus dalam angka rupiah penuh.` };
  }
  if (options?.min !== undefined && amount < options.min) {
    return { valid: false, error: `${fieldName} minimal ${formatRupiah(options.min)}.` };
  }
  if (options?.max !== undefined && amount > options.max) {
    return { valid: false, error: `${fieldName} tidak boleh melebihi ${formatRupiah(options.max)}.` };
  }
  return { valid: true };
}

// ── Principal validations ──

export function validatePrincipalPayment(): ValidationResult {
  // Principal is always full amount, no input needed
  return { valid: true };
}

// ── Mandatory validations ──

export function validateMandatoryFullPayment(
  remainingAmount: number,
): ValidationResult {
  if (!Number.isFinite(remainingAmount) || remainingAmount <= 0) {
    return { valid: false, error: "Sisa tagihan tidak valid." };
  }
  return { valid: true };
}

export function validateMandatoryPartialPayment(
  amount: number,
  remainingAmount: number,
): ValidationResult {
  const base = validateAmount(amount, {
    min: 1,
    max: remainingAmount,
    fieldName: "Nominal pembayaran",
  });
  if (!base.valid) return base;

  if (amount > remainingAmount) {
    return {
      valid: false,
      error: `Nominal pembayaran tidak boleh melebihi sisa tagihan ${formatRupiah(remainingAmount)}.`,
    };
  }
  return { valid: true };
}

// ── Voluntary deposit validations ──

export function validateVoluntaryDeposit(
  amount: number,
): ValidationResult {
  return validateAmount(amount, {
    min: SAVINGS_CONSTANTS.MIN_DEPOSIT,
    max: SAVINGS_CONSTANTS.MAX_DEPOSIT,
    fieldName: "Nominal setoran",
  });
}

// ── Voluntary withdrawal validations ──

export function validateVoluntaryWithdrawal(
  amount: number,
  reason: string,
  availableBalance: number,
): { amount: ValidationResult; reason: ValidationResult } {
  const amountResult = validateAmount(amount, {
    min: SAVINGS_CONSTANTS.MIN_WITHDRAWAL,
    max: availableBalance,
    fieldName: "Nominal pencairan",
  });

  let reasonResult: ValidationResult;
  if (!reason || reason.trim().length === 0) {
    reasonResult = { valid: false, error: "Alasan pencairan wajib diisi." };
  } else if (reason.trim().length < 5) {
    reasonResult = { valid: false, error: "Alasan pencairan minimal 5 karakter." };
  } else {
    reasonResult = { valid: true };
  }

  return { amount: amountResult, reason: reasonResult };
}
