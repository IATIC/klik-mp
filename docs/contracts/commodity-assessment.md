# Kontrak Modul Commodity Assessment

## Outcome

Operator memperoleh klasifikasi jenis komoditas dan estimasi grade beserta confidence. Hasil AI harus diverifikasi petugas; jika dikoreksi, nilai koreksi dan alasan wajib dicatat bersama. Modul tidak menyimpan data atau mengubah status sesi secara langsung.

## Input dan output

Input AI adalah `{ captureId: string, imageUrl: string }` dari capture tervalidasi. Output publik:

```ts
type CommodityAssessment = {
  commodityType: string;
  qualityGrade: string;
  classificationConfidence: number;
  qualityConfidence: number;
  verifiedByOfficer: boolean;
  correctedValue?: string;
  correctionReason?: string;
};
```

Seluruh konsumsi lintas feature harus melalui `features/commodity-assessment/index.ts`.

## Business rule

- Jenis komoditas dan grade tidak boleh kosong.
- Classification confidence dan quality confidence adalah bilangan finite pada rentang 0–1.
- Prediksi awal selalu `verifiedByOfficer: false`.
- Persetujuan petugas mengubah flag verifikasi tanpa mengubah prediksi AI.
- Koreksi menghasilkan `verifiedByOfficer: true`; `correctedValue` dan `correctionReason` wajib hadir bersama, dan alasan minimal 5 karakter.
- Nilai prediksi asli tetap dipertahankan untuk audit; koreksi berada pada field terpisah.

## Status

Status UI internal: `idle`, `analyzing`, `review`, `correcting`, `verified`, dan `error`. Modul menerima sesi `COMMODITY_CAPTURED`; orkestrator boleh menghasilkan `COMMODITY_ASSESSED` hanya setelah output valid dan `verifiedByOfficer` bernilai true. Modul tidak mengubah status bersama.

## Kebutuhan database

Integration owner perlu menyediakan record assessment yang mengacu ke capture/sesi, menyimpan seluruh prediksi asli, dua confidence, versi/model identifier, flag verifikasi, petugas pemverifikasi, nilai dan alasan koreksi, serta audit timestamp. Penyimpanan harus mempertahankan prediksi awal meskipun ada koreksi. Detail schema dan migration sengaja tidak ditentukan di workstream ini.

## Hardware, AI, dan protokol

- `HttpCommodityVisionAdapter` adalah adapter real dan default ke `POST /api/devices/commodity-vision` dengan JSON `{ "captureId": string, "imageUrl": string }`.
- Respons JSON wajib berbentuk `{ "commodityType": string, "qualityGrade": string, "classificationConfidence": number, "qualityConfidence": number }` dengan confidence 0–1.
- Endpoint, header, dan implementasi fetch dapat dikonfigurasi. Respons HTTP non-2xx atau payload invalid dianggap error dan tidak pernah dialihkan diam-diam ke mock.
- Endpoint server bertanggung jawab menjaga credential model, timeout/retry kebijakan, normalisasi respons provider, dan pencatatan versi model.
- `MockCommodityVisionAdapter` hanya untuk development/test.

## Error

Skenario error meliputi capture ID/foto kosong, endpoint tidak tersedia, timeout/network failure, respons non-2xx, payload AI malformed, confidence di luar rentang, prediksi kosong, koreksi tanpa nilai/alasan, serta kegagalan persistence oleh orkestrator. UI mempertahankan hasil review saat koreksi invalid dan menampilkan error yang dapat diperbaiki.

## Test

- Happy path prediksi dengan dua confidence valid.
- Input capture tidak lengkap dan respons AI malformed/out-of-range.
- Persetujuan hasil AI tanpa mutasi prediksi.
- Koreksi tanpa nilai atau alasan ditolak; koreksi lengkap diverifikasi.
- Component states: loading, review, validation error, verified, dan unexpected adapter error.
- Integration lanjutan: endpoint AI nyata, versi model, persistence, ownership/role petugas, idempotensi, status sesi, dan audit trail.

