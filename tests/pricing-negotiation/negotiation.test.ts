import { describe, expect, it, vi } from "vitest";

import {
  HttpMarketPriceAdapter,
  acceptBySeller,
  acceptCounterByBuyer,
  approveInitialOfferByBuyer,
  calculateOffer,
  counterBySeller,
  createLocalMarketPriceAdapter,
  createNegotiation,
  rejectNegotiation,
  toAgreedPrice,
} from "@/features/pricing-negotiation";

const now = "2026-07-10T08:00:00.000Z";

function decision(historyId: string) {
  return { historyId, occurredAt: now };
}

describe("pricing negotiation", () => {
  it("menghitung penawaran awal dari referensi dan faktor kualitas", () => {
    expect(calculateOffer(10_000, 0.85)).toBe(8_500);
    const session = createNegotiation({
      negotiationId: "nego-1",
      referencePrice: 10_000,
      qualityFactor: 0.85,
      quantity: 100,
      occurredAt: now,
    });
    expect(session.initialOffer).toBe(8_500);
    expect(session.currentTotalPrice).toBe(850_000);
    expect(session.status).toBe("OFFER_CREATED");
  });

  it("menjadi ACCEPTED hanya setelah pembeli dan penjual menyetujui harga sama", () => {
    const offered = createNegotiation({
      negotiationId: "nego-2",
      referencePrice: 10_000,
      qualityFactor: 1,
      quantity: 10,
      occurredAt: now,
    });
    expect(() => acceptBySeller(offered, decision("h-seller"))).toThrow(
      "Persetujuan pembeli wajib ada",
    );

    const buyerApproved = approveInitialOfferByBuyer(
      offered,
      decision("h-buyer"),
    );
    const accepted = acceptBySeller(buyerApproved, decision("h-seller"));
    expect(accepted.status).toBe("ACCEPTED");
    expect(accepted.buyerApproved).toBe(true);
    expect(accepted.sellerApproved).toBe(true);
    expect(toAgreedPrice(accepted).negotiationStatus).toBe("ACCEPTED");
  });

  it("mencatat counteroffer penjual dan persetujuan pembeli dalam riwayat", () => {
    const offered = createNegotiation({
      negotiationId: "nego-3",
      referencePrice: 10_000,
      qualityFactor: 0.9,
      quantity: 20,
      occurredAt: now,
    });
    const approved = approveInitialOfferByBuyer(offered, decision("h-1"));
    const countered = counterBySeller(approved, {
      ...decision("h-2"),
      unitPrice: 9_500,
      note: "Kualitas panen pilihan",
    });
    expect(countered.status).toBe("NEGOTIATING");
    expect(countered.buyerApproved).toBe(false);
    expect(countered.history.at(-1)?.action).toBe("SELLER_COUNTERED");

    const accepted = acceptCounterByBuyer(countered, decision("h-3"));
    expect(accepted.status).toBe("ACCEPTED");
    expect(accepted.currentTotalPrice).toBe(190_000);
    expect(accepted.history).toHaveLength(4);
  });

  it("mengunci negosiasi setelah ditolak", () => {
    const offered = createNegotiation({
      negotiationId: "nego-4",
      referencePrice: 10_000,
      qualityFactor: 1,
      quantity: 10,
      occurredAt: now,
    });
    const rejected = rejectNegotiation(offered, "SELLER", decision("h-r"));
    expect(rejected.status).toBe("REJECTED");
    expect(() =>
      approveInitialOfferByBuyer(rejected, decision("h-late")),
    ).toThrow("tidak dapat diubah");
  });
});

describe("market price HTTP adapter", () => {
  it("memanggil proxy lokal dengan POST tanpa fallback mock", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          referencePrice: 12_000,
          commodityType: "Gabah",
          qualityGrade: "A",
          market: "Pasar Induk",
          unit: "kg",
          currency: "IDR",
          observedAt: now,
          source: "Dinas",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const adapter = createLocalMarketPriceAdapter(fetcher);
    const result = await adapter.getReferencePrice({
      commodityType: "Gabah",
      qualityGrade: "A",
      unit: "kg",
    });

    expect(result.referencePrice).toBe(12_000);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/devices/market-price",
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body))).toMatchObject({
      commodityType: "Gabah",
      qualityGrade: "A",
    });
  });

  it("meneruskan kegagalan HTTP dan tidak mengarang harga", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 503 }));
    const adapter = new HttpMarketPriceAdapter({
      endpoint: "https://harga.example.test/reference",
      fetcher,
    });
    await expect(
      adapter.getReferencePrice({ commodityType: "Jagung", qualityGrade: "B" }),
    ).rejects.toThrow("HTTP 503");
  });
});
