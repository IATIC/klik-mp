// ── Domain types for Simpanan (Savings) module ──

export type SavingsType = "PRINCIPAL" | "MANDATORY" | "VOLUNTARY";

export type SavingsTransactionType =
  | "PRINCIPAL_PAYMENT"
  | "MANDATORY_PAYMENT"
  | "VOLUNTARY_DEPOSIT"
  | "VOLUNTARY_WITHDRAWAL";

export type SavingsTransactionStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "PENDING_APPROVAL"
  | "PAID"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type PrincipalStatus = "UNPAID" | "PENDING_PAYMENT" | "PAID";

export type MandatoryInvoiceStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PENDING_PAYMENT"
  | "PAID"
  | "OVERDUE";

export type PrinterStatus =
  | "READY"
  | "PRINTING"
  | "SUCCESS"
  | "FAILED"
  | "DISCONNECTED";

export type PaymentMode = "FULL" | "PARTIAL";

// ── Data models ──

export interface SavingsSummary {
  principal: {
    amount: number;
    status: PrincipalStatus;
    paidAt: string | null;
    activeInvoiceNumber: string | null;
  };
  mandatory: {
    outstandingAmount: number;
    activePeriod: string;
    status: string;
    totalBills: number;
    paidAmount: number;
  };
  voluntary: {
    availableBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
}

export interface MandatoryInvoice {
  id: string;
  period: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: MandatoryInvoiceStatus;
}

export interface SavingsTransaction {
  id: string;
  date: string;
  type: SavingsTransactionType;
  description: string;
  amount: number;
  status: SavingsTransactionStatus;
}

export interface PrincipalPaymentInput {
  memberId: string;
  memberName: string;
  memberNumber: string;
}

export interface MandatoryPaymentInput {
  memberId: string;
  memberName: string;
  memberNumber: string;
  invoiceId: string;
  period: string;
  amount: number;
  paymentMode: PaymentMode;
}

export interface VoluntaryDepositInput {
  memberId: string;
  memberName: string;
  memberNumber: string;
  amount: number;
}

export interface VoluntaryWithdrawalInput {
  memberId: string;
  memberName: string;
  memberNumber: string;
  amount: number;
  reason: string;
}

export interface SavingsDocument {
  documentNumber: string;
  documentType: "INVOICE" | "WITHDRAWAL_RECEIPT";
  documentTitle: string;
  savingsType: SavingsType;
  memberName: string;
  memberNumber: string;
  amount: number;
  status: SavingsTransactionStatus;
  createdAt: string;
  details?: Record<string, string>;
  printedCount: number;
  /** For mandatory: remaining after this payment */
  remainingAfterPayment?: number;
  /** For mandatory: payment mode */
  paymentMode?: PaymentMode;
  /** For mandatory: period */
  period?: string;
}

export interface PrintResult {
  success: boolean;
  message: string;
  documentId: string;
}

export interface SavingsService {
  getSummary(memberId: string): Promise<SavingsSummary>;
  getTransactions(memberId: string): Promise<SavingsTransaction[]>;
  getMandatoryInvoices(memberId: string): Promise<MandatoryInvoice[]>;
  getMemberInfo(memberId: string): Promise<{ name: string; number: string; memberId: string }>;
  createPrincipalPaymentInvoice(input: PrincipalPaymentInput): Promise<SavingsDocument>;
  createMandatoryPaymentInvoice(input: MandatoryPaymentInput): Promise<SavingsDocument>;
  createVoluntaryDepositInvoice(input: VoluntaryDepositInput): Promise<SavingsDocument>;
  submitVoluntaryWithdrawal(input: VoluntaryWithdrawalInput): Promise<SavingsDocument>;
}

export interface PrintService {
  getStatus(): Promise<PrinterStatus>;
  print(documentId: string): Promise<PrintResult>;
}

// ── Form state ──

export type SubmissionStatus =
  | "IDLE"
  | "LOADING"
  | "SUCCESS"
  | "ERROR"
  | "DUPLICATE";

// ── Flow context state ──

export interface SavingsFlowState {
  memberId: string;
  summary: SavingsSummary | null;
  transactions: SavingsTransaction[];
  mandatoryInvoices: MandatoryInvoice[];
  summaryLoading: boolean;
  summaryError: string | null;

  // Active flow
  selectedSavingsType: SavingsType | null;
  selectedMandatoryInvoice: MandatoryInvoice | null;
  paymentMode: PaymentMode | null;
  enteredAmount: number;
  withdrawalReason: string;
  currentDocument: SavingsDocument | null;
  submissionStatus: SubmissionStatus;
  submissionError: string | null;

  // Printer
  printerStatus: PrinterStatus;
  printStatus: SubmissionStatus;
  printError: string | null;
}

export type SavingsFlowAction =
  | { type: "SET_SUMMARY"; summary: SavingsSummary }
  | { type: "SET_SUMMARY_LOADING"; loading: boolean }
  | { type: "SET_SUMMARY_ERROR"; error: string | null }
  | { type: "SET_TRANSACTIONS"; transactions: SavingsTransaction[] }
  | { type: "SET_MANDATORY_INVOICES"; invoices: MandatoryInvoice[] }
  | { type: "SET_MEMBER_ID"; memberId: string }
  | { type: "SELECT_SAVINGS_TYPE"; savingsType: SavingsType }
  | { type: "SELECT_MANDATORY_INVOICE"; invoice: MandatoryInvoice }
  | { type: "SET_PAYMENT_MODE"; mode: PaymentMode }
  | { type: "SET_ENTERED_AMOUNT"; amount: number }
  | { type: "SET_WITHDRAWAL_REASON"; reason: string }
  | { type: "SET_DOCUMENT"; document: SavingsDocument }
  | { type: "SET_SUBMISSION_STATUS"; status: SubmissionStatus; error?: string | null }
  | { type: "SET_PRINTER_STATUS"; status: PrinterStatus }
  | { type: "SET_PRINT_STATUS"; status: SubmissionStatus; error?: string | null }
  | { type: "INCREMENT_DOCUMENT_PRINT" }
  | { type: "RESET_FLOW" };
