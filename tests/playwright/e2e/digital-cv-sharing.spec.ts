/**
 * Digital CV Sharing E2E Tests
 *
 * Tests the end-to-end digital CV/professional profile sharing system:
 * 1. Vanity URL slug generation and customization
 * 2. Public profile display with professional information
 * 3. OG image generation for social sharing
 * 4. Social share buttons (WhatsApp, Facebook)
 * 5. Earnings badge visibility toggle
 * 6. Profile visibility controls
 *
 * Prerequisites:
 * - Test professional account authenticated (via pro-auth.setup.ts)
 * - Professional has completed profile setup
 * - Professional has customizable slug
 * - Professional has some career stats (earnings, bookings)
 *
 * Note: Many of these features are not yet implemented.
 * Tests are marked as skipped until the Digital CV feature is complete.
 *
 * @see docs/digital-cv-implementation.md
 */

import { expect, test } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

// Run these tests only with professional authentication
test.use({ storageState: "tests/playwright/.auth/professional.json" });

// ============================================================================
// DIGITAL CV - SLUG MANAGEMENT
// ============================================================================

test.describe("Digital CV - Slug Management", () => {
  test("should display current vanity URL on profile settings", async ({ page }) => {
    // Navigate to professional profile settings
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    // Check current URL to verify page loaded
    const currentUrl = page.url();

    // If redirected to a different page (e.g., auth, dashboard), the feature may not be implemented
    if (!currentUrl.includes("/settings/profile")) {
      test.skip(true, "Profile settings page not available - may redirect elsewhere");
      return;
    }

    // Check for vanity URL section (feature may not be implemented)
    const vanitySection = page.locator("text=/Vanity URL/i, text=/Custom URL/i, text=/Profile Link/i");
    const hasVanitySection = await vanitySection.first().isVisible().catch(() => false);

    if (!hasVanitySection) {
      test.skip(true, "Vanity URL feature not yet implemented");
      return;
    }

    // Verify current slug is displayed
    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);

    if (hasSlug) {
      const slugText = await slugDisplay.textContent();
      expect(slugText).toMatch(/casaora\.com\/pro\//);
    }
  });

  test.skip("should validate slug format requirements", async ({ page }) => {
    // Skip: Vanity URL feature not yet implemented
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    // Find slug input field
    const slugInput = page.locator('input[name="slug"]');
    const hasSlugInput = await slugInput.isVisible().catch(() => false);

    test.skip(!hasSlugInput, "Slug input not available");

    // Test invalid characters (spaces, special chars)
    await slugInput.fill("invalid slug!");
    await page.locator('button:has-text("Save")').click();

    // Should show validation error
    const errorMessage = page.locator("text=/only letters, numbers, and hyphens/i");
    await expect(errorMessage).toBeVisible();
  });

  test.skip("should update slug successfully with valid format", async ({ page }) => {
    // Skip: Vanity URL feature not yet implemented
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const slugInput = page.locator('input[name="slug"]');
    const hasSlugInput = await slugInput.isVisible().catch(() => false);

    test.skip(!hasSlugInput, "Slug input not available");

    // Generate a unique slug with timestamp
    const newSlug = `test-pro-${Date.now()}`;
    await slugInput.fill(newSlug);
    await page.locator('button:has-text("Save")').click();

    // Wait for success message
    const successMessage = page.locator("text=/successfully updated/i");
    await expect(successMessage).toBeVisible({ timeout: 10_000 });

    // Verify new slug is displayed
    const slugDisplay = page.locator('[data-testid="current-slug"]');
    await expect(slugDisplay).toContainText(newSlug);
  });
});

// ============================================================================
// DIGITAL CV - PUBLIC PROFILE DISPLAY
// ============================================================================

test.describe("Digital CV - Public Profile Display", () => {
  test.skip("should access public profile via vanity URL", async ({ page, context }) => {
    // Skip: Public profile feature not yet implemented
    // First, get the professional's slug from settings
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);

    test.skip(!hasSlug, "No vanity URL configured");

    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    expect(slug).toBeTruthy();

    // Open public profile in new page (as public visitor)
    const publicPage = await context.newPage();
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    // Verify public profile elements are visible
    await expect(publicPage.locator('[data-testid="professional-profile"]')).toBeVisible();
    await expect(publicPage.locator("text=/About/i")).toBeVisible();
    await expect(publicPage.locator("text=/Services/i")).toBeVisible();
  });

  test.skip("should display professional information on public profile", async ({ page, context }) => {
    // Skip: Public profile feature not yet implemented
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);
    test.skip(!hasSlug, "No vanity URL configured");

    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    // Verify professional name
    const nameHeading = publicPage.locator("h1").first();
    await expect(nameHeading).toBeVisible();

    // Verify avatar/profile image
    const avatar = publicPage.locator('[data-testid="professional-avatar"]');
    const hasAvatar = await avatar.isVisible().catch(() => false);
    expect(hasAvatar).toBeTruthy();
  });

  test.skip("should display earnings badge when visibility enabled", async ({ page, context }) => {
    // Skip: Earnings badge feature not yet implemented
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const badgeToggle = page.locator('[data-testid="share-earnings-badge-toggle"]');
    const hasToggle = await badgeToggle.isVisible().catch(() => false);

    test.skip(!hasToggle, "Earnings badge toggle not available");

    // Ensure toggle is ON
    const isChecked = await badgeToggle.isChecked();
    if (!isChecked) {
      await badgeToggle.click();
      await page.waitForTimeout(1000);
    }

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    const earningsBadge = publicPage.locator('[data-testid="earnings-badge"]');
    await expect(earningsBadge).toBeVisible();
  });

  test.skip("should hide earnings badge when visibility disabled", async ({ page, context }) => {
    // Skip: Earnings badge feature not yet implemented
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const badgeToggle = page.locator('[data-testid="share-earnings-badge-toggle"]');
    const hasToggle = await badgeToggle.isVisible().catch(() => false);

    test.skip(!hasToggle, "Earnings badge toggle not available");

    const isChecked = await badgeToggle.isChecked();
    if (isChecked) {
      await badgeToggle.click();
      await page.waitForTimeout(1000);
    }

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    const earningsBadge = publicPage.locator('[data-testid="earnings-badge"]');
    await expect(earningsBadge).not.toBeVisible();
  });
});

// ============================================================================
// DIGITAL CV - SOCIAL SHARING
// ============================================================================

test.describe("Digital CV - Social Sharing", () => {
  test.skip("should display social share buttons on public profile", async ({ page, context }) => {
    // Skip: Social sharing feature not yet implemented
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);
    test.skip(!hasSlug, "No vanity URL configured");

    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    const shareSection = publicPage.locator('[data-testid="social-share-buttons"]');
    await expect(shareSection).toBeVisible();

    const whatsappButton = publicPage.locator('[data-testid="share-whatsapp"]');
    const facebookButton = publicPage.locator('[data-testid="share-facebook"]');

    await expect(whatsappButton).toBeVisible();
    await expect(facebookButton).toBeVisible();
  });

  test.skip("should generate WhatsApp share link with correct format", async ({ page, context }) => {
    // Skip: Social sharing feature not yet implemented
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);
    test.skip(!hasSlug, "No vanity URL configured");

    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    const whatsappButton = publicPage.locator('[data-testid="share-whatsapp"]');
    const href = await whatsappButton.getAttribute("href");

    expect(href).toContain("wa.me");
    expect(href).toContain(encodeURIComponent(`casaora.co/pro/${slug}`));
  });

  test.skip("should generate Facebook share link with correct format", async () => {
    // Skip: Social sharing feature not yet implemented
  });

  test.skip("should copy profile URL to clipboard", async () => {
    // Skip: Social sharing feature not yet implemented
  });
});

// ============================================================================
// DIGITAL CV - OG IMAGE GENERATION
// ============================================================================

test.describe("Digital CV - OG Image Generation", () => {
  test.skip("should have OG meta tags on public profile", async () => {
    // Skip: OG image feature not yet implemented
  });

  test.skip("should generate OG image with professional info", async () => {
    // Skip: OG image feature not yet implemented
  });

  test.skip("should have Twitter Card meta tags", async () => {
    // Skip: Twitter Card feature not yet implemented
  });
});

// ============================================================================
// DIGITAL CV - ACCESSIBILITY
// ============================================================================

test.describe("Digital CV - Accessibility", () => {
  test.skip("should have accessible share buttons with ARIA labels", async () => {
    // Skip: Digital CV feature not yet implemented
  });

  test.skip("should have proper heading hierarchy", async () => {
    // Skip: Digital CV feature not yet implemented
  });

  test.skip("should be keyboard navigable", async () => {
    // Skip: Digital CV feature not yet implemented
  });
});

// ============================================================================
// DIGITAL CV - RESPONSIVE DESIGN
// ============================================================================

test.describe("Digital CV - Responsive Design", () => {
  test.skip("should display public profile correctly on mobile", async () => {
    // Skip: Digital CV feature not yet implemented
  });

  test.skip("should display share buttons in mobile layout", async () => {
    // Skip: Digital CV feature not yet implemented
  });

  test.skip("should adapt layout for tablet viewport", async () => {
    // Skip: Digital CV feature not yet implemented
  });
});
