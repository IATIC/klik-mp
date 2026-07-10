import { Check } from "lucide-react";

type KioskProgressProps = {
  label: string;
  current: number;
  total: number;
};

export function KioskProgress({ label, current, total }: KioskProgressProps) {
  return (
    <div className="shrink-0 border-b border-border bg-background px-5 py-3 sm:px-9 lg:px-12">
      <p className="mb-2 text-sm font-bold sm:text-base">
        {label} <span className="font-medium text-primary">• Langkah {current} dari {total}</span>
      </p>
      <ol aria-label={`${label}, langkah ${current} dari ${total}`} className="grid grid-flow-col gap-1.5">
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={step} aria-current={active ? "step" : undefined} className={`h-2 rounded-full ${step <= current ? "bg-primary" : "bg-border"}`}>
              <span className="sr-only">{done ? <><Check /> Selesai</> : active ? "Aktif" : "Belum dimulai"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

