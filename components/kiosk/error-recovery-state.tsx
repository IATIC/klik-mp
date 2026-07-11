import { RefreshCw, TriangleAlert } from "lucide-react";

import { KioskButton } from "./kiosk-button";

export function ErrorRecoveryState({ title = "Belum berhasil", description, onRetry }: { title?: string; description: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-col items-center justify-center gap-5 text-center"><span className="flex size-24 items-center justify-center rounded-full bg-destructive/10 text-destructive"><TriangleAlert aria-hidden="true" className="size-12" /></span><h2 className="text-3xl font-extrabold">{title}</h2><p className="kiosk-body max-w-xl text-muted-foreground">{description}</p><KioskButton onClick={onRetry}><RefreshCw aria-hidden="true" /> Coba lagi</KioskButton></div>;
}
