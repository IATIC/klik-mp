import { redirect } from "next/navigation";

type LegacyIntakeSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function LegacyIntakeSessionPage({
  params,
}: LegacyIntakeSessionPageProps) {
  const { sessionId } = await params;
  redirect(`/kiosk/intake/${sessionId}`);
}
