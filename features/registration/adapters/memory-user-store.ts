import { randomUUID } from "node:crypto";
import { hashPassword } from "@/lib/auth/password";
import type { RegistrationInput } from "../types/registration";
import type { UserRepository, UserWithPassword } from "./contracts";

type UserRecord = {
  id: string;
  nik: string;
  namaLengkap: string;
  passwordHash: string;
  dukcapilMatched: boolean;
};

const users = new Map<string, UserRecord>();

export class MemoryUserStore implements UserRepository {
  async findByNIK(nik: string): Promise<{ id: string } | null> {
    const user = this.findByNIKRaw(nik);
    return user ? { id: user.id } : null;
  }

  async findWithPasswordByNIK(
    nik: string,
  ): Promise<UserWithPassword | null> {
    const user = this.findByNIKRaw(nik);
    return user
      ? { id: user.id, namaLengkap: user.namaLengkap, passwordHash: user.passwordHash }
      : null;
  }

  async create(input: RegistrationInput): Promise<{ id: string }> {
    const id = randomUUID();
    users.set(id, {
      id,
      nik: input.nik,
      namaLengkap: input.namaLengkap,
      passwordHash: await hashPassword(input.password),
      dukcapilMatched: input.dukcapilMatched,
    });
    return { id };
  }

  private findByNIKRaw(nik: string): UserRecord | undefined {
    for (const user of users.values()) {
      if (user.nik === nik) return user;
    }
    return undefined;
  }
}

export function clearMemoryUsers(): void {
  users.clear();
}
