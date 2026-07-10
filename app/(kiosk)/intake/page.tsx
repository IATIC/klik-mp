import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

export default function IntakeStartPage() {
  redirect(`/intake/${randomUUID()}`);
}
