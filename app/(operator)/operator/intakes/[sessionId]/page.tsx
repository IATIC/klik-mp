import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IntakeSessionDetail } from "@/features/intake-transaction";
import { getServerIntakeSession } from "@/features/intake-transaction/server/session-store";

type OperatorIntakeDetailPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail intake",
};

export default async function OperatorIntakeDetailPage({
  params,
}: OperatorIntakeDetailPageProps) {
  const { sessionId } = await params;
  const stored = getServerIntakeSession(sessionId);
  if (!stored) notFound();
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10">
      <IntakeSessionDetail stored={stored} />
    </main>
  );
}
