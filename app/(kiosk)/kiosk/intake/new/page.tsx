import { redirect } from "next/navigation";

import { createServerIntakeSession } from "@/features/intake-transaction/server/session-store";

export const dynamic = "force-dynamic";

export default function NewIntakeSessionPage() {
  const { session } = createServerIntakeSession();
  redirect(`/kiosk/intake/${session.sessionId}`);
}
