import { registrationSchema } from "../schemas/registration";
import type {
  RegistrationInput,
  RegistrationResult,
} from "../types/registration";
import { MockDukcapilAdapter } from "../adapters/mock-dukcapil";
import { MemoryUserStore } from "../adapters/memory-user-store";

const dukcapil = new MockDukcapilAdapter();
const userStore = new MemoryUserStore();

export async function registerUser(
  formData: FormData,
): Promise<RegistrationResult> {
  const raw = {
    nik: formData.get("nik"),
    namaLengkap: formData.get("namaLengkap"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message };
  }

  const existing = await userStore.findByNIK(parsed.data.nik);
  if (existing) {
    return { ok: false, error: "NIK sudah terdaftar" };
  }

  const dukcapilMatched = await dukcapil.lookupByNIK(parsed.data.nik).then(Boolean);

  const input: RegistrationInput = {
    nik: parsed.data.nik,
    namaLengkap: parsed.data.namaLengkap,
    password: parsed.data.password,
    dukcapilMatched,
  };

  const user = await userStore.create(input);

  return { ok: true, userId: user.id };
}

export async function lookupNIK(
  nik: string,
): Promise<{ namaLengkap: string } | null> {
  const record = await dukcapil.lookupByNIK(nik);
  return record ? { namaLengkap: record.namaLengkap } : null;
}

export { MockDukcapilAdapter, MemoryUserStore };
