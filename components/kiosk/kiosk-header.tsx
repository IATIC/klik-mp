import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";

import { HelpButton } from "./help-button";

type KioskHeaderProps = {
  homeHref?: string;
  showExit?: boolean;
  onExit?: () => void;
};

export function KioskHeader({ homeHref = "/", showExit = false, onExit }: KioskHeaderProps) {
  return (
    <header className="flex h-[4.75rem] shrink-0 items-center justify-between border-b border-border bg-background px-5 sm:h-[5.5rem] sm:px-9 lg:px-12">
      <Link href={homeHref} className="flex min-h-14 items-center gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25">
        <span className="flex items-center justify-center">
          <Image
            src="/assets/KLIK-MP_long.png"
            alt="KLIK-MP"
            width={85}
            height={34}
            className="h-9 w-auto object-contain"
            priority
          />
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <HelpButton />
        {showExit ? (
          <button type="button" onClick={onExit} className="flex min-h-14 items-center gap-2 rounded-xl border border-primary/30 px-4 font-bold text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25">
            <LogOut aria-hidden="true" className="size-5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}

