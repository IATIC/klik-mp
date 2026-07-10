# KLIK-MP

Kios Layanan Intake Komoditas untuk Koperasi Desa/Kelurahan Merah Putih. MVP menyatukan verifikasi anggota, penimbangan dan foto, assessment komoditas berbantuan AI, negosiasi harga, persetujuan akhir, serta pendampingan operator.

## Alur MVP

```text
DRAFT
-> IDENTITY_VERIFIED
-> MEMBERSHIP_READY
-> COMMODITY_CAPTURED
-> COMMODITY_ASSESSED
-> OFFER_CREATED
-> NEGOTIATING
-> AGREED
-> COMPLETED
```

Penawaran dapat berakhir `REJECTED`. Semua sesi yang belum selesai dapat dibatalkan secara aman menjadi `CANCELLED` selama transisinya masih diizinkan.

Keputusan produk yang diterapkan:

- Penjual wajib menjadi anggota.
- Nonanggota menyelesaikan simpanan pokok melalui pembayaran langsung atau pemotongan margin transaksi.
- Kios dapat digunakan mandiri atau didampingi petugas.
- Harga final membutuhkan persetujuan pembeli dan penjual.
- Penjual dapat mengajukan counteroffer.
- Koreksi hasil sistem wajib menyimpan alasan dan audit petugas.
- SIMKOPDES dan CoopTrade tidak termasuk MVP.

## Modul

- `identity-membership`: fingerprint, face recognition, identity matching, dan kesiapan keanggotaan.
- `commodity-capture`: timbangan, gross/tare/net, kamera, dan validasi kualitas foto.
- `commodity-assessment`: klasifikasi komoditas, grade, confidence, review, dan koreksi AI.
- `pricing-negotiation`: referensi pasar, faktor kualitas, approval, counteroffer, dan riwayat harga.
- `intake-transaction`: orkestrasi status, final approval, settlement simpanan, receipt, dan stock receipt.
- `operator-assistance`: review AI, audit trail, daftar transaksi, dan referensi harga.

Setiap modul hanya diekspor melalui `features/<feature>/index.ts`. Detail arsitektur tersedia di [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Routes

- `/`: landing dan pemilihan mode.
- `/kiosk`: beranda kios, pembuatan, dan kelanjutan sesi.
- `/kiosk/intake/new`: membuat sesi DRAFT melalui server lalu redirect.
- `/kiosk/intake/[sessionId]`: seluruh tahapan wizard intake.
- `/kiosk/intake/[sessionId]/receipt`: receipt sesi completed.
- `/operator`: dashboard petugas.
- `/operator/intakes`: daftar intake.
- `/operator/intakes/[sessionId]`: detail dan audit sesi.
- `/operator/reference-prices`: pengelolaan referensi harga.
- `/login`: entry autentikasi yang masih berupa placeholder.
- `/api/devices/[capability]`: proxy server untuk device bridge nyata.

Route lama `/intake/[sessionId]`, `/operator/transactions`, dan `/operator/review/[sessionId]` dipertahankan sebagai redirect sementara.

## Setup

Requirements: Node.js 20.19+ atau 22.12+, npm 10+, dan PostgreSQL connection string ketika data persistence mulai diaktifkan.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

### Device mode

`DEVICE_MODE="mock"` hanya untuk development/test. Mode ini memberikan adapter deterministik agar alur lintas modul dapat didemokan dan diuji tanpa perangkat.

`DEVICE_MODE="real"` memakai adapter nyata:

- Fingerprint dan face recognition melalui server-side device bridge.
- Timbangan melalui HTTP device bridge; adapter Web Serial generik juga tersedia.
- Kamera melalui `getUserMedia` browser.
- Commodity vision dan market price melalui device bridge.

Production selalu memilih mode real. Kegagalan perangkat nyata tidak pernah dialihkan diam-diam ke mock. Kontrak bridge dan acceptance gate ada di [docs/DEVICE_BRIDGE.md](docs/DEVICE_BRIDGE.md).

## Verification

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run verify
```

`npm run verify` menjalankan lint, typecheck, Vitest, dan production build. E2E dijalankan terpisah karena membutuhkan development server dan Chromium.

## Prisma dan persistence boundary

Schema Prisma yang berisi 27 model domain tetap dipertahankan tanpa perubahan. Fase ini tidak membuat migration, seed, atau operasi tulis database.

```powershell
npx prisma validate
npx prisma generate
```

Kebutuhan data setiap modul dicatat di `docs/contracts/`. Sesi dan receipt saat ini disimpan pada registry server in-memory agar routing dan server-controlled status dapat berjalan tanpa mengubah database. Data tersebut hilang ketika proses server restart dan harus diganti persistence nyata pada fase schema terkoordinasi.

## Status integrasi perangkat

Adapter dan protokol nyata sudah tersedia, tetapi kompatibilitas perangkat final belum dapat disahkan tanpa model hardware, vendor SDK, OS kios, endpoint/model AI, serta pengujian fisik. Mock bukan bukti hardware readiness.

Lihat [DEVELOPMENT.md](DEVELOPMENT.md) untuk aturan parallel workstream, testing, dan langkah integrasi berikutnya.
