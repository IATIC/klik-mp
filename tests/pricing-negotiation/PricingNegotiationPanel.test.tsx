import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  PricingNegotiationPanel,
  createNegotiation,
} from "@/features/pricing-negotiation";

describe("PricingNegotiationPanel", () => {
  it("menampilkan rincian harga dan mengirim persetujuan pembeli", async () => {
    const user = userEvent.setup();
    const onBuyerApprove = vi.fn();
    const session = createNegotiation({
      negotiationId: "neg-ui",
      referencePrice: 10_000,
      qualityFactor: 0.9,
      quantity: 50,
      occurredAt: "2026-07-10T08:00:00.000Z",
    });

    render(
      <PricingNegotiationPanel
        session={session}
        onBuyerApprove={onBuyerApprove}
      />,
    );

    expect(screen.getByText("Persetujuan pembeli dan penjual")).toBeInTheDocument();
    expect(screen.getByText(/Rp.*450\.000/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /setujui sebagai pembeli/i }));
    expect(onBuyerApprove).toHaveBeenCalledOnce();
  });
});
