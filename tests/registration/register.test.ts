import { describe, expect, it, beforeEach } from "vitest";
import { registerUser, lookupNIK } from "@/features/registration/services/register";
import { loginUser, fingerprintLogin } from "@/features/registration/services/login";
import { clearMemoryUsers } from "@/features/registration/adapters/memory-user-store";

describe("Registration service", () => {
  beforeEach(() => {
    clearMemoryUsers();
  });

  function makeFormData(overrides?: Record<string, string>): FormData {
    const fd = new FormData();
    fd.set("nik", overrides?.nik ?? "3201123456789012");
    fd.set("namaLengkap", overrides?.namaLengkap ?? "Asep Sudrajat");
    fd.set("password", overrides?.password ?? "password123");
    fd.set("confirmPassword", overrides?.confirmPassword ?? "password123");
    return fd;
  }

  it("registers user successfully with Dukcapil match", async () => {
    const result = await registerUser(makeFormData());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBeTruthy();
    }
  });

  it("registers user without Dukcapil match", async () => {
    const result = await registerUser(
      makeFormData({ nik: "1111111111111111", namaLengkap: "Budi Santoso" }),
    );

    expect(result.ok).toBe(true);
  });

  it("rejects missing NIK", async () => {
    const result = await registerUser(makeFormData({ nik: "12345" }));

    expect(result.ok).toBe(false);
  });

  it("rejects NIK with non-digits", async () => {
    const result = await registerUser(makeFormData({ nik: "1234abcd5678efgh" }));

    expect(result.ok).toBe(false);
  });

  it("rejects short password", async () => {
    const result = await registerUser(makeFormData({ password: "123", confirmPassword: "123" }));

    expect(result.ok).toBe(false);
  });

  it("rejects mismatched confirm password", async () => {
    const result = await registerUser(
      makeFormData({ password: "password123", confirmPassword: "different" }),
    );

    expect(result.ok).toBe(false);
  });

  it("rejects duplicate NIK", async () => {
    await registerUser(makeFormData());
    const result = await registerUser(makeFormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("sudah terdaftar");
    }
  });

  it("looks up NIK from Dukcapil", async () => {
    const result = await lookupNIK("3201123456789012");

    expect(result).toEqual({ namaLengkap: "Asep Sudrajat" });
  });

  it("returns null for unknown NIK", async () => {
    const result = await lookupNIK("0000000000000000");

    expect(result).toBeNull();
  });
});

describe("Login service", () => {
  beforeEach(() => {
    clearMemoryUsers();
  });

  async function registerDemoUser() {
    const fd = new FormData();
    fd.set("nik", "3201123456789012");
    fd.set("namaLengkap", "Asep Sudrajat");
    fd.set("password", "password123");
    fd.set("confirmPassword", "password123");
    await registerUser(fd);
  }

  function makeLoginFormData(overrides?: Record<string, string>): FormData {
    const fd = new FormData();
    fd.set("nik", overrides?.nik ?? "3201123456789012");
    fd.set("password", overrides?.password ?? "password123");
    return fd;
  }

  it("logs in with correct credentials", async () => {
    await registerDemoUser();

    const result = await loginUser(makeLoginFormData());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.namaLengkap).toBe("Asep Sudrajat");
    }
  });

  it("rejects login with wrong password", async () => {
    await registerDemoUser();

    const result = await loginUser(makeLoginFormData({ password: "wrongpass" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Password salah");
    }
  });

  it("rejects login for unregistered NIK", async () => {
    const result = await loginUser(
      makeLoginFormData({ nik: "0000000000000000" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("NIK belum terdaftar");
    }
  });

  it("rejects login with invalid NIK format", async () => {
    const result = await loginUser(makeLoginFormData({ nik: "12345" }));

    expect(result.ok).toBe(false);
  });

  it("rejects login with empty password", async () => {
    const result = await loginUser(makeLoginFormData({ password: "" }));

    expect(result.ok).toBe(false);
  });

  it("fingerprint login succeeds for registered user", async () => {
    await registerDemoUser();

    const result = await fingerprintLogin("3201123456789012");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.namaLengkap).toBe("Asep Sudrajat");
    }
  });

  it("fingerprint login auto-creates for unregistered NIK", async () => {
    const result = await fingerprintLogin("0000000000000000");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.namaLengkap).toBe("Asep Sudrajat");
    }
  });
});
