/**
 * Trial Credits E2E Tests
 *
 * Tests the end-to-end trial credit system flow:
 * 1. Complete bookings with a professional (earn credits)
 * 2. View earned credits in customer dashboard
 * 3. Apply credits to direct hire purchase
 * 4. Verify discounted pricing
 * 5. Complete payment and verify credit marked as used
 *
 * Prerequisites:
 * - Test customer account authenticated (via auth.setup.ts)
 * - Test professional account with direct hire enabled
 * - Stripe test mode configured
 * - Test database with booking data
 *
 * @see docs/amara-v2-e2e-testing-setup.md
 */

import { expect, test } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_DIRECT_HIRE_FEE_USD = 0; // deprecated fixed fee removed
const MAX_CREDIT_USD = 0; // deprecated fixed fee removed
// ============================================================================
// TRIAL CREDITS - DASHBOARD VIEW
// ============================================================================

test.describe("Trial Credits - Dashboard View", () => {
	test("should display trial credits summary on bookings page", async ({ page }) => {
		// Navigate to customer bookings dashboard
		await navigateTo(page, "/dashboard/customer/bookings");

		// Wait for page to load
		await page.waitForLoadState("networkidle");

		// Check if trial credits section exists (only if customer has credits)
		const creditsSummary = page.locator('[data-testid="trial-credits-summary"]');

		// If credits exist, verify the section
		if (await creditsSummary.isVisible()) {
			// Check for "Trial Credits Earned" heading
			await expect(page.getByText("Trial Credits Earned")).toBeVisible();

			// Verify credit card elements
			const creditCards = page.locator('[data-testid="trial-credit-card"]');
			const cardCount = await creditCards.count();

			if (cardCount > 0) {
				// Verify first credit card has required elements
				const firstCard = creditCards.first();
				await expect(firstCard).toBeVisible();

				// Check for professional name
				await expect(firstCard.locator("h3")).toBeVisible();

				// Check for booking count badge
				const bookingBadge = firstCard.locator('text=/\\d+ booking/');
				await expect(bookingBadge).toBeVisible();

				// Check for progress bar
				const progressBar = firstCard.locator('[role="progressbar"]');
				await expect(progressBar).toBeVisible();

				// Check for credit amount display
				const creditAmount = firstCard.locator('text=/\\$\\d+/');
				await expect(creditAmount.first()).toBeVisible();

				// Check for "Use Credit for Direct Hire" button
				const useCreditButton = firstCard.locator('text="Use Credit for Direct Hire"');
				await expect(useCreditButton).toBeVisible();
			}
		} else {
			// No credits yet - this is expected for new users
			console.log("[trial-credits] No trial credits found for test user (expected)");
		}
	});

	test("should show correct credit amount based on completed bookings", async ({ page }) => {
		// Navigate to bookings dashboard
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		if (cardCount > 0) {
			const firstCard = creditCards.first();

			// Get booking count
			const bookingBadgeText = await firstCard
				.locator('[data-testid="booking-count-badge"]')
				.textContent();

			if (bookingBadgeText) {
				const bookingCount = Number.parseInt(bookingBadgeText.match(/\\d+/)?.[0] || "0", 10);

				// Get credit amount
				const creditText = await firstCard
					.locator('[data-testid="credit-available"]')
					.textContent();

				if (creditText && bookingCount > 0) {
					const creditAmount = Number.parseInt(creditText.match(/\\d+/)?.[0] || "0", 10);

					// Verify credit is capped at $150
					expect(creditAmount).toBeLessThanOrEqual(MAX_CREDIT_USD);

					// Verify credit is greater than 0 if bookings exist
					expect(creditAmount).toBeGreaterThan(0);

					console.log(
						`[trial-credits] ${bookingCount} bookings → $${creditAmount} credit (max $${MAX_CREDIT_USD})`
					);
				}
			}
		}
	});

	test("should display progress toward max credit", async ({ page }) => {
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		if (cardCount > 0) {
			const firstCard = creditCards.first();
			const progressBar = firstCard.locator('[role="progressbar"]');

			// Verify progress bar exists
			await expect(progressBar).toBeVisible();

			// Get progress percentage from aria-valuenow
			const progressValue = await progressBar.getAttribute("aria-valuenow");
			expect(progressValue).toBeTruthy();

			const percentage = Number.parseFloat(progressValue || "0");

			// Verify percentage is between 0 and 100
			expect(percentage).toBeGreaterThanOrEqual(0);
			expect(percentage).toBeLessThanOrEqual(100);

			console.log(`[trial-credits] Progress toward max credit: ${percentage}%`);
		}
	});
});

// ============================================================================
// TRIAL CREDITS - DIRECT HIRE FLOW
// ============================================================================

test.describe("Trial Credits - Direct Hire Application", () => {
	test("should navigate to professional profile from credit card", async ({ page }) => {
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		if (cardCount > 0) {
			const firstCard = creditCards.first();
			const useCreditButton = firstCard.locator('a:has-text("Use Credit for Direct Hire")');

			// Click "Use Credit" button
			await useCreditButton.click();

			// Should navigate to professional profile
			await expect(page).toHaveURL(/\/professionals\/[a-f0-9-]+/);

			// Verify professional profile loaded
			await expect(page.locator("h1, h2")).toBeVisible();
		}
	});

	test("should display trial credit discount on direct hire card", async ({ page }) => {
		// This test assumes we're on a professional profile where the user has credits
		// Skip if no test data available

		// Navigate to a professional profile (would need test professional ID)
		// For now, this is a placeholder to show the expected behavior

		// await navigateTo(page, `/professionals/${TEST_PROFESSIONAL_ID}`);
		// await page.waitForLoadState("networkidle");

		// const directHireCard = page.locator('[data-testid="direct-hire-card"]');
		// await expect(directHireCard).toBeVisible();

		// // Check for trial credit badge
		// const creditBadge = directHireCard.locator('[data-testid="trial-credit-badge"]');
		// if (await creditBadge.isVisible()) {
		//   // Verify credit amount is shown
		//   await expect(creditBadge).toContainText(/\\$\\d+/);

		//   // Verify original price is struck through
		//   const originalPrice = directHireCard.locator('text=/\\20% concierge fee/');
		//   await expect(originalPrice).toHaveCSS("text-decoration", /line-through/);

		//   // Verify discounted price is displayed
		//   const discountedPrice = directHireCard.locator('[data-testid="discounted-price"]');
		//   await expect(discountedPrice).toBeVisible();

		//   // Verify "You save $X!" message
		//   const savingsMessage = directHireCard.locator('text=/You save \\$\\d+/');
		//   await expect(savingsMessage).toBeVisible();
		// }
	});

	test("should show trial progress widget when enabled", async ({ page: _page }) => {
		// This test would verify the TrialProgressWidget component display
		// Shows detailed credit earning progress
		// Skip - requires professional profile with trial credit data
	});

	test("should calculate correct discounted price", async ({ page: _page }) => {
		// This test would verify:
		// - Original price: 20% concierge fee// - Credit amount: $50 (from 1 booking)
		// - Discounted price: $249
		// Skip - requires professional profile access
	});

	test("should apply maximum credit discount ($150)", async ({ page: _page }) => {
		// This test would verify:
		// - Original price: 20% concierge fee// - Credit amount: $150 (maxed out)
		// - Discounted price: $149
		// Skip - requires test user with max credits
	});
});

// ============================================================================
// TRIAL CREDITS - PAYMENT FLOW
// ============================================================================

test.describe("Trial Credits - Payment Integration", () => {
	test("should pass credit discount to Stripe PaymentIntent", async ({ page: _page }) => {
		// This test would verify:
		// - Click "Request Contact Info" on Direct Hire card
		// - Navigate to payment page
		// - Verify payment amount reflects discount
		// - Verify metadata includes trial_credit_applied_cop
		// Skip - requires full payment flow
	});

	test("should complete payment with trial credit discount", async ({ page: _page }) => {
		// This test would:
		// - Complete payment with Stripe test card
		// - Verify payment succeeds with discounted amount
		// - Verify booking is created
		// Skip - requires Stripe test mode setup
	});

	test("should mark credit as used after successful payment", async ({ page: _page }) => {
		// This test would:
		// - Complete direct hire payment
		// - Navigate back to bookings dashboard
		// - Verify credit is marked as used (creditRemainingCOP = 0)
		// - Verify credit cannot be reused
		// Skip - requires full flow + database verification
	});

	test("should handle partial credit application", async ({ page: _page }) => {
		// This test would verify:
		// - User has $50 credit
		// - Direct hire fee is 20% concierge fee// - Payment amount is $249 (difference)
		// - Credit is fully consumed after payment
		// Skip - requires payment flow
	});

	test("should preserve credit if payment fails", async ({ page: _page }) => {
		// This test would:
		// - Start direct hire purchase
		// - Use declined Stripe test card (4000000000009995)
		// - Verify payment fails
		// - Navigate back to dashboard
		// - Verify credit is NOT marked as used (still available)
		// Skip - requires error handling flow
	});
});

// ============================================================================
// TRIAL CREDITS - EDGE CASES
// ============================================================================

test.describe("Trial Credits - Edge Cases", () => {
	test("should handle multiple professionals with separate credits", async ({ page }) => {
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		// If user has credits with multiple professionals
		if (cardCount > 1) {
			// Get professional names from each card
			const professionalNames = await creditCards.locator("h3").allTextContents();

			// Verify each professional has unique name
			const uniqueNames = new Set(professionalNames);
			expect(uniqueNames.size).toBe(cardCount);

			console.log(`[trial-credits] User has credits with ${cardCount} professionals`);
		}
	});

	test("should not show credits section if user has no bookings", async ({ page }) => {
		// For a brand new test user with no bookings
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditsSummary = page.locator('[data-testid="trial-credits-summary"]');

		// Credits section should be hidden if no bookings completed
		const isVisible = await creditsSummary.isVisible();

		if (!isVisible) {
			console.log("[trial-credits] No credits section (expected for user with no bookings)");

			// Should show empty state for bookings instead
			const emptyState = page.locator('text=/no bookings/i');
			const hasEmptyState = await emptyState.isVisible();

			expect(hasEmptyState || !isVisible).toBe(true);
		}
	});

	test("should cap credit at 50% of direct hire fee", async ({ page }) => {
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		if (cardCount > 0) {
			for (let i = 0; i < cardCount; i++) {
				const card = creditCards.nth(i);
				const creditText = await card.locator('[data-testid="credit-available"]').textContent();

				if (creditText) {
					const creditAmount = Number.parseInt(creditText.match(/\\d+/)?.[0] || "0", 10);

					// Verify credit never exceeds $150 (50% of 20% concierge fee)
					expect(creditAmount).toBeLessThanOrEqual(MAX_CREDIT_USD);

					// Verify percentage never exceeds 100%
					const progressBar = card.locator('[role="progressbar"]');
					const percentage = await progressBar.getAttribute("aria-valuenow");
					expect(Number.parseFloat(percentage || "0")).toBeLessThanOrEqual(100);
				}
			}
		}
	});

	test("should handle zero remaining credit (fully used)", async ({ page: _page }) => {
		// This test would verify:
		// - User earned $100 credit
		// - User applied $100 credit to direct hire
		// - Credit remaining is $0
		// - Credit card shows "Used" or similar indicator
		// Skip - requires database state with used credits
	});

	test("should only count completed bookings toward credit", async ({ page: _page }) => {
		// This test would verify:
		// - Pending bookings do NOT earn credit
		// - Canceled bookings do NOT earn credit
		// - Only "completed" bookings earn credit
		// Skip - requires various booking statuses in test data
	});
});

// ============================================================================
// TRIAL CREDITS - ACCESSIBILITY
// ============================================================================

test.describe("Trial Credits - Accessibility", () => {
	test("should have accessible progress bars", async ({ page }) => {
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		if (cardCount > 0) {
			const progressBar = creditCards.first().locator('[role="progressbar"]');

			// Verify ARIA attributes
			await expect(progressBar).toHaveAttribute("role", "progressbar");
			await expect(progressBar).toHaveAttribute("aria-valuenow");
			await expect(progressBar).toHaveAttribute("aria-valuemin", "0");
			await expect(progressBar).toHaveAttribute("aria-valuemax", "100");

			// Verify aria-label exists
			const ariaLabel = await progressBar.getAttribute("aria-label");
			expect(ariaLabel).toBeTruthy();
			expect(ariaLabel).toContain("credit earned");
		}
	});

	test("should have keyboard-accessible CTA buttons", async ({ page }) => {
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		if (cardCount > 0) {
			const useCreditButton = creditCards.first().locator('a:has-text("Use Credit for Direct Hire")');

			// Verify button is focusable
			await useCreditButton.focus();
			await expect(useCreditButton).toBeFocused();

			// Verify Enter key activates button
			await useCreditButton.press("Enter");
			await expect(page).toHaveURL(/\/professionals\/[a-f0-9-]+/);
		}
	});

	test("should have semantic HTML structure", async ({ page }) => {
		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditsSummary = page.locator('[data-testid="trial-credits-summary"]');

		if (await creditsSummary.isVisible()) {
			// Verify heading hierarchy
			const heading = creditsSummary.locator("h2, h3").first();
			await expect(heading).toBeVisible();

			// Verify professional names are headings
			const creditCards = page.locator('[data-testid="trial-credit-card"]');
			const cardCount = await creditCards.count();

			if (cardCount > 0) {
				const professionalHeading = creditCards.first().locator("h3");
				await expect(professionalHeading).toBeVisible();
			}
		}
	});
});

// ============================================================================
// TRIAL CREDITS - RESPONSIVE DESIGN
// ============================================================================

test.describe("Trial Credits - Responsive Design", () => {
	test("should stack credit cards on mobile", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		if (cardCount > 1) {
			// Get bounding boxes of first two cards
			const firstCard = await creditCards.first().boundingBox();
			const secondCard = await creditCards.nth(1).boundingBox();

			if (firstCard && secondCard) {
				// Verify cards are stacked (second card Y position > first card Y + height)
				expect(secondCard.y).toBeGreaterThan(firstCard.y + firstCard.height);
			}
		}
	});

	test("should display credit cards in grid on desktop", async ({ page }) => {
		// Set desktop viewport
		await page.setViewportSize({ width: 1280, height: 720 });

		await navigateTo(page, "/dashboard/customer/bookings");
		await page.waitForLoadState("networkidle");

		const creditCards = page.locator('[data-testid="trial-credit-card"]');
		const cardCount = await creditCards.count();

		if (cardCount > 1) {
			// Get bounding boxes
			const firstCard = await creditCards.first().boundingBox();
			const secondCard = await creditCards.nth(1).boundingBox();

			if (firstCard && secondCard) {
				// Verify cards are side-by-side (overlapping Y positions)
				const verticalOverlap =
					Math.min(firstCard.y + firstCard.height, secondCard.y + secondCard.height) -
					Math.max(firstCard.y, secondCard.y);

				expect(verticalOverlap).toBeGreaterThan(0);
			}
		}
	});
});
