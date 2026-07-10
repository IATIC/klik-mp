import Link from "next/link";
import { ArrowRight, FileText, Plus, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { StoredIntakeSession } from "../server/session-store";

const statusLabel = {
  DRAFT: "Baru",
  IDENTITY_VERIFIED: "Identitas terverifikasi",
  MEMBERSHIP_READY: "Keanggotaan siap",
  COMMODITY_CAPTURED: "Data komoditas tersedia",
  COMMODITY_ASSESSED: "Assessment selesai",
  OFFER_CREATED: "Penawaran dibuat",
  NEGOTIATING: "Negosiasi",
  AGREED: "Harga disepakati",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
} as const;

export function IntakeSessionDirectory({
  sessions,
  audience,
}: {
  sessions: StoredIntakeSession[];
  audience: "kiosk" | "operator";
}) {
  const basePath = audience === "kiosk" ? "/kiosk/intake" : "/operator/intakes";

  return (
    <section aria-labelledby="session-directory-title" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            {audience === "kiosk" ? "Beranda kios" : "Monitoring petugas"}
          </p>
          <h1 id="session-directory-title" className="mt-2 text-3xl font-bold tracking-[-0.04em]">
            {audience === "kiosk" ? "Sesi penerimaan" : "Intake komoditas"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Buat sesi baru atau lanjutkan sesi yang sudah terdaftar di server.
          </p>
        </div>
        {audience === "kiosk" ? (
          <Button asChild size="lg">
            <Link href="/kiosk/intake/new" prefetch={false}>
              <Plus aria-hidden="true" /> Buat sesi baru
            </Link>
          </Button>
        ) : null}
      </div>

      {sessions.length === 0 ? (
        <div className="border-y border-border py-12 text-center">
          <FileText aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-bold">Belum ada sesi</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sesi hanya dibuat melalui entry point kios.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {sessions.map(({ session, updatedAt }) => {
            const receipt = session.status === "COMPLETED";
            const href =
              audience === "kiosk" && receipt
                ? `/kiosk/intake/${session.sessionId}/receipt`
                : `${basePath}/${session.sessionId}`;
            return (
              <li key={session.sessionId}>
                <Link
                  href={href}
                  className="group grid gap-3 py-5 outline-none hover:bg-surface/60 focus-visible:bg-surface/60 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-3"
                >
                  <span>
                    <span className="block font-bold">{session.sessionId}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Diperbarui {new Date(updatedAt).toLocaleString("id-ID")}
                    </span>
                  </span>
                  <span className="w-fit rounded-full bg-surface px-3 py-1 text-xs font-bold text-primary">
                    {statusLabel[session.status]}
                  </span>
                  {receipt ? (
                    <ReceiptText aria-hidden="true" className="size-4 text-primary" />
                  ) : (
                    <ArrowRight aria-hidden="true" className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function IntakeSessionDetail({ stored }: { stored: StoredIntakeSession }) {
  const { session } = stored;
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Detail sesi</p>
        <h1 className="mt-2 text-2xl font-bold">{session.sessionId}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Status server: {statusLabel[session.status]}</p>
      </div>
      <dl className="divide-y divide-border border-y border-border text-sm">
        <Detail label="Penjual" value={session.seller?.sellerId ?? "Belum diverifikasi"} />
        <Detail label="Berat net" value={session.capture ? `${session.capture.netWeight} kg` : "Belum tersedia"} />
        <Detail label="Komoditas" value={session.assessment?.commodityType ?? "Belum tersedia"} />
        <Detail label="Audit event" value={String(session.auditTrail.length)} />
      </dl>
      {session.status === "COMPLETED" ? (
        <Button asChild>
          <Link href={`/kiosk/intake/${session.sessionId}/receipt`}>Lihat receipt</Link>
        </Button>
      ) : null}
    </section>
  );
}

export function IntakeReceiptView({ stored }: { stored: StoredIntakeSession }) {
  const completion = stored.completion;
  if (!completion) return null;
  return (
    <section className="mx-auto max-w-2xl border border-border bg-background p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Bukti penerimaan</p>
      <h1 className="mt-2 text-2xl font-bold">{completion.receipt.receiptNumber}</h1>
      <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
        <Detail label="Transaction ID" value={completion.transaction.transactionId} />
        <Detail label="Komoditas" value={completion.transaction.commodityType} />
        <Detail label="Berat net" value={`${completion.transaction.netWeight} kg`} />
        <Detail label="Harga total" value={formatRupiah(completion.transaction.finalTotalPrice)} />
        <Detail label="Diterima penjual" value={formatRupiah(completion.receipt.sellerPayout)} />
      </dl>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/kiosk">Kembali ke beranda kios</Link>
      </Button>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
