"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, FileText } from "lucide-react";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";

type LaporanItem = {
  id: string;
  judul: string;
  konten: string;
};

const LAPORAN: LaporanItem[] = [
  {
    id: "surat-undangan",
    judul: "Surat Undangan RAT",
    konten: `SURAT UNDANGAN
RAPAT ANGGOTA TAHUNAN
Koperasi Desa Kebonturi
Nomor: 012/UND-RAT/KMP/III/2026

Kepada Yth.
Seluruh Anggota Koperasi Desa Kebonturi
di Tempat

Dengan hormat,

Sehubungan dengan akan diselenggarakannya Rapat Anggota Tahunan (RAT) 
Koperasi Desa Kebonturi Tahun Buku 2025, bersama ini kami mengundang 
Bapak/Ibu/Saudara untuk hadir pada:

Hari/Tanggal   : Sabtu, 14 Maret 2026
Waktu          : 09.00 WIB - Selesai
Tempat         : Aula Koperasi Desa Kebonturi
                Jl. Raya Desa Kebonturi No. 1
                Kec. Arjawinangun, Kab. Cirebon

Acara          : Rapat Anggota Tahunan Tahun Buku 2025

Kehadiran Bapak/Ibu/Saudara sangat diharapkan guna kelancaran jalannya 
rapat. Terima kasih atas perhatian dan partisipasinya.

Bandung, 28 Februari 2026
Pengurus Koperasi Desa Kebonturi

Ketua,
( Tanda Tangan )

Asep Sudrajat`,
  },
  {
    id: "agenda",
    judul: "Agenda RAT",
    konten: `AGENDA RAPAT ANGGOTA TAHUNAN
Koperasi Desa Kebonturi
Sabtu, 14 Maret 2026

SESI I (09.00 - 10.30)
  1.  Pembukaan oleh Ketua Pengurus
  2.  Laporan Ketua Panitia Pelaksana
  3.  Pembacaan Surat Undangan
  4.  Pengesahan Tata Tertib RAT
  5.  Pembacaan Notulen RAT Sebelumnya

SESI II (10.45 - 12.30)
  6.  Laporan Pertanggungjawaban Pengurus
  7.  Laporan Pengawas
  8.  Laporan Keuangan Tahun Buku 2025
  9.  Tanggapan dan Tanya Jawab

ISTIRAHAT (12.30 - 13.30)

SESI III (13.30 - 15.30)
  10. Pembahasan Rencana Kerja Tahun Buku 2026
  11. Pembahasan RAPB Tahun Buku 2026
  12. Penetapan Pembagian SHU
  13. Pemilihan Pengurus dan Pengawas Baru

SESI IV (15.45 - 16.30)
  14. Sambutan Pembina
  15. Penutupan dan Doa`,
  },
  {
    id: "tata-tertib",
    judul: "Tata Tertib RAT",
    konten: `TATA TERTIB RAPAT ANGGOTA TAHUNAN
Koperasi Desa Kebonturi
14 Maret 2026

A.  KETENTUAN UMUM
    1.  RAT dimulai tepat pukul 09.00 WIB
    2.  Peserta wajib hadir 15 menit sebelum acara dimulai
    3.  Berpakaian rapi dan sopan (kemeja/batik)

B.  HAK PESERTA
    1.  Setiap anggota memiliki 1 (satu) hak suara
    2.  Anggota berhak mengajukan pertanyaan dan pendapat
    3.  Anggota berhak memilih dan dipilih

C.  TATA CARA SIDANG
    1.  Berbicara setelah mendapat izin pimpinan sidang
    2.  Mengangkat tangan sebelum mengajukan pertanyaan
    3.  Waktu berbicara maksimal 5 menit per peserta
    4.  Keputusan diambil secara musyawarah mufakat
    5.  Jika tidak mencapai mufakat, diputuskan dengan suara terbanyak

D.  SANKSI
    1.  Peserta yang meninggalkan ruangan tanpa izin dicatat
    2.  Pelanggaran tata tertib dapat dikenakan teguran`,
  },
  {
    id: "laporan-pengurus",
    judul: "Laporan Pengurus",
    konten: `LAPORAN PERTANGGUNGJAWABAN PENGURUS
Koperasi Desa Kebonturi
Tahun Buku 2025

A.  BIDANG ORGANISASI
    1.  Jumlah anggota awal       : 412 orang
    2.  Anggota baru              : 43 orang
    3.  Anggota keluar            : 7 orang
    4.  Jumlah anggota akhir      : 448 orang
    5.  Kehadiran anggota di RAT  : 78%

B.  BIDANG USAHA
    1.  Volume usaha              : Rp 2.845.000.000
    2.  Pendapatan usaha          : Rp 687.500.000
    3.  Beban operasional         : Rp 421.300.000
    4.  SHU sebelum pajak         : Rp 266.200.000
    5.  Pajak                     : Rp 12.400.000
    6.  SHU setelah pajak         : Rp 253.800.000

C.  REALISASI PROGRAM
    1.  Program digitalisasi      : 80%
    2.  Unit offtaker             : Berjalan 6 komoditas
    3.  Kemitraan                 : 2 perusahaan off-taker`,
  },
  {
    id: "daftar-hadir",
    judul: "Daftar Hadir",
    konten: `DAFTAR HADIR PESERTA
RAPAT ANGGOTA TAHUNAN
Koperasi Desa Kebonturi
Sabtu, 14 Maret 2026

Total Anggota Terdaftar  : 448 orang
Total Hadir              : 352 orang (78.6%)
Kuorum Terpenuhi         : Ya

KETERANGAN HADIR:
  Hadir tepat waktu      : 289 orang
  Hadir terlambat        : 41 orang
  Hadir (undangan)       : 22 orang

TIDAK HADIR:
  Izin                    : 38 orang
  Tanpa keterangan        : 58 orang

DAFTAR PESERTA (halaman 1 dari 8):

No  Nama                   Status      Tanda Tangan
1.  Asep Sudrajat          Ketua       [TTD]
2.  Budi Anggara         Anggota     [TTD]
3.  Dudung Abdulrahman     Anggota     [TTD]
4.  Neneng Hasanah         Anggota     [TTD]
5.  Cecep Supriadi         Anggota     [TTD]
6.  Yanti Sukmawati        Anggota     [TTD]
7.  Agus Wibowo            Anggota     [TTD]
8.  Ika Purwanti           Anggota     [TTD]
9.  Endang Koswara         Anggota     [TTD]
10. Rina Marlina           Anggota     [TTD]`,
  },
  {
    id: "gambaran-umum",
    judul: "Gambaran Umum",
    konten: `GAMBARAN UMUM
Koperasi Desa Kebonturi
Tahun Buku 2025

A.  PROFIL KOPERASI
    Nama Koperasi    : Koperasi Desa Kebonturi
    Alamat           : Jl. Raya Desa Kebonturi No. 1
                       Kec. Arjawinangun, Kab. Cirebon
    Provinsi         : Jawa Barat
    Badan Hukum      : 123/BH/KOP/VI/2018
    NPWP             : 01.234.567.8-901.000

B.  SEKTOR USAHA
    1.  Simpan Pinjam
    2.  Unit Offtaker Komoditas
    3.  Klinikdesa (Kesehatan)
    4.  Unit Waserda

C.  KEANGGOTAAN
    Total Anggota    : 448 orang
    Pria             : 267 orang
    Wanita           : 181 orang

D.  WILAYAH OPERASIONAL
    - Desa Kebonturi
    - Desa Jungjang
    - Desa Glebeg
    - Desa Kertawinangun`,
  },
  {
    id: "rencana-kerja",
    judul: "Rencana Kerja",
    konten: `RENCANA KERJA TAHUN BUKU 2026
Koperasi Desa Kebonturi

I.   BIDANG ORGANISASI DAN SDM
     1.  Penambahan 200 anggota baru
     2.  Pelatihan pengurus dan pengawas
     3.  Sertifikasi koperasi
     4.  RAT Tahun 2027 tepat waktu

II.  BIDANG USAHA
     1.  Target volume usaha Rp 4 Miliar
     2.  Pengembangan unit offtaker
        - 6 komoditas utama
        - Kerjasama dengan 5 petani mitra
     3.  Pengembangan Klinikdesa
        - Target 500 pasien per bulan
     4.  Digitalisasi layanan

III. BIDANG KEMITRAAN
     1.  Kerjasama off-taker dengan 2 perusahaan
     2.  Kemitraan dengan 3 koperasi desa lain
     3.  Program CSR dan pemberdayaan petani`,
  },
  {
    id: "laporan-pengawas",
    judul: "Laporan Pengawas",
    konten: `LAPORAN PENGAWAS
Koperasi Desa Kebonturi
Tahun Buku 2025

A.  RUANG LINGKUP PENGAWASAN
    1.  Kepatuhan terhadap Anggaran Dasar / Anggaran Rumah Tangga
    2.  Kinerja pengurus dalam mengelola koperasi
    3.  Kesehatan keuangan koperasi

B.  HASIL PENGAWASAN
    1.  Aspek Organisasi
        - Pengurus telah menjalankan tugas sesuai AD/ART
        - Rapat pengurus dilaksanakan rutin setiap bulan
        - Tidak ditemukan pelanggaran prosedur

    2.  Aspek Keuangan
        - Pembukuan dilakukan secara tertib
        - Laporan keuangan disusun sesuai standar
        - Rasio likuiditas: 185% (sehat)
        - Rasio solvabilitas: 142% (sehat)

C.  REKOMENDASI
    1.  Meningkatkan pengelolaan piutang
    2.  Memperkuat sistem pengendalian internal
    3.  Mengembangkan diversifikasi usaha`,
  },
  {
    id: "keuangan",
    judul: "Laporan Keuangan",
    konten: `LAPORAN POSISI KEUANGAN
Koperasi Desa Kebonturi
Periode Tahun Buku 2025

ASET
  Kas dan Bank                    Rp 245.800.000
  Piutang Anggota                 Rp 187.500.000
  Persediaan Barang               Rp  96.200.000
  Aset Tetap                      Rp 420.000.000
  Total Aset                      Rp 949.500.000

KEWAJIBAN
  Simpanan Anggota                Rp 312.000.000
  Hutang Usaha                    Rp  98.000.000
  Total Kewajiban                 Rp 410.000.000

SISA HASIL USAHA
  SHU Tahun Berjalan              Rp 127.800.000
  Cadangan Koperasi               Rp  38.340.000
  SHU Dibagikan ke Anggota        Rp  89.460.000`,
  },
  {
    id: "rapb",
    judul: "Rencana Anggaran (RAPB)",
    konten: `RENCANA ANGGARAN PENDAPATAN DAN BELANJA
Koperasi Desa Kebonturi
Tahun Buku 2026

A.  PENDAPATAN
    1.  Pendapatan Jasa Simpan Pinjam    Rp 720.000.000
    2.  Pendapatan Unit Offtaker         Rp 480.000.000
    3.  Pendapatan Unit Klinikdesa       Rp 240.000.000
    4.  Pendapatan Unit Waserda          Rp 156.000.000
    5.  Pendapatan Lain-lain             Rp  48.000.000
    Total Pendapatan                     Rp 1.644.000.000

B.  BELANJA
    1.  Belanja Pegawai                  Rp 342.000.000
    2.  Belanja Administrasi             Rp  96.000.000
    3.  Belanja Pemeliharaan             Rp  72.000.000
    4.  Belanja Operasional              Rp 180.000.000
    5.  Belanja Investasi                Rp 250.000.000
    6.  Belanja Lain-lain                Rp  48.000.000
    Total Belanja                        Rp 988.000.000

C.  SURPLUS ANGGARAN                    Rp 656.000.000

D.  ALOKASI SHU RENCANA
    1.  Cadangan Koperasi (30%)          Rp 196.800.000
    2.  SHU Anggota (50%)                Rp 328.000.000
    3.  Dana Pengurus (10%)              Rp  65.600.000
    4.  Dana Pendidikan (5%)             Rp  32.800.000
    5.  Dana Sosial (5%)                 Rp  32.800.000`,
  },
  {
    id: "presensi",
    judul: "Presensi Digital",
    konten: `PRESENSI DIGITAL
RAPAT ANGGOTA TAHUNAN
Koperasi Desa Kebonturi
Sabtu, 14 Maret 2026

SISTEM PRESENSI DIGITAL
Metode : QR Code + NFC
Waktu  : 08.30 - 16.30 WIB
Server : Online

STATUS PRESENSI
Total Anggota Terdaftar        : 448
Total Presensi Masuk           : 352
  - Scan QR Code               : 298
  - Scan NFC                   : 54
Total Presensi Keluar          : 310
Tidak Melakukan Presensi Keluar: 42

RIWAYAT PRESENSI (halaman 1 dari 15)

No  Nama                   Masuk         Keluar
1.  Asep Sudrajat          08:45         16:15
2.  Budi Anggara         08:50         16:20
3.  Dudung Abdulrahman     09:00         16:10
4.  Neneng Hasanah         08:55         16:25
5.  Cecep Supriadi         09:10         16:05
6.  Yanti Sukmawati        08:48         16:30
7.  Agus Wibowo            09:05         16:15
8.  Ika Purwanti           08:52         16:18
9.  Endang Koswara         09:15         16:00
10. Rina Marlina           08:47         16:22`,
  },
];

export function RapatLaporanPage() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <KioskPage
      footer={
        <KioskFooterActions
          start={
            <Button variant="outline" size="kiosk" onClick={() => router.push("/erat")}>
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="flex h-full flex-col gap-6 animate-foundation-in">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Akses Laporan Rapat</h1>
          <p className="mt-2 text-muted-foreground">Pilih laporan yang ingin dibaca</p>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {LAPORAN.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-border"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left font-bold text-lg hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
                >
                  <FileText aria-hidden="true" className="size-6 shrink-0 text-primary" />
                  <span className="flex-1">{item.judul}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border px-6 py-5">
                    <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                        <FileText aria-hidden="true" className="size-4 text-primary" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {item.judul}
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                        {item.konten}
                      </pre>
                      <div className="mt-4 border-t border-border pt-3 text-center">
                        <span className="text-[10px] text-muted-foreground/60">
                          Halaman 1 dari 1
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </KioskPage>
  );
}
