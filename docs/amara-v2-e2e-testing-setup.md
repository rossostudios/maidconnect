# Amara V2 E2E Testing Setup Guide

This guide explains how to run E2E tests for Amara V2 Generative UI features.

## Overview

The E2E tests cover the complete booking flow:
1. Opening Amara chat interface
2. Searching for professionals
3. Viewing availability calendar
4. Creating a booking
5. Confirming the booking

## Prerequisites

### 1. Test Environment Setup

Create a `.env.test.local` file with test environment variables:

```bash
# Supabase Test Environment
NEXT_PUBLIC_SUPABASE_URL=your_supabase_test_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_test_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PostHog Test Environment (optional - can use production with test feature flags)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Test User Credentials
TEST_CUSTOMER_EMAIL=test-customer@casaora.test
TEST_CUSTOMER_PASSWORD=TestPassword123!
TEST_PROFESSIONAL_EMAIL=test-pro@casaora.test
TEST_PROFESSIONAL_PASSWORD=TestPassword123!
```

### 2. Test Database Setup

#### Create Test Users

Run this SQL in your Supabase test database:

```sql
-- Create test customer user
INSERT INTO profiles (id, email, full_name, user_type, phone_number, created_at, updated_at)
VALUES (
  'test-customer-uuid',
  'test-customer@casaora.test',
  'Test Customer',
  'customer',
  '+57 300 123 4567',
  NOW(),
  NOW()
);

-- Create test professional user
INSERT INTO profiles (id, email, full_name, user_type, phone_number, created_at, updated_at)
VALUES (
  'test-pro-uuid',
  'test-pro@casaora.test',
  'Test Professional',
  'professional',
  '+57 300 765 4321',
  NOW(),
  NOW()
);

-- Create professional profile
INSERT INTO professional_profiles (
  id,
  bio,
  years_of_experience,
  service_radius_km,
  accepts_instant_booking,
  verification_status,
  background_check_status,
  average_rating,
  total_reviews,
  created_at,
  updated_at
)
VALUES (
  'test-pro-uuid',
  'Experienced cleaning professional for testing',
  5,
  10,
  true,  -- Enable instant booking for tests
  'verified',
  'approved',
  4.8,
  50,
  NOW(),
  NOW()
);

-- Create service category
INSERT INTO service_categories (id, name, slug, description, icon_name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Cleaning',
  'cleaning',
  'General and deep cleaning services',
  'sparkles',
  NOW(),
  NOW()
);

-- Create professional service
INSERT INTO professional_services (
  id,
  professional_id,
  name,
  description,
  service_category_id,
  status,
  created_at,
  updated_at
)
VALUES (
  'test-service-uuid',
  'test-pro-uuid',
  'Deep Cleaning',
  'Comprehensive deep cleaning service for testing',
  (SELECT id FROM service_categories WHERE slug = 'cleaning'),
  'active',
  NOW(),
  NOW()
);

-- Create pricing tier for the service
INSERT INTO pricing_tiers (
  id,
  service_id,
  name,
  hourly_rate_cop,
  min_hours,
  max_hours,
  is_default,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'test-service-uuid',
  'Standard Rate',
  50000,  -- 50,000 COP per hour
  2,
  8,
  true,
  NOW(),
  NOW()
);

-- Create availability for the next 7 days
DO $$
DECLARE
  day_offset INT;
  current_date DATE;
BEGIN
  FOR day_offset IN 0..6 LOOP
    current_date := CURRENT_DATE + day_offset;

    -- Morning slot (9 AM - 12 PM)
    INSERT INTO professional_availability (
      id,
      professional_id,
      day_of_week,
      start_time,
      end_time,
      is_available,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      'test-pro-uuid',
      EXTRACT(DOW FROM current_date)::INTEGER,
      '09:00:00',
      '12:00:00',
      true,
      NOW(),
      NOW()
    );

    -- Afternoon slot (2 PM - 6 PM)
    INSERT INTO professional_availability (
      id,
      professional_id,
      day_of_week,
      start_time,
      end_time,
      is_available,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      'test-pro-uuid',
      EXTRACT(DOW FROM current_date)::INTEGER,
      '14:00:00',
      '18:00:00',
      true,
      NOW(),
      NOW()
    );
  END LOOP;
END $$;
```

### 3. PostHog Feature Flag Configuration

Enable these feature flags in PostHog for your test environment:

#### Feature Flag: `show_amara_assistant`
- **Rollout**: 100% for test users
- **Purpose**: Shows Amara floating button
- **Test Users**: `test-customer@casaora.test`, `test-pro@casaora.test`

#### Feature Flag: `enable-amara-v2`
- **Rollout**: 100% for test users
- **Purpose**: Enables Generative UI (V2) features
- **Test Users**: `test-customer@casaora.test`, `test-pro@casaora.test`

### 4. Playwright Authentication Setup

Update Playwright config to use persistent authentication:

```typescript
// playwright.config.ts
export default defineConfig({
  // ... existing config

  use: {
    // Set authentication state for all tests
    storageState: 'tests/playwright/.auth/customer.json',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/playwright/.auth/customer.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

Create auth setup script:

```typescript
// tests/playwright/e2e/auth.setup.ts
import { test as setup } from '@playwright/test';
import { loginAsCustomer } from '../utils/test-helpers';

const authFile = 'tests/playwright/.auth/customer.json';

setup('authenticate as customer', async ({ page }) => {
  await loginAsCustomer(
    page,
    process.env.TEST_CUSTOMER_EMAIL || 'test-customer@casaora.test',
    process.env.TEST_CUSTOMER_PASSWORD || 'TestPassword123!'
  );

  // Wait for auth to complete
  await page.waitForURL('**/dashboard**');

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
```

## Running the Tests

### 1. Start Test Environment

```bash
# Start local Supabase (if using local test DB)
supabase start

# Start Next.js dev server with test environment
cp .env.test.local .env.local
bun dev
```

### 2. Run E2E Tests

```bash
# Run all E2E tests
bun test:e2e

# Run specific test file
bun test:e2e tests/playwright/e2e/amara-professional-search.spec.ts

# Run in headed mode (see browser)
bun test:e2e --headed

# Run in debug mode
bun test:e2e --debug

# Run with specific project (browser)
bun test:e2e --project=chromium
```

### 3. View Test Results

```bash
# Open HTML report
bun test:e2e --reporter=html
npx playwright show-report
```

## Test Structure

### Interface Tests (No Auth Required)
✅ Ready to run without authentication setup:
- `should display Amara floating button`
- `should open chat interface when floating button is clicked`

### Authenticated Flow Tests (Requires Setup)
⏸️ Currently skipped - remove `.skip()` after completing setup:
- `should search for professionals and display results`
- `should check professional availability`
- `should create booking summary`
- `should complete full booking flow`

## Troubleshooting

### Test Fails with "Authentication Required"

**Problem**: Tests fail because user is not authenticated.

**Solution**:
1. Verify test user exists in database (check SQL above)
2. Verify Supabase credentials in `.env.test.local`
3. Run auth setup: `npx playwright test auth.setup.ts`
4. Check `tests/playwright/.auth/customer.json` was created

### Test Fails with "No Professionals Found"

**Problem**: Professional search returns no results.

**Solution**:
1. Verify test professional profile exists (check SQL above)
2. Verify professional services are active
3. Verify professional has availability slots
4. Check professional location matches search criteria

### PostHog Feature Flags Not Working

**Problem**: Amara V2 components don't render.

**Solution**:
1. Verify PostHog API key is correct in `.env.test.local`
2. Enable feature flags for test users in PostHog dashboard
3. Wait 5-10 seconds for feature flags to propagate
4. Check browser console for PostHog errors
5. Add `await page.waitForTimeout(2000)` after page load to ensure flags load

### Booking Creation Fails

**Problem**: Booking confirmation returns error.

**Solution**:
1. Verify pricing tier exists for the test service
2. Verify professional has active services
3. Check Supabase logs for database errors
4. Verify booking_source column exists (run migration if needed)

## Best Practices

### 1. Test Data Isolation

Always use dedicated test users and never use production data:
- Prefix test emails with `test-`
- Use separate Supabase project for E2E tests (recommended)
- Clean up test bookings after tests complete

### 2. Wait Strategies

Use appropriate wait strategies:
```typescript
// ❌ Bad: Fixed timeouts
await page.waitForTimeout(3000);

// ✅ Good: Wait for specific conditions
await page.waitForSelector('[data-testid="professional-list"]');
await page.waitForLoadState('networkidle');
```

### 3. Flaky Test Prevention

- Use retry logic for API-dependent tests
- Add explicit waits for animations/transitions
- Use `test.describe.configure({ retries: 2 })` for flaky suites

### 4. Test Independence

Each test should be independent:
```typescript
test.beforeEach(async ({ page }) => {
  // Reset state
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Setup environment
        run: |
          cp .env.test.example .env.local
          echo "NEXT_PUBLIC_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }}" >> .env.local
          echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }}" >> .env.local

      - name: Install Playwright browsers
        run: bunx playwright install --with-deps

      - name: Run E2E tests
        run: bun test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Next Steps

After completing the setup above:

1. Remove `.skip()` from tests in `amara-professional-search.spec.ts`
2. Run tests locally to verify they pass
3. Add test coverage for edge cases (error states, cancellations, etc.)
4. Integrate E2E tests into CI/CD pipeline
5. Set up test monitoring and alerts

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Owner**: QA Team
