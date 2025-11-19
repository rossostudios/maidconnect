import { test as setup } from "@playwright/test";
import { loginAsCustomer } from "../utils/test-helpers";

/**
 * Authentication Setup for E2E Tests
 *
 * This setup script runs before all tests to establish an authenticated session.
 * It saves the authentication state to a file that all tests can reuse.
 *
 * Prerequisites:
 * - Test user must exist in database (see docs/amara-v2-e2e-testing-setup.md)
 * - Environment variables must be set in .env.test.local
 * - PostHog feature flags must be enabled for test user
 */

const authFile = "tests/playwright/.auth/customer.json";

setup("authenticate as customer", async ({ page }) => {
  const email = process.env.TEST_CUSTOMER_EMAIL || "test-customer@casaora.test";
  const password = process.env.TEST_CUSTOMER_PASSWORD || "TestPassword123!";

  console.log(`[auth.setup] Logging in as ${email}...`);

  // Use the existing test helper to log in
  await loginAsCustomer(page, email, password);

  // Wait for successful redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 10000 });

  console.log("[auth.setup] Login successful, saving authentication state...");

  // Save authentication state to file
  await page.context().storageState({ path: authFile });

  console.log(`[auth.setup] Authentication state saved to ${authFile}`);
});
