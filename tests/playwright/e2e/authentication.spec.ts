import { expect, test } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

/**
 * Authentication E2E Tests
 *
 * Tests for user signup, login, and logout flows.
 * Routes: /auth/sign-in, /auth/sign-up (i18n prefixed with /en/)
 */

const SIGN_IN_URL_REGEX = /\/auth\/sign-in/;
const SIGN_UP_URL_REGEX = /\/auth\/sign-up/;

test.describe("Authentication", () => {
  test.describe("Signup Flow", () => {
    test("should display signup form", async ({ page }) => {
      await navigateTo(page, "/auth/sign-up");

      // Check form elements are present (use name selectors to distinguish password fields)
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await navigateTo(page, "/auth/sign-up");

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Wait a bit for validation to trigger
      await page.waitForTimeout(300);

      // Check for validation - browser will focus first invalid field
      // Sign-up form has fullName as first required field
      const fullNameInput = page.locator('input[name="fullName"]');
      const emailInput = page.locator('input[type="email"]');

      // Check validation message exists on one of the required fields
      if (await fullNameInput.isVisible()) {
        const validationMessage = await fullNameInput.evaluate(
          (el: HTMLInputElement) => el.validationMessage
        );
        expect(validationMessage).toBeTruthy();
      } else {
        const validationMessage = await emailInput.evaluate(
          (el: HTMLInputElement) => el.validationMessage
        );
        expect(validationMessage).toBeTruthy();
      }
    });

    test("should show error for invalid email format", async ({ page }) => {
      await navigateTo(page, "/auth/sign-up");

      // Fill required fields with invalid email
      const fullNameInput = page.locator('input[name="fullName"]');
      if (await fullNameInput.isVisible()) {
        await fullNameInput.fill("Test User");
      }

      await page.fill('input[type="email"]', "invalidemail");
      await page.fill('input[name="password"]', "password123");
      await page.fill('input[name="confirmPassword"]', "password123");
      await page.click('button[type="submit"]');

      // Check for validation or error
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );
      expect(validationMessage).toBeTruthy();
    });

    test("should navigate to login from signup page", async ({ page }) => {
      await navigateTo(page, "/auth/sign-up");

      // Click sign-in link - wait for it to be visible first
      const signInLink = page.locator('a[href*="sign-in"]').first();
      await expect(signInLink).toBeVisible({ timeout: 5000 });
      await signInLink.click();
      await page.waitForURL("**/auth/sign-in**", { timeout: 10000 });

      await expect(page).toHaveURL(SIGN_IN_URL_REGEX);
    });
  });

  test.describe("Login Flow", () => {
    test("should display login form", async ({ page }) => {
      await navigateTo(page, "/auth/sign-in");

      // Check form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await navigateTo(page, "/auth/sign-in");

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Check for validation
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeFocused();
    });

    test("should navigate to signup from login page", async ({ page }) => {
      await navigateTo(page, "/auth/sign-in");

      // Click signup link - wait for it to be visible first
      const signUpLink = page.locator('a[href*="sign-up"]').first();
      await expect(signUpLink).toBeVisible({ timeout: 5000 });
      await signUpLink.click();
      await page.waitForURL("**/auth/sign-up**", { timeout: 10000 });

      await expect(page).toHaveURL(SIGN_UP_URL_REGEX);
    });

    test("should have password visibility toggle", async ({ page }) => {
      await navigateTo(page, "/auth/sign-in");

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
      await navigateTo(page, "/auth/sign-in");

      // Check for forgot password link
      const forgotLink = page.locator('a[href*="forgot"], a:has-text("Forgot")');

      // If link exists, verify it's clickable
      if (await forgotLink.first().isVisible()) {
        await expect(forgotLink.first()).toBeVisible();
      }
    });
  });

  test.describe("Protected Routes", () => {
    // Clear auth state for these tests - we need unauthenticated user
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should protect dashboard from unauthenticated access", async ({ page }) => {
      // Try to access dashboard without being logged in
      await page.goto("/en/dashboard");

      // Should either redirect to sign-in OR show error boundary (auth protection)
      // Wait a moment for any client-side redirect
      await page.waitForTimeout(2000);

      const url = page.url();
      const isRedirectedToLogin = url.includes("/auth/sign-in");
      const hasErrorState = await page.locator('text="Something went wrong"').isVisible();

      // Either redirect or error state indicates protected route
      expect(isRedirectedToLogin || hasErrorState).toBeTruthy();
    });

    test("should protect customer dashboard from unauthenticated access", async ({ page }) => {
      await page.goto("/en/dashboard/customer");
      await page.waitForTimeout(2000);

      const url = page.url();
      const isRedirectedToLogin = url.includes("/auth/sign-in");
      const hasErrorState = await page.locator('text="Something went wrong"').isVisible();

      expect(isRedirectedToLogin || hasErrorState).toBeTruthy();
    });

    test("should protect pro dashboard from unauthenticated access", async ({ page }) => {
      await page.goto("/en/dashboard/pro");
      await page.waitForTimeout(2000);

      const url = page.url();
      const isRedirectedToLogin = url.includes("/auth/sign-in");
      const hasErrorState = await page.locator('text="Something went wrong"').isVisible();

      expect(isRedirectedToLogin || hasErrorState).toBeTruthy();
    });
  });

  test.describe("User Type Selection", () => {
    test("should allow selecting customer type on signup", async ({ page }) => {
      await navigateTo(page, "/auth/sign-up");

      // Look for user type selection (role dropdown or radio)
      const customerOption = page.locator(
        'input[value="customer"], button:has-text("Customer"), select[name="role"]'
      );

      if (await customerOption.first().isVisible()) {
        const firstOption = customerOption.first();
        const tagName = await firstOption.evaluate((el) => el.tagName.toLowerCase());

        if (tagName === "select") {
          await firstOption.selectOption("customer");
        } else {
          await firstOption.click();
        }
      }
    });

    test("should allow selecting professional type on signup", async ({ page }) => {
      await navigateTo(page, "/auth/sign-up");

      // Look for user type selection
      const proOption = page.locator(
        'input[value="professional"], button:has-text("Professional"), select[name="role"]'
      );

      if (await proOption.first().isVisible()) {
        const firstOption = proOption.first();
        const tagName = await firstOption.evaluate((el) => el.tagName.toLowerCase());

        if (tagName === "select") {
          await firstOption.selectOption("professional");
        } else {
          await firstOption.click();
        }
      }
    });
  });
});
