# KLIK-MP — Kios Layanan Integrasi Koperasi Merah Putih

> **Demo:** [https://klik-mp.vercel.app](https://klik-mp.vercel.app)

MVP kios digital untuk Koperasi Merah Putih — anggota menjual komoditas hasil bumi dengan proses yang terintegrasi: identitas, timbangan, assessment AI, negosiasi harga, hingga receipt.

---

## 🧭 Walkthrough untuk Juri

### 1. Landing Page (`/`)
Pilih **Mode Kios** untuk memulai. Anda datang sebagai anggota koperasi yang ingin menjual komoditas.

### 2. Login / Registrasi
- **Anggota baru**: daftar via NIK + password. Data penduduk diverifikasi secara simulasi.
- **Anggota existing**: login via NIK dan password.
- Tersedia juga opsi **Fingerprint** dan **Face Recognition** (simulasi mock — tidak butuh hardware).

### 3. Beranda Kios (`/kiosk`)
Lihat status keanggotaan dan simpanan. Pilih **"Jual Komoditas"** untuk memulai transaksi intake.

### 4. Pemilihan Komoditas (`/intake/commodity`)
Pilih jenis komoditas yang akan dijual.

### 5. Penimbangan & Foto (`/intake/capture`)
- Masukkan **berat kotor (gross)** dan **berat wadah (tare)** — sistem otomatis menghitung berat bersih (net).
- Ambil foto komoditas (menggunakan kamera browser atau simulasi).

### 6. Assessment Komoditas (`/intake/assessment`)
Sistem AI (simulasi) menilai grade komoditas berdasarkan foto. Anda bisa **setujui** atau **koreksi** hasil assessment.

### 7. Penawaran & Negosiasi Harga (`/intake/offer`)
- Sistem memberikan **penawaran awal** berdasarkan grade dan harga pasar.
- Anda bisa **Terima** langsung, atau **Ajukan harga sendiri** — ketik bebas angka yang diinginkan + alasan.
- Petugas koperasi (di sisi operator) akan mereview dan menyetujui.

### 8. Transaksi Berhasil (`/intake/success`)
Receipt lengkap dengan detail transaksi dan **QR Code** untuk verifikasi.

---

### 🖥️ Mode Operator
Selain mode kios (anggota), terdapat **Mode Petugas** untuk operator koperasi:

- **Dashboard** (`/operator`) — ringkasan transaksi.
- **Daftar Intake** (`/operator/intakes`) — semua transaksi yang masuk.
- **Review & Audit** (`/operator/intakes/[sessionId]`) — lihat detail, riwayat negosiasi, dan setujui/tolak.
- **Referensi Harga** (`/operator/reference-prices`) — kelola harga pasar acuan.

---

## 🚀 Menjalankan di Lokal

```bash
# 1. Clone repo
git clone https://github.com/IATIC/klik-mp.git
cd klik-mp

# 2. Install dependencies
npm install

# 3. Salin environment variables
cp .env.example .env.local

# 4. Jalankan dev server
npm run dev
```

Buka **http://localhost:3000**. Semua data menggunakan mock — tidak perlu database atau hardware.

### Environment Variables (wajib di `.env.local`)

```env
DEVICE_MODE=mock
DEMO_MEMBERSHIP_STATUS=PENDING_PAYMENT
NEXT_PUBLIC_KOPERASI_INFO="Koperasi Desa Kebonturi, Kecamatan Arjawinangun, Kabupaten Cirebon, Jawa Barat"
```

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript strict |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui + Lucide icons |
| Form | React Hook Form + Zod |
| Database (future) | Prisma ORM + PostgreSQL |
| Testing | Vitest + Playwright |
| Deploy | Vercel (free tier) |

---

## 📦 Fitur per Modul

| Modul | Deskripsi | Status |
|---|---|---|
| **identity-membership** | Fingerprint, face recognition, matching identitas | ✅ Mock adapters |
| **commodity-capture** | Timbangan (gross/tare/net), kamera, validasi foto | ✅ Mock + Web Serial |
| **commodity-assessment** | Klasifikasi AI, grade, confidence, koreksi | ✅ Mock + HTTP bridge |
| **pricing-negotiation** | Harga pasar, counteroffer, approval, riwayat | ✅ Mock + HTTP bridge |
| **intake-transaction** | Status engine, final approval, receipt | ✅ Full |
| **operator-assistance** | Dashboard, review, audit trail, referensi harga | ✅ Full |
| **savings** | Simpanan anggota (wajib, pokok, sukarela) | ✅ Full |
| **clinic** | Klinik desa — antrian, registrasi pasien | ✅ Full |
| **pinjaman** | Pengajuan pembiayaan | ✅ UI + service |
| **rapat-anggota-tahunan** | RAT — kehadiran, laporan | ✅ UI |
| **erat** | Dashboard ERAT (E-Rencana Aktivitas Tahunan) | ✅ UI placeholder |

---

## 🧪 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Vitest
npm run test:e2e     # Playwright E2E
npm run verify       # lint + typecheck + test + build
```

---

## 🔌 Arsitektur

```
app/                    # Next.js App Router — halaman + API routes
├── (kiosk)/            # Route group untuk kios anggota
├── (operator)/         # Route group untuk operator
├── api/devices/        # Device bridge proxy
├── page.tsx            # Landing page
features/               # Modul bisnis terisolasi
├── <feature>/
│   ├── components/     # UI components
│   ├── services/       # Business logic
│   ├── actions/        # Server Actions
│   ├── adapters/       # Hardware adapters (mock + real)
│   ├── schemas/        # Zod validations
│   └── index.ts        # Public API
components/             # Shared UI components
lib/                    # Utilities, auth, device abstractions
docs/                   # Dokumentasi arsitektur & kontrak
```

Detail lebih lanjut: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 📋 Status MVP

- ✅ **Semua alur end-to-end** dapat didemokan tanpa hardware fisik.
- ✅ **Mock adapter** untuk fingerprint, face recognition, timbangan, kamera, AI vision, dan market price.
- ✅ **Device bridge protocol** siap untuk integrasi hardware nyata.
- ✅ **Server Actions** untuk validasi server-side (Zod + authorization).
- ⏳ **Database persistence** — Prisma schema siap, migration hanya saat scope final disetujui.
- ⏳ **Hardware integration** — adapter siap, butuh pengujian fisik.

---

Dibangun untuk **Hackathon Koperasi Merah Putih** — tim IATIC.
