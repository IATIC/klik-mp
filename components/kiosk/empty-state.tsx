import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({ title, description, icon: Icon = Inbox }: { title: string; description: string; icon?: LucideIcon }) {
  return <div className="flex flex-col items-center justify-center gap-4 text-center"><span className="flex size-24 items-center justify-center rounded-full bg-surface-muted text-muted-foreground"><Icon aria-hidden="true" className="size-11" /></span><h2 className="text-3xl font-extrabold">{title}</h2><p className="kiosk-body max-w-xl text-muted-foreground">{description}</p></div>;
}
