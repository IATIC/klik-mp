import type { PinjamanFormValues } from "../schemas/pinjaman";

export type PinjamanInput = PinjamanFormValues & {
  nik: string;
  namaLengkap: string;
};

export type PinjamanRecord = {
  id: string;
  nik: string;
  namaLengkap: string;
  jumlah: number;
  tenor: number;
  tujuan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PinjamanResult =
  | { ok: true; record: PinjamanRecord }
  | { ok: false; error: string };
