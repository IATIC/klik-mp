import { z } from "zod";

export const pinjamanSchema = z.object({
  jumlah: z
    .number({ message: "Jumlah pinjaman wajib diisi" })
    .positive("Jumlah pinjaman harus lebih dari 0")
    .max(20_000_000, "Jumlah pinjaman maksimal Rp20.000.000"),
  tenor: z
    .number({ message: "Tenor wajib dipilih" })
    .int("Tenor harus berupa bilangan bulat")
    .min(1, "Tenor minimal 1 bulan")
    .max(12, "Tenor maksimal 12 bulan"),
  tujuan: z
    .string({ message: "Tujuan pinjaman wajib diisi" })
    .min(1, "Tujuan pinjaman wajib diisi")
    .max(500, "Tujuan pinjaman maksimal 500 karakter"),
});

export type PinjamanFormValues = z.infer<typeof pinjamanSchema>;
