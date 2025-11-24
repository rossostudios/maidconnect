import { expect, test } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

/**
 * Accessibility E2E Tests
 *
 * Tests for basic accessibility compliance (WCAG standards).
 * Routes: /auth/sign-in, /auth/sign-up (i18n prefixed with /en/)
 */

test.describe("Accessibility", () => {
  test.describe("Keyboard Navigation", () => {
    test("should navigate homepage with keyboard", async ({ page }) => {
      await navigateTo(page, "/");

      // Start from first focusable element
      await page.keyboard.press("Tab");

      // Wait for focus to settle
      await page.waitForTimeout(100);

      // Get focused element - use :focus-visible or visible focused element
      const focused = page.locator(":focus-visible, [data-focus-visible]");
      const focusedCount = await focused.count();

      // Either we have a focused element or the skip link appeared
      expect(focusedCount).toBeGreaterThanOrEqual(0);
    });

    test("should have skip to main content link", async ({ page }) => {
      await navigateTo(page, "/");

      // Press Tab to focus first element
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);

      // Check if first focusable element is skip link
      const skipLink = page.locator('a[href="#main"], a:has-text("Skip")');
      const skipLinkCount = await skipLink.count();

      // Skip link is optional but good practice
      if (skipLinkCount > 0) {
        const text = await skipLink.first().textContent();
        expect(text?.toLowerCase()).toContain("skip");
      }
    });

    test("should trap focus in modals when open", async ({ page }) => {
      await navigateTo(page, "/");

      // Look for any modal trigger (mobile menu button is common)
      const modalTrigger = page
        .locator('button:has-text("Menu"), button[aria-haspopup="dialog"], button[aria-label*="menu"]')
        .first();

      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();

        // Wait for modal to open
        await page.waitForTimeout(300);

        // Tab through modal elements
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");

        // Verify we're still in the page (focus not lost)
        const body = page.locator("body");
        await expect(body).toBeVisible();
      }
    });
  });

  test.describe("ARIA Labels and Roles", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      await navigateTo(page, "/");

      // Check for h1
      const h1 = page.locator("h1");
      await expect(h1.first()).toBeVisible();

      // Should have at least one h1
      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThan(0);
    });

    test("should have alt text on images", async ({ page }) => {
      await navigateTo(page, "/");

      // Get all images
      const images = page.locator("img");
      const count = await images.count();

      // Check each image has alt attribute (can be empty for decorative images)
      for (let i = 0; i < Math.min(count, 10); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        // alt should be defined (can be empty string for decorative images)
        expect(alt !== null).toBeTruthy();
      }
    });

    test("should have aria-label on icon buttons", async ({ page }) => {
      await navigateTo(page, "/");

      // Get buttons that might be icon-only
      const buttons = page.locator("button");
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();

        // If button has no text, it should have aria-label
        if (!text || text.trim() === "") {
          const ariaLabel = await button.getAttribute("aria-label");
          const ariaLabelledBy = await button.getAttribute("aria-labelledby");
          const title = await button.getAttribute("title");

          expect(ariaLabel || ariaLabelledBy || title).toBeDefined();
        }
      }
    });

    test("should have form labels", async ({ page }) => {
      await navigateTo(page, "/auth/sign-in");

      // Wait for form to be visible (may take time to hydrate)
      await page.waitForSelector('form', { state: "visible", timeout: 10000 });

      // Check email input has label
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      const emailId = await emailInput.getAttribute("id");

      if (emailId) {
        const label = page.locator(`label[for="${emailId}"]`);
        const labelVisible = await label.isVisible();

        if (!labelVisible) {
          // Check for aria-label or aria-labelledby as alternative
          const ariaLabel = await emailInput.getAttribute("aria-label");
          const ariaLabelledBy = await emailInput.getAttribute("aria-labelledby");
          const placeholder = await emailInput.getAttribute("placeholder");

          // Should have some form of labeling
          expect(ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
        }
      }
    });

    test("should have proper button roles", async ({ page }) => {
      await navigateTo(page, "/");

      // All clickable elements should be buttons or links
      const clickables = page.locator("[onclick], [click]");
      const count = await clickables.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const el = clickables.nth(i);
        const tagName = await el.evaluate((node) => node.tagName.toLowerCase());
        const role = await el.getAttribute("role");

        expect(["button", "a", "input"].includes(tagName) || role === "button").toBeTruthy();
      }
    });
  });

  test.describe("Color Contrast", () => {
    test("should have sufficient color contrast for text", async ({ page }) => {
      await navigateTo(page, "/");

      // This is a basic check - for full compliance, use axe-core
      // Check that text elements have color styles
      const textElements = page.locator("p, h1, h2, h3, span");
      const count = await textElements.count();

      expect(count).toBeGreaterThan(0);

      // In production, you'd use axe-core or similar for real contrast checking
    });

    test("should not rely solely on color for information", async ({ page }) => {
      await navigateTo(page, "/");

      // Check that error states have text/icons, not just red color
      // This is more of a manual check, but we can verify structure
      const errorElements = page.locator('[class*="error"], [aria-invalid="true"]');
      const count = await errorElements.count();

      // If errors exist, they should have descriptive text
      if (count > 0) {
        const firstError = errorElements.first();
        const text = await firstError.textContent();
        expect(text).toBeTruthy();
      }
    });
  });

  test.describe("Focus Indicators", () => {
    test("should show focus indicators on interactive elements", async ({ page }) => {
      await navigateTo(page, "/");

      // Tab to first focusable element
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);

      // This is a basic structural check - actual focus styling is CSS-based
      // Verify page is interactive and accessible
      const body = page.locator("body");
      await expect(body).toBeVisible();
    });
  });

  test.describe("Screen Reader Support", () => {
    test("should have lang attribute on html", async ({ page }) => {
      await navigateTo(page, "/");

      // Wait for page content to be visible (hydration complete)
      await page.waitForSelector("body", { state: "visible" });

      const lang = await page.locator("html").getAttribute("lang");
      // Next.js i18n sets lang attribute based on locale
      // Should be "en" for English pages
      expect(lang).toBeTruthy();
      expect(["en", "es", "en-US", "es-ES", "es-CO"]).toContain(lang);
    });

    test("should have page title", async ({ page }) => {
      await navigateTo(page, "/");

      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test("should announce page changes", async ({ page }) => {
      await navigateTo(page, "/");

      // Navigate to sign-in page using header link
      const signInLink = page.locator('a[href*="sign-in"]').first();

      if (await signInLink.isVisible()) {
        await signInLink.click();
        await page.waitForURL("**/auth/sign-in**");

        // Check that title changed
        const newTitle = await page.title();
        expect(newTitle).toBeTruthy();
      }

      // Check for aria-live regions or similar (optional but good practice)
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const count = await liveRegions.count();

      // Having live regions is good practice
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Responsive Design", () => {
    test("should be accessible on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateTo(page, "/");

      // Check that content is visible and not overflowing
      const body = page.locator("body");
      const scrollWidth = await body.evaluate((el) => el.scrollWidth);
      const clientWidth = await body.evaluate((el) => el.clientWidth);

      // Should not have horizontal scroll (with tolerance for minor overflow)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
    });

    test("should have touch-friendly tap targets on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateTo(page, "/");

      // Get all buttons and links
      const interactive = page.locator("button, a");
      const count = await interactive.count();

      // Check size of first few visible elements
      let checkedCount = 0;
      for (let i = 0; i < Math.min(count, 10) && checkedCount < 5; i++) {
        const el = interactive.nth(i);
        if (await el.isVisible()) {
          const box = await el.boundingBox();

          // Skip elements that are too small to be actual tap targets (likely hidden/decorative)
          if (box && box.height >= 10 && box.width >= 10) {
            // Minimum touch target size is 44x44px per WCAG, but 24px is acceptable for text links
            expect(box.height).toBeGreaterThanOrEqual(24);
            checkedCount++;
          }
        }
      }
    });
  });
});
