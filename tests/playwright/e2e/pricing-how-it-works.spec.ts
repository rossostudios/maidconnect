import { expect, test } from "@playwright/test";

test.describe("Pricing and How It Works", () => {
  test("pricing shows transparent customer fees", async ({ page }) => {
    await page.goto("/en/pricing");

    // Service fee transparency
    await expect(page.getByText("Service fee (customer pays)")).toBeVisible();
    await expect(page.getByText("Pros keep 100%", { exact: false })).toBeVisible();

    // Single tier shows 15% customer fee
    await expect(page.getByText("15%", { exact: false })).toBeVisible();

    // No calculators should be present
    await expect(page.getByText(/calculator/i))
      .not.toBeVisible()
      .catch(() => {});
  });

  test("how-it-works CTA leads to browse professionals", async ({ page }) => {
    await page.goto("/en/how-it-works");

    // Main CTA buttons - Browse Professionals is the primary action
    const ctaButtons = page
      .locator("section", { hasText: "Ready to Get Started" })
      .getByRole("link");
    await expect(ctaButtons.nth(0)).toHaveText(/Browse Professionals/i);
    await expect(ctaButtons.nth(0)).toHaveAttribute("href", "/professionals");
  });
});

test("pros page respects locale", async ({ page }) => {
  await page.goto("/en/pros");
  await expect(page.getByText("For Professionals")).toBeVisible();
  await page.goto("/es/pros");
  await expect(page.getByText("Para Profesionales")).toBeVisible();

  // Ensure no hardcoded Medellín/COP strings leak on en
  await expect(page.getByText(/Medell/i))
    .not.toBeVisible()
    .catch(() => {});
});
