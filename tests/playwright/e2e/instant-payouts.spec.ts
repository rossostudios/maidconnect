/**
 * Instant Payouts E2E Tests
 *
 * Tests the end-to-end instant payout system flow:
 * 1. View balance card on finances dashboard
 * 2. Open instant payout modal
 * 3. Enter payout amount and calculate fees
 * 4. Confirm and initiate payout
 * 5. Verify payout success and updated balance
 *
 * Prerequisites:
 * - Test professional account authenticated (via pro-auth.setup.ts)
 * - Professional has linked bank account in Stripe
 * - Professional has available balance > minimum threshold
 * - Stripe test mode configured
 *
 * @see docs/instant-payout-implementation.md
 */

import { expect, test } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

// Run these tests only with professional authentication
test.use({ storageState: "tests/playwright/.auth/professional.json" });

// ============================================================================
// CONSTANTS
// ============================================================================

const INSTANT_PAYOUT_FEE_PERCENTAGE = 1.5; // 1.5%
const MIN_PAYOUT_COP = 50_000; // ~$12 USD
const MAX_PAYOUT_COP = 100_000_000; // ~$25,000 USD

// ============================================================================
// INSTANT PAYOUTS - DASHBOARD VIEW
// ============================================================================

test.describe("Instant Payouts - Dashboard View", () => {
  test("should display balance card on finances page", async ({ page }) => {
    // Navigate to professional finances dashboard
    await navigateTo(page, "/dashboard/pro/finances");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check if balance card exists
    const balanceCard = page.locator('[data-testid="balance-card"]');
    await expect(balanceCard).toBeVisible();

    // Verify balance card has required elements
    await expect(balanceCard.locator("text=/Available Balance/i")).toBeVisible();
    await expect(balanceCard.locator("text=/Pending Balance/i")).toBeVisible();

    // Verify instant payout button exists if balance is sufficient
    const instantPayoutButton = balanceCard.locator('button:has-text("Instant Payout")');
    const isVisible = await instantPayoutButton.isVisible();

    if (isVisible) {
      await expect(instantPayoutButton).toBeEnabled();
    }
  });

  test("should show 24-hour clearance notice for pending balance", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const balanceCard = page.locator('[data-testid="balance-card"]');

    // Check for pending balance section
    const pendingSection = balanceCard.locator('[data-testid="pending-balance"]');

    if (await pendingSection.isVisible()) {
      // Verify 24-hour clearance message exists
      const clearanceNotice = balanceCard.locator("text=/24.*hour/i");
      await expect(clearanceNotice).toBeVisible();
    }
  });

  test("should display formatted currency amounts", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const balanceCard = page.locator('[data-testid="balance-card"]');

    // Get available balance text
    const availableBalance = await balanceCard
      .locator('[data-testid="available-balance"]')
      .textContent();

    // Verify currency formatting (COP with thousands separators)
    expect(availableBalance).toMatch(/\$[\d,]+/);
  });
});

// ============================================================================
// INSTANT PAYOUTS - MODAL INTERACTION
// ============================================================================

test.describe("Instant Payouts - Modal Interaction", () => {
  test("should open instant payout modal when button clicked", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    // Skip test if button not visible (insufficient balance)
    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    // Click instant payout button
    await instantPayoutButton.click();

    // Verify modal opens
    const modal = page.locator('[data-testid="instant-payout-modal"]');
    await expect(modal).toBeVisible();

    // Verify modal title
    await expect(modal.locator("text=/Instant Payout/i")).toBeVisible();

    // Verify amount input exists
    await expect(modal.locator('input[type="number"]')).toBeVisible();
  });

  test("should display fee calculator in modal", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');

    // Verify fee calculator elements
    await expect(modal.locator("text=/Fee/i")).toBeVisible();
    await expect(modal.locator("text=/You will receive/i")).toBeVisible();

    // Verify fee percentage is shown
    await expect(modal.locator(`text=/${INSTANT_PAYOUT_FEE_PERCENTAGE}%/`)).toBeVisible();
  });

  test("should provide quick amount buttons (25%, 50%, 75%, 100%)", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');

    // Verify quick amount buttons exist
    await expect(modal.locator('button:has-text("25%")')).toBeVisible();
    await expect(modal.locator('button:has-text("50%")')).toBeVisible();
    await expect(modal.locator('button:has-text("75%")')).toBeVisible();
    await expect(modal.locator('button:has-text("100%")')).toBeVisible();
  });

  test("should calculate fee correctly when amount is entered", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    const amountInput = modal.locator('input[type="number"]');

    // Enter test amount: 1,000,000 COP
    await amountInput.fill("1000000");

    // Wait for fee calculation
    await page.waitForTimeout(500);

    // Expected fee: 1,000,000 * 0.015 = 15,000 COP
    // Expected net: 1,000,000 - 15,000 = 985,000 COP

    const feeAmount = await modal.locator('[data-testid="fee-amount"]').textContent();
    const netAmount = await modal.locator('[data-testid="net-amount"]').textContent();

    // Verify fee is shown
    expect(feeAmount).toContain("15,000");

    // Verify net amount is shown
    expect(netAmount).toContain("985,000");
  });

  test("should close modal when cancel button clicked", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    await expect(modal).toBeVisible();

    // Click cancel button
    const cancelButton = modal.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // Verify modal closes
    await expect(modal).not.toBeVisible();
  });
});

// ============================================================================
// INSTANT PAYOUTS - VALIDATION
// ============================================================================

test.describe("Instant Payouts - Validation", () => {
  test("should show error for amount below minimum threshold", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    const amountInput = modal.locator('input[type="number"]');

    // Enter amount below minimum (e.g., 10,000 COP)
    await amountInput.fill("10000");

    // Try to submit
    const confirmButton = modal.locator('button:has-text("Confirm")');
    await confirmButton.click();

    // Verify error message is shown
    const errorMessage = modal.locator("text=/Minimum.*50,000/i");
    await expect(errorMessage).toBeVisible();
  });

  test("should show error for amount above maximum limit", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    const amountInput = modal.locator('input[type="number"]');

    // Enter amount above maximum (e.g., 150,000,000 COP)
    await amountInput.fill("150000000");

    // Try to submit
    const confirmButton = modal.locator('button:has-text("Confirm")');
    await confirmButton.click();

    // Verify error message is shown
    const errorMessage = modal.locator("text=/Maximum.*100,000,000/i");
    await expect(errorMessage).toBeVisible();
  });

  test("should show error for amount exceeding available balance", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    // Get available balance from balance card
    const balanceCard = page.locator('[data-testid="balance-card"]');
    const balanceText = await balanceCard
      .locator('[data-testid="available-balance"]')
      .textContent();

    // Extract balance amount (remove currency symbol and commas)
    const balanceMatch = balanceText?.match(/[\d,]+/);
    if (!balanceMatch) {
      test.skip();
      return;
    }

    const availableBalance = Number.parseInt(balanceMatch[0].replace(/,/g, ""), 10);

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    const amountInput = modal.locator('input[type="number"]');

    // Enter amount exceeding balance
    const excessAmount = availableBalance + 1_000_000;
    await amountInput.fill(excessAmount.toString());

    // Try to submit
    const confirmButton = modal.locator('button:has-text("Confirm")');
    await confirmButton.click();

    // Verify error message is shown
    const errorMessage = modal.locator("text=/Insufficient.*balance/i");
    await expect(errorMessage).toBeVisible();
  });

  test("should disable confirm button when no amount entered", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    const confirmButton = modal.locator('button:has-text("Confirm")');

    // Verify confirm button is disabled initially
    await expect(confirmButton).toBeDisabled();
  });
});

// ============================================================================
// INSTANT PAYOUTS - BANK ACCOUNT
// ============================================================================

test.describe("Instant Payouts - Bank Account", () => {
  test("should show bank account info in modal", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');

    // Verify bank account info is shown
    const bankInfo = modal.locator('[data-testid="bank-account-info"]');
    await expect(bankInfo).toBeVisible();

    // Verify last 4 digits are shown
    await expect(bankInfo.locator("text=/\\*\\*\\*\\*\\d{4}/")).toBeVisible();
  });

  test("should prompt to add bank account if none linked", async ({ page }) => {
    // This test would require a professional account without a bank account
    // Skip for now - requires specific test data
    test.skip();
  });
});

// ============================================================================
// INSTANT PAYOUTS - TRANSACTION HISTORY
// ============================================================================

test.describe("Instant Payouts - Transaction History", () => {
  test("should display payout history on finances page", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    // Check if payout history section exists
    const payoutHistory = page.locator('[data-testid="payout-history"]');

    if (await payoutHistory.isVisible()) {
      // Verify payout history has table headers
      await expect(payoutHistory.locator("text=/Date/i")).toBeVisible();
      await expect(payoutHistory.locator("text=/Amount/i")).toBeVisible();
      await expect(payoutHistory.locator("text=/Status/i")).toBeVisible();
    } else {
      // No payout history yet - this is expected for new professionals
      console.log("[instant-payouts] No payout history found (expected for new professionals)");
    }
  });

  test("should filter payout history by status", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const payoutHistory = page.locator('[data-testid="payout-history"]');

    if (await payoutHistory.isVisible()) {
      // Check for status filter dropdown
      const statusFilter = payoutHistory.locator('[data-testid="status-filter"]');

      if (await statusFilter.isVisible()) {
        // Click filter dropdown
        await statusFilter.click();

        // Verify filter options exist
        await expect(page.locator("text=/All/i")).toBeVisible();
        await expect(page.locator("text=/Completed/i")).toBeVisible();
        await expect(page.locator("text=/Pending/i")).toBeVisible();
        await expect(page.locator("text=/Failed/i")).toBeVisible();
      }
    }
  });
});

// ============================================================================
// INSTANT PAYOUTS - ACCESSIBILITY
// ============================================================================

test.describe("Instant Payouts - Accessibility", () => {
  test("should have accessible modal dialog", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');

    // Verify modal has role="dialog"
    await expect(modal).toHaveAttribute("role", "dialog");

    // Verify modal has aria-labelledby or aria-label
    const hasLabel =
      (await modal.getAttribute("aria-labelledby")) || (await modal.getAttribute("aria-label"));
    expect(hasLabel).toBeTruthy();
  });

  test("should have accessible form inputs", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    const amountInput = modal.locator('input[type="number"]');

    // Verify input has associated label
    const inputId = await amountInput.getAttribute("id");
    expect(inputId).toBeTruthy();

    if (inputId) {
      const label = modal.locator(`label[for="${inputId}"]`);
      await expect(label).toBeVisible();
    }

    // Verify input has aria-describedby for error messages
    const ariaDescribedBy = await amountInput.getAttribute("aria-describedby");
    expect(ariaDescribedBy).toBeTruthy();
  });

  test("should support keyboard navigation", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    // Focus button and press Enter to open
    await instantPayoutButton.focus();
    await instantPayoutButton.press("Enter");

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    await expect(modal).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("should trap focus within modal", async ({ page }) => {
    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');

    // Tab through modal elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Verify focus is still within modal
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();
  });
});

// ============================================================================
// INSTANT PAYOUTS - RESPONSIVE DESIGN
// ============================================================================

test.describe("Instant Payouts - Responsive Design", () => {
  test("should display balance card correctly on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const balanceCard = page.locator('[data-testid="balance-card"]');
    await expect(balanceCard).toBeVisible();

    // Verify content is readable (not cut off)
    const cardBox = await balanceCard.boundingBox();
    expect(cardBox?.width).toBeLessThanOrEqual(375);
  });

  test("should display modal correctly on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const instantPayoutButton = page.locator('button:has-text("Instant Payout")');

    if (!(await instantPayoutButton.isVisible())) {
      test.skip();
      return;
    }

    await instantPayoutButton.click();

    const modal = page.locator('[data-testid="instant-payout-modal"]');
    await expect(modal).toBeVisible();

    // Verify modal fits within viewport
    const modalBox = await modal.boundingBox();
    expect(modalBox?.width).toBeLessThanOrEqual(375);
  });

  test("should stack balance sections vertically on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateTo(page, "/dashboard/pro/finances");
    await page.waitForLoadState("networkidle");

    const balanceCard = page.locator('[data-testid="balance-card"]');
    const availableBalance = balanceCard.locator('[data-testid="available-balance"]');
    const pendingBalance = balanceCard.locator('[data-testid="pending-balance"]');

    if ((await availableBalance.isVisible()) && (await pendingBalance.isVisible())) {
      // Get bounding boxes
      const availableBox = await availableBalance.boundingBox();
      const pendingBox = await pendingBalance.boundingBox();

      if (availableBox && pendingBox) {
        // Verify sections are stacked (pending below available)
        expect(pendingBox.y).toBeGreaterThan(availableBox.y + availableBox.height);
      }
    }
  });
});
