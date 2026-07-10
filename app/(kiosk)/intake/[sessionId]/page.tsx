import type { Metadata } from "next";

import {
  KioskIntakeExperience,
  type KioskDeviceMode,
} from "@/features/intake-transaction";

type IntakeSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata: Metadata = {
  title: "Intake komoditas",
};

export default async function IntakeSessionPage({
  params,
}: IntakeSessionPageProps) {
  const { sessionId } = await params;
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
  const savingsRequiredAmount = Number.isFinite(configuredSavings)
    ? Math.max(0, configuredSavings)
    : 100_000;

  return (
    <KioskIntakeExperience
      sessionId={sessionId}
      deviceMode={deviceMode}
      membershipStatus={membershipStatus}
      savingsRequiredAmount={savingsRequiredAmount}
    />
  );
}
