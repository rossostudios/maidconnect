import { expect, test } from "@playwright/test";
import { expectTextPresent, navigateTo } from "../utils/test-helpers";

/**
 * Homepage E2E Tests
 *
 * Tests for the main landing page and navigation.
 */

const TITLE_REGEX = /Casaora/;
const LOGIN_URL_REGEX = /\/login/;
const SIGNUP_URL_REGEX = /\/signup/;

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page }) => {
    await navigateTo(page, "/");
    await expect(page).toHaveTitle(TITLE_REGEX);
  });

  test("should display hero section with CTA", async ({ page }) => {
    await navigateTo(page, "/");

    // Check for hero content
    await expectTextPresent(page, "Trusted home professionals for expats in Colombia");

    // Check for CTA buttons
    await expect(page.locator('a:has-text("Find a professional")')).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await navigateTo(page, "/");

    // Click login link in navigation
    await page.click('a:has-text("Login")');
    await page.waitForURL("**/login");

    await expect(page).toHaveURL(LOGIN_URL_REGEX);
  });

  test("should navigate to signup page", async ({ page }) => {
    await navigateTo(page, "/");

    // Click signup link in navigation
    await page.click('a:has-text("Sign up")');
    await page.waitForURL("**/signup");

    await expect(page).toHaveURL(SIGNUP_URL_REGEX);
  });

  test("should display features section", async ({ page }) => {
    await navigateTo(page, "/");

    // Scroll to features section
    await page.evaluate(() => window.scrollTo(0, 500));

    // Check for key features
    await expectTextPresent(page, "How it works");
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateTo(page, "/");

    // Check mobile menu button exists
    const mobileMenu = page.locator('button[aria-label*="menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  test("should have working footer links", async ({ page }) => {
    await navigateTo(page, "/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links
    await expect(page.locator('footer a:has-text("Privacy")')).toBeVisible();
    await expect(page.locator('footer a:has-text("Terms")')).toBeVisible();
  });

  test("should accept cookies", async ({ page }) => {
    await navigateTo(page, "/");

    // Wait for cookie banner to appear
    await page.waitForTimeout(1500); // Banner has 1s delay

    // Check if cookie banner is visible
    const cookieBanner = page.locator("text=We use cookies");
    await expect(cookieBanner).toBeVisible();

    // Click accept button
    await page.click('button:has-text("Accept Cookies")');

    // Banner should disappear
    await expect(cookieBanner).not.toBeVisible();
  });
});
