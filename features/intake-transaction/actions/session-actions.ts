"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import type { AgreedPrice } from "@/features/pricing-negotiation";

import {
  approveFinalIntake,
  cancelIntake,
  completeIntake,
  markMembershipReady,
  markNegotiating,
  recordAgreement,
  recordCommodityAssessment,
  recordCommodityCapture,
  recordOfferCreated,
  recordVerifiedSeller,
  rejectIntake,
} from "../services/intake";
import {
  requireServerIntakeSession,
  saveServerIntakeCompletion,
  saveServerIntakeSession,
} from "../server/session-store";
import type {
  CommodityAssessment,
  CommodityCapture,
  IntakeSession,
  VerifiedSeller,
} from "../types/contracts";

function context(action: string, actorId = "kiosk-session") {
  return {
    auditId: `${action}-${randomUUID()}`,
    actorId,
    occurredAt: new Date().toISOString(),
  };
}

function currentSession(sessionId: string) {
  return requireServerIntakeSession(sessionId).session;
}

function persist(session: IntakeSession) {
  saveServerIntakeSession(session);
  revalidatePath(`/kiosk/intake/${session.sessionId}`);
  revalidatePath("/kiosk");
  revalidatePath("/operator");
  revalidatePath("/operator/intakes");
  return session;
}

export async function verifySellerForSession(
  sessionId: string,
  seller: VerifiedSeller,
) {
  const identified = recordVerifiedSeller(
    currentSession(sessionId),
    seller,
    context("identity-verified"),
  );
  return persist(
    markMembershipReady(identified, context("membership-ready")),
  );
}

export async function captureCommodityForSession(
  sessionId: string,
  capture: CommodityCapture,
) {
  return persist(
    recordCommodityCapture(
      currentSession(sessionId),
      capture,
      context("commodity-captured"),
    ),
  );
}

export async function assessCommodityForSession(
  sessionId: string,
  assessment: CommodityAssessment,
) {
  return persist(
    recordCommodityAssessment(
      currentSession(sessionId),
      assessment,
      context("commodity-assessed"),
    ),
  );
}

export async function createOfferForSession(
  sessionId: string,
  price: AgreedPrice,
) {
  return persist(
    recordOfferCreated(
      currentSession(sessionId),
      price,
      context("offer-created"),
    ),
  );
}

export async function beginNegotiationForSession(sessionId: string) {
  return persist(
    markNegotiating(currentSession(sessionId), context("negotiating")),
  );
}

export async function agreePriceForSession(
  sessionId: string,
  price: AgreedPrice,
) {
  return persist(
    recordAgreement(
      currentSession(sessionId),
      price,
      context("price-agreed"),
    ),
  );
}

export async function rejectOfferForSession(sessionId: string) {
  return persist(
    rejectIntake(currentSession(sessionId), context("offer-rejected")),
  );
}

export async function approveIntakeForSession(
  sessionId: string,
  party: "BUYER" | "SELLER",
) {
  return persist(
    approveFinalIntake(currentSession(sessionId), {
      ...context(`${party.toLowerCase()}-approval`),
      party,
    }),
  );
}

export async function completeIntakeForSession(
  sessionId: string,
  savingsRequiredAmount: number,
  directPaymentReceived: boolean,
) {
  const completion = await completeIntake(
    currentSession(sessionId),
    { async completeAtomically() {} },
    {
      ...context("intake-completed"),
      transactionId: `transaction-${randomUUID()}`,
      receiptNumber: `receipt-${randomUUID()}`,
      stockReceiptId: `stock-${randomUUID()}`,
    },
    { savingsRequiredAmount, directPaymentReceived },
  );
  saveServerIntakeCompletion(completion);
  revalidatePath(`/kiosk/intake/${sessionId}`);
  revalidatePath(`/kiosk/intake/${sessionId}/receipt`);
  revalidatePath("/operator/intakes");
  return completion;
}

export async function cancelIntakeForSession(sessionId: string) {
  return persist(
    cancelIntake(currentSession(sessionId), context("intake-cancelled")),
  );
}
