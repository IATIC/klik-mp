import Link from "next/link";
import { ClipboardList, Scale, ShieldCheck, Tags } from "lucide-react";

const navigation = [
  { href: "/operator/intakes", label: "Intake", icon: ClipboardList },
  { href: "/operator/reference-prices", label: "Referensi harga", icon: Tags },
  { href: "/kiosk", label: "Buka kios", icon: Scale },
] as const;

export default function OperatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-svh bg-surface text-foreground">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto flex min-h-18 w-full max-w-[96rem] flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <Link href="/operator" className="flex items-center gap-3 rounded-md">
            <ShieldCheck aria-hidden="true" className="size-5 text-accent-green" />
            <span>
              <span className="block text-sm font-bold">KLIK-MP Operator</span>
              <span className="block text-[11px] text-white/60">
                Ruang pendampingan
              </span>
            </span>
          </Link>
          <nav aria-label="Navigasi operator" className="flex flex-wrap gap-1">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-white/72 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="border-b border-info/20 bg-info/5 px-5 py-2 text-center text-xs font-semibold text-info sm:px-8">
        Data operator masih berupa fixture development; persistence belum aktif.
      </div>
      {children}
    </div>
  );
}
