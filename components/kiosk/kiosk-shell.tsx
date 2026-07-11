import type { ReactNode } from "react";

import { KioskHeader } from "./kiosk-header";
import { KioskProgress } from "./kiosk-progress";

type KioskShellProps = {
  children: ReactNode;
  actionBar?: ReactNode;
  progress?: { label: string; current: number; total: number };
  showExit?: boolean;
  onExit?: () => void;
};

/** Stable frame for every self-service screen. It never scrolls as a page. */
export function KioskShell({ children, actionBar, progress, showExit, onExit }: KioskShellProps) {
  return (
    <div className="kiosk-canvas flex min-h-[42rem] flex-col bg-background text-foreground">
      <KioskHeader showExit={showExit} onExit={onExit} />
      {progress ? <KioskProgress {...progress} /> : null}
      {children}
      {actionBar}
    </div>
  );
}
