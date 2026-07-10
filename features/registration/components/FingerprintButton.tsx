"use client";

import { useState } from "react";
import { Fingerprint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onScan: () => void;
  disabled?: boolean;
};

export function FingerprintButton({ onScan, disabled }: Props) {
  const [scanning, setScanning] = useState(false);

  const handleClick = async () => {
    setScanning(true);
    setTimeout(() => {
      onScan();
      setScanning(false);
    }, 1200);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={disabled || scanning}
      onClick={handleClick}
      className="w-full gap-3 rounded-xl py-5 text-base"
    >
      {scanning ? (
        <Loader2 aria-hidden="true" className="size-5 animate-spin" />
      ) : (
        <Fingerprint aria-hidden="true" className="size-5" />
      )}
      {scanning ? "Memindai sidik jari…" : "Gunakan sidik jari"}
    </Button>
  );
}
