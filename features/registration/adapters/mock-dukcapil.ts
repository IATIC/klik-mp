import type { DukcapilAdapter } from "./contracts";
import type { DukcapilRecord } from "../types/registration";

const MOCK_DUKCAPIL: Record<string, DukcapilRecord> = {
  "3201123456789012": {
    nik: "3201123456789012",
    namaLengkap: "Asep Sudrajat",
    tempatLahir: "Cirebon",
    tanggalLahir: "1990-05-12",
    jenisKelamin: "L",
    alamat: "Jl. Raya Desa Kebonturi, Kec. Arjawinangun, Kab. Cirebon",
    agama: "Islam",
    statusPerkawinan: "Kawin",
    pekerjaan: "Petani",
  },
  "3273123456789012": {
    nik: "3273123456789012",
    namaLengkap: "Budi Anggara",
    tempatLahir: "Cirebon",
    tanggalLahir: "1995-08-23",
    jenisKelamin: "P",
    alamat: "Jl. Merdeka No. 12, Kec. Arjawinangun, Kab. Cirebon",
    agama: "Islam",
    statusPerkawinan: "Belum Kawin",
    pekerjaan: "Pedagang",
  },
};

export class MockDukcapilAdapter implements DukcapilAdapter {
  async lookupByNIK(nik: string): Promise<DukcapilRecord | null> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_DUKCAPIL[nik] ?? null;
  }
}
