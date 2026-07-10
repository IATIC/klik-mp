export type DukcapilRecord = {
  nik: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  alamat: string;
  agama: string;
  statusPerkawinan: string;
  pekerjaan: string;
};

export type RegistrationInput = {
  nik: string;
  namaLengkap: string;
  password: string;
  dukcapilMatched: boolean;
};

export type RegistrationResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

export type LoginInput = {
  nik: string;
  password: string;
};

export type LoginResult =
  | { ok: true; userId: string; namaLengkap: string }
  | { ok: false; error: string };
