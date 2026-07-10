import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  KioskIntakeExperience,
  type KioskDeviceMode,
} from "@/features/intake-transaction";
import { getServerIntakeSession } from "@/features/intake-transaction/server/session-store";

type IntakeSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wizard penerimaan",
};

export default async function IntakeSessionPage({
  params,
}: IntakeSessionPageProps) {
  const { sessionId } = await params;
  const stored = getServerIntakeSession(sessionId);
  if (!stored) notFound();
  if (stored.session.status === "COMPLETED") {
    redirect(`/kiosk/intake/${sessionId}/receipt`);
  }

  const configuredMode = process.env.DEVICE_MODE?.toLowerCase();
  const mockAllowed =
    process.env.NODE_ENV !== "production" ||
    process.env.E2E_ALLOW_MOCK_DEVICES === "true";
  const deviceMode: KioskDeviceMode =
    configuredMode === "mock" && mockAllowed ? "mock" : "real";
  const membershipStatus =
    process.env.DEMO_MEMBERSHIP_STATUS === "ACTIVE"
      ? "ACTIVE"
      : "PENDING_PAYMENT";
  const configuredSavings = Number(
    process.env.DEMO_SAVINGS_REQUIRED_AMOUNT ?? "100000",
  );

  return (
    <KioskIntakeExperience
      initialSession={stored.session}
      deviceMode={deviceMode}
      membershipStatus={membershipStatus}
      savingsRequiredAmount={
        Number.isFinite(configuredSavings)
          ? Math.max(0, configuredSavings)
          : 100_000
      }
    />
  );
}
