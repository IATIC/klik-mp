import { DEMO_CREDENTIALS, DEMO_IDENTITY, type AuthenticatedUser } from "@/features/kiosk-flow";
import { waitForMock } from "./mock-utils";

export interface AuthAdapter {
  login(account: string, password: string): Promise<{ ok: true; user: AuthenticatedUser } | { ok: false; error: string }>;
}

export class MockAuthAdapter implements AuthAdapter {
  async login(account: string, password: string) {
    await waitForMock(360);
    const validAccount = account === DEMO_CREDENTIALS.account || account.toUpperCase() === DEMO_CREDENTIALS.memberNumber;
    if (!validAccount || password !== DEMO_CREDENTIALS.password) {
      return { ok: false as const, error: "NIK/nomor anggota atau kata sandi tidak sesuai." };
    }
    return {
      ok: true as const,
      user: {
        memberNumber: DEMO_IDENTITY.memberNumber,
        fullName: DEMO_IDENTITY.fullName,
        nikMasked: "3273••••••••0042",
        loginMethod: "manual" as const,
      },
    };
  }
}

export const authAdapter: AuthAdapter = new MockAuthAdapter();

