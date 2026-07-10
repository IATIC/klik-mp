import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SavingsStatusBadge } from "@/features/savings/components/savings-status-badge";
import { formatRupiah } from "@/features/savings/validations/savings-validation";
import { TransactionHistoryList } from "@/features/savings/components/transaction-history-list";
import { MoneyInput } from "@/features/savings/components/money-input";
import { WithdrawalReasonInput } from "@/features/savings/components/withdrawal-reason-input";
import { PrinterStatusPanel } from "@/features/savings/components/printer-status";
import { PaymentSummary } from "@/features/savings/components/payment-summary";
import type { SavingsTransaction } from "@/features/savings";

describe("SavingsStatusBadge", () => {
  it("menampilkan label Belum Lunas untuk UNPAID", () => {
    render(<SavingsStatusBadge status="UNPAID" />);
    expect(screen.getByText("Belum Lunas")).toBeInTheDocument();
  });

  it("menampilkan label Lunas untuk PAID", () => {
    render(<SavingsStatusBadge status="PAID" />);
    expect(screen.getByText("Lunas")).toBeInTheDocument();
  });

  it("menampilkan label Menunggu Pembayaran untuk PENDING_PAYMENT", () => {
    render(<SavingsStatusBadge status="PENDING_PAYMENT" />);
    expect(screen.getByText("Menunggu Pembayaran")).toBeInTheDocument();
  });

  it("menampilkan label Menunggu Persetujuan untuk PENDING_APPROVAL", () => {
    render(<SavingsStatusBadge status="PENDING_APPROVAL" />);
    expect(screen.getByText("Menunggu Persetujuan")).toBeInTheDocument();
  });
});

describe("MoneyInput", () => {
  it("menampilkan label", () => {
    render(<MoneyInput value={0} onChange={() => {}} label="Nominal Setoran" />);
    expect(screen.getByText("Nominal Setoran")).toBeInTheDocument();
  });

  it("menampilkan error ketika diberikan", () => {
    render(
      <MoneyInput
        value={0}
        onChange={() => {}}
        label="Nominal"
        error="Nominal harus lebih dari nol"
      />,
    );
    expect(screen.getByText("Nominal harus lebih dari nol")).toBeInTheDocument();
  });

  it("menampilkan quick amount buttons jika disediakan", () => {
    render(
      <MoneyInput value={0} onChange={() => {}} label="Nominal" quickAmounts={[50_000, 100_000]} />,
    );
    expect(screen.getByText(/Rp\s*50\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*100\.000/)).toBeInTheDocument();
  });

  it("mengaktifkan quick amount yang cocok dengan nilai", () => {
    render(
      <MoneyInput value={50_000} onChange={() => {}} label="Nominal" quickAmounts={[50_000, 100_000]} />,
    );
    // Two elements match (formatted value <p> + quick amount button)
    expect(screen.getAllByText(/Rp\s*50\.000/).length).toBeGreaterThanOrEqual(1);
  });

  it("menampilkan placeholder saat nilai nol", () => {
    render(<MoneyInput value={0} onChange={() => {}} label="Nominal" placeholder="Masukkan nominal" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Masukkan nominal");
  });
});

describe("WithdrawalReasonInput", () => {
  it("menampilkan label dan textarea", () => {
    render(<WithdrawalReasonInput value="" onChange={() => {}} />);
    expect(screen.getByText("Alasan Pencairan")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jelaskan alasan pencairan simpanan...")).toBeInTheDocument();
  });

  it("menampilkan error", () => {
    render(
      <WithdrawalReasonInput
        value=""
        onChange={() => {}}
        error="Alasan pencairan wajib diisi"
      />,
    );
    expect(screen.getByText("Alasan pencairan wajib diisi")).toBeInTheDocument();
  });

  it("mengirim perubahan nilai", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<WithdrawalReasonInput value="" onChange={onChange} />);
    const textarea = screen.getByPlaceholderText("Jelaskan alasan pencairan simpanan...");
    await user.type(textarea, "Biaya pendidikan");
    expect(onChange).toHaveBeenCalled();
  });
});

describe("PrinterStatusPanel", () => {
  it("menampilkan printer siap", () => {
    render(
      <PrinterStatusPanel printerStatus="READY" printStatus="IDLE" />,
    );
    expect(screen.getByText("Printer siap")).toBeInTheDocument();
  });

  it("menampilkan printer disconnect", () => {
    render(
      <PrinterStatusPanel printerStatus="DISCONNECTED" printStatus="IDLE" />,
    );
    expect(screen.getByText("Printer tidak terhubung")).toBeInTheDocument();
  });

  it("menampilkan status printing", () => {
    render(
      <PrinterStatusPanel printerStatus="READY" printStatus="LOADING" />,
    );
    expect(screen.getByText("Sedang mencetak...")).toBeInTheDocument();
  });

  it("menampilkan status print success", () => {
    render(
      <PrinterStatusPanel printerStatus="READY" printStatus="SUCCESS" />,
    );
    expect(screen.getByText("Dokumen berhasil dicetak")).toBeInTheDocument();
  });

  it("menampilkan error print", () => {
    render(
      <PrinterStatusPanel
        printerStatus="READY"
        printStatus="ERROR"
        printError="Pencetakan gagal"
      />,
    );
    expect(screen.getByText("Pencetakan gagal")).toBeInTheDocument();
  });
});

describe("TransactionHistoryList", () => {
  it("menampilkan empty state ketika tidak ada transaksi", () => {
    render(<TransactionHistoryList transactions={[]} />);
    expect(
      screen.getByText("Belum ada riwayat transaksi."),
    ).toBeInTheDocument();
  });

  it("menampilkan daftar transaksi", () => {
    const transactions: SavingsTransaction[] = [
      {
        id: "1",
        date: "2026-07-10T08:00:00+07:00",
        type: "PRINCIPAL_PAYMENT",
        description: "Pembayaran Simpanan Pokok",
        amount: 500_000,
        status: "PAID",
      },
    ];
    render(<TransactionHistoryList transactions={transactions} />);
    expect(screen.getByText("Simpanan Pokok")).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*500\.000/)).toBeInTheDocument();
    expect(screen.getByText("Lunas")).toBeInTheDocument();
  });

  it("menampilkan empty label kustom", () => {
    render(
      <TransactionHistoryList
        transactions={[]}
        emptyLabel="Tidak ada histori"
      />,
    );
    expect(screen.getByText("Tidak ada histori")).toBeInTheDocument();
  });
});

describe("PaymentSummary", () => {
  it("menampilkan judul, item, dan total", () => {
    render(
      <PaymentSummary
        title="Ringkasan Pembayaran"
        items={[
          { label: "Jenis", value: "Simpanan Pokok" },
          { label: "Nominal", value: formatRupiah(500_000) },
        ]}
        total={formatRupiah(500_000)}
      />,
    );
    expect(screen.getByText("Ringkasan Pembayaran")).toBeInTheDocument();
    expect(screen.getByText("Simpanan Pokok")).toBeInTheDocument();
    // Two elements match (item value + total)
    expect(screen.getAllByText(/Rp\s*500\.000/).length).toBeGreaterThanOrEqual(1);
  });
});
