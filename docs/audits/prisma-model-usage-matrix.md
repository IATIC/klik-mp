# Prisma Model Usage Matrix — KLIK-MP

> **Audit date:** 2026-07-11
> **Total models evaluated:** 27/27
> **Schema source:** Panitia-provided reference schema (read-only, not owned by KLIK-MP team)

---

## 1. Schema Context

The `prisma/schema.prisma` contains 27 models provided by the panitia (hackathon organizers). These models represent the broader koperasi domain and are **shared across multiple teams**. Key characteristics:

- **All fields are nullable** (`String?`, `DateTime?`, `Decimal?`) — making the schema permissive but semantically loose
- **No `updatedAt` auto-management** — timestamps are nullable `DateTime?` without `@updatedAt` or `@default(now())`
- **IDs use panitia-specific naming** (`sample_id`, `row_id`, `__row_id`) 
- **Datasource has no `url`** — connection string is provided via `prisma.config.ts` from `DATABASE_URL`
- **Generator uses `prisma-client`** — this is valid for Prisma 7 (confirmed via package.json showing `@prisma/client@^7.8.0`)
- **No team prefix** on table names — all panitia models use bare names
- **All tables scoped to `koperasi_ref`** via `referensi_koperasi_wilayah` FK

**Critical:** These models are **read-only references**. KLIK-MP must NOT write to these tables without explicit permission. Application-specific data must use prefixed team tables.

---

## 2. Full Model Matrix (27 models)

| # | Model | Fungsi Asli | Modul KLIK-MP | Field yang Dapat Dipakai | Kekurangan | Klasifikasi | Akses | Rekomendasi |
|---|---|---|---|---|---|---|---|---|
| 1 | `akun_bank_koperasi` | Bank accounts koperasi | None | None | Tidak terkait intake/simpanan/klinik | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan. Simpanan koperasi tidak terkait rekening bank untuk MVP |
| 2 | `anggota_koperasi` | Member master data | Identity & Membership | `anggota_ref` (ID), `nama`, `nik`, `kode_wilayah`, `status_keanggotaan`, `tanggal_terdaftar`, `status_akun`, `file_ktp`, `pekerjaan` | Tidak ada relasi ke user login, tidak ada credential, tidak ada biometric reference, tidak ada phone/email sebagai field terstruktur, `tanggal_lahir` tidak ada | **PARTIAL_REUSE** | Read-only reference; application needs own user model | Gunakan sebagai reference anggota. Buat model `User` sendiri untuk auth. Simpan biometric reference di tabel prefixed sendiri |
| 3 | `aset_koperasi` | Koperasi assets/inventory | None | None | Tidak terkait komoditas intake | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 4 | `barang_keluar_produk` | Product outward (sales) | None (potensial E-Rat) | Struktur barang keluar dengan `jumlah_keluar`, `harga`, `total_nilai` | Ini adalah transaksi **penjualan ke pelanggan** (outbound), bukan pembelian dari anggota | **OUT_OF_SCOPE_MVP** untuk offtaker; **AMBIGUOUS** untuk E-Rat | Read-only | Jangan gunakan untuk transaksi offtaker. E-Rat (belanja) mungkin relevan tapi di luar MVP |
| 5 | `barang_masuk_produk` | Product inward (receiving) | Intake Transaction (partial) | `barang_masuk_ref`, `produk_sample_id`, `koperasi_ref`, `jumlah_masuk`, `jumlah_tersedia`, `harga_beli`, `total_biaya`, `status`, `tanggal_masuk` | Tidak memiliki: penjual/anggota, intake session ID, gross/tare/net terpisah, foto, hasil CV, grade, harga referensi, penawaran, negosiasi, persetujuan kasir, receipt/QR, status lifecycle komoditas | **PARTIAL_REUSE** | Read-only for final stock record; intake process needs own tables | Model ini hanya cukup untuk **hasil akhir** stok masuk. Seluruh proses intake (timbang→CV→negosiasi→setuju) harus ditangani tabel prefixed sendiri |
| 6 | `dokumen_koperasi` | Koperasi documents | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 7 | `gerai_koperasi` | Koperasi outlets/branches | Kiosk/Clinic location reference | `gerai_ref`, `koperasi_ref`, `jenis_gerai_ref`, `status_gerai`, `foto_gerai`, `koordinat_dibulatkan` | Tidak memiliki field untuk kiosk mode, kasir assignment, atau lokasi KlinikDesa spesifik | **REFERENCE_READ_ONLY** | Read-only | Jadikan referensi lokasi kiosk/klinik. Data operasional (antrean, sesi) simpan di tabel prefixed |
| 8 | `inventaris_produk` | Product inventory snapshot | Inventory (post-intake) | `inventaris_ref`, `produk_sample_id`, `koperasi_ref`, `stok` | Ini adalah **snapshot stok**, bukan movement log. Tidak memiliki riwayat transaksi, tidak bisa diaudit | **PARTIAL_REUSE** | Read-only reference | Stok sebaiknya dihitung dari movement (barang_masuk - barang_keluar) atau gunakan snapshot periodik. Untuk MVP, hitung dari barang_masuk_produk |
| 9 | `karyawan_koperasi` | Koperasi employees | Operator/petugas profile | `karyawan_ref`, `koperasi_ref`, `nama`, `jabatan`, `nik`, `email`, `status_karyawan` | Tidak memiliki relasi ke user login, tidak ada role permission | **PARTIAL_REUSE** | Read-only reference | Jadikan referensi profil petugas. Buat model `User` dan `UserRole` sendiri untuk auth/otorisasi |
| 10 | `kbli_koperasi` | KBLI business classification | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 11 | `modal_koperasi` | Koperasi capital/funding | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 12 | `pengajuan_domain` | Domain registration requests | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 13 | `pengajuan_kemitraan` | Partnership applications | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 14 | `pengajuan_pembiayaan` | Financing applications | None (potensial Pinjaman) | Struktur pengajuan dengan nominal, tenor | Pinjaman belum termasuk MVP | **OUT_OF_SCOPE_MVP** | Read-only | Tidak untuk MVP. Pinjaman mungkin nanti |
| 15 | `pengajuan_rekening_bank` | Bank account applications | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 16 | `pengurus_koperasi` | Koperasi management board | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 17 | `produk_koperasi` | Koperasi product master | Commodity master (partial) | `produk_sample_id`, `koperasi_ref`, `nama_produk`, `unit` | Ini adalah master **produk koperasi** (untuk barang yang dijual), bukan master komoditas pertanian. Tidak memiliki grade, kualitas, jenis komoditas | **PARTIAL_REUSE** | Read-only reference | Bandingkan dengan `referensi_komoditas_desa`. Untuk komoditas offtaker, `referensi_komoditas_desa` lebih tepat sebagai master |
| 18 | `profil_koperasi` | Koperasi profile | Tenant identity | `koperasi_ref`, `nama_koperasi`, `alamat_lengkap`, `tentang_koperasi` | Tidak memiliki konfigurasi kiosk, device, atau jam operasional | **REFERENCE_READ_ONLY** | Read-only | Jadikan sumber informasi koperasi yang ditampilkan ke anggota |
| 19 | `rat_koperasi` | Annual member meeting | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 20 | `referensi_dokumen_koperasi` | Document type reference | None | None | Tidak terkait | **OUT_OF_SCOPE_MVP** | Read-only | Jangan digunakan |
| 21 | `referensi_gerai_koperasi` | Outlet type reference | None (type reference) | `jenis_gerai_ref`, `nama_jenis_gerai` | Hanya tipe referensi | **REFERENCE_READ_ONLY** | Read-only | Jadikan referensi jenis gerai jika diperlukan |
| 22 | `referensi_komoditas_desa` | Village commodity reference | Commodity master | `komoditas_ref`, `kode_wilayah`, `nama_komoditas` | Tidak memiliki grade, harga referensi, unit standar, atau kategori kualitas | **REFERENCE_READ_ONLY** | Read-only | **Sumber master komoditas yang paling tepat** untuk offtaker. Tapi perlu ditambah grade, harga referensi, dan kualitas di tabel prefixed |
| 23 | `referensi_koperasi_wilayah` | Koperasi-region mapping | Tenant scope | `koperasi_ref`, `kode_wilayah` | Ini adalah **junction table** yang menghubungkan koperasi dengan wilayah. Seluruh model lain FK ke sini | **CORE_REUSE** | Read-only | **Wajib digunakan sebagai tenant scope.** Semua data koperasi terikat ke `koperasi_ref`. KLIK-MP harus membaca konfigurasi koperasi dari sini |
| 24 | `referensi_profil_desa` | Village profile data | None | Informasi demografis desa | Data statistik, tidak operasional | **REFERENCE_READ_ONLY** | Read-only | Bisa digunakan untuk informasi tambahan, tidak kritis untuk MVP |
| 25 | `referensi_wilayah` | Region master | Location reference | `kode_wilayah`, `provinsi`, `kab_kota`, `kecamatan`, `desa_kelurahan` | Data wilayah lengkap | **REFERENCE_READ_ONLY** | Read-only | **Wajib digunakan sebagai referensi wilayah** untuk alamat anggota dan lokasi |
| 26 | `simpanan_anggota` | Member savings records | Savings | `simpanan_ref`, `koperasi_ref`, `anggota_ref`, `periode_pembayaran`, `jumlah_simpanan`, `status`, `dibayar_pada` | Model tunggal ini harus menampung semua jenis simpanan (Pokok, Wajib, Sukarela) tanpa pembeda tipe yang jelas. Tidak memiliki: rekening/akun terpisah, tagihan, transaksi debit/kredit, invoice, pengajuan pencairan, approval history, idempotency key | **PARTIAL_REUSE** | Read-only reference | Model **tidak cukup** untuk kebutuhan simpanan KLIK-MP. Simpanan Pokok, Wajib, dan Sukarela memiliki behaviour berbeda. Perlu tabel prefixed: `savings_accounts`, `savings_obligations`, `savings_transactions`, `payment_invoices`, `withdrawal_requests` |
| 27 | `transaksi_penjualan` | Sales transaction | None (E-Rat potential) | `transaksi_sample_id`, `koperasi_ref`, `nama_pelanggan`, `total_pembayaran`, `status_transaksi`, `metode_pembayaran` | Ini adalah transaksi **penjualan koperasi ke pelanggan** (outbound B2C), bukan pembelian komoditas dari anggota (inbound B2B). Memiliki `nama_pelanggan` (bukan anggota) dan `barang_keluar_produk` | **OUT_OF_SCOPE_MVP** untuk offtaker; **AMBIGUOUS** untuk E-Rat | Read-only | **JANGAN GUNAKAN** untuk transaksi offtaker. Arahnya penjualan ke pelanggan, bukan pembelian dari anggota. E-Rat (belanja) mungkin relevan di fase mendatang |

---

## 3. Models Used Directly (CORE_REUSE)

| # | Model | Usage | Notes |
|---|---|---|---|
| 1 | `referensi_koperasi_wilayah` | Tenant scope — menentukan koperasi aktif dan wilayahnya | Critical for all scoped queries |

**Only 1 model falls into CORE_REUSE.** This reflects that the panitia schema serves as an organizational reference, not an application schema.

---

## 4. Models Used Partially (PARTIAL_REUSE)

| # | Model | Usage | Limitation |
|---|---|---|---|
| 1 | `anggota_koperasi` | Member identity reference | No auth/credential fields |
| 2 | `barang_masuk_produk` | Final stock receipt record | Missing entire intake process lifecycle |
| 3 | `inventaris_produk` | Stock snapshot | Better calculated from movements |
| 4 | `karyawan_koperasi` | Operator profile reference | No auth/role fields |
| 5 | `produk_koperasi` | Product master (limited) | Better to use `referensi_komoditas_desa` for commodities |
| 6 | `simpanan_anggota` | Savings record reference | Cannot support full savings domain alone |

---

## 5. Models Reference-Only (REFERENCE_READ_ONLY)

| # | Model | Usage |
|---|---|---|
| 1 | `gerai_koperasi` | Kiosk/clinic location reference |
| 2 | `profil_koperasi` | Koperasi info display |
| 3 | `referensi_gerai_koperasi` | Outlet type reference |
| 4 | `referensi_komoditas_desa` | Commodity master reference |
| 5 | `referensi_profil_desa` | Village demographic info |
| 6 | `referensi_wilayah` | Region/location master |

---

## 6. Models Out of Scope for MVP (OUT_OF_SCOPE_MVP)

| # | Model | Reason |
|---|---|---|
| 1 | `akun_bank_koperasi` | No bank account management in MVP |
| 2 | `aset_koperasi` | No asset management |
| 3 | `barang_keluar_produk` | Sales inventory out — outbound transaction |
| 4 | `dokumen_koperasi` | No document management |
| 5 | `kbli_koperasi` | Business classification — not relevant |
| 6 | `modal_koperasi` | Capital management — not in scope |
| 7 | `pengajuan_domain` | Domain registration requests |
| 8 | `pengajuan_kemitraan` | Partnership applications |
| 9 | `pengajuan_pembiayaan` | Financing/loans — Pinjaman not in MVP |
| 10 | `pengajuan_rekening_bank` | Bank account applications |
| 11 | `pengurus_koperasi` | Management board data |
| 12 | `rat_koperasi` | Annual meeting management |
| 13 | `referensi_dokumen_koperasi` | Document type reference |
| 14 | `transaksi_penjualan` | Sales (outbound) — not for offtaker purchases |

**14 models out of 27 are out of scope for MVP.** This is expected — the panitia schema covers the full koperasi domain, while KLIK-MP focuses on intake, savings, and clinic.

---

## 7. Missing Domain Entities

Based on the gap analysis, KLIK-MP needs the following new tables (all with team prefix):

### Auth & Identity
| Entity | Purpose | MVP | PII |
|---|---|---|---|
| `users` | Login credentials, role, koperasi_ref | ✅ YES | Yes (password hash) |
| `user_roles` | Role assignment (member, officer, admin) | ✅ YES | No |
| `sessions` | Server-managed sessions | ✅ YES | No |
| `biometric_credentials` | Opaque biometric references | ✅ YES | Yes (biometric) |
| `identity_verifications` | Verification audit trail | ✅ YES | Yes (NIK) |

### Intake / Commodity
| Entity | Purpose | MVP | Notes |
|---|---|---|---|
| `commodity_intakes` | Intake session with full lifecycle | ✅ YES | Core of offtaker flow |
| `intake_captures` | Weighing record (gross, tare, net, photo) | ✅ YES | |
| `intake_assessments` | CV results with grades | ✅ YES | |
| `intake_offers` | Pricing and negotiation | ✅ YES | |
| `intake_negotiations` | Negotiation history | ✅ YES | |
| `intake_approvals` | Buyer/seller approval | ✅ YES | |
| `commodity_receipts` | Final receipt | ✅ YES | |
| `inventory_movements` | Stock movement ledger | P1 | |
| `market_prices` | Reference price snapshots | P1 | |

### Savings
| Entity | Purpose | MVP | Notes |
|---|---|---|---|
| `savings_accounts` | Per-member savings accounts | ✅ YES | One per member per type |
| `savings_obligations` | Mandatory payment schedule | ✅ YES | |
| `savings_transactions` | Debit/credit ledger | ✅ YES | |
| `payment_invoices` | Payment invoices | ✅ YES | |
| `withdrawal_requests` | Withdrawal applications | ✅ YES | Requires approval |

### Clinic
| Entity | Purpose | MVP | Notes |
|---|---|---|---|
| `clinic_applications` | Patient applications | ✅ YES | |
| `clinic_queue_tickets` | Queue management | ✅ YES | |
| `clinic_consents` | Patient consent records | ✅ YES | Sensitive |

### Shared
| Entity | Purpose | MVP | Notes |
|---|---|---|---|
| `print_jobs` | Print queue | P1 | |
| `idempotency_keys` | Idempotency tracking | ✅ YES | Critical for atomic ops |
| `audit_logs` | Immutable audit trail | ✅ YES | |
| `file_attachments` | File references | P1 | |

---

## 8. Schema Quality Findings

| Finding | Model(s) | Impact | Severity |
|---|---|---|---|
| All fields nullable | All 27 models | Cannot enforce `NOT NULL` constraints | P2 (panitia schema, not ours) |
| `__row_id` naming | `barang_keluar_produk`, `kbli_koperasi` | Non-standard ID naming | P2 (cosmetic) |
| `sample_id` naming | Multiple models | Suggests sample/test data, not production | P1 (clarity) |
| Status as `String?` | Multiple models | No enum constraint, risk of invalid values | P1 |
| No `@updatedAt` | All models | No auto-managed update timestamps | P2 |
| No explicit indexes | All models | Query performance on large datasets | P1 |
| `Float` for financial values | `pengajuan_pembiayaan.nominal_permohonan` | Floating-point rounding errors | **P0** |
| `Decimal` without precision | Multiple models | No precision constraint | P1 |
| Date as `String?` | `pengurus_koperasi.tanggal_lahir` | Cannot do date operations | P1 |
| `BigInt` for financial | `referensi_komoditas_desa.nilai_potensi_desa` | Awkward for application code | P2 |
| No composite unique constraints | All models | Risk of duplicate records | P1 |
| Single table for all savings types | `simpanan_anggota` | Cannot distinguish savings behavior | **P0** for savings module |

---

## 9. Shared Database / Table Prefix Strategy

### Current State
- Database is shared across multiple teams
- Panitia tables use bare names (no prefix)
- No prefix defined for KLIK-MP team tables
- `.env.example` has placeholder `DATABASE_URL`

### Constraints
- **Must NOT** rename, drop, or restructure panitia tables
- **Must NOT** write to panitia tables without explicit permission
- **Must** prefix all application tables with team identifier

### Recommended Strategy: **Option B/C Hybrid — Panitia tables read-only + prefixed application tables**

**Rationale:**
1. Panitia tables stay completely untouched (complies with hackathon rules)
2. All KLIK-MP data goes to `<TEAM_PREFIX>_*` tables
3. Panitia data is accessed via Prisma models but never written
4. Prisma `@@map("<TEAM_PREFIX>_table_name")` for all application models

**Table prefix: NOT YET DETERMINED — BLOCKER**

The `.env.example` and project docs do not specify the team prefix. This must be obtained from the panitia/integration owner before any table can be created.

**Tenant scoping strategy:**
- `koperasi_ref` must be derived from server configuration or session, NOT from client
- All application tables must include `koperasi_ref` or equivalent tenant identifier
- Cross-tenant access must be prevented at the repository/query level

**PostgreSQL schema alternative:** Using a separate PG schema (e.g., `klik_mp.` prefix for all tables) would provide cleaner isolation but may not align with shared database conventions.

---

## 10. Recommended Database MVP

### Phase 1 — Foundation
1. Define table prefix (blocked — needs panitia)
2. `users` (auth + basic profile)
3. `user_roles` (role assignment)
4. `sessions` (Auth.js or custom)
5. `idempotency_keys` (critical operations)
6. `audit_logs` (immutable trail)

### Phase 2 — Intake Vertical Slice
7. `commodity_intakes` (session with lifecycle)
8. `intake_captures` (weighing + photo)
9. `intake_assessments` (CV results)
10. `intake_offers` (pricing)
11. `intake_negotiations` (history)
12. `intake_approvals` (buyer/seller)
13. `commodity_receipts` (final receipt)

### Phase 3 — Savings
14. `savings_accounts`
15. `savings_obligations`
16. `savings_transactions`
17. `payment_invoices`
18. `withdrawal_requests`

### Phase 4 — Clinic
19. `clinic_applications`
20. `clinic_queue_tickets`
21. `clinic_consents`

### Phase 5 — Post-MVP
22. `inventory_movements`
23. `market_prices`
24. `print_jobs`
25. `file_attachments`
