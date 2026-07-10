import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("KLIK-MP landing page", () => {
  it("shows welcome view with Mulai button", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /klik-mp/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mulai/i }),
    ).toBeInTheDocument();
  });

  it("shows Register and Login after clicking Mulai", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /mulai/i }));

    expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
