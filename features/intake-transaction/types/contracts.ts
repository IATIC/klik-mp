import type { AgreedPrice } from "@/features/pricing-negotiation";

export type IntakeSessionStatus =
  | "DRAFT"
  | "IDENTITY_VERIFIED"
  | "MEMBERSHIP_READY"
  | "COMMODITY_CAPTURED"
  | "COMMODITY_ASSESSED"
  | "OFFER_CREATED"
  | "NEGOTIATING"
  | "AGREED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type VerifiedSeller = {
  sellerId: string;
  membershipStatus: "ACTIVE" | "PENDING_PAYMENT";
  fingerprintVerified: boolean;
  faceVerified: boolean;
  savingsSettlement?: "DIRECT_PAYMENT" | "DEDUCT_FROM_MARGIN";
};

export type CommodityCapture = {
  captureId: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  imageUrl: string;
  capturedAt: string;
};

export type CommodityAssessment = {
  commodityType: string;
  qualityGrade: string;
  classificationConfidence: number;
  qualityConfidence: number;
  verifiedByOfficer: boolean;
  correctedValue?: string;
  correctionReason?: string;
};

export type IntakeApproval = {
  party: "BUYER" | "SELLER";
  approvedBy: string;
  approvedAt: string;
};

export type SavingsSettlement = {
  method: "NOT_REQUIRED" | "DIRECT_PAYMENT" | "DEDUCT_FROM_MARGIN";
  requiredAmount: number;
  deductedAmount: number;
  sellerPayout: number;
};

export type IntakeAuditEntry = {
  id: string;
  action: string;
  actorId: string;
  occurredAt: string;
  fromStatus: IntakeSessionStatus;
  toStatus: IntakeSessionStatus;
  note?: string;
};

export type IntakeSession = {
  sessionId: string;
  status: IntakeSessionStatus;
  seller?: VerifiedSeller;
  capture?: CommodityCapture;
  assessment?: CommodityAssessment;
  price?: AgreedPrice;
  approvals: IntakeApproval[];
  auditTrail: IntakeAuditEntry[];
};

export type IntakeTransactionRecord = {
  transactionId: string;
  sessionId: string;
  sellerId: string;
  captureId: string;
  commodityType: string;
  qualityGrade: string;
  netWeight: number;
  finalUnitPrice: number;
  finalTotalPrice: number;
  savingsSettlement: SavingsSettlement;
  completedAt: string;
};

export type IntakeReceipt = {
  receiptNumber: string;
  transactionId: string;
  sellerPayout: number;
  savingsDeduction: number;
  issuedAt: string;
};

export type StockReceipt = {
  stockReceiptId: string;
  transactionId: string;
  commodityType: string;
  qualityGrade: string;
  quantity: number;
  receivedAt: string;
};

export type IntakeCompletion = {
  session: IntakeSession;
  transaction: IntakeTransactionRecord;
  receipt: IntakeReceipt;
  stockReceipt: StockReceipt;
};

export interface IntakeCompletionPort {
  completeAtomically(input: {
    transaction: IntakeTransactionRecord;
    receipt: IntakeReceipt;
    stockReceipt: StockReceipt;
    auditEntry: IntakeAuditEntry;
  }): Promise<void>;
}
