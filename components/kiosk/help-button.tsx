"use client";

import { CircleHelp, Headphones } from "lucide-react";
import { useState } from "react";

import { ConfirmationDialog } from "./confirmation-dialog";

export function HelpButton() {
  const [open, setOpen] = useState(false);
  const [called, setCalled] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-14 items-center gap-3 rounded-xl border border-primary/30 bg-background px-4 text-sm font-bold text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 sm:px-5 sm:text-base"
      >
        {called ? <Headphones aria-hidden="true" className="size-6" /> : <CircleHelp aria-hidden="true" className="size-6" />}
        <span className="hidden sm:inline">{called ? "Petugas dipanggil" : "Butuh bantuan?"}</span>
      </button>
      <ConfirmationDialog
        open={open}
        title={called ? "Petugas sedang menuju kios" : "Panggil petugas pendamping?"}
        description={called ? "Mohon tetap berada di depan kios. Petugas sudah menerima permintaan bantuan demo ini." : "Petugas dapat membantu posisi jari, kamera, pengisian data, atau proses komoditas."}
        confirmLabel={called ? "Tutup" : "Panggil petugas"}
        cancelLabel="Batal"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setCalled(true);
          setOpen(false);
        }}
      />
    </>
  );
}

