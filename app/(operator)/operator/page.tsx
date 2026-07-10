import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tags } from "lucide-react";

import { IntakeSessionDirectory } from "@/features/intake-transaction";
import { listServerIntakeSessions } from "@/features/intake-transaction/server/session-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard operator",
};

export default function OperatorDashboardPage() {
  const sessions = listServerIntakeSessions();
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-5 py-8 sm:px-8 lg:px-10">
      <IntakeSessionDirectory sessions={sessions.slice(0, 5)} audience="operator" />
      <Link
        href="/operator/reference-prices"
        className="flex items-center justify-between border-y border-border py-5 font-bold text-primary"
      >
        <span className="flex items-center gap-3"><Tags aria-hidden="true" className="size-5" /> Kelola referensi harga</span>
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </main>
  );
}
