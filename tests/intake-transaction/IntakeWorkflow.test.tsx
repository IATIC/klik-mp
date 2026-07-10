import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  IntakeWorkflow,
  cancelIntake,
  createIntakeSession,
} from "@/features/intake-transaction";

describe("IntakeWorkflow", () => {
  it("menampilkan tahapan dan menyediakan pembatalan aman", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <IntakeWorkflow
        session={createIntakeSession("intake-ui")}
        identityStep={<div>Modul identitas terpasang</div>}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText("Penerimaan komoditas")).toBeInTheDocument();
    expect(screen.getByLabelText("Modul aktif")).toHaveTextContent(
      "Modul identitas terpasang",
    );
    expect(screen.getByRole("list", { name: "Tahapan penerimaan" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /batalkan sesi/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("menampilkan status terminal tanpa tombol pembatalan", () => {
    const cancelled = cancelIntake(createIntakeSession("intake-ui-2"), {
      auditId: "a-1",
      actorId: "operator",
      occurredAt: "2026-07-10T08:00:00.000Z",
    });
    render(<IntakeWorkflow session={cancelled} />);
    expect(screen.getByRole("status")).toHaveTextContent("CANCELLED");
    expect(screen.queryByRole("button", { name: /batalkan sesi/i })).not.toBeInTheDocument();
  });
});
