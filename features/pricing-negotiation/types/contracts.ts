export type NegotiationActor = "BUYER" | "SELLER" | "OFFICER" | "SYSTEM";

export type NegotiationStatus =
  | "OFFER_CREATED"
  | "NEGOTIATING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export type NegotiationAction =
  | "INITIAL_OFFER_CREATED"
  | "BUYER_APPROVED"
  | "SELLER_ACCEPTED"
  | "SELLER_COUNTERED"
  | "BUYER_ACCEPTED_COUNTER"
  | "BUYER_REJECTED"
  | "SELLER_REJECTED"
  | "CANCELLED";

export type NegotiationHistoryEntry = {
  id: string;
  actor: NegotiationActor;
  action: NegotiationAction;
  unitPrice: number;
  totalPrice: number;
  occurredAt: string;
  note?: string;
};

export type NegotiationSession = {
  negotiationId: string;
  referencePrice: number;
  qualityFactor: number;
  quantity: number;
  initialOffer: number;
  currentUnitPrice: number;
  currentTotalPrice: number;
  buyerApproved: boolean;
  sellerApproved: boolean;
  status: NegotiationStatus;
  history: NegotiationHistoryEntry[];
};

export type AgreedPrice = {
  referencePrice: number;
  qualityFactor: number;
  initialOffer: number;
  finalUnitPrice: number;
  finalTotalPrice: number;
  negotiationStatus: "ACCEPTED" | "REJECTED" | "NEGOTIATING";
};

export type MarketPriceQuery = {
  commodityType: string;
  qualityGrade: string;
  market?: string;
  unit?: string;
};

export type MarketPriceReference = {
  referencePrice: number;
  commodityType: string;
  qualityGrade: string;
  market: string;
  unit: string;
  currency: "IDR";
  observedAt: string;
  source: string;
};

export interface MarketPriceAdapter {
  getReferencePrice(query: MarketPriceQuery): Promise<MarketPriceReference>;
}
