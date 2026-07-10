import { expect, test } from "@playwright/test";

test("menyelesaikan alur intake mock lintas feature", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /buka kios/i }).click();

  await expect(
    page.getByRole("heading", { name: "Intake komoditas", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Mock development")).toBeVisible();

  await page.getByRole("button", { name: "Mulai verifikasi" }).click();
  await page.getByLabel("Potong dari margin transaksi").check();
  await page.getByRole("button", { name: "Konfirmasi pilihan" }).click();

  await page.getByRole("button", { name: "Aktifkan perangkat" }).click();
  await page.getByRole("button", { name: "Baca berat" }).click();
  await page.getByRole("button", { name: "Ambil foto" }).click();
  await page
    .getByRole("button", { name: "Simpan hasil penangkapan" })
    .click();

  await page.getByRole("button", { name: "Analisis foto" }).click();
  await page.getByRole("button", { name: "Setujui hasil AI" }).click();

  await page.getByRole("button", { name: "Buat penawaran" }).click();
  await page
    .getByRole("button", { name: "Setujui sebagai pembeli" })
    .click();
  await page.getByLabel("Counteroffer penjual per kg").fill("7000");
  await page.getByRole("button", { name: "Ajukan counteroffer" }).click();
  await page
    .getByRole("button", { name: "Setujui sebagai pembeli" })
    .click();

  await page.getByRole("button", { name: "Persetujuan pembeli" }).click();
  await page.getByRole("button", { name: "Persetujuan penjual" }).click();
  await page.getByRole("button", { name: "Selesaikan penerimaan" }).click();

  await expect(page.getByRole("status")).toContainText("COMPLETED");
  await expect(
    page.getByRole("heading", { name: "Preview bukti transaksi tersedia" }),
  ).toBeVisible();
});
