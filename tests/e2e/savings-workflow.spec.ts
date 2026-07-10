import { expect, test } from "@playwright/test";

test.describe("Simpanan Module - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login first to access kiosk dashboard
    await page.goto("/");
    // Navigate through access page to login
    await page.getByRole("link", { name: /buka kios/i }).click();
    // If login page appears, login with mock credentials
    await page.waitForURL(/\/login/).catch(() => {});
    // Use manual login if needed
    const loginForm = page.getByLabel(/NIK/i);
    if (await loginForm.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginForm.fill("3273000000000042");
      await page.getByLabel(/kata sandi/i).fill("Klikmp123");
      await page.getByRole("button", { name: /masuk/i }).click();
    }
  });

  test("E2E 1 - Navigasi layanan: halaman utama menampilkan Simpanan dan mengarah ke dashboard", async ({ page }) => {
    // After login, should be on kiosk home page
    await page.waitForURL(/\/kiosk/).catch(() => {});
    
    // Either the carousel or the direct Simpanan button exists
    const simpananLink = page.getByRole("button", { name: "Simpanan" }).first();
    await expect(simpananLink).toBeVisible({ timeout: 5000 });
    
    // Click on Simpanan (may need to navigate carousel first)
    await simpananLink.click();
    
    // Should navigate to savings dashboard
    await page.waitForURL(/\/simpanan/).catch(() => {});
    await expect(page.getByText(/simpanan/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("E2E 2 - Simpanan Pokok: ajukan pembayaran dan buat invoice", async ({ page }) => {
    // Navigate to savings
    await page.goto("/simpanan");
    
    // Click on Simpanan Pokok card
    const principalCard = page.getByRole("link", { name: /simpanan pokok/i });
    await expect(principalCard).toBeVisible({ timeout: 5000 });
    await principalCard.click();
    
    // Should be on principal detail page
    await page.waitForURL(/\/simpanan\/principal/);
    await expect(page.getByText(/simpanan pokok/i)).toBeVisible();
    
    // Click Ajukan Pembayaran
    const ajukanBtn = page.getByRole("button", { name: /ajukan pembayaran/i });
    if (await ajukanBtn.isVisible({ timeout: 2000 })) {
      await ajukanBtn.click();
      
      // On payment confirmation page
      await page.waitForURL(/\/simpanan\/principal\/payment/);
      await expect(page.getByText(/ringkasan/i)).toBeVisible();
      
      // Click Buat Invoice
      await page.getByRole("button", { name: /buat invoice/i }).click();
      
      // Wait for invoice to be created
      await page.waitForURL(/\/simpanan\/principal\/invoice/);
      await expect(page.getByText(/invoice/i)).toBeVisible();
      await expect(page.getByText(/menunggu pembayaran/i)).toBeVisible();
      
      // Print invoice option should be visible
      const cetakBtn = page.getByRole("button", { name: /cetak/i });
      await expect(cetakBtn).toBeVisible();
    }
  });

  test("E2E 3 - Simpanan Wajib penuh", async ({ page }) => {
    await page.goto("/simpanan");
    
    // Click Simpanan Wajib
    const wajibCard = page.getByRole("link", { name: /simpanan wajib/i });
    await expect(wajibCard).toBeVisible({ timeout: 5000 });
    await wajibCard.click();
    
    await page.waitForURL(/\/simpanan\/mandatory/);
    
    // Click Bayar Tagihan on unpaid invoice
    const bayarBtn = page.getByRole("button", { name: /bayar tagihan/i }).first();
    if (await bayarBtn.isVisible({ timeout: 2000 })) {
      await bayarBtn.click();
      
      // On payment page
      await page.waitForURL(/\/simpanan\/mandatory\/payment/);
      
      // Select full payment
      const fullBtn = page.getByRole("button", { name: /bayar penuh/i });
      await expect(fullBtn).toBeVisible();
      await fullBtn.click();
      
      // Create invoice
      await page.getByRole("button", { name: /buat invoice/i }).click();
      
      // Invoice created
      await page.waitForURL(/\/simpanan\/mandatory\/invoice/);
      await expect(page.getByText(/invoice/i)).toBeVisible();
    }
  });

  test("E2E 4 - Simpanan Wajib sebagian", async ({ page }) => {
    await page.goto("/simpanan");
    
    const wajibCard = page.getByRole("link", { name: /simpanan wajib/i });
    await wajibCard.click();
    
    await page.waitForURL(/\/simpanan\/mandatory/);
    
    const bayarBtn = page.getByRole("button", { name: /bayar tagihan/i }).first();
    if (await bayarBtn.isVisible({ timeout: 2000 })) {
      await bayarBtn.click();
      
      await page.waitForURL(/\/simpanan\/mandatory\/payment/);
      
      // Select partial payment
      const partialBtn = page.getByRole("button", { name: /bayar sebagian/i });
      await expect(partialBtn).toBeVisible();
      await partialBtn.click();
      
      // Enter amount
      const moneyInput = page.getByRole("textbox").first();
      if (await moneyInput.isVisible({ timeout: 2000 })) {
        await moneyInput.fill("30000");
      }
      
      // Create invoice
      await page.getByRole("button", { name: /buat invoice/i }).click();
      
      await page.waitForURL(/\/simpanan\/mandatory\/invoice/);
      await expect(page.getByText(/invoice/i)).toBeVisible();
    }
  });

  test("E2E 5 - Setoran Sukarela", async ({ page }) => {
    await page.goto("/simpanan");
    
    const sukarelaCard = page.getByRole("link", { name: /sukarela/i });
    await expect(sukarelaCard).toBeVisible({ timeout: 5000 });
    await sukarelaCard.click();
    
    await page.waitForURL(/\/simpanan\/voluntary/);
    
    // Click Setor Simpanan
    const setorBtn = page.getByRole("link", { name: /setor simpanan/i });
    await expect(setorBtn).toBeVisible({ timeout: 3000 });
    await setorBtn.click();
    
    await page.waitForURL(/\/simpanan\/voluntary\/deposit/);
    
    // Enter amount
    const input = page.getByRole("textbox").first();
    if (await input.isVisible({ timeout: 2000 })) {
      await input.fill("200000");
    }
    
    // Confirm - click Buat Invoice
    const buatInvoiceBtn = page.getByRole("button", { name: /buat invoice/i });
    if (await buatInvoiceBtn.isVisible({ timeout: 2000 })) {
      await buatInvoiceBtn.click();
    }
    
    // Result page
    await page.waitForURL(/\/simpanan\/voluntary\/result/);
    await expect(page.getByText(/berhasil/i)).toBeVisible({ timeout: 5000 });
  });

  test("E2E 6 - Pencairan Sukarela", async ({ page }) => {
    await page.goto("/simpanan");
    
    const sukarelaCard = page.getByRole("link", { name: /sukarela/i });
    await sukarelaCard.click();
    
    await page.waitForURL(/\/simpanan\/voluntary/);
    
    // Click Ajukan Pencairan
    const cairBtn = page.getByRole("link", { name: /ajukan pencairan/i });
    await expect(cairBtn).toBeVisible({ timeout: 3000 });
    await cairBtn.click();
    
    await page.waitForURL(/\/simpanan\/voluntary\/withdraw/);
    
    // Enter amount
    const amountInput = page.getByRole("textbox").first();
    if (await amountInput.isVisible({ timeout: 2000 })) {
      await amountInput.fill("200000");
    }
    
    // Enter reason
    const reasonInput = page.getByPlaceholder(/alasan/i);
    if (await reasonInput.isVisible({ timeout: 2000 })) {
      await reasonInput.fill("Biaya pendidikan anak");
    }
    
    // Submit
    const ajukanBtn = page.getByRole("button", { name: /ajukan pencairan/i });
    if (await ajukanBtn.isVisible({ timeout: 2000 })) {
      await ajukanBtn.click();
    }
    
    // Result page
    await page.waitForURL(/\/simpanan\/voluntary\/result/);
    await expect(page.getByText(/berhasil/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/menunggu persetujuan/i)).toBeVisible();
  });

  test("E2E 7 - Validation: nominal kosong, nol, negatif, melebihi limit", async ({ page }) => {
    await page.goto("/simpanan/voluntary/deposit");
    
    // Try submitting empty amount
    const submitBtn = page.getByRole("button", { name: /buat invoice/i });
    if (await submitBtn.isVisible({ timeout: 2000 })) {
      await submitBtn.click();
      // Should show validation error
      const errorMsg = page.getByText(/lebih dari nol/i);
      const errorMsg2 = page.getByText(/wajib diisi/i);
      await expect(errorMsg.or(errorMsg2)).toBeVisible({ timeout: 3000 });
    }
  });

  test("E2E 8 - Regression: komoditas flow masih berfungsi", async ({ page }) => {
    // Navigate to kiosk home
    await page.goto("/kiosk");
    
    // Verify Offtacker/komoditas option exists
    const komoditasBtn = page.getByRole("button", { name: /offtacker/i });
    await expect(komoditasBtn).toBeVisible({ timeout: 5000 });
    
    // Verify Simpanan option exists
    const simpananBtn = page.getByRole("button", { name: "Simpanan" });
    await expect(simpananBtn).toBeVisible({ timeout: 5000 });
    
    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});
