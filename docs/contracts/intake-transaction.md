# Contract: Intake Transaction

## Outcome pengguna

Hasil identitas, keanggotaan, penimbangan/foto, assessment, dan negosiasi yang telah divalidasi dapat disusun menjadi satu transaksi penerimaan. Pembeli dan penjual memberikan persetujuan akhir, simpanan pokok diselesaikan sesuai pilihan, bukti dan penerimaan stok dibuat atomik, dan sesi yang belum selesai dapat dibatalkan dengan aman.

## Public module boundary

Consumer wajib menggunakan `@/features/intake-transaction`. Modul tidak deep import ke Workstream A/B; kontrak `VerifiedSeller`, `CommodityCapture`, dan `CommodityAssessment` sengaja structurally compatible dengan public output mereka dan divalidasi ulang oleh Zod pada boundary intake.

Public surface utama:

- `IntakeSession`, output modul A/B, settlement, receipt, stock receipt, dan `IntakeCompletionPort`
- fungsi transisi dari `createIntakeSession` hingga `completeIntake`/`cancelIntake`
- schema Zod seluruh output eksternal, approval, settlement, dan completion context
- `IntakeWorkflow`, dengan composition slots `identityStep`, `captureStep`, `assessmentStep`, dan `pricingStep`; workflow memilih slot aktif berdasarkan status tanpa mengambil alih logic modul asal.

## Input dan output

Input:

- `VerifiedSeller` dari Identity & Membership.
- `CommodityCapture` dari Commodity Capture.
- `CommodityAssessment` yang telah disetujui petugas.
- `AgreedPrice` dari Pricing & Negotiation.
- Persetujuan akhir pembeli dan penjual.
- Konfigurasi jumlah simpanan yang dipercaya dari server dan konfirmasi pembayaran langsung.

Intake tidak menghitung ulang fingerprint, face match, net weight, classification, quality score, faktor kualitas, harga unit, atau total harga. Modul hanya memvalidasi bentuk/batas output dan mengorkestrasi snapshot tersebut.

Output completion memuat session `COMPLETED`, transaction record, receipt, dan stock receipt. Persistence dilakukan melalui satu pemanggilan `IntakeCompletionPort.completeAtomically`.

## Business rules

1. Fingerprint dan wajah penjual wajib sudah terverifikasi.
2. Penjual `PENDING_PAYMENT` wajib memilih `DIRECT_PAYMENT` atau `DEDUCT_FROM_MARGIN` sebelum `MEMBERSHIP_READY`.
3. Assessment wajib `verifiedByOfficer=true`; koreksi wajib mempunyai alasan.
4. Harga final yang diterima untuk `AGREED` wajib mempunyai `negotiationStatus=ACCEPTED`.
5. Pembeli dan penjual masing-masing hanya dapat memberi satu persetujuan akhir.
6. Completion ditolak hingga kedua persetujuan tersedia dan seluruh output upstream lengkap.
7. Anggota aktif tidak dikenai settlement simpanan pada transaksi.
8. Direct payment harus dikonfirmasi sudah diterima; tidak mengurangi payout transaksi.
9. Deduct from margin mengurangi payout sebesar kewajiban simpanan dan ditolak jika total transaksi tidak cukup.
10. Transaction, receipt, stock receipt, dan audit completion wajib ditulis atomik oleh adapter persistence.
11. Kegagalan persistence tidak mengubah object sesi masukan yang immutable.
12. `CANCELLED` idempoten. `COMPLETED` tidak dapat dibatalkan; reversal harus menjadi flow terpisah pada fase mendatang.

## Status sesi bersama

```text
DRAFT
→ IDENTITY_VERIFIED
→ MEMBERSHIP_READY
→ COMMODITY_CAPTURED
→ COMMODITY_ASSESSED
→ OFFER_CREATED
→ NEGOTIATING (opsional)
→ AGREED
→ COMPLETED
```

Cabang:

- `OFFER_CREATED | NEGOTIATING → REJECTED`
- Semua status sebelum `COMPLETED`, termasuk cabang `REJECTED`, dapat menuju `CANCELLED` sesuai transition map.
- `REJECTED` tidak dapat kembali ke happy path; ia hanya dapat ditutup sebagai `CANCELLED`. `COMPLETED` dan `CANCELLED` terminal.

`recordAgreement` mendukung jalur langsung `OFFER_CREATED → AGREED` saat penjual menerima penawaran awal dan jalur `NEGOTIATING → AGREED` setelah counteroffer disepakati.

## External dependencies

- Public output Workstream A: identity/membership.
- Public output Workstream B: capture/assessment.
- Public output Pricing & Negotiation: agreed price.
- Persistence implementation `IntakeCompletionPort` dari integration owner.

Tidak ada akses Prisma, perangkat, HTTP API, SIMKOPDES, atau CoopTrade dari modul ini.

## Database requirements (untuk integration owner)

Belum ada schema atau migration. Kebutuhan logis:

- Intake session: ID unik, status, seller/capture/assessment/negotiation references atau immutable snapshots, created/updated/cancelled/completed timestamps, optimistic version.
- Final approvals: unique `(session, party)`, approvedBy, approvedAt; actor direferensikan ke model petugas/pihak yang dipilih integration owner.
- Transaction receipt: transaction ID, session unique FK, seller, capture, commodity/grade snapshot, net weight, final unit/total price, completedAt.
- Savings settlement: membership state snapshot, method, required/deducted/payout amount, direct payment confirmation/reference.
- Receipt: receipt number unik, transaction FK unik, payout, deduction, issuedAt.
- Stock receipt/supply event: ID unik, transaction FK unik, commodity/grade, quantity, receivedAt.
- Audit trail append-only: audit/idempotency key unik, from/to status, action, actor, occurredAt, note.
- Completion harus memakai database transaction tunggal untuk transaction, settlement, receipt, stock event, audit, dan status sesi.
- Conditional update wajib memastikan status masih `AGREED` dan mencegah repeated completion.
- Money sebaiknya Decimal/database numeric, bukan floating point.
- Nama fisik tabel dan prefix ditentukan integration owner.

## Error scenarios

- Output upstream invalid/tidak lengkap atau urutan status dilompati.
- Identity belum lolos dua verifikasi.
- Assessment belum di-approve atau koreksi tanpa alasan.
- Harga belum accepted/rejected diperlakukan sebagai agreement.
- Approval pihak diduplikasi.
- Direct payment belum diterima.
- Margin kurang untuk potongan simpanan.
- Persistence atomik gagal/concurrent completion.
- Cancel setelah completion.

## Test scenarios

- Happy path seluruh output tersusun tanpa perhitungan ulang.
- Output assessment belum diverifikasi ditolak.
- Approval dua pihak dan completion atomik.
- Settlement direct payment dan deduct from margin.
- Margin tidak cukup ditolak.
- Persistence failure mempertahankan session input `AGREED`.
- Cancel idempoten dan cancel setelah complete ditolak.
- UI tahapan, approval, terminal state, dan cancel callback.
