# Registration Feature Contract

## Outcome Pengguna
Pengguna dapat mendaftar akun e-Kiosk menggunakan NIK. Jika NIK terdaftar di Dukcapil (mock), data diri otomatis terisi. Jika tidak, pengguna mengisi manual.

## Input & Output Module

### Public Export (`features/registration/index.ts`)
- `RegistrationForm` — React component untuk halaman register
- `registerUser` — Server action untuk submit registrasi
- `lookupNIK` — Server action untuk lookup Dukcapil berdasarkan NIK
- `registrationSchema`, `nikSchema` — Zod schemas

### Input
- `RegistrationInput`: `{ nik, namaLengkap, password, dukcapilMatched }`

### Output
- `RegistrationResult`: `{ ok: true, userId } | { ok: false, error }`
- `DukcapilRecord`: `{ nik, namaLengkap, tempatLahir, tanggalLahir, jenisKelamin, alamat, agama, statusPerkawinan, pekerjaan }`

## Business Rules
1. NIK wajib 16 digit angka
2. NIK harus unik (tidak boleh duplikat)
3. Nama minimal 2 karakter, maksimal 100
4. Password minimal 8 karakter, maksimal 128
5. Konfirmasi password harus cocok
6. Jika NIK ditemukan di Dukcapil, nama diambil dari data Dukcapil (read-only)
7. Password di-hash dengan scrypt (Node.js crypto) sebelum disimpan

## Database Requirement (Menunggu Migration)

### Model `User`

```prisma
model User {
  id              String   @id @default(uuid())
  nik             String   @unique
  namaLengkap     String
  passwordHash    String
  koperasiRef     String?           // FK ke referensi_koperasi_wilayah
  dukcapilMatched Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Field details
- `nik`: NIK 16 digit, unique constraint
- `passwordHash`: hash scrypt dalam format `salt:hash`
- `koperasiRef`: opsional, menghubungkan ke koperasi mesin e-Kiosk
- `dukcapilMatched`: indikator apakah data diisi dari Dukcapil

## Error Scenarios
- NIK sudah terdaftar → "NIK sudah terdaftar"
- NIK bukan 16 digit → "NIK harus 16 digit"
- NIK mengandung non-angka → "NIK hanya boleh berisi angka"
- Nama < 2 karakter → "Nama lengkap minimal 2 karakter"
- Password < 8 karakter → "Password minimal 8 karakter"
- Konfirmasi tidak cocok → "Konfirmasi password tidak cocok"

## Test Scenarios
| Name | Input | Expected |
|---|---|---|
| Registrasi sukses + Dukcapil match | NIK: 3201123456789012, auto-fill nama, password valid | Redirect ke /login |
| Registrasi sukses + manual | NIK: 1111111111111111 (tidak ada di mock), isi manual | Redirect ke /login |
| NIK sudah terdaftar | NIK yang sudah pernah register | Error "NIK sudah terdaftar" |
| Password < 8 karakter | Password "123" | Validation error |
| Konfirmasi tidak cocok | Password "12345678", confirm "87654321" | Validation error |
| NIK bukan 16 digit | NIK "12345" | Validation error |
| NIK mengandung huruf | NIK "1234abcd5678efgh" | Validation error |
| Akses tanpa auth | Buka /register | Harus bisa diakses (belum ada guard) |

## Hardware Integration Status
- **Fingerprint**: Gimmick — tombol "Gunakan sidik jari" mengisi demo NIK
- **Dukcapil**: Mock adapter — 2 data demo, lookup by NIK

## Mock/Real Status
| Adapter | Mock | Real |
|---|---|---|
| DukcapilAdapter | MockDukcapilAdapter | Belum diimplementasikan |
| UserRepository | MemoryUserStore | Belum (menunggu User model di Prisma) |
