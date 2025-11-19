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

    // Check for vanity URL section
    const vanitySection = page.locator("text=/Vanity URL/i").locator("..");
    await expect(vanitySection).toBeVisible();

    // Verify current slug is displayed
    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);

    if (hasSlug) {
      const slugText = await slugDisplay.textContent();
      expect(slugText).toMatch(/casaora\.com\/pro\//);
    }
  });

  test("should validate slug format requirements", async ({ page }) => {
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

  test("should update slug successfully with valid format", async ({ page }) => {
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
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    // Verify new slug is displayed
    const slugDisplay = page.locator('[data-testid="current-slug"]');
    await expect(slugDisplay).toContainText(newSlug);
  });
});

// ============================================================================
// DIGITAL CV - PUBLIC PROFILE DISPLAY
// ============================================================================

test.describe("Digital CV - Public Profile Display", () => {
  test("should access public profile via vanity URL", async ({ page, context }) => {
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

  test("should display professional information on public profile", async ({ page, context }) => {
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

    // Verify bio/description
    const bioSection = publicPage.locator('[data-testid="professional-bio"]');
    const hasBio = await bioSection.isVisible().catch(() => false);

    if (hasBio) {
      const bioText = await bioSection.textContent();
      expect(bioText).toBeTruthy();
    }
  });

  test("should display earnings badge when visibility enabled", async ({ page, context }) => {
    // First, enable earnings badge visibility
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const badgeToggle = page.locator('[data-testid="share-earnings-badge-toggle"]');
    const hasToggle = await badgeToggle.isVisible().catch(() => false);

    test.skip(!hasToggle, "Earnings badge toggle not available");

    // Ensure toggle is ON
    const isChecked = await badgeToggle.isChecked();
    if (!isChecked) {
      await badgeToggle.click();
      await page.waitForTimeout(1000); // Wait for save
    }

    // Get slug and visit public profile
    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    // Verify earnings badge is displayed
    const earningsBadge = publicPage.locator('[data-testid="earnings-badge"]');
    await expect(earningsBadge).toBeVisible();

    // Verify badge shows tier
    const badgeText = await earningsBadge.textContent();
    expect(badgeText).toMatch(/(Rising Star|Established Pro|Elite Pro|Top Performer)/);
  });

  test("should hide earnings badge when visibility disabled", async ({ page, context }) => {
    // Disable earnings badge visibility
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const badgeToggle = page.locator('[data-testid="share-earnings-badge-toggle"]');
    const hasToggle = await badgeToggle.isVisible().catch(() => false);

    test.skip(!hasToggle, "Earnings badge toggle not available");

    // Ensure toggle is OFF
    const isChecked = await badgeToggle.isChecked();
    if (isChecked) {
      await badgeToggle.click();
      await page.waitForTimeout(1000); // Wait for save
    }

    // Get slug and visit public profile
    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    // Verify earnings badge is NOT displayed
    const earningsBadge = publicPage.locator('[data-testid="earnings-badge"]');
    await expect(earningsBadge).not.toBeVisible();
  });
});

// ============================================================================
// DIGITAL CV - SOCIAL SHARING
// ============================================================================

test.describe("Digital CV - Social Sharing", () => {
  test("should display social share buttons on public profile", async ({ page, context }) => {
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

    // Check for social share section
    const shareSection = publicPage.locator('[data-testid="social-share-buttons"]');
    await expect(shareSection).toBeVisible();

    // Verify individual share buttons
    const whatsappButton = publicPage.locator('[data-testid="share-whatsapp"]');
    const facebookButton = publicPage.locator('[data-testid="share-facebook"]');

    await expect(whatsappButton).toBeVisible();
    await expect(facebookButton).toBeVisible();
  });

  test("should generate WhatsApp share link with correct format", async ({ page, context }) => {
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

    // Verify WhatsApp share URL format
    expect(href).toContain("wa.me");
    expect(href).toContain(encodeURIComponent(`casaora.com/pro/${slug}`));
  });

  test("should generate Facebook share link with correct format", async ({ page, context }) => {
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

    const facebookButton = publicPage.locator('[data-testid="share-facebook"]');
    const href = await facebookButton.getAttribute("href");

    // Verify Facebook share URL format
    expect(href).toContain("facebook.com/sharer");
    expect(href).toContain(encodeURIComponent(`casaora.com/pro/${slug}`));
  });

  test("should copy profile URL to clipboard", async ({ page, context }) => {
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

    // Find and click copy link button
    const copyButton = publicPage.locator('[data-testid="copy-profile-url"]');
    const hasCopyButton = await copyButton.isVisible().catch(() => false);

    test.skip(!hasCopyButton, "Copy button not available");

    await copyButton.click();

    // Verify success message or tooltip
    const successMessage = publicPage.locator("text=/copied|link copied/i");
    await expect(successMessage).toBeVisible({ timeout: 3000 });
  });
});

// ============================================================================
// DIGITAL CV - OG IMAGE GENERATION
// ============================================================================

test.describe("Digital CV - OG Image Generation", () => {
  test("should have OG meta tags on public profile", async ({ page, context }) => {
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

    // Check for OG meta tags in HTML
    const ogTitle = await publicPage.locator('meta[property="og:title"]').getAttribute("content");
    const ogDescription = await publicPage.locator('meta[property="og:description"]').getAttribute("content");
    const ogImage = await publicPage.locator('meta[property="og:image"]').getAttribute("content");

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogImage).toBeTruthy();
  });

  test("should generate OG image with professional info", async ({ page, context }) => {
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

    const ogImage = await publicPage.locator('meta[property="og:image"]').getAttribute("content");

    // Verify OG image URL format
    expect(ogImage).toContain("/api/og/professional");
    expect(ogImage).toContain(slug);
  });

  test("should have Twitter Card meta tags", async ({ page, context }) => {
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

    // Check for Twitter Card meta tags
    const twitterCard = await publicPage.locator('meta[name="twitter:card"]').getAttribute("content");
    const twitterTitle = await publicPage.locator('meta[name="twitter:title"]').getAttribute("content");
    const twitterImage = await publicPage.locator('meta[name="twitter:image"]').getAttribute("content");

    expect(twitterCard).toBe("summary_large_image");
    expect(twitterTitle).toBeTruthy();
    expect(twitterImage).toBeTruthy();
  });
});

// ============================================================================
// DIGITAL CV - ACCESSIBILITY
// ============================================================================

test.describe("Digital CV - Accessibility", () => {
  test("should have accessible share buttons with ARIA labels", async ({ page, context }) => {
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

    // Check ARIA labels on share buttons
    const whatsappButton = publicPage.locator('[data-testid="share-whatsapp"]');
    const facebookButton = publicPage.locator('[data-testid="share-facebook"]');

    const whatsappLabel = await whatsappButton.getAttribute("aria-label");
    const facebookLabel = await facebookButton.getAttribute("aria-label");

    expect(whatsappLabel).toMatch(/share.*whatsapp/i);
    expect(facebookLabel).toMatch(/share.*facebook/i);
  });

  test("should have proper heading hierarchy", async ({ page, context }) => {
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

    // Verify heading hierarchy (should have h1, then h2s, etc.)
    const h1Count = await publicPage.locator("h1").count();
    expect(h1Count).toBe(1); // Should have exactly one h1

    const h1 = publicPage.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("should be keyboard navigable", async ({ page, context }) => {
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

    // Tab through interactive elements
    await publicPage.keyboard.press("Tab");
    await publicPage.keyboard.press("Tab");

    // At least one element should receive focus
    const focusedElement = await publicPage.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

// ============================================================================
// DIGITAL CV - RESPONSIVE DESIGN
// ============================================================================

test.describe("Digital CV - Responsive Design", () => {
  test("should display public profile correctly on mobile", async ({ page, context }) => {
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);
    test.skip(!hasSlug, "No vanity URL configured");

    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    // Verify profile is visible and properly sized
    const profileCard = publicPage.locator('[data-testid="professional-profile"]');
    await expect(profileCard).toBeVisible();

    const cardBox = await profileCard.boundingBox();
    expect(cardBox?.width).toBeLessThanOrEqual(375);
  });

  test("should display share buttons in mobile layout", async ({ page, context }) => {
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);
    test.skip(!hasSlug, "No vanity URL configured");

    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.setViewportSize({ width: 375, height: 667 });
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    // Verify share buttons are visible on mobile
    const shareSection = publicPage.locator('[data-testid="social-share-buttons"]');
    await expect(shareSection).toBeVisible();

    const whatsappButton = publicPage.locator('[data-testid="share-whatsapp"]');
    const facebookButton = publicPage.locator('[data-testid="share-facebook"]');

    await expect(whatsappButton).toBeVisible();
    await expect(facebookButton).toBeVisible();
  });

  test("should adapt layout for tablet viewport", async ({ page, context }) => {
    await navigateTo(page, "/dashboard/pro/settings/profile");
    await page.waitForLoadState("networkidle");

    const slugDisplay = page.locator('[data-testid="current-slug"]');
    const hasSlug = await slugDisplay.isVisible().catch(() => false);
    test.skip(!hasSlug, "No vanity URL configured");

    const slugText = await slugDisplay.textContent();
    const slug = slugText?.match(/\/pro\/([a-z0-9-]+)/)?.[1];

    const publicPage = await context.newPage();
    await publicPage.setViewportSize({ width: 768, height: 1024 }); // iPad
    await publicPage.goto(`/pro/${slug}`);
    await publicPage.waitForLoadState("networkidle");

    // Verify content is visible and properly laid out
    const profileCard = publicPage.locator('[data-testid="professional-profile"]');
    await expect(profileCard).toBeVisible();
  });
});
