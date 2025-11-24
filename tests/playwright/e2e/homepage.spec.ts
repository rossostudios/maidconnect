import { expect, test } from "@playwright/test";
import { expectTextPresent, navigateTo } from "../utils/test-helpers";

/**
 * Homepage E2E Tests
 *
 * Tests for the main landing page and navigation.
 */

const TITLE_REGEX = /Casaora/;
const LOGIN_URL_REGEX = /\/en\/auth\/sign-in/;
const SIGNUP_URL_REGEX = /\/en\/auth\/sign-up/;
const HOMEPAGE_URL = "/en";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page }) => {
    await navigateTo(page, HOMEPAGE_URL);
    await expect(page).toHaveTitle(TITLE_REGEX);
  });

  test("should display hero section with CTA", async ({ page }) => {
    await navigateTo(page, HOMEPAGE_URL);

    // Check for hero content - actual headline
    await expect(page.locator("h1")).toContainText("Book trusted home help");

    // Check for search button (main CTA)
    await expect(page.locator('button:has-text("Search")').first()).toBeVisible();
  });

  test("should have navigation menu", async ({ page }) => {
    await navigateTo(page, HOMEPAGE_URL);

    // Check for main navigation items via dropdown buttons
    await expect(page.locator('button:has-text("Professionals")')).toBeVisible();
    await expect(page.locator('button:has-text("Customers")')).toBeVisible();
  });

  test("should have menu button", async ({ page }) => {
    await navigateTo(page, HOMEPAGE_URL);

    // Check for menu button (opens auth options)
    const menuButton = page.locator('button[aria-label="Open menu"]').first();
    await expect(menuButton).toBeVisible();
  });

  test("should display benefits section", async ({ page }) => {
    await navigateTo(page, HOMEPAGE_URL);

    // Scroll to benefits section
    await page.evaluate(() => window.scrollTo(0, 800));

    // Check for benefits section heading
    await expect(page.locator("h2").filter({ hasText: "Why choose Casaora" })).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateTo(page, HOMEPAGE_URL);

    // Check mobile menu button exists (use aria-controls for mobile-menu specifically)
    const mobileMenu = page.locator('button[aria-controls="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  test("should have working footer links", async ({ page }) => {
    await navigateTo(page, HOMEPAGE_URL);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links
    await expect(page.locator('footer a:has-text("Privacy")')).toBeVisible();
    await expect(page.locator('footer a:has-text("Terms")')).toBeVisible();
  });

  test("should accept cookies", async ({ page }) => {
    await navigateTo(page, HOMEPAGE_URL);

    // Wait for cookie banner to appear
    await page.waitForTimeout(1500); // Banner has 1s delay

    // Check if cookie banner heading is visible (use first() for multiple matches)
    const cookieBanner = page.getByRole("heading", { name: "We use cookies" });
    await expect(cookieBanner.first()).toBeVisible();

    // Click accept button
    await page.click('button:has-text("Accept")');

    // Banner should disappear
    await expect(cookieBanner.first()).not.toBeVisible();
  });
});
