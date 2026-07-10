import type { SavingsTransaction } from "../types/savings";

// ── Mock configuration ──

export const MOCK_DELAY_MS = 280;

export const SAVINGS_CONSTANTS = {
  PRINCIPAL_AMOUNT: 500_000,
  MAX_DEPOSIT: 10_000_000,
  MIN_DEPOSIT: 10_000,
  MIN_WITHDRAWAL: 10_000,
  MANDATORY_MONTHLY_AMOUNT: 100_000,
} as const;

// ── Document title templates ──

export const DOCUMENT_TITLES = {
  PRINCIPAL_INVOICE: "Invoice Pembayaran Simpanan Pokok",
  MANDATORY_INVOICE: "Invoice Pembayaran Simpanan Wajib",
  VOLUNTARY_DEPOSIT_INVOICE: "Invoice Setoran Simpanan Sukarela",
  VOLUNTARY_WITHDRAWAL_RECEIPT: "Bukti Pengajuan Pencairan Simpanan Sukarela",
} as const;

// ── Success messages ──

export const SUCCESS_MESSAGES = {
  INVOICE_CREATED: "Invoice berhasil dibuat",
  WITHDRAWAL_SUBMITTED: "Pengajuan pencairan berhasil dikirim",
  INVOICE_PRINTED: "Invoice sudah dicetak",
  RECEIPT_PRINTED: "Bukti pengajuan sudah dicetak",
  PRINTER_DISCONNECTED: "Printer tidak terhubung",
  PRINT_FAILED: "Pencetakan gagal, coba lagi",
} as const;

// ── Default transaction history ──

export const MOCK_TRANSACTIONS: SavingsTransaction[] = [
  {
    id: "TXN-001",
    date: "2026-06-15T08:30:00+07:00",
    type: "PRINCIPAL_PAYMENT",
    description: "Pembayaran Simpanan Pokok",
    amount: 500_000,
    status: "PAID",
  },
  {
    id: "TXN-002",
    date: "2026-06-01T09:00:00+07:00",
    type: "MANDATORY_PAYMENT",
    description: "Pembayaran Simpanan Wajib - Juni 2026",
    amount: 100_000,
    status: "PAID",
  },
  {
    id: "TXN-003",
    date: "2026-05-01T10:15:00+07:00",
    type: "MANDATORY_PAYMENT",
    description: "Pembayaran Simpanan Wajib - Mei 2026",
    amount: 100_000,
    status: "PAID",
  },
  {
    id: "TXN-004",
    date: "2026-04-20T11:00:00+07:00",
    type: "VOLUNTARY_DEPOSIT",
    description: "Setoran Simpanan Sukarela",
    amount: 200_000,
    status: "PAID",
  },
  {
    id: "TXN-005",
    date: "2026-04-10T13:45:00+07:00",
    type: "VOLUNTARY_WITHDRAWAL",
    description: "Pencairan Simpanan Sukarela",
    amount: 100_000,
    status: "APPROVED",
  },
  {
    id: "TXN-006",
    date: "2026-03-01T08:00:00+07:00",
    type: "MANDATORY_PAYMENT",
    description: "Pembayaran Simpanan Wajib - Maret 2026",
    amount: 100_000,
    status: "PAID",
  },
];

// ── Default status configuration ──
// Set to false if withdrawal should auto-approve
export const WITHDRAWAL_REQUIRES_APPROVAL = true;
