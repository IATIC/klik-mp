import type { Metadata } from "next";

import {
  createDemoAiReview,
  OperatorReviewWorkspace,
} from "@/features/operator-assistance";

type OperatorReviewPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata: Metadata = {
  title: "Review hasil AI",
};

export default async function OperatorReviewPage({
  params,
}: OperatorReviewPageProps) {
  const { sessionId } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-8 lg:px-10">
      <OperatorReviewWorkspace initialReview={createDemoAiReview(sessionId)} />
    </main>
  );
}
