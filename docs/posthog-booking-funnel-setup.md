# PostHog Booking Funnel Setup Guide

## Overview

This document describes the booking funnel tracking implementation for Casaora PMF (Product-Market Fit) analytics.

## Implemented Events

### Client-Side Events (Web)

1. **Booking Started** - `bookingTracking.started()`
   - **Triggered**: When user searches for professionals via hero search bar
   - **Location**: [src/components/ui/hero-search-bar.tsx](../src/components/ui/hero-search-bar.tsx)
   - **Properties**:
     - `service_type`: Selected service or "any"
     - `location`: Selected city
     - `source`: "hero_search"

2. **Professional Selected** - `bookingTracking.professionalSelected()`
   - **Triggered**: When user selects a date on professional profile (initiates booking)
   - **Location**: [src/components/professionals/professional-profile-view.tsx](../src/components/professionals/professional-profile-view.tsx)
   - **Properties**:
     - `professional_id`: ID of selected professional
     - `service_type`: Professional's primary service

3. **Checkout Started** - `bookingTracking.checkoutStarted()`
   - **Triggered**: After booking is successfully created, before payment screen
   - **Location**: [src/components/bookings/booking-sheet.tsx](../src/components/bookings/booking-sheet.tsx)
   - **Properties**:
     - `booking_id`: Created booking ID
     - `amount`: Total booking amount
     - `currency`: "COP"

### Server-Side Events (API/Webhooks)

4. **Booking Submitted** - `trackBookingSubmittedServer()`
   - **Triggered**: When booking record is created in database
   - **Location**: [src/app/api/bookings/route.ts](../src/app/api/bookings/route.ts)
   - **Properties**:
     - `booking_id`: Created booking ID
     - `professional_id`: ID of professional
     - `service_type`: Service name
     - `total_amount`: Booking amount
     - `currency`: Currency code
     - `duration`: Duration in minutes

5. **Booking Completed** - `trackBookingCompletedServer()`
   - **Triggered**: When Stripe payment succeeds (payment_intent.succeeded webhook)
   - **Location**: [src/lib/stripe/webhook-handlers.ts](../src/lib/stripe/webhook-handlers.ts)
   - **Properties**:
     - `booking_id`: Booking ID
     - `professional_id`: Professional ID
     - `total_amount`: Amount captured (from Stripe, converted from cents)
     - `currency`: Currency code

6. **Booking Cancelled** - `trackBookingCancelledServer()`
   - **Triggered**: When payment is canceled (payment_intent.canceled webhook)
   - **Location**: [src/lib/stripe/webhook-handlers.ts](../src/lib/stripe/webhook-handlers.ts)
   - **Properties**:
     - `booking_id`: Booking ID
     - `cancelled_by`: "customer"
     - `reason`: Cancellation reason from Stripe

## Creating the Booking Funnel in PostHog

### Manual Setup Instructions

1. **Go to PostHog Insights**
   - Navigate to: https://us.posthog.com/insights
   - Click "New insight"

2. **Select Funnel Type**
   - Choose "Funnel" from insight types

3. **Configure Funnel Steps**

   Add the following steps in order:

   **Step 1: Page View**
   - Event: `$pageview`
   - Filter: `Current URL` contains `/professionals` (optional, to focus on booking intent)

   **Step 2: Booking Started**
   - Event: `Booking Started`
   - No filters needed

   **Step 3: Professional Selected**
   - Event: `Professional Selected`
   - No filters needed

   **Step 4: Checkout Started**
   - Event: `Checkout Started`
   - No filters needed

   **Step 5: Booking Completed**
   - Event: `Booking Completed`
   - No filters needed

4. **Configure Funnel Settings**
   - **Conversion window**: 7 days (users have up to 7 days to complete the flow)
   - **Attribution**: First touchpoint
   - **Breakdown**: Add breakdowns by:
     - `service_type` - See which services convert best
     - `location` - See which cities have highest conversion
     - `source` - Track different entry points

5. **Save Insight**
   - Name: "Casaora Booking Funnel (PMF Analytics)"
   - Description: "Complete booking funnel tracking from search to payment completion. 7-day conversion window."
   - Save to dashboard: "Product Analytics" or create "Booking Analytics" dashboard

## Expected Metrics & KPIs

### Conversion Rates to Track

- **Search → Professional Selected**: % of users who view a professional after searching
- **Professional Selected → Checkout**: % who proceed to checkout after selecting
- **Checkout → Payment**: % who complete payment after starting checkout
- **Overall Conversion**: % of searches that result in completed bookings

### Benchmark Targets (Industry Standards)

- **Step 1 → 2**: 40-60% (Search to view professional)
- **Step 2 → 3**: 25-35% (View professional to select/book)
- **Step 3 → 4**: 70-85% (Selection to checkout)
- **Step 4 → 5**: 60-75% (Checkout to payment completion)
- **Overall**: 7-15% (Search to completed booking)

### Drop-off Analysis

Monitor where users drop off:
- **High drop-off at Step 1→2**: Search results quality issue
- **High drop-off at Step 2→3**: Professional profiles not compelling
- **High drop-off at Step 3→4**: Booking form friction
- **High drop-off at Step 4→5**: Payment issues or pricing concerns

## Testing the Implementation

### Manual Testing Checklist

1. **Test Booking Started Event**
   ```bash
   # 1. Go to homepage
   # 2. Fill out hero search (service, location, date)
   # 3. Click "Search"
   # 4. Verify in PostHog Live Events: "Booking Started" event fired
   ```

2. **Test Professional Selected Event**
   ```bash
   # 1. View a professional profile
   # 2. Select a date on the calendar
   # 3. Verify in PostHog Live Events: "Professional Selected" event fired
   ```

3. **Test Checkout Started Event**
   ```bash
   # 1. Continue booking flow (select time, service, details)
   # 2. Submit booking form
   # 3. Verify in PostHog Live Events: "Checkout Started" event fired
   ```

4. **Test Booking Completed Event**
   ```bash
   # 1. Complete Stripe payment (use test card: 4242 4242 4242 4242)
   # 2. Wait for Stripe webhook to fire
   # 3. Verify in PostHog Live Events: "Booking Completed" event fired
   ```

### Automated Testing (Future)

```typescript
// tests/analytics/booking-funnel.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Funnel Tracking', () => {
  test('tracks complete booking flow', async ({ page, context }) => {
    // Intercept PostHog events
    const events: string[] = [];
    await context.route('**/i/v0/e/', async (route) => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      events.push(body.event);
      await route.continue();
    });

    // Step 1: Search for professionals
    await page.goto('/');
    await page.selectOption('[name="location"]', 'bogota');
    await page.selectOption('[name="service"]', 'cleaning');
    await page.click('button[type="submit"]');

    expect(events).toContain('Booking Started');

    // Step 2: Select professional
    await page.click('[data-testid="professional-card"]');
    await page.click('[data-testid="calendar-date"]');

    expect(events).toContain('Professional Selected');

    // Step 3: Checkout
    await page.click('[data-testid="time-slot"]');
    await page.fill('[name="specialInstructions"]', 'Test booking');
    await page.click('button:has-text("Continue to Payment")');

    expect(events).toContain('Checkout Started');

    // Step 4: Complete payment (mock)
    // Note: Booking Completed is server-side via Stripe webhook
  });
});
```

## Troubleshooting

### Events Not Showing in PostHog

1. **Check PostHog is initialized**:
   ```typescript
   // Browser console
   window.posthog?.isFeatureEnabled('test') // Should not error
   ```

2. **Verify environment variables**:
   ```bash
   # .env.local
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

3. **Check network tab** for PostHog requests to `/i/v0/e/`

4. **Enable PostHog debug mode**:
   ```typescript
   // src/lib/integrations/posthog/client.ts
   posthog.init(apiKey, {
     api_host: apiHost,
     debug: true, // Add this
   });
   ```

### Server Events Not Firing

1. **Check Stripe webhook configuration**:
   - Webhook URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events enabled: `payment_intent.succeeded`, `payment_intent.canceled`

2. **Verify webhook handler receives events**:
   ```bash
   # Check logs
   grep "Stripe Webhook" logs/*.log
   ```

3. **Test PostHog server client**:
   ```typescript
   // In API route
   import { trackServerEvent } from '@/lib/integrations/posthog/server';
   await trackServerEvent('test-user', 'Test Event', { test: true });
   ```

## Next Steps

### Additional Tracking to Implement

1. **Search Analytics**
   - Track search queries with no results
   - Track filter usage (price range, rating, availability)
   - Track search result position clicked

2. **Professional Profile Analytics**
   - Track tab switches (About, Services, Portfolio, Reviews)
   - Track "Contact" button clicks
   - Track review expansion

3. **Abandoned Checkout Recovery**
   - Track checkout abandonment reasons
   - Set up email reminders for incomplete bookings
   - A/B test checkout flow improvements

4. **Revenue Analytics**
   - Track average booking value by service type
   - Track customer lifetime value (LTV)
   - Track repeat booking rate

## Related Documentation

- [PostHog Implementation Guide](../src/lib/integrations/posthog/IMPLEMENTATION_GUIDE.md)
- [Booking Creation Service](../src/lib/services/bookings/booking-creation-service.ts)
- [Stripe Webhook Handlers](../src/lib/stripe/webhook-handlers.ts)

---

**Last Updated**: 2025-01-14
**Owner**: Engineering Team
**Status**: ✅ Implemented
