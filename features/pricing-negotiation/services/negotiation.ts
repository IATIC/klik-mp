import {
  counterofferSchema,
  createNegotiationSchema,
  negotiationDecisionSchema,
  type CounterofferInput,
  type CreateNegotiationInput,
  type NegotiationDecisionInput,
} from "../schemas/pricing";
import type {
  AgreedPrice,
  NegotiationAction,
  NegotiationActor,
  NegotiationHistoryEntry,
  NegotiationSession,
} from "../types/contracts";

const TERMINAL_STATUSES = new Set(["ACCEPTED", "REJECTED", "CANCELLED"]);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function assertOpen(session: NegotiationSession) {
  if (TERMINAL_STATUSES.has(session.status)) {
    throw new Error(`Negosiasi berstatus ${session.status} tidak dapat diubah.`);
  }
}

function historyEntry(
  input: NegotiationDecisionInput,
  actor: NegotiationActor,
  action: NegotiationAction,
  unitPrice: number,
  quantity: number,
): NegotiationHistoryEntry {
  return {
    id: input.historyId,
    actor,
    action,
    unitPrice,
    totalPrice: roundMoney(unitPrice * quantity),
    occurredAt: input.occurredAt,
    ...(input.note ? { note: input.note } : {}),
  };
}

function append(
  session: NegotiationSession,
  entry: NegotiationHistoryEntry,
): NegotiationSession {
  if (session.history.some(({ id }) => id === entry.id)) {
    throw new Error(`Riwayat negosiasi ${entry.id} sudah tercatat.`);
  }

  return { ...session, history: [...session.history, entry] };
}

export function calculateOffer(
  referencePrice: number,
  qualityFactor: number,
) {
  return roundMoney(referencePrice * qualityFactor);
}

export function createNegotiation(
  unsafeInput: CreateNegotiationInput,
): NegotiationSession {
  const input = createNegotiationSchema.parse(unsafeInput);
  const initialOffer = calculateOffer(input.referencePrice, input.qualityFactor);
  const totalPrice = roundMoney(initialOffer * input.quantity);

  return {
    negotiationId: input.negotiationId,
    referencePrice: input.referencePrice,
    qualityFactor: input.qualityFactor,
    quantity: input.quantity,
    initialOffer,
    currentUnitPrice: initialOffer,
    currentTotalPrice: totalPrice,
    buyerApproved: false,
    sellerApproved: false,
    status: "OFFER_CREATED",
    history: [
      {
        id: `${input.negotiationId}:initial`,
        actor: "OFFICER",
        action: "INITIAL_OFFER_CREATED",
        unitPrice: initialOffer,
        totalPrice,
        occurredAt: input.occurredAt,
      },
    ],
  };
}

export function approveInitialOfferByBuyer(
  session: NegotiationSession,
  unsafeInput: NegotiationDecisionInput,
) {
  assertOpen(session);
  if (session.status !== "OFFER_CREATED") {
    throw new Error("Pembeli hanya dapat menyetujui penawaran awal.");
  }
  const input = negotiationDecisionSchema.parse(unsafeInput);
  return append(
    { ...session, buyerApproved: true },
    historyEntry(
      input,
      "BUYER",
      "BUYER_APPROVED",
      session.currentUnitPrice,
      session.quantity,
    ),
  );
}

export function acceptBySeller(
  session: NegotiationSession,
  unsafeInput: NegotiationDecisionInput,
) {
  assertOpen(session);
  if (!session.buyerApproved) {
    throw new Error("Persetujuan pembeli wajib ada sebelum penjual menerima harga.");
  }
  const input = negotiationDecisionSchema.parse(unsafeInput);
  return append(
    { ...session, sellerApproved: true, status: "ACCEPTED" },
    historyEntry(
      input,
      "SELLER",
      "SELLER_ACCEPTED",
      session.currentUnitPrice,
      session.quantity,
    ),
  );
}

export function counterBySeller(
  session: NegotiationSession,
  unsafeInput: CounterofferInput,
) {
  assertOpen(session);
  if (!session.buyerApproved) {
    throw new Error("Penawaran awal harus disetujui pembeli sebelum dinegosiasikan.");
  }
  const input = counterofferSchema.parse(unsafeInput);
  const totalPrice = roundMoney(input.unitPrice * session.quantity);
  return append(
    {
      ...session,
      currentUnitPrice: input.unitPrice,
      currentTotalPrice: totalPrice,
      buyerApproved: false,
      sellerApproved: true,
      status: "NEGOTIATING",
    },
    historyEntry(
      input,
      "SELLER",
      "SELLER_COUNTERED",
      input.unitPrice,
      session.quantity,
    ),
  );
}

export function acceptCounterByBuyer(
  session: NegotiationSession,
  unsafeInput: NegotiationDecisionInput,
) {
  assertOpen(session);
  if (session.status !== "NEGOTIATING" || !session.sellerApproved) {
    throw new Error("Tidak ada counteroffer penjual yang dapat disetujui.");
  }
  const input = negotiationDecisionSchema.parse(unsafeInput);
  return append(
    { ...session, buyerApproved: true, status: "ACCEPTED" },
    historyEntry(
      input,
      "BUYER",
      "BUYER_ACCEPTED_COUNTER",
      session.currentUnitPrice,
      session.quantity,
    ),
  );
}

export function rejectNegotiation(
  session: NegotiationSession,
  actor: "BUYER" | "SELLER",
  unsafeInput: NegotiationDecisionInput,
) {
  assertOpen(session);
  const input = negotiationDecisionSchema.parse(unsafeInput);
  const action = actor === "BUYER" ? "BUYER_REJECTED" : "SELLER_REJECTED";
  return append(
    { ...session, buyerApproved: false, sellerApproved: false, status: "REJECTED" },
    historyEntry(
      input,
      actor,
      action,
      session.currentUnitPrice,
      session.quantity,
    ),
  );
}

export function cancelNegotiation(
  session: NegotiationSession,
  unsafeInput: NegotiationDecisionInput,
) {
  if (session.status === "CANCELLED") return session;
  assertOpen(session);
  const input = negotiationDecisionSchema.parse(unsafeInput);
  return append(
    { ...session, buyerApproved: false, sellerApproved: false, status: "CANCELLED" },
    historyEntry(
      input,
      "OFFICER",
      "CANCELLED",
      session.currentUnitPrice,
      session.quantity,
    ),
  );
}

export function toAgreedPrice(session: NegotiationSession): AgreedPrice {
  const negotiationStatus =
    session.status === "ACCEPTED"
      ? "ACCEPTED"
      : session.status === "REJECTED"
        ? "REJECTED"
        : "NEGOTIATING";

  return {
    referencePrice: session.referencePrice,
    qualityFactor: session.qualityFactor,
    initialOffer: session.initialOffer,
    finalUnitPrice: session.currentUnitPrice,
    finalTotalPrice: session.currentTotalPrice,
    negotiationStatus,
  };
}
