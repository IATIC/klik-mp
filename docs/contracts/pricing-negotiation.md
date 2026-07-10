# Contract: Pricing & Negotiation

## Outcome pengguna

Pembeli dan penjual memperoleh harga komoditas yang transparan: penawaran awal berasal dari harga referensi pasar dikalikan faktor kualitas, penjual dapat menerima, menolak, atau mengajukan harga lain, dan harga final hanya sah setelah kedua pihak menyetujui nilai yang sama.

## Public module boundary

Seluruh consumer wajib mengimpor dari `@/features/pricing-negotiation`. Deep import ke `services`, `schemas`, `adapters`, atau `types` tidak didukung.

Public surface utama:

- `MarketPriceAdapter`, `HttpMarketPriceAdapter`, `MockMarketPriceAdapter`
- `createLocalMarketPriceAdapter()` untuk `POST /api/devices/market-price`
- `createNegotiation`, fungsi keputusan pembeli/penjual, dan `toAgreedPrice`
- schema Zod query harga, respons harga, pembuatan negosiasi, keputusan, dan counteroffer
- `PricingNegotiationPanel`

## Input dan output

Input penawaran wajib memuat `referencePrice`, `qualityFactor`, `quantity`, ID negosiasi, dan waktu kejadian. Harga pasar datang melalui `MarketPriceAdapter` dan memuat komoditas, grade, pasar, unit, mata uang IDR, waktu observasi, dan sumber.

Output lintas modul adalah:

```ts
type AgreedPrice = {
  referencePrice: number;
  qualityFactor: number;
  initialOffer: number;
  finalUnitPrice: number;
  finalTotalPrice: number;
  negotiationStatus: "ACCEPTED" | "REJECTED" | "NEGOTIATING";
};
```

`NegotiationSession` mempertahankan persetujuan pihak, harga berjalan, dan riwayat immutable untuk UI serta persistence boundary.

## Business rules

1. Harga penawaran unit = `referencePrice × qualityFactor`, dibulatkan ke dua angka desimal.
2. Total = harga unit yang sedang dibahas × quantity.
3. Faktor kualitas yang diterima boundary adalah 0,5 sampai 1,5.
4. Penawaran awal dibuat petugas tetapi belum merupakan persetujuan pembeli.
5. Penjual hanya dapat menerima atau mengajukan counteroffer setelah pembeli menyetujui penawaran awal.
6. Counteroffer penjual membatalkan persetujuan pembeli atas harga sebelumnya; pembeli harus menerima harga baru.
7. `ACCEPTED` hanya tercapai ketika pembeli dan penjual menyetujui harga berjalan yang sama.
8. Setiap aksi harga dicatat dengan ID unik, actor, waktu, harga unit/total, dan catatan opsional.
9. Status terminal `ACCEPTED`, `REJECTED`, dan `CANCELLED` tidak dapat dimutasi.
10. Pembatalan negosiasi yang sudah `CANCELLED` idempoten.

## Status

- Masuk dari sesi `COMMODITY_ASSESSED` untuk membuat `OFFER_CREATED`.
- `OFFER_CREATED → NEGOTIATING` saat counteroffer diajukan.
- `OFFER_CREATED | NEGOTIATING → ACCEPTED` setelah persetujuan yang diwajibkan lengkap.
- `OFFER_CREATED | NEGOTIATING → REJECTED` saat salah satu pihak menolak.
- Status nonterminal dapat menjadi `CANCELLED`.
- Modul intake menerjemahkan `ACCEPTED` menjadi status sesi bersama `AGREED`.

## External dependency dan adapter

`MarketPriceAdapter` adalah satu-satunya kontrak sumber harga. `createLocalMarketPriceAdapter()` memakai bridge nyata `POST /api/devices/market-price`. `HttpMarketPriceAdapter` dapat dikonfigurasi untuk endpoint GET/POST, header, timeout, fetch implementation, dan response mapper.

Kegagalan HTTP, timeout, atau payload invalid diteruskan sebagai error; adapter nyata tidak pernah fallback diam-diam ke mock. `MockMarketPriceAdapter` hanya untuk development dan automated test dan harus dipilih eksplisit.

Tidak ada integrasi SIMKOPDES atau CoopTrade.

## Database requirements (untuk integration owner)

Belum ada schema atau migration dari workstream ini. Kebutuhan logis:

- Entitas negosiasi: ID unik, session/intake foreign key, reference price, quality factor, quantity, initial/current/final unit dan total price, buyer/seller approval flags, status, created/updated timestamp.
- Riwayat negosiasi append-only: ID unik/idempotency key, negotiation FK, actor type/actor ID, action, unit/total price, note, occurred timestamp.
- Snapshot referensi harga: commodity, grade, market, unit, currency, observed time, source, raw-source reference bila diperlukan.
- Check constraint untuk angka positif dan quality factor dalam rentang kontrak.
- Unique constraint pada history ID/idempotency key.
- Optimistic version atau conditional update pada negosiasi untuk mencegah dua keputusan bersamaan.
- Persetujuan final dan penulisan history harus berada dalam satu transaksi database.
- Nama fisik tabel dan prefix mengikuti keputusan integration owner.

## Error scenarios

- Query atau payload harga pasar invalid.
- Sumber harga timeout/non-2xx/tidak mempunyai source atau timestamp.
- Faktor kualitas atau quantity di luar batas.
- Penjual memutuskan sebelum pembeli menyetujui penawaran awal.
- Pembeli menerima saat tidak ada counteroffer aktif.
- History ID digunakan dua kali.
- Mutasi setelah status terminal.

## Test scenarios

- Kalkulasi reference × quality factor dan total quantity.
- Persetujuan awal pembeli lalu penerimaan penjual.
- Counteroffer penjual lalu penerimaan pembeli dengan history lengkap.
- Reject mengunci negosiasi.
- Proxy lokal dipanggil dengan POST dan request body benar.
- Kegagalan HTTP tidak fallback ke mock.
- UI menampilkan harga, total, status, riwayat, dan callback persetujuan.

