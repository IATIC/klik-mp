import { expect, test } from "@playwright/test";

test("renders the KLIK-MP mode selection", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /satu alur untuk identitas, mutu, dan kesepakatan harga/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /buka kios/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /buka operator/i }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.locator("body").evaluate((body) => {
    return body.scrollWidth > body.clientWidth;
  });

  expect(hasHorizontalOverflow).toBe(false);
});

test("renders the operator workspaces", async ({ page }) => {
  await page.goto("/operator/transactions");
  await expect(
    page.getByRole("heading", { name: "Daftar transaksi penerimaan" }),
  ).toBeVisible();

  await page.goto("/operator/reference-prices");
  await expect(
    page.getByRole("heading", { name: "Referensi harga" }),
  ).toBeVisible();

  await page.goto("/operator/review/session-demo");
  await expect(
    page.getByRole("heading", { name: "Review hasil AI" }),
  ).toBeVisible();
});
