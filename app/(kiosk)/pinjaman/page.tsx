"use client";

import { useRouter } from "next/navigation";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { PinjamanForm } from "@/features/pinjaman";
import { useKioskFlow } from "@/features/kiosk-flow";

const DEMO_NIK = "3201123456789012";
const DEMO_NAMA = "Asep Sudrajat";

export default function PinjamanPage() {
  const router = useRouter();
  const { state } = useKioskFlow();

  const user = state.authenticatedUser;
  const nik = user?.memberNumber ?? DEMO_NIK;
  const namaLengkap = user?.fullName ?? DEMO_NAMA;

  return (
    <KioskPage>
      <div className="flex h-full flex-col animate-foundation-in">
        <PinjamanForm
          nik={nik}
          namaLengkap={namaLengkap}
          onBack={() => router.push("/kiosk")}
        />
      </div>
    </KioskPage>
  );
}
