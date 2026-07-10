import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CommodityAssessmentPanel,
  MockCommodityVisionAdapter,
} from "@/features/commodity-assessment";

afterEach(cleanup);

const input = {
  captureId: "capture-ui",
  imageUrl: "data:image/jpeg;base64,dGVzdA==",
};

describe("CommodityAssessmentPanel", () => {
  it("menampilkan loading, prediksi, dan verifikasi petugas", async () => {
    const user = userEvent.setup();
    const onAssessed = vi.fn();
    render(
      <CommodityAssessmentPanel
        input={input}
        visionAdapter={new MockCommodityVisionAdapter()}
        onAssessed={onAssessed}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Analisis foto" }));
    expect(await screen.findByText("Gabah Kering Panen")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Confidence klasifikasi" }),
    ).toHaveAttribute("aria-valuenow", "94");

    await user.click(screen.getByRole("button", { name: "Setujui hasil AI" }));
    expect(await screen.findByText("Hasil telah diverifikasi")).toBeInTheDocument();
    expect(onAssessed).toHaveBeenCalledWith(
      expect.objectContaining({ verifiedByOfficer: true }),
    );
  });

  it("menolak koreksi tanpa alasan lalu menyimpan koreksi lengkap", async () => {
    const user = userEvent.setup();
    const onAssessed = vi.fn();
    render(
      <CommodityAssessmentPanel
        input={input}
        visionAdapter={new MockCommodityVisionAdapter()}
        onAssessed={onAssessed}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Analisis foto" }));
    await screen.findByText("Gabah Kering Panen");
    await user.type(screen.getByLabelText("Nilai yang benar"), "Beras — Grade A");
    await user.click(
      screen.getByRole("button", { name: "Simpan koreksi dan verifikasi" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Alasan koreksi");

    await user.type(
      screen.getByLabelText("Alasan koreksi"),
      "Butir bersih dan warna seragam.",
    );
    await user.click(
      screen.getByRole("button", { name: "Simpan koreksi dan verifikasi" }),
    );

    expect(await screen.findByText("Hasil telah diverifikasi")).toBeInTheDocument();
    expect(onAssessed).toHaveBeenCalledWith(
      expect.objectContaining({
        correctedValue: "Beras — Grade A",
        correctionReason: "Butir bersih dan warna seragam.",
      }),
    );
  });

  it("menampilkan error adapter tanpa fallback ke mock", async () => {
    const user = userEvent.setup();
    render(
      <CommodityAssessmentPanel
        input={input}
        visionAdapter={
          new MockCommodityVisionAdapter({ error: new Error("Model tidak tersedia") })
        }
      />,
    );

    await user.click(screen.getByRole("button", { name: "Analisis foto" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Model tidak tersedia");
  });
});
