import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  IdentityMembershipWorkflow,
  MockFaceRecognitionAdapter,
  MockFingerprintAdapter,
} from "@/features/identity-membership";

afterEach(cleanup);

describe("IdentityMembershipWorkflow", () => {
  it("menyelesaikan verifikasi anggota aktif", async () => {
    const user = userEvent.setup();
    const onVerified = vi.fn();

    render(
      <IdentityMembershipWorkflow
        faceRecognitionAdapter={new MockFaceRecognitionAdapter({ sellerId: "seller-001" })}
        fingerprintAdapter={new MockFingerprintAdapter({ sellerId: "seller-001" })}
        membershipStatus="ACTIVE"
        onVerified={onVerified}
        sessionId="session-001"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mulai verifikasi" }));

    expect(await screen.findByText("Identitas terverifikasi")).toBeInTheDocument();
    expect(screen.getByText("Penjual seller-001 siap melanjutkan proses.")).toBeInTheDocument();
    expect(onVerified).toHaveBeenCalledWith(
      expect.objectContaining({ sellerId: "seller-001", membershipStatus: "ACTIVE" }),
    );
  });

  it("meminta nonanggota memilih potong margin sebelum selesai", async () => {
    const user = userEvent.setup();
    const onVerified = vi.fn();

    render(
      <IdentityMembershipWorkflow
        faceRecognitionAdapter={new MockFaceRecognitionAdapter({ sellerId: "seller-002" })}
        fingerprintAdapter={new MockFingerprintAdapter({ sellerId: "seller-002" })}
        membershipStatus="PENDING_PAYMENT"
        onVerified={onVerified}
        sessionId="session-002"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mulai verifikasi" }));
    await user.click(
      await screen.findByRole("radio", {
        name: /Potong dari margin transaksi/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Konfirmasi pilihan" }));

    expect(await screen.findByText("Identitas terverifikasi")).toBeInTheDocument();
    expect(onVerified).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipStatus: "PENDING_PAYMENT",
        savingsSettlement: "DEDUCT_FROM_MARGIN",
      }),
    );
  });

  it("menampilkan error state ketika identitas fingerprint dan wajah tidak cocok", async () => {
    const user = userEvent.setup();

    render(
      <IdentityMembershipWorkflow
        faceRecognitionAdapter={new MockFaceRecognitionAdapter({ sellerId: "seller-999" })}
        fingerprintAdapter={new MockFingerprintAdapter({ sellerId: "seller-001" })}
        membershipStatus="ACTIVE"
        sessionId="session-003"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mulai verifikasi" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("IDENTITY_MISMATCH");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Identitas dari sidik jari dan wajah tidak cocok",
    );
  });
});
