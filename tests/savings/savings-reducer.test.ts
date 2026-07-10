import { describe, expect, it } from "vitest";
import {
  savingsFlowReducer,
  initialSavingsFlowState,
} from "@/features/savings/context/savings-flow-context";
import type { SavingsDocument, SavingsSummary, SavingsTransaction, MandatoryInvoice } from "@/features/savings";

describe("savingsFlowReducer", () => {
  it("mengembalikan initial state untuk action RESET_FLOW", () => {
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "RESET_FLOW",
    });
    expect(state).toEqual(initialSavingsFlowState);
  });

  it("menangani SET_SUMMARY", () => {
    const summary: SavingsSummary = {
      principal: { amount: 500_000, status: "UNPAID", paidAt: null, activeInvoiceNumber: null },
      mandatory: { outstandingAmount: 60_000, activePeriod: "Juli 2026", status: "UNPAID", totalBills: 100_000, paidAmount: 40_000 },
      voluntary: { availableBalance: 1_200_000, totalDeposits: 1_500_000, totalWithdrawals: 300_000 },
    };
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_SUMMARY",
      summary,
    });
    expect(state.summary).toEqual(summary);
    expect(state.summaryLoading).toBe(false);
    expect(state.summaryError).toBeNull();
  });

  it("menangani SET_TRANSACTIONS", () => {
    const transactions: SavingsTransaction[] = [
      { id: "1", date: "2026-07-10", type: "PRINCIPAL_PAYMENT", description: "Test", amount: 500_000, status: "PAID" },
    ];
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_TRANSACTIONS",
      transactions,
    });
    expect(state.transactions).toHaveLength(1);
  });

  it("menangani SET_MANDATORY_INVOICES", () => {
    const invoices: MandatoryInvoice[] = [
      { id: "INV-1", period: "Juli 2026", totalAmount: 100_000, paidAmount: 0, remainingAmount: 100_000, dueDate: "2026-07-31", status: "UNPAID" },
    ];
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_MANDATORY_INVOICES",
      invoices,
    });
    expect(state.mandatoryInvoices).toHaveLength(1);
  });

  it("menangani SELECT_SAVINGS_TYPE", () => {
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SELECT_SAVINGS_TYPE",
      savingsType: "PRINCIPAL",
    });
    expect(state.selectedSavingsType).toBe("PRINCIPAL");
  });

  it("menangani SELECT_MANDATORY_INVOICE", () => {
    const invoice: MandatoryInvoice = {
      id: "INV-1",
      period: "Juli 2026",
      totalAmount: 100_000,
      paidAmount: 0,
      remainingAmount: 100_000,
      dueDate: "2026-07-31",
      status: "UNPAID",
    };
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SELECT_MANDATORY_INVOICE",
      invoice,
    });
    expect(state.selectedMandatoryInvoice).toEqual(invoice);
  });

  it("menangani SET_PAYMENT_MODE", () => {
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_PAYMENT_MODE",
      mode: "PARTIAL",
    });
    expect(state.paymentMode).toBe("PARTIAL");
  });

  it("menangani SET_ENTERED_AMOUNT", () => {
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_ENTERED_AMOUNT",
      amount: 50_000,
    });
    expect(state.enteredAmount).toBe(50_000);
  });

  it("menangani SET_WITHDRAWAL_REASON", () => {
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_WITHDRAWAL_REASON",
      reason: "Biaya pendidikan",
    });
    expect(state.withdrawalReason).toBe("Biaya pendidikan");
  });

  it("menangani SET_DOCUMENT", () => {
    const doc: SavingsDocument = {
      documentNumber: "SMP-001",
      documentType: "INVOICE",
      documentTitle: "Test Invoice",
      savingsType: "PRINCIPAL",
      memberName: "Test",
      memberNumber: "AGT-001",
      amount: 500_000,
      status: "PENDING_PAYMENT",
      createdAt: "2026-07-10",
      printedCount: 0,
    };
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_DOCUMENT",
      document: doc,
    });
    expect(state.currentDocument).toEqual(doc);
    expect(state.submissionStatus).toBe("SUCCESS");
  });

  it("menangani INCREMENT_DOCUMENT_PRINT", () => {
    const stateWithDoc = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_DOCUMENT",
      document: {
        documentNumber: "SMP-001",
        documentType: "INVOICE",
        documentTitle: "Test",
        savingsType: "PRINCIPAL",
        memberName: "Test",
        memberNumber: "AGT-001",
        amount: 500_000,
        status: "PENDING_PAYMENT",
        createdAt: "2026-07-10",
        printedCount: 0,
      },
    });
    const state = savingsFlowReducer(stateWithDoc, {
      type: "INCREMENT_DOCUMENT_PRINT",
    });
    expect(state.currentDocument?.printedCount).toBe(1);
  });

  it("tidak mengubah state untuk INCREMENT_DOCUMENT_PRINT tanpa dokumen", () => {
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "INCREMENT_DOCUMENT_PRINT",
    });
    expect(state.currentDocument).toBeNull();
  });

  it("menangani SET_SUBMISSION_STATUS", () => {
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_SUBMISSION_STATUS",
      status: "ERROR",
      error: "Gagal memproses",
    });
    expect(state.submissionStatus).toBe("ERROR");
    expect(state.submissionError).toBe("Gagal memproses");
  });

  it("mereset semua state pada RESET_FLOW", () => {
    const modified = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_ENTERED_AMOUNT",
      amount: 200_000,
    });
    const state = savingsFlowReducer(modified, { type: "RESET_FLOW" });
    expect(state.enteredAmount).toBe(0);
    expect(state.selectedSavingsType).toBeNull();
    expect(state.currentDocument).toBeNull();
    expect(state.submissionStatus).toBe("IDLE");
  });

  it("menangani SET_PRINTER_STATUS", () => {
    const state = savingsFlowReducer(initialSavingsFlowState, {
      type: "SET_PRINTER_STATUS",
      status: "DISCONNECTED",
    });
    expect(state.printerStatus).toBe("DISCONNECTED");
  });
});
