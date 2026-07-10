import type { Metadata } from "next";

import { IntakeSessionDirectory } from "@/features/intake-transaction";
import { listServerIntakeSessions } from "@/features/intake-transaction/server/session-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar intake",
};

export default function OperatorIntakesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      <IntakeSessionDirectory
        sessions={listServerIntakeSessions()}
        audience="operator"
      />
    </main>
  );
}
