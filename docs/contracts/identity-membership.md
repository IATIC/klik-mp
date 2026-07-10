# Identity & Membership Contract

## Outcome pengguna

Penjual dapat membuktikan identitasnya melalui sidik jari dan pengenalan wajah, lalu memperoleh status keanggotaan yang siap dipakai modul orkestrasi transaksi. Modul menghentikan proses jika kedua sumber biometrik tidak menunjuk penjual yang sama.

Seluruh pengguna wajib menjadi anggota. Status `ACTIVE` dapat langsung diteruskan. Status `PENDING_PAYMENT` hanya dapat diteruskan setelah memilih `DIRECT_PAYMENT` atau `DEDUCT_FROM_MARGIN` untuk menyelesaikan simpanan pokok.

## Batas modul

Modul bertanggung jawab atas:

- kontrak fingerprint scanner dan face recognition;
- pencocokan identitas dari dua biometrik;
- penerapan aturan kesiapan keanggotaan;
- validasi metadata koreksi beserta alasan;
- UI berbahasa Indonesia yang dapat disusun oleh halaman atau workflow lain;
- real HTTP adapters dan mock adapters untuk development/test.

Modul tidak menyimpan data, memotong uang, membuat anggota, mengubah schema, atau mengorkestrasi transaksi intake. Pemanggil bertanggung jawab mengambil `membershipStatus` dari sumber server yang tepercaya dan mengeksekusi pembayaran/pemotongan setelah hasil modul disetujui.

Semua consumer harus mengimpor dari `@/features/identity-membership`, bukan deep import ke file internal.

## Input

UI `IdentityMembershipWorkflow` menerima:

```ts
type IdentityMembershipWorkflowProps = {
  sessionId: string;
  membershipStatus: "ACTIVE" | "PENDING_PAYMENT";
  fingerprintAdapter: FingerprintAdapter;
  faceRecognitionAdapter: FaceRecognitionAdapter;
  sellerIdHint?: string;
  initialSettlement?: "DIRECT_PAYMENT" | "DEDUCT_FROM_MARGIN";
  correction?: IdentityCorrection;
  onVerified?: (seller: VerifiedSeller) => void;
  onError?: (error: IdentityMembershipError) => void;
};
```

Service `verifyIdentityMembership(input)` menerima hasil kedua adapter, status anggota, pilihan simpanan opsional, expected seller opsional, dan metadata koreksi opsional. Service menerima `unknown` dan memvalidasinya dengan Zod sebelum menjalankan business rule.

`membershipStatus` dan `sellerIdHint` bukan authorization boundary. Integration owner wajib memasok nilai tersebut dari server yang tepercaya; nilai client tidak boleh dipakai untuk memberikan hak atau melakukan pencatatan finansial.

## Output publik

```ts
type VerifiedSeller = {
  sellerId: string;
  membershipStatus: "ACTIVE" | "PENDING_PAYMENT";
  fingerprintVerified: boolean;
  faceVerified: boolean;
  savingsSettlement?: "DIRECT_PAYMENT" | "DEDUCT_FROM_MARGIN";
};
```

Service memakai discriminated result:

```ts
type VerifyIdentityMembershipResult =
  | { ok: true; seller: VerifiedSeller; correction?: IdentityCorrection }
  | { ok: false; error: IdentityMembershipError };
```

`savingsSettlement` hanya ada untuk `PENDING_PAYMENT`. Hasil tersebut adalah keputusan tervalidasi, bukan bukti bahwa pembayaran/pemotongan sudah terjadi.

## Business rules

1. Fingerprint dan wajah wajib sama-sama `verified: true`.
2. Hasil berhasil wajib membawa `sellerId`.
3. Modality hasil fingerprint wajib `FINGERPRINT`; modality hasil wajah wajib `FACE`.
4. `sellerId` fingerprint dan wajah wajib sama.
5. Bila `expectedSellerId` diberikan, kedua biometrik wajib menunjuk ID tersebut.
6. Mismatch tidak boleh dikoreksi diam-diam dan selalu menghasilkan `IDENTITY_MISMATCH` untuk review petugas.
7. `ACTIVE` tidak memakai settlement simpanan.
8. `PENDING_PAYMENT` wajib memilih `DIRECT_PAYMENT` atau `DEDUCT_FROM_MARGIN`.
9. Metadata koreksi wajib memiliki nilai lama, nilai baru, alasan minimal lima karakter, dan identitas petugas. Koreksi tanpa alasan menghasilkan `CORRECTION_REASON_REQUIRED`.
10. Metadata koreksi tidak dapat menimpa mismatch biometrik atau melewati rule keanggotaan.

## States

State internal UI:

```text
IDLE
  -> VERIFYING_IDENTITY
  -> VERIFIED                    (ACTIVE)
  -> AWAITING_SETTLEMENT         (PENDING_PAYMENT tanpa pilihan)
       -> VERIFIED               (pilihan valid)

VERIFYING_IDENTITY -> ERROR      (device/validation/mismatch)
ERROR -> VERIFYING_IDENTITY      (hanya error retryable)
```

Mapping ke status sesi bersama:

- hasil biometrik cocok: integration owner dapat mengubah sesi menjadi `IDENTITY_VERIFIED`;
- `VerifiedSeller` aktif atau pending dengan pilihan settlement: integration owner dapat mengubah sesi menjadi `MEMBERSHIP_READY`;
- modul ini tidak menulis status sesi secara langsung.

## Database requirements

Dokumen ini hanya mencatat kebutuhan. Tidak ada schema atau migration yang dibuat oleh workstream ini.

Integration owner perlu memetakan kebutuhan ke model existing atau schema terkoordinasi:

- seller/anggota: stable `sellerId`, status `ACTIVE | PENDING_PAYMENT`, timestamp status;
- biometric verification event: session ID, modality, capture/reference ID, device ID, confidence, result, timestamp;
- identity match decision: fingerprint seller ID, face seller ID, expected seller ID opsional, result, error code;
- savings settlement intent: `DIRECT_PAYMENT | DEDUCT_FROM_MARGIN`, status eksekusi terpisah, nominal dan currency dari domain keanggotaan;
- correction audit: field, previous value, corrected value, reason, corrected by, timestamp;
- audit/event idempotency key untuk mencegah pencatatan ulang pada retry.

Data template fingerprint, embedding wajah, dan gambar mentah tidak boleh dimasukkan ke log aplikasi. Kebijakan retensi, enkripsi, consent, dan akses data biometrik harus diputuskan sebelum persistence diaktifkan.

## Hardware dan external dependencies

MVP real membutuhkan:

- fingerprint scanner dengan local device service/bridge;
- kamera yang dapat diakses face-recognition bridge;
- kemampuan matching pada bridge atau service di belakang proxy;
- route proxy aplikasi `POST /api/devices/fingerprint` dan `POST /api/devices/face-recognition`;
- HTTPS/authentication antara aplikasi dan bridge pada deployment nyata;
- timeout, health check, dan observability tanpa data biometrik sensitif.

Feature tidak mengasumsikan vendor, SDK, transport perangkat, atau algoritma pengenalan tertentu. Adapter HTTP hanya mengasumsikan JSON protocol di bawah ini. `baseUrl`, endpoint, headers, timeout, fetch implementation, dan request-ID factory dapat dikonfigurasi. Default endpoint mengarah ke route proxy aplikasi milik integration owner.

Tidak ada fallback otomatis dari real adapter ke mock. Kegagalan hardware harus terlihat sebagai error.

## JSON device-bridge protocol v1.0

Request fingerprint ke `POST /api/devices/fingerprint`:

```json
{
  "protocolVersion": "1.0",
  "requestId": "018f-request-id",
  "operation": "VERIFY_FINGERPRINT",
  "sessionId": "intake-session-001",
  "sellerIdHint": "seller-001",
  "metadata": {
    "stationId": "kiosk-01"
  }
}
```

Request face recognition memakai envelope yang sama, endpoint `/api/devices/face-recognition`, dan `operation: "VERIFY_FACE"`.

Response berhasil:

```json
{
  "protocolVersion": "1.0",
  "requestId": "018f-request-id",
  "status": "VERIFIED",
  "result": {
    "sellerId": "seller-001",
    "captureId": "capture-001",
    "confidence": 0.98,
    "verifiedAt": "2026-07-10T08:00:00.000Z",
    "deviceId": "fingerprint-bridge-01"
  }
}
```

Response tidak cocok tetap membawa `result` dan timestamp:

```json
{
  "protocolVersion": "1.0",
  "requestId": "018f-request-id",
  "status": "NOT_VERIFIED",
  "result": {
    "captureId": "capture-001",
    "confidence": 0.31,
    "verifiedAt": "2026-07-10T08:00:00.000Z",
    "deviceId": "face-bridge-01"
  }
}
```

Response bridge error:

```json
{
  "protocolVersion": "1.0",
  "requestId": "018f-request-id",
  "status": "ERROR",
  "error": {
    "code": "DEVICE_BUSY",
    "message": "Perangkat sedang digunakan.",
    "retryable": true
  }
}
```

`requestId` response wajib identik dengan request. `VERIFIED` wajib memiliki `sellerId`. Confidence bila tersedia berada pada rentang `0..1`. Bridge tidak boleh mengembalikan template biometrik atau gambar mentah dalam envelope ini.

## Errors

| Code | Kondisi | Retryable |
| --- | --- | --- |
| `INVALID_INPUT` | Kontrak input/modality tidak valid | Tidak |
| `FINGERPRINT_NOT_VERIFIED` | Fingerprint tidak cocok/tidak lengkap | Ya |
| `FACE_NOT_VERIFIED` | Wajah tidak cocok/tidak lengkap | Ya |
| `IDENTITY_MISMATCH` | Seller ID antar-biometrik/expected ID berbeda | Tidak, review petugas |
| `SETTLEMENT_REQUIRED` | Pending payment belum memilih settlement | Ya, pilih opsi |
| `CORRECTION_REASON_REQUIRED` | Metadata koreksi tidak lengkap | Tidak, lengkapi audit |
| `DEVICE_UNAVAILABLE` | Bridge/HTTP/vendor error | Berdasarkan response |
| `DEVICE_RESPONSE_INVALID` | Envelope, korelasi, atau field response salah | Tidak |
| `DEVICE_REQUEST_ABORTED` | Dibatalkan/timeout | Ya |
| `UNEXPECTED_ERROR` | Kegagalan tak terklasifikasi | Ya |

UI menampilkan `role="alert"` untuk error. `IDENTITY_MISMATCH` tidak menawarkan retry otomatis karena membutuhkan review petugas. Error bridge vendor dipetakan ke error publik dan kode aslinya disimpan pada `details.deviceCode`.

## Real dan mock adapters

- `HttpFingerprintAdapter`: real HTTP adapter; default `/api/devices/fingerprint`.
- `HttpFaceRecognitionAdapter`: real HTTP adapter; default `/api/devices/face-recognition`.
- `MockFingerprintAdapter`: deterministic development/test adapter.
- `MockFaceRecognitionAdapter`: deterministic development/test adapter.
- `createMatchingMockBiometricAdapters`: helper untuk membuat pasangan mock dengan seller ID sama.

Mock harus dipilih secara eksplisit oleh composition root development/test. Demonstrasi real tidak boleh beralih ke mock ketika bridge gagal.

## Test scenarios

Unit service:

- anggota aktif dan dua biometrik cocok menghasilkan `VerifiedSeller`;
- kedua pilihan settlement diterima untuk `PENDING_PAYMENT`;
- pending tanpa settlement ditolak;
- fingerprint tidak terverifikasi ditolak;
- mismatch fingerprint/wajah menghasilkan error eksplisit;
- koreksi tanpa alasan ditolak.

Adapter:

- endpoint proxy default dan request envelope benar;
- custom endpoint didukung;
- response verified/not-verified dipetakan dengan benar;
- response dengan request ID berbeda ditolak;
- integration berikutnya perlu menguji timeout, abort, 4xx/5xx, serta error bridge terhadap route proxy nyata.

Component:

- anggota aktif selesai dan memanggil `onVerified`;
- pending memilih potong margin sebelum selesai;
- mismatch tampil sebagai accessible error state;
- integration berikutnya perlu menguji real proxy dengan hardware simulator dan perangkat fisik.

## Integration risks

- Route proxy integration owner harus memakai envelope v1.0 yang sama; perubahan kontrak perlu versioning.
- `membershipStatus` belum memiliki persistence/server lookup pada feature ini dan tidak boleh dipercaya langsung dari browser.
- Pilihan `DEDUCT_FROM_MARGIN` adalah intent; intake transaction tetap harus memvalidasi saldo/margin dan mengeksekusi pemotongan secara atomic.
- Confidence tidak memiliki threshold bisnis dalam modul ini. Keputusan threshold dimiliki device/recognition service dan harus terdokumentasi per deployment.
- Kepatuhan privasi biometrik, consent, retention, encryption, dan incident response belum diselesaikan.
- Ketersediaan driver/SDK, kalibrasi, lighting kamera, serta performa bridge perangkat fisik belum dapat dibuktikan oleh automated test ini.
