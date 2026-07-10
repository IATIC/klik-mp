import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { IntakeReceiptView } from "@/features/intake-transaction";
import { getServerIntakeSession } from "@/features/intake-transaction/server/session-store";

type ReceiptPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receipt penerimaan",
};

export default async function IntakeReceiptPage({ params }: ReceiptPageProps) {
  const { sessionId } = await params;
  const stored = getServerIntakeSession(sessionId);
  if (!stored) notFound();
  if (stored.session.status !== "COMPLETED") {
    redirect(`/kiosk/intake/${sessionId}`);
  }
  if (!stored.completion) notFound();
  return (
    <main className="px-5 py-8 sm:px-8">
      <IntakeReceiptView stored={stored} />
    </main>
  );
}
