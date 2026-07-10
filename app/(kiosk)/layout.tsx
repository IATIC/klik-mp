import Link from "next/link";
import { CircleHelp, Store } from "lucide-react";

export default function KioskLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-svh bg-surface text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-18 w-full max-w-[96rem] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-deep-teal text-white">
              <Store aria-hidden="true" className="size-4.5" />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[-0.01em]">
                KLIK-MP
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Mode kios
              </span>
            </span>
          </Link>
          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CircleHelp aria-hidden="true" className="size-4" />
            Petugas siap mendampingi
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
