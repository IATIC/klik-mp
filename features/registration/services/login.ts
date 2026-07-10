import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "../schemas/registration";
import type { LoginResult } from "../types/registration";
import { MemoryUserStore } from "../adapters/memory-user-store";

const userStore = new MemoryUserStore();

export async function loginUser(formData: FormData): Promise<LoginResult> {
  const raw = {
    nik: formData.get("nik"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message };
  }

  const user = await userStore.findWithPasswordByNIK(parsed.data.nik);
  if (!user) {
    return { ok: false, error: "NIK belum terdaftar" };
  }

  const valid = verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Password salah" };
  }

  return { ok: true, userId: user.id, namaLengkap: user.namaLengkap };
}

export async function fingerprintLogin(
  nik: string,
): Promise<LoginResult> {
  const user = await userStore.findWithPasswordByNIK(nik);
  if (!user) {
    const created = await userStore.create({
      nik,
      namaLengkap: "Asep Sudrajat",
      password: "password123",
      dukcapilMatched: true,
    });
    return { ok: true, userId: created.id, namaLengkap: "Asep Sudrajat" };
  }

  return { ok: true, userId: user.id, namaLengkap: user.namaLengkap };
}

export { MemoryUserStore };
