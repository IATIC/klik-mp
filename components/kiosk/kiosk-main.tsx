import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Remaining screen area. Content is designed to fit this viewport, not scroll it. */
export function KioskMain({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "min-h-0 flex-1 overflow-hidden px-8 py-6 sm:px-12 lg:px-16 xl:px-20",
        className,
      )}
      {...props}
    />
  );
}
