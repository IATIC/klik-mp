# KLIK-MP Development Guide

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
npx prisma generate
npm run dev
```

Prisma Client generation tidak menulis ke database. Jangan menjalankan migration, `db push`, `db pull`, seed, reset, atau raw database operation sebagai bagian dari feature workstream.

## Feature architecture

```text
features/
  identity-membership/
  commodity-capture/
  commodity-assessment/
  pricing-negotiation/
  intake-transaction/
  operator-assistance/
```

Setiap feature menggunakan struktur sesuai kebutuhan:

```text
components/  UI feature
actions/     Server/request boundary bila dibutuhkan
services/    Business rules murni
adapters/    Hardware, AI, atau external source
schemas/     Zod validation
types/       Kontrak domain
tests/       Test yang benar-benar milik feature
index.ts     Satu-satunya public export
```

Jangan membuat folder kosong. Import lintas feature wajib melalui `@/features/<feature>`, tidak melalui internal file.

Page files tetap tipis. `IntakeWorkflow` mengorkestrasi slot public dari feature lain tanpa menghitung ulang identitas, berat, assessment, atau harga.

## Parallel ownership

Workstream feature hanya mengubah:

```text
features/<assigned-feature>/**
tests/<assigned-feature>/**
docs/contracts/<assigned-feature>.md
```

File berikut dimiliki integration owner:

- `package.json` dan lockfile
- `prisma/schema.prisma` dan `prisma.config.ts`
- `app/layout.tsx`, global CSS, routes, dan orchestration pages
- `components/ui/*`
- `lib/db/*`

Database requirements ditulis dahulu pada contract feature. Schema dan migration harus digabung serta ditinjau secara serial pada fase database tersendiri.

## Device adapters

### Development/test

Set `DEVICE_MODE="mock"`. Mock dipilih secara eksplisit pada composition root dan tidak digunakan di production.

### Real hardware/AI

Set:

```text
DEVICE_MODE="real"
DEVICE_BRIDGE_URL="https://bridge.internal"
DEVICE_BRIDGE_API_KEY="..."
```

Browser berkomunikasi dengan `/api/devices/[capability]`; API key hanya dibaca server. Payload feature harus divalidasi kembali oleh adapter masing-masing.

Real adapters:

- `HttpFingerprintAdapter`
- `HttpFaceRecognitionAdapter`
- `HttpScaleDeviceBridgeAdapter`
- `WebSerialScaleAdapter`
- `BrowserMediaCameraAdapter`
- `HttpCommodityVisionAdapter`
- `HttpMarketPriceAdapter`

Sebelum hardware acceptance, catat vendor/model, SDK, connection/framing, unit dan stable flag timbangan, biometric thresholds, camera constraints, AI model version, timeout, serta retry behavior.

## Testing

Targeted development checks:

```powershell
npm run lint
npm run typecheck
npm run test
```

Full verification:

```powershell
npm run verify
npm run test:e2e
```

Vitest mencakup service rules, adapters, request boundaries, dan UI state. Playwright menjalankan root mode selection serta alur intake mock lintas feature pada desktop dan mobile.

E2E membuat production build terisolasi di `.next-e2e`, mengaktifkan mock hanya melalui override script test, lalu menjalankan `next start` pada port 3107. Deployment production biasa tidak mengenali override mock tersebut.

Integration/database tests yang menulis data belum dibuat karena persistence schema belum disetujui. Ketika ditambahkan, gunakan database test terpisah dan jangan mengarahkannya ke development/production data.

## Business-rule checklist

- Membership status berasal dari server tepercaya, bukan client.
- Fingerprint dan face recognition wajib menunjuk seller yang sama.
- Net weight hanya dihitung service sebagai gross dikurangi tare.
- AI confidence berada pada 0–1; koreksi wajib alasan.
- Harga dan counteroffer tercatat pada immutable history.
- Buyer dan seller wajib memberi final approval.
- Direct savings payment harus benar-benar dikonfirmasi.
- Margin deduction harus atomic bersama completion transaction.
- Cancel tidak boleh mengubah transaksi yang sudah completed.
- Mock tidak boleh menjadi fallback hardware.

## Current known boundaries

- Prisma persistence dan server authorization belum diimplementasikan.
- Demo membership/reference/transaction data adalah fixture development.
- Atomic completion port pada composition UI belum menulis data.
- Real device bridge belum diuji terhadap hardware/vendor final.
- Kebijakan consent, retention, encryption, dan incident response biometrik harus diselesaikan sebelum production.

Contract lengkap tersedia di `docs/contracts/`.
