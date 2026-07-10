import { randomUUID } from "node:crypto";
import { pinjamanSchema } from "../schemas/pinjaman";
import type { PinjamanInput, PinjamanRecord, PinjamanResult } from "../types/pinjaman";

const store = new Map<string, PinjamanRecord>();

export function clearPinjamanStore(): void {
  store.clear();
}

export async function ajukanPinjaman(input: PinjamanInput): Promise<PinjamanResult> {
  const parsed = pinjamanSchema.safeParse({
    jumlah: input.jumlah,
    tenor: input.tenor,
    tujuan: input.tujuan,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message };
  }

  const now = new Date().toISOString();
  const record: PinjamanRecord = {
    id: randomUUID(),
    nik: input.nik,
    namaLengkap: input.namaLengkap,
    jumlah: parsed.data.jumlah,
    tenor: parsed.data.tenor,
    tujuan: parsed.data.tujuan,
    status: "diajukan",
    createdAt: now,
    updatedAt: now,
  };

  store.set(record.id, record);

  return { ok: true, record };
}
