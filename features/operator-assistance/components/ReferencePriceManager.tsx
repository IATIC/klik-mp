"use client";

import { Check, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ManagedReferencePrice } from "../types/contracts";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export type ReferencePriceManagerProps = {
  prices: ManagedReferencePrice[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onApprove?: (referenceId: string) => void;
};

export function ReferencePriceManager({
  prices,
  loading = false,
  error,
  onRefresh,
  onApprove,
}: ReferencePriceManagerProps) {
  return (
    <section aria-labelledby="reference-price-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Acuan pasar</p>
          <h2 id="reference-price-title" className="mt-1 text-xl font-bold text-foreground">
            Referensi harga
          </h2>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={!onRefresh || loading}>
          <RefreshCw aria-hidden="true" className={loading ? "animate-spin" : undefined} />
          {loading ? "Mengambil harga…" : "Ambil harga terbaru"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error">
          {error}
        </p>
      ) : null}

      <ul className="grid gap-3 lg:grid-cols-2">
        {prices.map((price) => (
          <li key={price.referenceId} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-foreground">{price.reference.commodityType}</p>
                <p className="text-xs text-muted-foreground">
                  {price.reference.qualityGrade} · {price.reference.market}
                </p>
              </div>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
                {price.status}
              </span>
            </div>
            <p className="mt-4 text-lg font-bold text-foreground">
              {rupiah.format(price.reference.referencePrice)}/{price.reference.unit}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Sumber: {price.reference.source}</p>
            {price.status === "DRAFT" ? (
              <Button className="mt-4" onClick={() => onApprove?.(price.referenceId)} disabled={!onApprove}>
                <Check aria-hidden="true" /> Setujui referensi
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
