import type {
  MandatoryInvoice,
  SavingsSummary,
  SavingsTransaction,
} from "../types/savings";
import { MOCK_TRANSACTIONS } from "../constants/savings-constants";

export const MOCK_MEMBER_ID = "AGT-0042";
export const MOCK_MEMBER_NAME = "Budi Anggara";
export const MOCK_MEMBER_NUMBER = "AGT-0042";

export function createMockSummary(): SavingsSummary {
  return {
    principal: {
      amount: 500_000,
      status: "UNPAID",
      paidAt: null,
      activeInvoiceNumber: null,
    },
    mandatory: {
      outstandingAmount: 60_000,
      activePeriod: "Juli 2026",
      status: "UNPAID",
      totalBills: 100_000,
      paidAmount: 40_000,
    },
    voluntary: {
      availableBalance: 1_200_000,
      totalDeposits: 1_500_000,
      totalWithdrawals: 300_000,
    },
  };
}

export function createMockMandatoryInvoices(): MandatoryInvoice[] {
  return [
    {
      id: "INV-MAND-202607",
      period: "Juli 2026",
      totalAmount: 100_000,
      paidAmount: 40_000,
      remainingAmount: 60_000,
      dueDate: "2026-07-31",
      status: "UNPAID",
    },
    {
      id: "INV-MAND-202606",
      period: "Juni 2026",
      totalAmount: 100_000,
      paidAmount: 100_000,
      remainingAmount: 0,
      dueDate: "2026-06-30",
      status: "PAID",
    },
    {
      id: "INV-MAND-202605",
      period: "Mei 2026",
      totalAmount: 100_000,
      paidAmount: 100_000,
      remainingAmount: 0,
      dueDate: "2026-05-31",
      status: "PAID",
    },
  ];
}

export function createMockTransactions(
  count: number = 5,
): SavingsTransaction[] {
  return MOCK_TRANSACTIONS.slice(0, count);
}
