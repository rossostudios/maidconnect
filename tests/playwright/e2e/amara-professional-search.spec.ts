import { expect, test } from '@playwright/test';
import { navigateTo } from '../utils/test-helpers';

/**
 * Amara Professional Search E2E Tests
 *
 * Tests the Generative UI flow for searching and displaying professionals.
 * Requires:
 * - PostHog feature flags: show_amara_assistant=true, enable-amara-v2=true
 * - Authenticated user session
 * - Test database with professional data
 */

test.describe('Amara Professional Search (V2 Generative UI)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage where Amara floating button is available
    await navigateTo(page, '/');

    // Wait for PostHog to load (feature flags)
    await page.waitForTimeout(1000);
  });

  test.describe('Chat Interface', () => {
    test('should display Amara floating button', async ({ page }) => {
      // Check for Amara floating button
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();

      // Button should be visible
      await expect(amaraButton).toBeVisible();

      // Button should have the Amara icon
      const icon = amaraButton.locator('img[alt*="Amara"]');
      await expect(icon).toBeVisible();
    });

    test('should open chat interface when floating button is clicked', async ({ page }) => {
      // Click Amara floating button
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();

      // Wait for chat interface to open
      await page.waitForTimeout(500);

      // Check for chat interface elements
      const chatContainer = page.locator('[class*="chat"]').first();
      await expect(chatContainer).toBeVisible();

      // Check for message input
      const messageInput = page.locator('textarea, input[type="text"]').first();
      await expect(messageInput).toBeVisible();
    });
  });

  test.describe('Professional Search Flow', () => {
    test('should search for professionals and display results', async ({
      page,
    }) => {
      // NOTE: Authentication is now handled by auth.setup.ts
      // Requires:
      // 1. PostHog feature flags enabled: enable-amara-v2, show_amara_assistant
      // 2. Test database with professional data (see docs/amara-v2-e2e-testing-setup.md)

      // Open chat interface
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      // Type search query
      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find me a cleaning professional in Bogotá');

      // Send message
      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();

      // Wait for AI response
      await page.waitForTimeout(2000);

      // Check for loading state
      const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"]').first();

      // Loading should appear and then disappear
      if (await loadingIndicator.isVisible()) {
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
      }

      // Check for professional list component
      const professionalList = page.locator('[class*="professional"], [role="list"]').first();
      await expect(professionalList).toBeVisible({ timeout: 10000 });

      // Check for at least one professional card
      const professionalCards = page.locator('[class*="professional"][class*="card"]');
      await expect(professionalCards.first()).toBeVisible();

      // Verify card contains expected elements
      const firstCard = professionalCards.first();
      await expect(firstCard.locator('img, [class*="avatar"]')).toBeVisible(); // Profile photo
      await expect(firstCard.locator('text=/[A-Z]/')).toBeVisible(); // Name (starts with capital)
      await expect(firstCard.locator('button')).toBeVisible(); // Action button (Book Now, etc.)
    });

    test.skip('should display "Book Now" button on professional cards (requires auth + feature flags)', async ({
      page,
    }) => {
      // NOTE: Skipped for same reasons as above test

      // Open chat and search
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find me a cleaner');

      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();

      // Wait for results
      await page.waitForTimeout(3000);

      // Check for Book Now button
      const bookButton = page.locator('button:has-text("Book")').first();
      await expect(bookButton).toBeVisible({ timeout: 10000 });

      // Button should be clickable
      await expect(bookButton).toBeEnabled();
    });

    test.skip('should handle no results gracefully (requires auth + feature flags)', async ({
      page,
    }) => {
      // NOTE: Skipped for same reasons as above test

      // Open chat and search
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find me a professional in NonexistentCity12345');

      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();

      // Wait for response
      await page.waitForTimeout(3000);

      // Check for "no results" message
      const noResultsMessage = page.locator('text=/no.*found/i, text=/no.*available/i').first();
      await expect(noResultsMessage).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Component Rendering', () => {
    test.skip('should render ProfessionalList component with correct structure (requires auth + feature flags)', async ({
      page,
    }) => {
      // NOTE: Skipped for same reasons as above test

      // Open chat and trigger search
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Show me cleaning professionals');

      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();

      // Wait for component to render
      await page.waitForTimeout(3000);

      // Check for list structure
      const list = page.locator('[role="list"], [class*="professional-list"]').first();
      await expect(list).toBeVisible({ timeout: 10000 });

      // Check for multiple cards
      const cards = page.locator('[class*="professional"][class*="card"]');
      const cardCount = await cards.count();

      expect(cardCount).toBeGreaterThan(0);

      // Verify each card has required elements
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = cards.nth(i);
        await expect(card).toBeVisible();

        // Profile image or avatar
        await expect(card.locator('img, [class*="avatar"]')).toBeVisible();

        // Action button
        await expect(card.locator('button')).toBeVisible();
      }
    });
  });

  test.describe('Analytics Tracking', () => {
    test.skip('should track amara_component_rendered event (requires auth + feature flags)', async ({
      page,
    }) => {
      // NOTE: This test would require PostHog event capture mocking or inspection
      // Placeholder for future analytics testing

      // Open chat and trigger search
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();

      // Send search query
      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find professionals');

      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();

      await page.waitForTimeout(3000);

      // TODO: Verify PostHog capture was called with correct event
      // This would require either:
      // 1. Mocking PostHog in the test environment
      // 2. Using a test PostHog project and verifying events via API
      // 3. Inspecting network requests for PostHog capture calls
    });
  });

  test.describe('Availability Selector Flow', () => {
    test('should display availability calendar when checking professional availability', async ({
      page,
    }) => {
      // NOTE: Authentication handled by auth.setup.ts

      // Open chat and search
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      // Search for professionals
      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find me a cleaning professional');
      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();
      await page.waitForTimeout(3000);

      // Ask to check availability
      await messageInput.fill("Check Maria's availability");
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Check for availability calendar component
      const calendar = page.locator('[class*="availability"], [class*="calendar"]').first();
      await expect(calendar).toBeVisible({ timeout: 10000 });

      // Check for calendar grid (7 columns for days of week)
      const dayHeaders = page.locator('text=/Sun|Mon|Tue|Wed|Thu|Fri|Sat/');
      await expect(dayHeaders.first()).toBeVisible();

      // Check for status indicator legend
      const legend = page.locator('text=/Available|Limited|Booked|Blocked/').first();
      await expect(legend).toBeVisible();
    });

    test('should allow date and time selection', async ({
      page,
    }) => {
      // NOTE: Authentication handled by auth.setup.ts

      // Navigate to availability calendar (same steps as above)
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find me a cleaning professional');
      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();
      await page.waitForTimeout(3000);

      await messageInput.fill("Check Maria's availability");
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Click on an available date
      const availableDate = page
        .locator('button[class*="available"]:not([disabled])')
        .first();
      await availableDate.click();
      await page.waitForTimeout(500);

      // Time slots should appear
      const timeSlots = page.locator('button[class*="time"]');
      await expect(timeSlots.first()).toBeVisible({ timeout: 5000 });

      // Select a time slot
      await timeSlots.first().click();
      await page.waitForTimeout(500);

      // Confirm booking button should appear
      const confirmButton = page.locator('button:has-text("Book")').first();
      await expect(confirmButton).toBeVisible();
      await expect(confirmButton).toBeEnabled();
    });
  });

  test.describe('Booking Summary Flow', () => {
    test('should display booking summary after date/time selection', async ({
      page,
    }) => {
      // NOTE: Authentication handled by auth.setup.ts

      // Complete date and time selection (same steps as above)
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find me a cleaning professional');
      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();
      await page.waitForTimeout(3000);

      await messageInput.fill("Check Maria's availability");
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Select date and time
      const availableDate = page
        .locator('button[class*="available"]:not([disabled])')
        .first();
      await availableDate.click();
      await page.waitForTimeout(500);

      const timeSlot = page.locator('button[class*="time"]').first();
      await timeSlot.click();
      await page.waitForTimeout(500);

      // Click booking confirmation button
      const confirmButton = page.locator('button:has-text("Book")').first();
      await confirmButton.click();
      await page.waitForTimeout(2000);

      // Check for booking summary component
      const bookingSummary = page.locator('text=/Booking Summary/').first();
      await expect(bookingSummary).toBeVisible({ timeout: 10000 });

      // Verify summary contains required elements
      await expect(page.locator('img, [class*="avatar"]')).toBeVisible(); // Professional photo
      await expect(page.locator('text=/[A-Z]/')).toBeVisible(); // Professional name
      await expect(page.locator('text=/[0-9]{1,2}:[0-9]{2}/')).toBeVisible(); // Time
      await expect(page.locator('text=/\\$[0-9]+/')).toBeVisible(); // Price

      // Check for action buttons
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      const finalConfirmButton = page.locator('button:has-text("Confirm")').first();

      await expect(cancelButton).toBeVisible();
      await expect(finalConfirmButton).toBeVisible();
    });

    test.skip('should allow booking cancellation from summary (requires auth + feature flags)', async ({
      page,
    }) => {
      // NOTE: Skipped for same reasons as above tests

      // Navigate to booking summary (same steps as above)
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find me a cleaning professional');
      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();
      await page.waitForTimeout(3000);

      await messageInput.fill("Check availability");
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Select date and time
      const availableDate = page
        .locator('button[class*="available"]:not([disabled])')
        .first();
      await availableDate.click();
      await page.waitForTimeout(500);

      const timeSlot = page.locator('button[class*="time"]').first();
      await timeSlot.click();
      await page.waitForTimeout(500);

      const confirmButton = page.locator('button:has-text("Book")').first();
      await confirmButton.click();
      await page.waitForTimeout(2000);

      // Click cancel button on booking summary
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      await cancelButton.click();
      await page.waitForTimeout(500);

      // Booking summary should be dismissed or show cancellation message
      // (Exact behavior depends on implementation)
    });
  });

  test.describe('Complete Happy Path', () => {
    test('should complete full booking flow: search → availability → summary → confirm', async ({
      page,
    }) => {
      // NOTE: This is the comprehensive E2E test for the complete happy path
      // Authentication handled by auth.setup.ts

      // Step 1: Open Amara chat
      const amaraButton = page.locator('button[aria-label*="Amara"]').first();
      await amaraButton.click();
      await page.waitForTimeout(500);

      // Step 2: Search for professionals
      const messageInput = page.locator('textarea, input[type="text"]').first();
      await messageInput.fill('Find me a deep cleaning professional in Bogotá');

      const sendButton = page.locator('button[type="submit"]').first();
      await sendButton.click();
      await page.waitForTimeout(3000);

      // Verify professional results displayed
      const professionalList = page.locator('[class*="professional"]').first();
      await expect(professionalList).toBeVisible({ timeout: 10000 });

      // Step 3: Check availability
      await messageInput.fill("Check the first professional's availability");
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Verify availability calendar displayed
      const calendar = page.locator('[class*="availability"]').first();
      await expect(calendar).toBeVisible({ timeout: 10000 });

      // Step 4: Select date and time
      const availableDate = page
        .locator('button[class*="available"]:not([disabled])')
        .first();
      await availableDate.click();
      await page.waitForTimeout(500);

      const timeSlot = page.locator('button[class*="time"]').first();
      await timeSlot.click();
      await page.waitForTimeout(500);

      // Step 5: Proceed to booking summary
      const bookButton = page.locator('button:has-text("Book")').first();
      await bookButton.click();
      await page.waitForTimeout(2000);

      // Verify booking summary displayed
      const bookingSummary = page.locator('text=/Booking Summary/').first();
      await expect(bookingSummary).toBeVisible({ timeout: 10000 });

      // Step 6: Confirm booking
      const finalConfirmButton = page.locator('button:has-text("Confirm")').first();
      await expect(finalConfirmButton).toBeVisible();
      await expect(finalConfirmButton).toBeEnabled();

      await finalConfirmButton.click();
      await page.waitForTimeout(1000);

      // TODO: Verify booking confirmation message or redirect
      // This will depend on the final booking creation implementation
    });
  });
});
