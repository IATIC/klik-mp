import { expect, test } from "@playwright/test";

test.describe("KlinikDesa Module - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login first to access kiosk dashboard
    await page.goto("/");
    await page.getByRole("link", { name: /buka kios/i }).click();
    await page.waitForURL(/\/login/).catch(() => {});
    const loginForm = page.getByLabel(/NIK/i);
    if (await loginForm.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginForm.fill("3273000000000042");
      await page.getByLabel(/kata sandi/i).fill("Klikmp123");
      await page.getByRole("button", { name: /masuk/i }).click();
    }
  });

  test("E2E 1 - Navigasi: halaman utama menampilkan Klinikdesa dan mengarah ke /clinic", async ({ page }) => {
    await page.waitForURL(/\/kiosk/).catch(() => {});

    // Klinikdesa button exists on home page
    const klinikBtn = page.getByRole("button", { name: "Klinikdesa" }).first();
    await expect(klinikBtn).toBeVisible({ timeout: 5000 });

    // Click to navigate
    await klinikBtn.click();
    await page.waitForURL(/\/clinic/).catch(() => {});
    await expect(page.getByText(/klinik desa/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("E2E 2 - Service selection: memilih layanan dan melanjutkan ke form aplikasi", async ({ page }) => {
    await page.goto("/clinic");

    // Should see at least one service
    const serviceCard = page.getByRole("button").filter({ hasText: /Pemeriksaan/i }).first();
    await expect(serviceCard).toBeVisible({ timeout: 5000 });

    // Click Ajukan Pemeriksaan button
    const ajukanBtn = page.getByText("Ajukan Pemeriksaan").first();
    await expect(ajukanBtn).toBeVisible({ timeout: 3000 });
    await ajukanBtn.click();

    // Should navigate to application page
    await page.waitForURL(/\/clinic\/application/);
    await expect(page.getByLabel(/nomor kontak/i)).toBeVisible({ timeout: 5000 });
  });

  test("E2E 3 - Application form: mengisi form dan melanjutkan ke dokumen", async ({ page }) => {
    await page.goto("/clinic/application");

    // If redirected back due to no service selected, navigate properly
    const currentUrl = page.url();
    if (currentUrl.includes("/clinic") && !currentUrl.includes("/application")) {
      // Need to select service first
      await page.goto("/clinic");
      const ajukanBtn = page.getByText("Ajukan Pemeriksaan").first();
      await ajukanBtn.click();
      await page.waitForURL(/\/clinic\/application/);
    }

    // Fill phone number
    const phoneInput = page.getByLabel(/nomor kontak/i);
    if (await phoneInput.isVisible({ timeout: 3000 })) {
      await phoneInput.fill("081234567890");
    }

    // Fill complaint
    const complaintInput = page.getByLabel(/keluhan utama/i);
    if (await complaintInput.isVisible({ timeout: 3000 })) {
      await complaintInput.fill("Sakit kepala sejak 3 hari yang lalu");
    }

    // Click Lanjut ke Dokumen
    const lanjutBtn = page.getByRole("button", { name: /lanjut ke dokumen/i });
    if (await lanjutBtn.isVisible({ timeout: 2000 })) {
      await lanjutBtn.click();
    }

    // Should navigate to documents page
    await page.waitForURL(/\/clinic\/documents/).catch(() => {});
    await expect(page.getByText(/kelengkapan administrasi/i)).toBeVisible({ timeout: 3000 });
  });

  test("E2E 4 - Documents: checklist dan consent lalu lanjut ke review", async ({ page }) => {
    await page.goto("/clinic/documents");

    // If redirected, handle it
    if (!page.url().includes("/documents")) {
      await page.goto("/clinic/application");
      const phoneInput = page.getByLabel(/nomor kontak/i);
      if (await phoneInput.isVisible({ timeout: 2000 })) {
        await phoneInput.fill("081234567890");
      }
      const complaintInput = page.getByLabel(/keluhan utama/i);
      if (await complaintInput.isVisible({ timeout: 2000 })) {
        await complaintInput.fill("Sakit kepala sejak 3 hari");
      }
      await page.getByRole("button", { name: /lanjut ke dokumen/i }).click();
      await page.waitForURL(/\/clinic\/documents/);
    }

    // Check consent checkbox
    const consentCheckbox = page.getByLabel(/persetujuan/i);
    if (await consentCheckbox.isVisible({ timeout: 3000 })) {
      await consentCheckbox.check();
      expect(await consentCheckbox.isChecked()).toBe(true);
    }

    // Click Lanjut ke Review
    const lanjutBtn = page.getByRole("button", { name: /lanjut ke review/i });
    if (await lanjutBtn.isVisible({ timeout: 2000 })) {
      await lanjutBtn.click();
    }

    await page.waitForURL(/\/clinic\/review/).catch(() => {});
    await expect(page.getByText(/periksa pengajuan/i).or(page.getByText(/konfirmasi/i))).toBeVisible({ timeout: 3000 });
  });

  test("E2E 5 - Review & submit: review data dan ajukan pemeriksaan", async ({ page }) => {
    // Navigate through the full flow
    await page.goto("/clinic");
    const ajukanBtn = page.getByText("Ajukan Pemeriksaan").first();
    await ajukanBtn.click();
    await page.waitForURL(/\/clinic\/application/);

    // Fill form
    const phoneInput = page.getByLabel(/nomor kontak/i);
    if (await phoneInput.isVisible({ timeout: 2000 })) {
      await phoneInput.fill("081234567890");
    }
    const complaintInput = page.getByLabel(/keluhan utama/i);
    if (await complaintInput.isVisible({ timeout: 2000 })) {
      await complaintInput.fill("Sakit kepala sejak 3 hari yang lalu");
    }
    await page.getByRole("button", { name: /lanjut ke dokumen/i }).click();
    await page.waitForURL(/\/clinic\/documents/);

    // Check consent
    const consentCheckbox = page.getByLabel(/persetujuan/i);
    if (await consentCheckbox.isVisible({ timeout: 2000 })) {
      await consentCheckbox.check();
    }
    await page.getByRole("button", { name: /lanjut ke review/i }).click();
    await page.waitForURL(/\/clinic\/review/);

    // Verify review data is visible
    await expect(page.getByText(/Pemeriksaan/i).first()).toBeVisible({ timeout: 3000 });

    // Click Ajukan
    const ajukanBtn2 = page.getByRole("button", { name: /ajukan pemeriksaan/i });
    if (await ajukanBtn2.isVisible({ timeout: 2000 })) {
      await ajukanBtn2.click();
    }

    // Confirm dialog
    const confirmBtn = page.getByRole("button", { name: /ya, ajukan/i });
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
    }

    // Should reach queue page
    await page.waitForURL(/\/clinic\/queue/).catch(() => {});
    await expect(page.getByText(/nomor antrean/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("E2E 6 - Validation: form validation error pada aplikasi", async ({ page }) => {
    await page.goto("/clinic/application");

    // If redirected, handle
    if (!page.url().includes("/application")) {
      await page.goto("/clinic");
      const ajukanBtn = page.getByText("Ajukan Pemeriksaan").first();
      await ajukanBtn.click();
      await page.waitForURL(/\/clinic\/application/);
    }

    // Try submitting without filling required fields
    const lanjutBtn = page.getByRole("button", { name: /lanjut ke dokumen/i });
    if (await lanjutBtn.isVisible({ timeout: 2000 })) {
      await lanjutBtn.click();
    }

    // Should show validation errors
    const errorMsg = page.getByText(/wajib diisi/i);
    const errorMsg2 = page.getByText(/diawali 0/i);
    await expect(errorMsg.or(errorMsg2)).toBeVisible({ timeout: 3000 });
  });

  test("E2E 7 - Regression: kiosk home masih menampilkan semua menu", async ({ page }) => {
    await page.goto("/kiosk");

    // Verify key menu items exist
    const offtakerBtn = page.getByRole("button", { name: /offtacker/i });
    await expect(offtakerBtn).toBeVisible({ timeout: 5000 });

    const simpananBtn = page.getByRole("button", { name: "Simpanan" });
    await expect(simpananBtn).toBeVisible({ timeout: 5000 });

    const klinikBtn = page.getByRole("button", { name: "Klinikdesa" });
    await expect(klinikBtn).toBeVisible({ timeout: 5000 });

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});
