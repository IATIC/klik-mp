import { FileText } from "lucide-react";
import type { SavingsDocument } from "../types/savings";
import { formatRupiah } from "../validations/savings-validation";
import { SavingsStatusBadge } from "./savings-status-badge";

type InvoicePreviewProps = {
  document: SavingsDocument;
};

export function InvoicePreview({ document }: InvoicePreviewProps) {
  return (
    <section className="w-full rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold">
        <FileText aria-hidden="true" className="size-5 text-primary" />
        {document.documentTitle}
      </h2>
      <div className="divide-y divide-border">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground sm:text-base">No. Dokumen</span>
          <span className="text-sm font-extrabold sm:text-base">
            {document.documentNumber}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground sm:text-base">Nama Anggota</span>
          <span className="text-sm font-extrabold sm:text-base">
            {document.memberName}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground sm:text-base">Jenis</span>
          <span className="text-sm font-extrabold sm:text-base">
            {document.documentTitle}
          </span>
        </div>
        {document.period && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground sm:text-base">Periode</span>
            <span className="text-sm font-extrabold sm:text-base">{document.period}</span>
          </div>
        )}
        {document.paymentMode && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground sm:text-base">
              Jenis Pembayaran
            </span>
            <span className="text-sm font-extrabold sm:text-base">
              {document.paymentMode === "FULL" ? "Penuh" : "Sebagian"}
            </span>
          </div>
        )}
        {document.remainingAfterPayment !== undefined && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground sm:text-base">
              Sisa tagihan setelah pembayaran
            </span>
            <span className="text-sm font-extrabold sm:text-base">
              {formatRupiah(document.remainingAfterPayment)}
            </span>
          </div>
        )}
        {document.details &&
          Object.entries(document.details).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground sm:text-base">{key}</span>
              <span className="text-sm font-extrabold sm:text-base">{val}</span>
            </div>
          ))}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground sm:text-base">
            Tanggal & Waktu
          </span>
          <span className="text-sm font-extrabold sm:text-base">
            {document.createdAt}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground sm:text-base">Status</span>
          <SavingsStatusBadge status={document.status} />
        </div>
        <div className="flex items-center justify-between py-3 pt-4">
          <span className="text-lg font-extrabold sm:text-xl">Nominal</span>
          <span className="text-2xl font-extrabold text-primary sm:text-3xl">
            {formatRupiah(document.amount)}
          </span>
        </div>
      </div>
    </section>
  );
}
