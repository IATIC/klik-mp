"use client";

import { useState } from "react";

import { approveReferencePrice } from "../services/operator";
import type { ManagedReferencePrice } from "../types/contracts";
import { ReferencePriceManager } from "./ReferencePriceManager";

export type ReferencePriceWorkspaceProps = {
  initialPrices: ManagedReferencePrice[];
};

export function ReferencePriceWorkspace({
  initialPrices,
}: ReferencePriceWorkspaceProps) {
  const [prices, setPrices] = useState(initialPrices);
  const [error, setError] = useState<string | undefined>();

  function approve(referenceId: string) {
    setError(undefined);
    try {
      setPrices((current) =>
        current.map((price) =>
          price.referenceId === referenceId
            ? approveReferencePrice(price, {
                auditId: `approval-${globalThis.crypto.randomUUID()}`,
                actorId: "operator-demo",
                occurredAt: new Date().toISOString(),
              })
            : price,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Approval gagal.");
    }
  }

  return (
    <ReferencePriceManager
      prices={prices}
      error={error}
      onApprove={approve}
    />
  );
}
