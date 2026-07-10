-- Query Distribusi Usia Kopdes
SELECT
  CASE
    WHEN DATE_PART('year', CURRENT_DATE) - LEFT(tanggal_lahir, 4)::int < 30 THEN '< 30'
    WHEN DATE_PART('year', CURRENT_DATE) - LEFT(tanggal_lahir, 4)::int BETWEEN 30 AND 40 THEN '30-40'
    WHEN DATE_PART('year', CURRENT_DATE) - LEFT(tanggal_lahir, 4)::int BETWEEN 41 AND 50 THEN '41-50'
    WHEN DATE_PART('year', CURRENT_DATE) - LEFT(tanggal_lahir, 4)::int BETWEEN 51 AND 60 THEN '51-60'
    ELSE '> 60'
  END AS kelompok_usia,
  COUNT(*) AS jumlah,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS persentase
FROM pengurus_koperasi
WHERE tanggal_lahir IS NOT NULL
  AND tanggal_lahir != '0000-00-00'
  AND tanggal_lahir ~ '^\d{4}'
GROUP BY kelompok_usia
ORDER BY MIN(LEFT(tanggal_lahir, 4)::int);

-- Akses Listrik dan Internet Koperasi dan Gerai
SELECT
  gk.akses_listrik,
  gk.akses_internet,
  COUNT(DISTINCT gk.koperasi_ref) AS jumlah_koperasi,
  COUNT(*) AS jumlah_gerai
FROM gerai_koperasi gk
JOIN referensi_koperasi_wilayah rkw ON gk.koperasi_ref = rkw.koperasi_ref
JOIN referensi_wilayah rw ON rkw.kode_wilayah = rw.kode_wilayah
WHERE rw.desa_kelurahan IS NOT NULL
GROUP BY gk.akses_listrik, gk.akses_internet
ORDER BY gk.akses_listrik, gk.akses_internet;

-- Status Pendidikan Pengurus
SELECT status_pendidikan, COUNT(*) AS jumlah
FROM pengurus_koperasi pk
JOIN referensi_koperasi_wilayah rkw ON pk.koperasi_ref = rkw.koperasi_ref
JOIN referensi_wilayah rw ON rkw.kode_wilayah = rw.kode_wilayah
WHERE rw.desa_kelurahan IS NOT NULL
  AND pk.status_pendidikan IS NOT NULL
GROUP BY status_pendidikan
ORDER BY jumlah DESC;

-- Metode Pengisiamn
SELECT
  metode_pengisian,
  COUNT(*) AS jumlah,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS persentase
FROM profil_koperasi
WHERE metode_pengisian IS NOT NULL
GROUP BY metode_pengisian
ORDER BY jumlah DESC;

--Persen tanpa akun
SELECT
  status_akun,
  COUNT(*) AS jumlah,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS persentase
FROM anggota_koperasi
WHERE status_akun IS NOT NULL
GROUP BY status_akun;

--Persen tanpa akun per daerah
SELECT
  rw.provinsi,
  rw.kab_kota,
  rw.kecamatan,
  rw.desa_kelurahan,
  COUNT(*) AS total_anggota,
  SUM(CASE WHEN ak.status_akun = 'Tidak Punya Akun' THEN 1 ELSE 0 END) AS tanpa_akun,
  SUM(CASE WHEN ak.status_akun = 'Punya Akun' THEN 1 ELSE 0 END) AS punya_akun,
  ROUND(SUM(CASE WHEN ak.status_akun = 'Tidak Punya Akun' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS persen_tanpa_akun
FROM anggota_koperasi ak
LEFT JOIN referensi_wilayah rw ON ak.kode_wilayah = rw.kode_wilayah
WHERE ak.status_akun IS NOT NULL
GROUP BY rw.provinsi, rw.kab_kota, rw.kecamatan, rw.desa_kelurahan
ORDER BY persen_tanpa_akun DESC;


