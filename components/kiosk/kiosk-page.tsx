import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

import { KioskHeader } from "./kiosk-header";
import { KioskProgress } from "./kiosk-progress";

type KioskPageProps = {
  children: ReactNode;
  footer?: ReactNode;
  progress?: { label: string; current: number; total: number };
  mainClassName?: string;
  showExit?: boolean;
  onExit?: () => void;
};

export function KioskPage({ children, footer, progress, mainClassName, showExit, onExit }: KioskPageProps) {
  return (
    <div className="flex h-svh min-h-[40rem] w-full flex-col overflow-hidden bg-surface text-foreground">
      <KioskHeader showExit={showExit} onExit={onExit} />
      {progress ? <KioskProgress {...progress} /> : null}
      <main className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-9 sm:py-6 lg:px-12", mainClassName)}>{children}</main>
      {footer}
    </div>
  );
}

