import { describe, expect, it, beforeEach } from "vitest";
import { ajukanPinjaman } from "@/features/pinjaman/services/pinjaman";
import { clearPinjamanStore } from "@/features/pinjaman/services/pinjaman";
import type { PinjamanInput } from "@/features/pinjaman";

describe("Pinjaman service", () => {
  beforeEach(() => {
    clearPinjamanStore();
  });

  const validInput: PinjamanInput = {
    jumlah: 5_000_000,
    tenor: 6,
    tujuan: "Modal usaha ternak",
    nik: "3201123456789012",
    namaLengkap: "Asep Sudrajat",
  };

  it("mengajukan pinjaman sukses", async () => {
    const result = await ajukanPinjaman(validInput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.record.jumlah).toBe(5_000_000);
      expect(result.record.tenor).toBe(6);
      expect(result.record.tujuan).toBe("Modal usaha ternak");
      expect(result.record.nik).toBe("3201123456789012");
      expect(result.record.status).toBe("diajukan");
      expect(result.record.id).toBeTruthy();
    }
  });

  it("menolak jumlah 0", async () => {
    const result = await ajukanPinjaman({ ...validInput, jumlah: 0 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("lebih dari 0");
    }
  });

  it("menolak jumlah negatif", async () => {
    const result = await ajukanPinjaman({ ...validInput, jumlah: -1000 });

    expect(result.ok).toBe(false);
  });

  it("menolak jumlah melebihi 20 juta", async () => {
    const result = await ajukanPinjaman({ ...validInput, jumlah: 25_000_000 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("maksimal");
    }
  });

  it("menolak tenor 0", async () => {
    const result = await ajukanPinjaman({ ...validInput, tenor: 0 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("minimal");
    }
  });

  it("menolak tenor 13", async () => {
    const result = await ajukanPinjaman({ ...validInput, tenor: 13 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("maksimal");
    }
  });

  it("menolak tenor pecahan", async () => {
    const result = await ajukanPinjaman({ ...validInput, tenor: 5.5 });

    expect(result.ok).toBe(false);
  });

  it("menolak tujuan kosong", async () => {
    const result = await ajukanPinjaman({ ...validInput, tujuan: "" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("wajib diisi");
    }
  });

  it("menolak tujuan terlalu panjang", async () => {
    const result = await ajukanPinjaman({
      ...validInput,
      tujuan: "x".repeat(501),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("maksimal 500");
    }
  });

  it("menyimpan data dengan benar", async () => {
    const result = await ajukanPinjaman(validInput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.record.createdAt).toBeTruthy();
      expect(result.record.updatedAt).toBe(result.record.createdAt);
    }
  });
});
