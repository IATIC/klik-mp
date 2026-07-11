import type { ReactNode } from "react";

/** Consistent, deliberately quiet bottom actions for touch screens. */
export function KioskActionBar({ start, center, end }: { start?: ReactNode; center?: ReactNode; end?: ReactNode }) {
  return (
    <footer className="grid min-h-[7.25rem] shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-6 bg-surface px-8 sm:px-12 lg:px-16 xl:px-20">
      <div className="justify-self-start">{start}</div>
      <div className="justify-self-center">{center}</div>
      <div className="justify-self-end">{end}</div>
    </footer>
  );
}
