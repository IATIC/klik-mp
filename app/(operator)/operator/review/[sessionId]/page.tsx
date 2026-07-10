import { redirect } from "next/navigation";

type LegacyReviewPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function LegacyReviewPage({ params }: LegacyReviewPageProps) {
  const { sessionId } = await params;
  redirect(`/operator/intakes/${sessionId}`);
}
