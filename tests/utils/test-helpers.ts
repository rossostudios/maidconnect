import { expect, Page } from "@playwright/test";

/**
 * Test Helpers
 *
 * Reusable helper functions for Playwright tests.
 */

/**
 * Wait for page to be fully loaded including network idle
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
}

/**
 * Login as a customer
 */
export async function loginAsCustomer(
  page: Page,
  email = "customer@test.com",
  password = "password123"
) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await waitForPageLoad(page);
}

/**
 * Login as a professional
 */
export async function loginAsProfessional(
  page: Page,
  email = "pro@test.com",
  password = "password123"
) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await waitForPageLoad(page);
}

/**
 * Logout
 */
export async function logout(page: Page) {
  // Navigate to dashboard and click logout
  await page.goto("/dashboard");
  await page.click('button:has-text("Logout")');
  await waitForPageLoad(page);
}

/**
 * Navigate to a route and wait for it to load
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await waitForPageLoad(page);
}

/**
 * Fill a form field by label
 */
export async function fillFormField(page: Page, label: string, value: string) {
  const input = page.locator(`label:has-text("${label}")`).locator("..");
  await input.locator("input, textarea, select").first().fill(value);
}

/**
 * Click a button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.click(`button:has-text("${text}")`);
}

/**
 * Wait for a toast notification to appear
 */
export async function waitForToast(page: Page, message?: string) {
  if (message) {
    await expect(page.locator(`[role="alert"]:has-text("${message}")`)).toBeVisible();
  } else {
    await expect(page.locator('[role="alert"]')).toBeVisible();
  }
}

/**
 * Check if element is visible
 */
export async function expectVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible();
}

/**
 * Check if text is present on page
 */
export async function expectTextPresent(page: Page, text: string) {
  await expect(page.locator(`text=${text}`)).toBeVisible();
}

/**
 * Take a screenshot with a custom name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}

/**
 * Mock Supabase authentication
 */
export async function mockAuth(page: Page, userId: string, userType: "customer" | "professional") {
  await page.addInitScript(
    ({ userId, userType }) => {
      // Mock localStorage for auth session
      localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          currentSession: {
            access_token: "mock_token",
            user: {
              id: userId,
              email: `${userType}@test.com`,
              user_metadata: { user_type: userType },
            },
          },
        })
      );
    },
    { userId, userType }
  );
}
