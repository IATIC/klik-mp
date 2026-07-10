"use client";

import { Check, HandCoins, History, MessageSquareMore, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { NegotiationSession } from "../types/contracts";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const statusLabel: Record<NegotiationSession["status"], string> = {
  OFFER_CREATED: "Menunggu persetujuan",
  NEGOTIATING: "Sedang dinegosiasikan",
  ACCEPTED: "Harga disepakati",
  REJECTED: "Penawaran ditolak",
  CANCELLED: "Negosiasi dibatalkan",
};

export type PricingNegotiationPanelProps = {
  session: NegotiationSession;
  onBuyerApprove?: () => void;
  onSellerAccept?: () => void;
  onSellerCounter?: () => void;
  onReject?: () => void;
};

export function PricingNegotiationPanel({
  session,
  onBuyerApprove,
  onSellerAccept,
  onSellerCounter,
  onReject,
}: PricingNegotiationPanelProps) {
  const terminal = ["ACCEPTED", "REJECTED", "CANCELLED"].includes(
    session.status,
  );

  return (
    <section
      aria-labelledby="pricing-title"
      className="rounded-2xl border border-border bg-background p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold text-primary">Harga transaksi</p>
          <h2 id="pricing-title" className="text-xl font-bold text-foreground">
            Persetujuan pembeli dan penjual
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Harga awal mengikuti referensi pasar dan faktor kualitas.
          </p>
        </div>
        <span className="w-fit rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
          {statusLabel[session.status]}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <PriceDatum label="Referensi" value={`${rupiah.format(session.referencePrice)}/kg`} />
        <PriceDatum label="Faktor kualitas" value={`${session.qualityFactor.toFixed(2)}×`} />
        <PriceDatum label="Harga berjalan" value={`${rupiah.format(session.currentUnitPrice)}/kg`} />
      </dl>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface p-4">
        <HandCoins aria-hidden="true" className="size-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Total {session.quantity} kg</p>
          <p className="font-bold text-foreground">
            {rupiah.format(session.currentTotalPrice)}
          </p>
        </div>
      </div>

      {!terminal ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {!session.buyerApproved ? (
            <Button onClick={onBuyerApprove} disabled={!onBuyerApprove}>
              <Check aria-hidden="true" /> Setujui sebagai pembeli
            </Button>
          ) : (
            <Button onClick={onSellerAccept} disabled={!onSellerAccept}>
              <Check aria-hidden="true" /> Penjual setuju
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onSellerCounter}
            disabled={!onSellerCounter || !session.buyerApproved}
          >
            <MessageSquareMore aria-hidden="true" /> Ajukan harga lain
          </Button>
          <Button variant="ghost" onClick={onReject} disabled={!onReject}>
            <X aria-hidden="true" /> Tolak penawaran
          </Button>
        </div>
      ) : null}

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <History aria-hidden="true" className="size-4 text-primary" /> Riwayat harga
        </h3>
        <ol className="mt-3 space-y-2">
          {session.history.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col justify-between gap-1 text-sm sm:flex-row"
            >
              <span className="text-muted-foreground">
                {entry.actor} · {entry.action.replaceAll("_", " ")}
              </span>
              <span className="font-semibold text-foreground">
                {rupiah.format(entry.unitPrice)}/kg
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PriceDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-bold text-foreground">{value}</dd>
    </div>
  );
}
