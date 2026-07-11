# Pinjaman Feature Contract

## Outcome Pengguna
Pengguna dapat mengajukan pinjaman koperasi dengan mengisi jumlah pinjaman (Rp1–20.000.000), memilih tenor (1–12 bulan), dan menuliskan tujuan pinjaman.

## Input & Output Module

### Public Export (`features/pinjaman/index.ts`)
- `PinjamanForm` — React component untuk halaman pengajuan pinjaman
- `ajukanPinjaman` — Server action untuk submit pengajuan
- `pinjamanSchema` — Zod schema validasi
- Types `PinjamanFormValues`, `PinjamanInput`, `PinjamanRecord`, `PinjamanResult`

### Input
- `PinjamanInput`: `{ jumlah: number, tenor: number, tujuan: string, nik: string, namaLengkap: string }`

### Output
- `PinjamanResult`: `{ ok: true, record: PinjamanRecord } | { ok: false, error: string }`
- `PinjamanRecord`: `{ id, nik, namaLengkap, jumlah, tenor, tujuan, status, createdAt, updatedAt }`

## Business Rules
1. Jumlah pinjaman 1 – 20.000.000 rupiah (termasuk)
2. Tenor 1 – 12 bulan, bilangan bulat
3. Tujuan pinjaman 1 – 500 karakter, wajib diisi
4. Validasi dilakukan di client (Zod) dan server (Zod)
5. Status awal pengajuan: `"diajukan"`
6. Hanya user terautentikasi yang dapat mengajukan
7. ID pengajuan digenerate server-side (UUID)

## Database Requirement

### Existing Model (`pengajuan_pembiayaan`)

```prisma
model pengajuan_pembiayaan {
  pengajuan_pembiayaan_ref       String   @id
  koperasi_ref                   String
  nik                            String?
  penanggung_jawab               String?
  nomor_penanggung_jawab         String?
  status_permohonan              String?
  formulir_permohonan_pembiayaan String?
  nominal_permohonan             Float?   @db.Real
  tenor                          Int?
  tujuan_permohonan              String?
  dibuat_pada                    DateTime?
  diperbarui_pada                DateTime?
  referensi_koperasi_wilayah     referensi_koperasi_wilayah @relation(fields: [koperasi_ref], ...)
}
```

### Field Mapping

| PinjamanInput | Model Field |
|---|---|
| `jumlah` | `nominal_permohonan` |
| `tenor` | `tenor` |
| `tujuan` | `tujuan_permohonan` |
| `nik` | `nik` |
| `namaLengkap` | `penanggung_jawab` |
| `status: "diajukan"` | `status_permohonan` |
| `id` (UUID) | `pengajuan_pembiayaan_ref` |

Store awal: in-memory (`MemoryPinjamanStore`). Nanti migrasi ke Prisma setelah
integration owner menggabungkan schema.

## Error Scenarios
- Jumlah ≤ 0 → "Jumlah pinjaman harus lebih dari 0"
- Jumlah > 20.000.000 → "Jumlah pinjaman maksimal Rp20.000.000"
- Tenor < 1 → "Tenor minimal 1 bulan"
- Tenor > 12 → "Tenor maksimal 12 bulan"
- Tenor bukan bilangan bulat → "Tenor harus berupa bilangan bulat"
- Tujuan kosong → "Tujuan pinjaman wajib diisi"
- Tujuan > 500 karakter → "Tujuan pinjaman maksimal 500 karakter"

## Test Scenarios
| Name | Input | Expected |
|---|---|---|
| Pengajuan sukses | jumlah: 5.000.000, tenor: 6, tujuan: "Modal usaha" | `ok: true`, status "diajukan" |
| Jumlah 0 | jumlah: 0 | Error "Jumlah pinjaman harus lebih dari 0" |
| Jumlah > 20jt | jumlah: 25.000.000 | Error "maksimal Rp20.000.000" |
| Tenor 0 | tenor: 0 | Error "Tenor minimal 1 bulan" |
| Tenor 13 | tenor: 13 | Error "Tenor maksimal 12 bulan" |
| Tujuan kosong | tujuan: "" | Error "Tujuan pinjaman wajib diisi" |
| Tujuan > 500 karakter | tujuan: "x".repeat(501) | Error "maksimal 500 karakter" |

## Hardware Integration Status
- Tidak ada hardware dependency

## Mock/Real Status
| Adapter | Mock | Real |
|---|---|---|
| PinjamanStore | MemoryPinjamanStore (in-memory Map) | Belum (menunggu Prisma) |
