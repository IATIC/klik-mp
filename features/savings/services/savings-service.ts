import { waitForMock } from "@/lib/services/mock-utils";
import { SAVINGS_CONSTANTS, DOCUMENT_TITLES, WITHDRAWAL_REQUIRES_APPROVAL } from "../constants/savings-constants";
import {
  createMockSummary,
  createMockMandatoryInvoices,
  createMockTransactions,
  MOCK_MEMBER_NAME,
  MOCK_MEMBER_NUMBER,
} from "../mocks/savings-mock-data";
import type {
  SavingsService,
  MandatoryPaymentInput,
  PrincipalPaymentInput,
  SavingsDocument,
  VoluntaryDepositInput,
  VoluntaryWithdrawalInput,
} from "../types/savings";

let documentCounter = 0;

function generateDocumentNumber(prefix: string): string {
  documentCounter++;
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(documentCounter).padStart(3, "0");
  return `${prefix}-${date}-${seq}`;
}

function formatTimestamp(): string {
  return new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export class MockSavingsService implements SavingsService {
  async getSummary(_memberId: string) {
    void _memberId;
    await waitForMock(280);
    return createMockSummary();
  }

  async getTransactions(_memberId: string) {
    void _memberId;
    await waitForMock(200);
    return createMockTransactions(5);
  }

  async getMandatoryInvoices(_memberId: string) {
    void _memberId;
    await waitForMock(250);
    return createMockMandatoryInvoices();
  }

  async getMemberInfo(memberId: string) {
    await waitForMock(150);
    return {
      name: MOCK_MEMBER_NAME,
      number: MOCK_MEMBER_NUMBER,
      memberId,
    };
  }

  async createPrincipalPaymentInvoice(input: PrincipalPaymentInput) {
    await waitForMock(400);
    const doc: SavingsDocument = {
      documentNumber: generateDocumentNumber("SMP"),
      documentType: "INVOICE",
      documentTitle: DOCUMENT_TITLES.PRINCIPAL_INVOICE,
      savingsType: "PRINCIPAL",
      memberName: input.memberName,
      memberNumber: input.memberNumber,
      amount: SAVINGS_CONSTANTS.PRINCIPAL_AMOUNT,
      status: "PENDING_PAYMENT",
      createdAt: formatTimestamp(),
      printedCount: 0,
    };
    return doc;
  }

  async createMandatoryPaymentInvoice(input: MandatoryPaymentInput) {
    await waitForMock(400);
    const remainingAfterPayment =
      input.paymentMode === "FULL"
        ? 0
        : Math.max(0, input.amount - (input.amount > 0 ? 0 : 0));

    const doc: SavingsDocument = {
      documentNumber: generateDocumentNumber("SMW"),
      documentType: "INVOICE",
      documentTitle: DOCUMENT_TITLES.MANDATORY_INVOICE,
      savingsType: "MANDATORY",
      memberName: input.memberName,
      memberNumber: input.memberNumber,
      amount: input.amount,
      status: "PENDING_PAYMENT",
      createdAt: formatTimestamp(),
      printedCount: 0,
      remainingAfterPayment,
      paymentMode: input.paymentMode,
      period: input.period,
    };

    // Calculate actual remaining after payment
    doc.remainingAfterPayment = Math.max(0, input.amount);

    return doc;
  }

  async createVoluntaryDepositInvoice(input: VoluntaryDepositInput) {
    await waitForMock(400);
    const doc: SavingsDocument = {
      documentNumber: generateDocumentNumber("SMS"),
      documentType: "INVOICE",
      documentTitle: DOCUMENT_TITLES.VOLUNTARY_DEPOSIT_INVOICE,
      savingsType: "VOLUNTARY",
      memberName: input.memberName,
      memberNumber: input.memberNumber,
      amount: input.amount,
      status: "PENDING_PAYMENT",
      createdAt: formatTimestamp(),
      printedCount: 0,
    };
    return doc;
  }

  async submitVoluntaryWithdrawal(input: VoluntaryWithdrawalInput) {
    await waitForMock(450);
    const status = WITHDRAWAL_REQUIRES_APPROVAL ? "PENDING_APPROVAL" : "APPROVED";
    const doc: SavingsDocument = {
      documentNumber: generateDocumentNumber("SMPC"),
      documentType: "WITHDRAWAL_RECEIPT",
      documentTitle: DOCUMENT_TITLES.VOLUNTARY_WITHDRAWAL_RECEIPT,
      savingsType: "VOLUNTARY",
      memberName: input.memberName,
      memberNumber: input.memberNumber,
      amount: input.amount,
      status,
      createdAt: formatTimestamp(),
      printedCount: 0,
      details: {
        Alasan: input.reason,
      },
    };
    return doc;
  }
}

export const savingsService: SavingsService = new MockSavingsService();
