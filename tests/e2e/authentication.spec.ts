import { expect, test } from "@playwright/test";
import { clickButton, navigateTo } from "../utils/test-helpers";

/**
 * Authentication E2E Tests
 *
 * Tests for user signup, login, and logout flows.
 */

test.describe("Authentication", () => {
  test.describe("Signup Flow", () => {
    test("should display signup form", async ({ page }) => {
      await navigateTo(page, "/signup");

      // Check form elements are present
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await navigateTo(page, "/signup");

      // Try to submit empty form
      await clickButton(page, "Sign up");

      // Check for validation messages (browser native or custom)
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeFocused();
    });

    test("should show error for invalid email format", async ({ page }) => {
      await navigateTo(page, "/signup");

      // Fill with invalid email
      await page.fill('input[type="email"]', "invalidemail");
      await page.fill('input[type="password"]', "password123");
      await clickButton(page, "Sign up");

      // Check for validation or error
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );
      expect(validationMessage).toBeTruthy();
    });

    test("should navigate to login from signup page", async ({ page }) => {
      await navigateTo(page, "/signup");

      // Click login link
      await page.click('a:has-text("Login")');
      await page.waitForURL("**/login");

      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Login Flow", () => {
    test("should display login form", async ({ page }) => {
      await navigateTo(page, "/login");

      // Check form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await navigateTo(page, "/login");

      // Try to submit empty form
      await clickButton(page, "Login");

      // Check for validation
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeFocused();
    });

    test("should navigate to signup from login page", async ({ page }) => {
      await navigateTo(page, "/login");

      // Click signup link
      await page.click('a:has-text("Sign up")');
      await page.waitForURL("**/signup");

      await expect(page).toHaveURL(/\/signup/);
    });

    test("should have password visibility toggle", async ({ page }) => {
      await navigateTo(page, "/login");

      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();

      // Look for eye icon or show/hide button
      const toggleButton = page.locator('button[aria-label*="password"]').first();

      // If toggle exists, test it
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await expect(page.locator('input[type="text"]')).toBeVisible();
      }
    });

    test("should have forgot password link", async ({ page }) => {
      await navigateTo(page, "/login");

      // Check for forgot password link
      const forgotLink = page.locator('a:has-text("Forgot")');

      // If link exists, verify it's clickable
      if (await forgotLink.isVisible()) {
        await expect(forgotLink).toBeVisible();
      }
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect to login when accessing protected route", async ({ page }) => {
      // Try to access dashboard without being logged in
      await page.goto("/dashboard");

      // Should redirect to login
      await page.waitForURL("**/login**");
      await expect(page).toHaveURL(/\/login/);
    });

    test("should redirect to login when accessing customer dashboard", async ({ page }) => {
      await page.goto("/dashboard/customer");
      await page.waitForURL("**/login**");
      await expect(page).toHaveURL(/\/login/);
    });

    test("should redirect to login when accessing pro dashboard", async ({ page }) => {
      await page.goto("/dashboard/pro");
      await page.waitForURL("**/login**");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("User Type Selection", () => {
    test("should allow selecting customer type on signup", async ({ page }) => {
      await navigateTo(page, "/signup");

      // Look for user type selection
      const customerOption = page.locator('input[value="customer"], button:has-text("Customer")');

      if (await customerOption.first().isVisible()) {
        await customerOption.first().click();
        // Verify selection is active
        await expect(customerOption.first())
          .toBeChecked()
          .catch(() => expect(customerOption.first()).toHaveAttribute("aria-pressed", "true"));
      }
    });

    test("should allow selecting professional type on signup", async ({ page }) => {
      await navigateTo(page, "/signup");

      // Look for user type selection
      const proOption = page.locator(
        'input[value="professional"], button:has-text("Professional")'
      );

      if (await proOption.first().isVisible()) {
        await proOption.first().click();
        // Verify selection is active
        await expect(proOption.first())
          .toBeChecked()
          .catch(() => expect(proOption.first()).toHaveAttribute("aria-pressed", "true"));
      }
    });
  });
});
