import type { ReactNode } from "react";

export function KioskFooterActions({ start, center, end }: { start?: ReactNode; center?: ReactNode; end?: ReactNode }) {
  return (
    <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-border bg-background px-5 py-3 sm:px-9 sm:py-4 lg:px-12">
      <div className="justify-self-start">{start}</div>
      <div className="justify-self-center">{center}</div>
      <div className="justify-self-end">{end}</div>
    </footer>
  );
}

