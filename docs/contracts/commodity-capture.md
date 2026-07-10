# Kontrak Modul Commodity Capture

## Outcome

Operator memperoleh satu bukti penangkapan komoditas yang memuat gross, tare, net, foto, dan waktu pengambilan. Modul tidak menyimpan data ke database dan tidak mengubah status sesi secara langsung.

## Input dan output

Input runtime adalah implementasi `ScaleAdapter`, implementasi `CameraAdapter`, serta ID capture dari orkestrator. Output publik:

```ts
type CommodityCapture = {
  captureId: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  imageUrl: string;
  capturedAt: string;
};
```

Seluruh konsumsi lintas feature harus melalui `features/commodity-capture/index.ts`.

## Business rule

- Satuan berat kontrak adalah kilogram.
- Gross dan tare harus bilangan finite serta lebih besar dari nol.
- Gross harus lebih besar daripada tare.
- Net selalu dihitung oleh service sebagai `gross - tare`; nilai net dari client tidak diterima.
- Foto minimal 640×480, brightness 0,15–0,9, dan sharpness minimal 0,05.
- Capture hanya dihasilkan setelah berat dan foto lolos validasi Zod serta aturan kualitas.

## Status

Status UI internal: `idle`, `connecting`, `ready`, `reading`, `capturing`, `validation_error`, `saving`, `success`, dan `error`. Modul menerima sesi sebelum `COMMODITY_CAPTURED`; orkestrator boleh menghasilkan `COMMODITY_CAPTURED` hanya setelah menerima output valid. Status bersama tidak diubah oleh modul ini.

## Kebutuhan database

Integration owner perlu menyediakan penyimpanan record capture yang mengacu ke sesi intake, menyimpan gross/tare/net, URL bukti foto persisten, timestamp, metadata perangkat, dan audit timestamp. Penyimpanan objek diperlukan untuk mengubah data URL/blob kamera menjadi URL persisten. Detail schema dan migration sengaja tidak ditentukan di workstream ini.

## Hardware dan protokol

- `HttpScaleDeviceBridgeAdapter` adalah jalur real default untuk integrasi melalui `POST /api/devices/scale`. Request memakai `{ "action": "connect" | "read_gross" | "read_tare" | "disconnect" }`; respons baca memakai `{ "weight": number }`, sedangkan connect/disconnect boleh mengembalikan objek kosong. Respons HTTP non-2xx atau payload invalid dianggap error dan tidak pernah dialihkan diam-diam ke mock.
- `WebSerialScaleAdapter` adalah adapter real generik tanpa SDK vendor. Ia membutuhkan Chromium, secure context (HTTPS/localhost), izin pengguna, baud rate, command gross/tare, terminator, dan parser respons yang sesuai protokol timbangan terpilih.
- Parser default mengambil angka desimal pertama dari satu baris respons. Integrasi final wajib mengonfirmasi unit, stable flag, framing, checksum, serta command aktual perangkat.
- `BrowserMediaCameraAdapter` adalah adapter real yang memakai `getUserMedia`, video preview, canvas JPEG, dan metrik piksel lokal.
- `MockScaleAdapter` dan `MockCameraAdapter` hanya untuk development/test.

## Error

Skenario error meliputi API browser tidak tersedia, izin perangkat ditolak, port gagal dibuka, timeout/protokol timbangan tidak cocok, pembacaan nonnumerik, kamera belum siap, gross/tare invalid, foto terlalu kecil/gelap/terang/buram, dan kegagalan persistence oleh orkestrator. UI menampilkan error yang dapat dicoba ulang tanpa mengeluarkan capture invalid.

## Test

- Happy path perhitungan gross/tare/net dan output contract.
- Gross/tare nol, negatif, atau gross tidak lebih besar dari tare.
- Foto valid dan setiap kegagalan kualitas foto.
- Mock device belum aktif atau dikonfigurasi gagal.
- Component flow: aktivasi, pembacaan, foto, validasi, success.
- Integration lanjutan: protokol perangkat fisik, upload bukti, persistence, status sesi, idempotensi, dan audit trail.
