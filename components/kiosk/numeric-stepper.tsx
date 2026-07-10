import { Minus, Plus } from "lucide-react";

export function NumericStepper({ value, onChange, step = 10_000, min = 0, max = Number.MAX_SAFE_INTEGER, label }: { value: number; onChange: (value: number) => void; step?: number; min?: number; max?: number; label: string }) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div>
      <label htmlFor="counteroffer" className="mb-2 block text-base font-bold">{label}</label>
      <div className="grid grid-cols-[4rem_1fr_4rem] gap-3">
        <button type="button" aria-label="Kurangi harga" onClick={() => onChange(clamp(value - step))} className="flex min-h-16 items-center justify-center rounded-xl border-2 border-primary text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"><Minus aria-hidden="true" /></button>
        <input id="counteroffer" inputMode="numeric" type="number" min={min} max={max} step={step} value={value || ""} onChange={(event) => onChange(clamp(Number(event.target.value)))} className="min-w-0 rounded-xl border-2 border-border bg-background px-4 text-center text-2xl font-extrabold outline-none focus:border-primary focus:ring-4 focus:ring-ring/15" />
        <button type="button" aria-label="Tambah harga" onClick={() => onChange(clamp(value + step))} className="flex min-h-16 items-center justify-center rounded-xl border-2 border-primary text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"><Plus aria-hidden="true" /></button>
      </div>
    </div>
  );
}

