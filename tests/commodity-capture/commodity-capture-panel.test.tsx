import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CommodityCapturePanel,
  MockCameraAdapter,
  MockScaleAdapter,
} from "@/features/commodity-capture";

afterEach(cleanup);

describe("CommodityCapturePanel", () => {
  it("mengorkestrasi perangkat hingga capture sukses", async () => {
    const user = userEvent.setup();
    const onCaptured = vi.fn();
    render(
      <CommodityCapturePanel
        scaleAdapter={new MockScaleAdapter({ grossWeight: 18, tareWeight: 2 })}
        cameraAdapter={new MockCameraAdapter()}
        createCaptureId={() => "capture-ui"}
        onCaptured={onCaptured}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Aktifkan perangkat" }));
    await user.click(screen.getByRole("button", { name: "Baca berat" }));
    expect(await screen.findByText("16.00 kg")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ambil foto" }));
    await user.click(
      screen.getByRole("button", { name: "Simpan hasil penangkapan" }),
    );

    expect(
      await screen.findByText("Data komoditas siap dilanjutkan"),
    ).toBeInTheDocument();
    expect(onCaptured).toHaveBeenCalledWith(
      expect.objectContaining({ captureId: "capture-ui", netWeight: 16 }),
    );
  });

  it("menampilkan error validasi foto dan mencegah simpan", async () => {
    const user = userEvent.setup();
    render(
      <CommodityCapturePanel
        scaleAdapter={new MockScaleAdapter()}
        cameraAdapter={
          new MockCameraAdapter({
            photo: {
              imageUrl: "data:image/jpeg;base64,dGVzdA==",
              metrics: { width: 320, height: 240, brightness: 0.5, sharpness: 0.2 },
            },
          })
        }
      />,
    );

    await user.click(screen.getByRole("button", { name: "Aktifkan perangkat" }));
    await user.click(screen.getByRole("button", { name: "Ambil foto" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Resolusi foto terlalu rendah",
    );
    expect(
      screen.getByRole("button", { name: "Simpan hasil penangkapan" }),
    ).toBeDisabled();
  });
});
