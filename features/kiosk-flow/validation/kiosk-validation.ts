import type { IdentityRecord } from "../types/kiosk-flow";

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type ManualIdentityFields = Omit<IdentityRecord, "memberNumber">;

export function validateManualIdentity(
  value: ManualIdentityFields,
): FieldErrors<keyof ManualIdentityFields> {
  const errors: FieldErrors<keyof ManualIdentityFields> = {};

  if (!/^\d{16}$/.test(value.nik)) errors.nik = "NIK harus terdiri dari 16 digit angka.";
  if (value.fullName.trim().length < 2) errors.fullName = "Nama lengkap wajib diisi sesuai KTP.";
  if (value.birthPlace.trim().length < 2) errors.birthPlace = "Tempat lahir wajib diisi.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.birthDate)) errors.birthDate = "Tanggal lahir wajib diisi.";
  if (value.address.trim().length < 10) errors.address = "Alamat lengkap minimal 10 karakter.";

  return errors;
}

export function validatePassword(
  password: string,
  confirmation: string,
  identity?: IdentityRecord | null,
): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Kata sandi minimal 8 karakter.");
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.push("Gunakan kombinasi huruf dan angka.");
  }
  if (password !== confirmation) errors.push("Ulangi kata sandi dengan nilai yang sama.");
  if (identity && password.includes(identity.nik)) errors.push("Jangan gunakan NIK sebagai kata sandi.");
  return errors;
}

export function validateLogin(account: string, password: string) {
  const errors: FieldErrors<"account" | "password"> = {};
  if (!account.trim()) errors.account = "NIK atau nomor anggota wajib diisi.";
  if (!password) errors.password = "Kata sandi wajib diisi.";
  return errors;
}

export function validateCounteroffer(
  counteroffer: number,
  reason: string,
  currentOffer: number,
): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(counteroffer) || counteroffer <= 0) errors.push("Masukkan harga negosiasi yang valid.");
  if (reason.trim().length < 5) errors.push("Alasan negosiasi wajib diisi minimal 5 karakter.");
  return errors;
}

export function calculateNetWeight(gross: number, tare: number) {
  if (!Number.isFinite(gross) || !Number.isFinite(tare) || gross <= 0 || tare < 0 || tare >= gross) {
    throw new Error("Data berat tidak valid.");
  }
  return Math.round((gross - tare) * 10) / 10;
}

