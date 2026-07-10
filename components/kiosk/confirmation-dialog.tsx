"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Kembali",
  tone = "default",
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(92vw,38rem)] rounded-3xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-deep-teal/45"
    >
      <div className="p-7 sm:p-9">
        <div className="flex items-start justify-between gap-5">
          <span className={`flex size-14 shrink-0 items-center justify-center rounded-full ${tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            <AlertTriangle aria-hidden="true" className="size-7" />
          </span>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="flex size-14 items-center justify-center rounded-full text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25">
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>
        <h2 id="confirmation-title" className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <p id="confirmation-description" className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="outline" size="kiosk" onClick={onClose}>{cancelLabel}</Button>
          <Button type="button" variant={tone === "danger" ? "danger" : "default"} size="kiosk" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}

