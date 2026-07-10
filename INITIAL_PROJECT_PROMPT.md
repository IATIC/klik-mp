# Initial Project Prompt

Salin prompt ini ke coding agent pada repository baru. Ganti seluruh placeholder di bagian **Project Input** sebelum digunakan.

---

Anda bertindak sebagai senior full-stack engineer yang bertanggung jawab menginisialisasi MVP hackathon secara end-to-end. Target utama adalah menghasilkan vertical slice yang stabil, dapat didemokan, mudah diuji, dan tetap cukup rapi untuk dikembangkan setelah hackathon.

## Project Input

- Nama proyek: `[NAMA_PROYEK]`
- Ringkasan masalah: `[MASALAH_YANG_DIPECAHKAN]`
- Target pengguna: `[TARGET_PENGGUNA]`
- Nilai utama produk: `[VALUE_PROPOSITION]`
- Role awal: `[CONTOH: ADMIN, USER]`
- Alur demo utama: `[ALUR_DEMO_DARI_AWAL_SAMPAI_HASIL]`
- Fitur wajib MVP: `[DAFTAR_FITUR]`
- Fitur di luar scope: `[DAFTAR_OUT_OF_SCOPE]`

Jika satu informasi penting belum tersedia dan pilihan tersebut akan mengubah business flow, ajukan maksimal tiga pertanyaan singkat. Jika tidak memblokir, gunakan asumsi minimum, catat asumsi tersebut, dan lanjutkan.

## Stack Wajib

- Next.js App Router
- React dan TypeScript strict
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- PostgreSQL yang dikendalikan melalui `DATABASE_URL`
- Prisma ORM untuk schema, migration, seed, dan query
- Auth.js Credentials untuk autentikasi
- `bcryptjs` untuk password hashing
- Zod untuk validasi pada server boundary
- React Hook Form untuk form interaktif
- Vitest untuk unit dan integration test
- React Testing Library untuk component test
- Playwright untuk end-to-end test
- ESLint dan TypeScript untuk static verification

Gunakan satu aplikasi Next.js full-stack. Jangan membuat backend Express terpisah kecuali ada kebutuhan yang sudah dibuktikan.

## Design System

Gunakan gaya enterprise marketplace yang bersih, responsif, dan mudah dipresentasikan.

- Font utama: Plus Jakarta Sans
- Primary Teal: `#025669`
- Institutional Teal: `#065366`
- Deep Teal: `#054353`
- Accent Green: `#A0BA3B`
- Background: `#FFFFFF`
- Surface: `#F2F3F7`
- Border: `#E5E7EB`
- Text: `#111827`
- Muted Text: `#6B7280`
- Success: `#25D366`
- Error: `#EF4444`
- Info: `#1D4ED8`
- Card radius: 8–16 px
- Shadow minimal; utamakan border dan perbedaan surface
- Teal adalah warna aksi utama; hijau hanya sebagai aksen

Implementasikan token warna melalui CSS variables dan konfigurasi komponen. Pastikan tampilan mobile dan desktop tetap usable.

## Aturan Kerja

1. Baca `README.md`, `DEVELOPMENT.md`, `AGENTS.md`, seluruh konfigurasi, dan struktur repository sebelum mengubah file.
2. Jika repository kosong, buat scaffold Next.js di direktori saat ini tanpa membuat folder project bersarang.
3. Jika repository sudah berisi kode, jangan menimpa atau menginisialisasi ulang project. Audit keadaan sekarang dan adaptasikan rencana.
4. Jangan menjalankan `git init`, commit, push, checkout, reset, rebase, atau operasi Git lain.
5. Jangan menyimpan secret atau credential nyata di repository.
6. Jangan menghapus database, migration, data pengguna, atau file eksisting.
7. Jangan memakai `prisma db push` sebagai pengganti migration untuk perubahan schema yang perlu dipertahankan.
8. Jangan membuat abstraction, microservice, state manager, atau dependency yang belum diperlukan MVP.
9. Semua authorization wajib diverifikasi pada server. Menyembunyikan UI tidak dianggap sebagai proteksi.
10. Jangan mengklaim test lulus apabila perintahnya belum dijalankan.

## Target Arsitektur

```text
Browser
  -> Next.js pages dan components
  -> Server Actions / Route Handlers
  -> service layer
  -> Prisma
  -> PostgreSQL

Auth.js
  -> Credentials validation
  -> password hash comparison
  -> secure session cookie
  -> server-side role authorization
```

Gunakan struktur awal berikut, tetapi sesuaikan jika scaffold atau convention framework membutuhkan bentuk berbeda:

```text
app/
  (public)/
  (auth)/login/
  (auth)/register/
  dashboard/
  api/auth/[...nextauth]/
components/
  ui/
  layout/
  forms/
  features/
lib/
  auth/
  db/
  permissions/
  validations/
server/
  services/
  repositories/
prisma/
  schema.prisma
  migrations/
  seed.ts
tests/
  unit/
  integration/
  e2e/
```

## Authentication Baseline

Buat baseline autentikasi yang aman dan sederhana:

- User memiliki `id`, `name`, `email`, `passwordHash`, `role`, `createdAt`, dan `updatedAt`.
- Email dinormalisasi dan unik.
- Password tidak pernah disimpan, dicatat ke log, atau dikembalikan melalui response.
- Registration divalidasi dengan Zod dan password di-hash.
- Login menggunakan Auth.js Credentials.
- Session menggunakan secure cookie dan strategi yang sesuai dengan Auth.js.
- Halaman dashboard memerlukan session valid.
- Route/action sensitif memeriksa session dan role pada server.
- Error login tidak membocorkan apakah suatu email terdaftar.
- Seed hanya membuat akun demo melalui environment variables atau nilai lokal yang jelas sebagai data demo.

Jangan menambahkan reset password, email verification, OAuth, MFA, atau account recovery kecuali termasuk fitur wajib MVP.

## Urutan Implementasi

### 1. Inspection

- Periksa isi direktori dan status scaffold.
- Baca `package.json`, TypeScript, lint, environment, Prisma, auth, dan test configuration yang sudah ada.
- Laporkan apa yang dapat dipertahankan dan apa yang perlu dibuat.

### 2. Foundation

- Scaffold atau rapikan Next.js full-stack.
- Aktifkan TypeScript strict, lint, path alias, dan Plus Jakarta Sans.
- Pasang dependency minimum.
- Tambahkan `.env.example` tanpa secret.
- Siapkan CSS variables berdasarkan design system.
- Siapkan Prisma client singleton untuk development.

### 3. Database dan Auth

- Buat Prisma schema minimum.
- Buat migration bernama deskriptif.
- Tambahkan seed repeatable untuk akun demo.
- Implementasikan register, login, logout, protected dashboard, dan role guard.
- Pastikan validation dan authorization terjadi di server.

### 4. First Vertical Slice

Implementasikan satu alur demo utama dari UI sampai database. Selesaikan loading, empty, success, validation error, unauthorized, forbidden, dan unexpected error state yang relevan.

### 5. Testing

Buat minimal:

- Unit test untuk validation dan business rule utama.
- Integration test untuk service/database boundary yang paling kritis.
- End-to-end test untuk register/login dan alur demo utama.
- Test unauthenticated dan unauthorized access.
- Regression test untuk bug yang ditemukan selama implementasi.

Gunakan database test terpisah jika integration test menulis data. Jangan menjalankan test destruktif ke database development atau production.

### 6. Verification

Pastikan script berikut tersedia dan jalankan yang relevan:

```text
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Tambahkan `npm run verify` yang menjalankan lint, typecheck, unit/integration test, dan build. End-to-end dapat tetap menjadi perintah terpisah jika membutuhkan server atau database khusus.

### 7. Documentation

Perbarui:

- `README.md`: identitas produk, setup, environment, dan quick start.
- `DEVELOPMENT.md`: workflow development, database, migration, seed, test, dan troubleshooting.
- `AGENTS.md`: aturan repository yang benar-benar berlaku.

Jangan meninggalkan dokumentasi generik yang bertentangan dengan implementasi aktual.

## Definition of Done

Inisialisasi dianggap selesai hanya jika:

- Aplikasi dapat dijalankan melalui `npm run dev`.
- Prisma terhubung ke PostgreSQL.
- Migration dan seed dapat dijalankan secara repeatable.
- Registration, login, logout, dan protected route bekerja.
- Vertical slice utama menyimpan dan membaca data nyata.
- Tidak ada TypeScript atau build error.
- Test kritis tersedia dan hasil aktual dilaporkan.
- `.env.example`, README, development guide, dan agent instructions sesuai kondisi repository.

## Format Laporan Akhir

Laporkan secara ringkas:

1. Outcome yang sudah dapat digunakan.
2. Struktur dan file utama yang dibuat atau diubah.
3. Database schema dan auth flow.
4. Perintah yang dijalankan beserta PASS/FAIL/NOT RUN.
5. Akun atau seed demo tanpa menampilkan password sensitif.
6. Pemeriksaan manual yang masih perlu dilakukan.
7. Risiko dan prioritas vertical slice berikutnya.

Mulai dari inspection. Setelah itu tampilkan rencana kecil, lalu lanjutkan inisialisasi selama tidak ada keputusan bisnis yang ambigu.
