import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  OperatorAssistancePanel,
  OperatorTransactionList,
  ReferencePriceManager,
  createAiReview,
} from "@/features/operator-assistance";

const now = "2026-07-10T08:00:00.000Z";

describe("operator components", () => {
  it("menahan koreksi sampai nilai dan alasan diisi", async () => {
    const user = userEvent.setup();
    const onCorrect = vi.fn();
    const review = createAiReview({
      reviewId: "review-ui",
      sessionId: "intake-ui",
      assessment: {
        commodityType: "Gabah",
        qualityGrade: "B",
        classificationConfidence: 0.9,
        qualityConfidence: 0.8,
        verifiedByOfficer: false,
      },
      auditId: "a-ui",
      actorId: "operator",
      occurredAt: now,
    });
    render(<OperatorAssistancePanel review={review} onCorrect={onCorrect} />);
    const submit = screen.getByRole("button", { name: /simpan koreksi/i });
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText("Nilai koreksi"), "A");
    await user.type(
      screen.getByLabelText(/alasan koreksi/i),
      "Butir utuh terlihat jelas",
    );
    expect(submit).toBeEnabled();
    await user.click(submit);
    expect(onCorrect).toHaveBeenCalledWith(
      expect.objectContaining({ correctedValue: "A" }),
    );
  });

  it("menyediakan empty state daftar transaksi", () => {
    render(<OperatorTransactionList transactions={[]} />);
    expect(screen.getByText("Belum ada transaksi")).toBeInTheDocument();
  });

  it("menampilkan error sumber harga tanpa fallback diam-diam", () => {
    render(
      <ReferencePriceManager
        prices={[]}
        error="Sumber harga tidak tersedia"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Sumber harga tidak tersedia",
    );
  });
});
