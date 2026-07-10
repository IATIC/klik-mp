import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type LargeActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent?: boolean;
  onClick?: () => void;
};

export function LargeActionCard({ title, description, href, icon: Icon, accent = false, onClick }: LargeActionCardProps) {
  return (
    <Link onClick={onClick} href={href} className={`group flex min-h-52 flex-col items-center justify-center rounded-3xl border-2 p-7 text-center outline-none transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-ring/25 sm:min-h-64 ${accent ? "border-primary bg-primary text-white" : "border-border bg-background hover:border-primary/50"}`}>
      <Icon aria-hidden="true" className={`size-14 sm:size-16 ${accent ? "text-white" : "text-primary"}`} strokeWidth={1.7} />
      <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">{title}</h2>
      <p className={`mt-2 max-w-sm text-base leading-6 sm:text-lg ${accent ? "text-white/80" : "text-muted-foreground"}`}>{description}</p>
    </Link>
  );
}

