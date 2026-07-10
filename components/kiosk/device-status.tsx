import { Check, LoaderCircle, Radio, TriangleAlert, WifiOff, type LucideIcon } from "lucide-react";

import type { DeviceStatus as DeviceStatusValue } from "@/features/kiosk-flow";

const presentation: Record<DeviceStatusValue, { icon: LucideIcon; className: string }> = {
  idle: { icon: Radio, className: "bg-surface text-muted-foreground" },
  ready: { icon: Check, className: "bg-success/10 text-green-700" },
  reading: { icon: LoaderCircle, className: "bg-info/10 text-info" },
  capturing: { icon: LoaderCircle, className: "bg-info/10 text-info" },
  success: { icon: Check, className: "bg-success/10 text-green-700" },
  failed: { icon: TriangleAlert, className: "bg-destructive/10 text-destructive" },
  disconnected: { icon: WifiOff, className: "bg-neutral-200 text-neutral-700" },
};

export function DeviceStatus({ status, label, detail }: { status: DeviceStatusValue; label: string; detail?: string }) {
  const { icon: Icon, className } = presentation[status];
  return (
    <div aria-live="polite" role="status" className={`flex min-h-16 items-center gap-3 rounded-2xl px-4 py-3 ${className}`}>
      <Icon aria-hidden="true" className={`size-7 shrink-0 ${status === "reading" || status === "capturing" ? "animate-spin" : ""}`} />
      <span><strong className="block text-base">{label}</strong>{detail ? <span className="block text-sm opacity-80">{detail}</span> : null}</span>
    </div>
  );
}

