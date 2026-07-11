"use client";

import { TimerReset } from "lucide-react";

import { ConfirmationDialog } from "./confirmation-dialog";

export function SessionTimeoutDialog({ open, onContinue, onEnd }: { open: boolean; onContinue: () => void; onEnd: () => void }) {
  return <ConfirmationDialog open={open} title="Masih ingin melanjutkan?" description="Sesi ini akan berakhir agar data Anda tetap aman." confirmLabel="Lanjutkan sesi" cancelLabel="Akhiri sesi" onConfirm={onContinue} onClose={onEnd} />;
}

export { TimerReset };
