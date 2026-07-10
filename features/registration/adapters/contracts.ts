import type { DukcapilRecord, RegistrationInput } from "../types/registration";

export interface DukcapilAdapter {
  lookupByNIK(nik: string): Promise<DukcapilRecord | null>;
}

export type UserWithPassword = {
  id: string;
  namaLengkap: string;
  passwordHash: string;
};

export interface UserRepository {
  findByNIK(nik: string): Promise<{ id: string } | null>;
  findWithPasswordByNIK(nik: string): Promise<UserWithPassword | null>;
  create(input: RegistrationInput): Promise<{ id: string }>;
}
