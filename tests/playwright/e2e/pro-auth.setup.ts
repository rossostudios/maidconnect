import { test as setup } from "@playwright/test";
import { loginAsProfessional } from "../utils/test-helpers";

/**
 * Professional Authentication Setup for E2E Tests
 *
 * This setup script runs before professional-only tests to establish an authenticated session.
 * It saves the authentication state to a file that all professional tests can reuse.
 *
 * Prerequisites:
 * - Test professional user must exist in database
 * - Environment variables must be set in .env.test.local
 * - Professional must have completed onboarding
 * - Professional must have bank account linked (for payout tests)
 */

const authFile = "tests/playwright/.auth/professional.json";

setup("authenticate as professional", async ({ page }) => {
  const email = process.env.TEST_PROFESSIONAL_EMAIL || "test-pro@casaora.test";
  const password = process.env.TEST_PROFESSIONAL_PASSWORD || "TestPassword123!";

  console.log(`[pro-auth.setup] Logging in as ${email}...`);

  // Use the existing test helper to log in
  await loginAsProfessional(page, email, password);

  // Wait for successful redirect to any dashboard (customer or pro)
  // Some professionals may redirect to customer dashboard first if not fully onboarded
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });

  const currentUrl = page.url();
  console.log(`[pro-auth.setup] Redirected to: ${currentUrl}`);

  // If not on pro dashboard, navigate there explicitly
  if (!currentUrl.includes("/dashboard/pro")) {
    console.log("[pro-auth.setup] Navigating to pro dashboard...");
    await page.goto("/en/dashboard/pro");
    await page.waitForLoadState("networkidle");
  }

  console.log("[pro-auth.setup] Login successful, saving authentication state...");

  // Save authentication state to file
  await page.context().storageState({ path: authFile });

  console.log(`[pro-auth.setup] Authentication state saved to ${authFile}`);
});
