# Contract: Operator Assistance

## Outcome pengguna

Petugas dapat mendampingi kios, meninjau hasil AI, mengoreksi dengan alasan yang dapat diaudit, menyetujui assessment untuk intake, melihat daftar transaksi, serta mengambil dan menyetujui referensi harga pasar tanpa menaruh business logic pada halaman.

## Public module boundary

Seluruh consumer menggunakan `@/features/operator-assistance`.

Public surface utama:

- `createAiReview`, `correctAiReview`, `approveAiReview`, `resolveAssessment`
- `createReferencePriceDraft`, `approveReferencePrice`, `archiveReferencePrice`
- schema Zod review, koreksi, context operator, referensi harga, dan transaction summary
- `OperatorAssistancePanel`, `OperatorTransactionList`, `ReferencePriceManager`

Komponen bersifat props-driven. Route page hanya merakit data/callback dari authorization-aware server boundary pada fase integrasi.

## Input dan output

AI review menerima assessment dari public contract intake/commodity assessment, review/session ID, actor, audit ID, dan timestamp. Koreksi menerima field yang dikoreksi, nilai baru, alasan, actor, serta timestamp.

`resolveAssessment` hanya menghasilkan `CommodityAssessment` berstatus verified setelah review `APPROVED`. Jika dikoreksi, output menyertakan `correctedValue` dan `correctionReason`.

Reference price management menerima public `MarketPriceAdapter` serta query harga, menghasilkan `ManagedReferencePrice` `DRAFT`, lalu membutuhkan approval operator untuk menjadi `ACTIVE`.

Transaction list menerima summary siap-render; komponen tidak membaca database.

## Business rules

1. Koreksi hanya pada `COMMODITY_TYPE` atau `QUALITY_GRADE`.
2. Nilai koreksi wajib berbeda dari hasil AI awal.
3. Alasan koreksi wajib, 5–500 karakter, dan disimpan pada correction serta audit trail.
4. Review yang sudah approved immutable.
5. Assessment tidak dapat diteruskan ke intake sebelum review approved.
6. Approval tanpa koreksi mempertahankan hasil AI dan hanya menandai verifikasi petugas.
7. Referensi dari adapter selalu `DRAFT` agar petugas dapat memeriksa sumber/waktu/harga.
8. Hanya referensi `DRAFT` dapat menjadi `ACTIVE`; hanya `ACTIVE` dapat diarsipkan.
9. Setiap event review/referensi mempunyai audit ID unik.
10. UI tidak silently fallback saat pengambilan harga gagal; error ditampilkan.

## Status

AI review:

```text
PENDING → CORRECTED → APPROVED
PENDING → APPROVED
```

Reference price:

```text
DRAFT → ACTIVE → ARCHIVED
```

Operator transaction list menggunakan status sesi intake bersama dan tidak mengubahnya.

## External dependencies

- Public assessment contract dari `@/features/intake-transaction`.
- `MarketPriceAdapter` dari `@/features/pricing-negotiation`.
- Proxy nyata `POST /api/devices/market-price` dipilih melalui `createLocalMarketPriceAdapter` oleh integration layer.
- Mock price adapter hanya dipakai secara eksplisit untuk development/test.

Authorization operator, persistence, AI/device call, dan page orchestration bukan tanggung jawab komponen ini. Server boundary mendatang wajib memastikan actor mempunyai hak review/approval.

## Database requirements (untuk integration owner)

Belum ada schema atau migration. Kebutuhan logis:

- AI review: review ID unik, session/assessment reference, original commodity/grade/confidence snapshot, status, approvedBy/At, created/updated timestamps.
- Correction: review FK, corrected field, previous/corrected value, mandatory reason, correctedBy/At; pertahankan sebagai immutable record atau versioned history.
- Reference price: reference ID, commodity, grade, market, unit, currency, amount Decimal, observedAt, source, status, approvedBy/At, archivedAt.
- Operator audit append-only: audit ID/idempotency key unik, entity type/ID, action, actor, reason, occurredAt.
- Hanya satu/aturan prioritas `ACTIVE` price per commodity + grade + market + unit perlu diputuskan integration owner; activation dan archive harga lama harus atomic.
- Approval AI dan audit entry harus atomic. Correction dan audit entry juga harus atomic.
- Index untuk pending reviews, transaction status/update time, serta active reference query.
- Foreign key actor disesuaikan dengan model identity/role final; jangan mempercayai actor dari client.
- Nama fisik tabel dan prefix ditentukan integration owner.

## Error scenarios

- Assessment/query/context invalid.
- Koreksi kosong, terlalu pendek, atau sama dengan nilai awal.
- Koreksi/approval terhadap review terminal.
- Resolve sebelum approval.
- Harga adapter gagal, timeout, atau payload invalid.
- Approval referensi non-DRAFT atau archive non-ACTIVE.
- Audit ID duplikat/concurrent approval.
- Unauthorized operator harus ditolak server boundary (belum diimplementasikan karena auth/role belum tersedia).

## Test scenarios

- Koreksi tanpa alasan ditolak.
- Koreksi valid menyimpan actor/reason/audit lalu approval menghasilkan assessment verified.
- Harga mock menghasilkan DRAFT dan approval menghasilkan ACTIVE.
- Form koreksi UI disabled sampai nilai/alasan valid.
- Empty state daftar transaksi.
- Error harga ditampilkan dan tidak ditutupi mock fallback.

