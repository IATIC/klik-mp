import type { ReactNode } from "react";

export function KioskDialog({ title, children }: { title: string; children: ReactNode }) {
  return <section aria-label={title} className="rounded-3xl border border-border bg-surface p-8 shadow-xl">{children}</section>;
}
