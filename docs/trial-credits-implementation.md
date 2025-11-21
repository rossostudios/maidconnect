# Trial Credits System - Implementation Summary

**Status:** ✅ Complete
**Last Updated:** 2025-01-18
**Testing:** Unit tests passing (29/29), E2E tests ready

---

## Overview

The Trial Credits system gamifies the transition from gig work to direct hire by offering customers 50% credit on completed bookings (up to 3 bookings) toward the 20% concierge fee direct hire placement fee.

### Key Features

- **Credit Calculation:** 50% of total completed booking fees
- **Credit Cap:** Maximum 50% of direct hire fee (~$150 USD / 598,000 COP)
- **Scope:** Per-professional (separate credits with different pros)
- **Booking Source:** Any source counts (Amara, web, etc.)
- **Partial Credit:** Can direct hire after 1, 2, or 3 bookings
- **Pricing Fix:** Corrected 2,000,000 COP → 1,196,000 COP (20% concierge fee at 4,000 COP/USD)

---

## Implementation Components

### 1. Database Layer

**Migration:** [`supabase/migrations/20250118000000_add_trial_credit_system.sql`](../supabase/migrations/20250118000000_add_trial_credit_system.sql)

- **Table:** `trial_credits` - Tracks credits per customer-professional pair
- **Trigger:** `update_trial_credit_on_booking_completion()` - Auto-calculates credits on booking completion
- **Function:** `get_trial_credit_info(customer_id, professional_id)` - Server-side credit queries
- **Indexes:** Optimized for customer/professional lookups

**Key SQL Logic:**
```sql
-- Credit calculation (50% of booking fees)
credit_earned_cop = ROUND(total_bookings_value_cop * 0.5)

-- Credit cap enforcement (50% of direct hire fee)
credit_remaining_cop = LEAST(
  credit_earned_cop,
  ROUND(direct_hire_fee_cop * 0.5)
)
```

### 2. Service Layer

**File:** [`src/lib/services/trial-credits/trialCreditService.ts`](../src/lib/services/trial-credits/trialCreditService.ts)

**Public API:**
```typescript
// Get credit info for customer-professional pair
getTrialCreditInfo(supabase, customerId, professionalId): Promise<TrialCreditInfo>

// Apply credit to direct hire pricing
applyTrialCredit(supabase, customerId, professionalId, directHireFeeCOP): Promise<AppliedCreditResult>

// Mark credit as used (webhook handler)
markTrialCreditUsed(supabase, customerId, professionalId, bookingId, creditUsedCOP): Promise<void>

// Get all credits for customer dashboard
getCustomerTrialCredits(supabase, customerId): Promise<CustomerTrialCreditSummary[]>
```

**Types:**
```typescript
type TrialCreditInfo = {
  hasCredit: boolean;
  creditAvailableCOP: number;
  creditAvailableUSD: number;
  bookingsCompleted: number;
  totalBookingsValueCOP: number;
  maxCreditCOP: number;
  percentageEarned: number;
};

type AppliedCreditResult = {
  finalPriceCOP: number;
  discountAppliedCOP: number;
  creditRemainingCOP: number;
};

type CustomerTrialCreditSummary = TrialCreditInfo & {
  professionalId: string;
  professionalName: string | null;
};
```

### 3. API Integration

**Direct Hire API:** [`src/app/api/direct-hire/route.ts`](../src/app/api/direct-hire/route.ts)

- Fetches trial credit info via `getTrialCreditInfo()`
- Calculates pricing via `applyTrialCredit()`
- Stores discount in Stripe PaymentIntent metadata

**Stripe Webhook:** [`src/app/api/webhooks/stripe/route.ts`](../src/app/api/webhooks/stripe/route.ts)

- On `payment_intent.succeeded`, calls `markTrialCreditUsed()`
- Updates `trial_credits` table with used credit amount

### 4. UI Components

**Component:** [`src/components/trial-credits/trial-credits-summary.tsx`](../src/components/trial-credits/trial-credits-summary.tsx)

- Displays trial credits grid on customer dashboard
- Shows credit amounts, progress bars, booking counts
- Links to professional pages for direct hire

**Component:** [`src/components/trial-credits/trial-credit-badge.tsx`](../src/components/trial-credits/trial-credit-badge.tsx)

- Small badge showing available credit
- Used in professional cards and search results

**Component:** [`src/components/trial-credits/trial-progress-widget.tsx`](../src/components/trial-credits/trial-progress-widget.tsx)

- Progress widget showing credit earn progress
- Visual indicator of bookings completed (1-3)

**Component:** [`src/components/professionals/direct-hire-card.tsx`](../src/components/professionals/direct-hire-card.tsx)

- Updated to show trial credit discount
- Displays final price after credit application

### 5. Dashboard Integration

**Page:** [`src/app/[locale]/dashboard/customer/bookings/page.tsx`](../src/app/[locale]/dashboard/customer/bookings/page.tsx)

- Fetches trial credits via `getCustomerTrialCredits()`
- Displays `TrialCreditsSummary` component
- Shows credits above bookings list

---

## Testing

### Unit Tests (✅ Passing)

**File:** [`src/lib/services/trial-credits/__tests__/trialCreditService.test.ts`](../src/lib/services/trial-credits/__tests__/trialCreditService.test.ts)

- **Total Tests:** 29
- **Coverage:** 100% function and line coverage
- **Assertions:** 104 expect() calls

**Test Suites:**
1. `getTrialCreditInfo` - Success cases (6 tests)
2. `getTrialCreditInfo` - Error handling (3 tests)
3. `applyTrialCredit` - Success cases (4 tests)
4. `applyTrialCredit` - Edge cases (3 tests)
5. `markTrialCreditUsed` - Success & error (2 tests)
6. `getCustomerTrialCredits` - Success & error (3 tests)
7. Pricing integrity tests (4 tests)
8. Currency conversion tests (4 tests)

**Run Tests:**
```bash
bun test src/lib/services/trial-credits/__tests__/trialCreditService.test.ts
```

**Expected Output:**
```
✓ getTrialCreditInfo - Success Cases > should return credit info with available credit
✓ getTrialCreditInfo - Success Cases > should return credit info with no credit
...
29 pass
0 fail
104 expect() calls
```

### E2E Tests (Ready)

**File:** [`tests/playwright/e2e/trial-credits.spec.ts`](../tests/playwright/e2e/trial-credits.spec.ts)

- **Total Tests:** 22
- **Test Suites:** 6

**Test Suites:**
1. Dashboard View (3 tests) - Fully implemented
2. Direct Hire Application (4 tests) - Partially implemented (payment placeholders)
3. Payment Integration (5 tests) - Placeholders (require Stripe test mode)
4. Edge Cases (5 tests) - Fully implemented
5. Accessibility (3 tests) - Fully implemented
6. Responsive Design (2 tests) - Fully implemented

**Run Tests:**
```bash
# 1. Start development server
bun dev

# 2. In another terminal, run E2E tests
npx playwright test tests/playwright/e2e/trial-credits.spec.ts
```

**Note:** Payment-related tests are placeholders and require full Stripe test mode setup. Dashboard view, edge cases, accessibility, and responsive design tests are functional.

---

## Security Considerations

1. **Server-Side Validation:** All credit calculations performed server-side via PostgreSQL triggers and RPC functions
2. **Credit Cap Enforcement:** Database-level constraint prevents credit from exceeding 50% of direct hire fee
3. **Webhook Verification:** Stripe webhook signatures verified before marking credits as used
4. **Auth Context:** All service functions require authenticated Supabase client with proper RLS policies

---

## Data Flow

### Earning Credits (Booking Completion)

```
1. Booking marked as "completed"
   ↓
2. Trigger: update_trial_credit_on_booking_completion()
   - Calculates total bookings value
   - Calculates 50% credit
   - Enforces credit cap (50% of direct hire fee)
   - Updates trial_credits table
   ↓
3. Customer sees updated credit on dashboard
```

### Applying Credits (Direct Hire)

```
1. Customer initiates direct hire
   ↓
2. API fetches credit: getTrialCreditInfo()
   ↓
3. API applies discount: applyTrialCredit()
   - Calculates final price
   - Stores metadata in Stripe PaymentIntent
   ↓
4. Customer completes Stripe payment
   ↓
5. Webhook: payment_intent.succeeded
   - Calls markTrialCreditUsed()
   - Updates trial_credits table
   ↓
6. Credit marked as used, remaining = 0
```

---

## Constants

```typescript
DEFAULT_DIRECT_HIRE_FEE_COP =   // 20% concierge fee
COP_TO_USD_EXCHANGE_RATE = 4000
MAX_CREDIT_COP = 598_000                 // 50% of direct hire fee (~$150 USD)
```

---

## Known Limitations

1. **Payment Tests Incomplete:** E2E tests for Stripe payment flow are placeholders
2. **Credit Expiry:** No expiration logic implemented (future enhancement)
3. **Credit Transfers:** Credits are non-transferable between professionals
4. **Refunds:** No credit refund logic if direct hire booking is canceled (future enhancement)

---

## Future Enhancements

1. **Credit Expiry:** Add expiration date (e.g., 90 days after earning)
2. **Credit Notifications:** Email customers when they earn credits
3. **Credit History:** Show transaction history (earned vs. used)
4. **Partial Use:** Allow partial credit use across multiple direct hires
5. **Refund Logic:** Handle credit restoration if direct hire booking is refunded
6. **Analytics:** Track credit conversion rates in PostHog

---

## Maintenance Notes

### Adding New Credit Rules

To modify credit calculation rules:

1. Update SQL trigger: `supabase/migrations/[timestamp]_update_trial_credit_rules.sql`
2. Update constants in `trialCreditService.ts`
3. Update unit tests to reflect new rules
4. Update E2E tests for new behavior

### Debugging Credits

```sql
-- Check customer's credits
SELECT * FROM trial_credits WHERE customer_id = 'customer-uuid';

-- Check credit calculation for customer-professional pair
SELECT * FROM get_trial_credit_info('customer-uuid', 'professional-uuid');

-- Check booking completion trigger
SELECT * FROM bookings WHERE status = 'completed' AND customer_id = 'customer-uuid';
```

---

## Support

For questions or issues:

1. Review unit tests for expected behavior
2. Check database trigger logic in migration file
3. Verify Stripe webhook events in dashboard
4. Review PostHog events for credit tracking

---

**Implementation Team:** Claude Code
**Documentation Version:** 1.0.0
