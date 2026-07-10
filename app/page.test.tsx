import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("KLIK-MP entry page", () => {
  it("offers kiosk and operator entry points", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /satu alur untuk identitas, mutu, dan kesepakatan harga/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /buka kios/i })).toHaveAttribute(
      "href",
      "/intake",
    );
    expect(
      screen.getByRole("link", { name: /buka operator/i }),
    ).toHaveAttribute("href", "/operator/transactions");
  });
});
