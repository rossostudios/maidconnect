# Formatting Utilities Migration Examples

This document shows before/after examples of files migrated to use the centralized formatting utilities.

## Example 1: Checkout Summary Component

**File:** `/src/components/bookings/checkout-summary.tsx`

### Before

```typescript
export function CheckoutSummary({
  serviceName,
  baseAmount,
  taxRate = 0.19,
  currency = "COP",
  // ... other props
}: CheckoutSummaryProps) {
  const subtotal = baseAmount;
  const totalAmount = subtotal + taxAmount + tipAmount;

  // Inline formatting function - duplicated across 47+ files
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div>
      <span>{formatCurrency(subtotal)}</span>
      <span>{formatCurrency(taxAmount)}</span>
      <span>{formatCurrency(totalAmount)}</span>
    </div>
  );
}
```

### After

```typescript
import { formatCurrency } from "@/lib/format";

export function CheckoutSummary({
  serviceName,
  baseAmount,
  taxRate = 0.19,
  currency = "COP",
  // ... other props
}: CheckoutSummaryProps) {
  const subtotal = baseAmount;
  const totalAmount = subtotal + taxAmount + tipAmount;

  // No inline function needed - use centralized utility
  return (
    <div>
      <span>{formatCurrency(subtotal, { currency })}</span>
      <span>{formatCurrency(taxAmount, { currency })}</span>
      <span>{formatCurrency(totalAmount, { currency })}</span>
    </div>
  );
}
```

**Benefits:**
- Removed 7 lines of duplicated code
- Consistent formatting across the component
- Type-safe with full TypeScript support
- Handles null/undefined automatically

---

## Example 2: Tip Selector Component

**File:** `/src/components/payments/tip-selector.tsx`

### Before

```typescript
export function TipSelector({
  baseAmount,
  currency = "COP",
  onTipChange,
  initialTip = 0,
}: TipSelectorProps) {
  // Duplicated formatting logic
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div>
      {PRESET_PERCENTAGES.map((percentage) => {
        const tipAmount = Math.round((baseAmount * percentage) / 100);
        return (
          <span key={percentage}>
            {formatCurrency(tipAmount)}
          </span>
        );
      })}
    </div>
  );
}
```

### After

```typescript
import { formatCurrency } from "@/lib/format";

export function TipSelector({
  baseAmount,
  currency = "COP",
  onTipChange,
  initialTip = 0,
}: TipSelectorProps) {
  // No inline function needed
  return (
    <div>
      {PRESET_PERCENTAGES.map((percentage) => {
        const tipAmount = Math.round((baseAmount * percentage) / 100);
        return (
          <span key={percentage}>
            {formatCurrency(tipAmount, { currency })}
          </span>
        );
      })}
    </div>
  );
}
```

**Benefits:**
- Removed 7 lines of duplicated code
- Consistent formatting across all tip amounts
- Supports multiple currencies without code changes

---

## Example 3: Price Breakdown Component

**File:** `/src/components/pricing/price-breakdown.tsx`

### Before

```typescript
export function PriceBreakdown({
  baseAmount,
  addonsTotal = 0,
  hours,
  hourlyRate,
  showPlatformFee = false,
}: PriceBreakdownProps) {
  // Duplicated formatting logic
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div>
      <span>{formatCurrency(hourlyRate)}/hr</span>
      <span>{formatCurrency(baseAmount)}</span>
      <span>{formatCurrency(addonsTotal)}</span>
      <span>{formatCurrency(totalWithFees)}</span>
    </div>
  );
}

export function CompactPrice({ hourlyRate }: CompactPriceProps) {
  // Duplicated again in same file!
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);

  return <div>{formatCurrency(hourlyRate)}/hr</div>;
}
```

### After

```typescript
import { formatCOP } from "@/lib/format";

export function PriceBreakdown({
  baseAmount,
  addonsTotal = 0,
  hours,
  hourlyRate,
  showPlatformFee = false,
}: PriceBreakdownProps) {
  // No inline function needed - use COP-specific helper
  return (
    <div>
      <span>{formatCOP(hourlyRate)}/hr</span>
      <span>{formatCOP(baseAmount)}</span>
      <span>{formatCOP(addonsTotal)}</span>
      <span>{formatCOP(totalWithFees)}</span>
    </div>
  );
}

export function CompactPrice({ hourlyRate }: CompactPriceProps) {
  // Uses same centralized utility
  return <div>{formatCOP(hourlyRate)}/hr</div>;
}
```

**Benefits:**
- Removed 14 lines of duplicated code (2 inline functions)
- Both components use same formatting logic
- Shorter, cleaner code with `formatCOP` helper

---

## Example 4: Book Again Card Component

**File:** `/src/components/bookings/book-again-card.tsx`

### Before

```typescript
// Moved outside component but still duplicated
function formatCurrencyCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const BookAgainCardComponent = memo(
  function BookAgainCard({ booking }: BookAgainCardProps) {
    return (
      <div>
        <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
        <span>{formatCurrencyCOP(booking.amount)}</span>
      </div>
    );
  }
);
```

### After

```typescript
import { formatCOP, formatDate } from "@/lib/format";

const BookAgainCardComponent = memo(
  function BookAgainCard({ booking }: BookAgainCardProps) {
    return (
      <div>
        <span>{formatDate(booking.scheduledDate)}</span>
        <span>{formatCOP(booking.amount)}</span>
      </div>
    );
  }
);
```

**Benefits:**
- Removed external helper function (7 lines)
- Date formatting now centralized
- Consistent formatting across date and currency

---

## Example 5: Notifications Module

**File:** `/src/lib/notifications.ts`

### Before

```typescript
export async function notifyCustomerBookingConfirmed(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    scheduledStart: string;
    professionalName: string;
  }
) {
  // Inline date formatting
  const date = new Date(booking.scheduledStart).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return sendPushNotification({
    title: "Booking Confirmed! 🎉",
    body: `Your ${booking.serviceName} with ${booking.professionalName} is confirmed for ${date}`,
  });
}
```

### After

```typescript
import { formatDate } from "@/lib/format";

export async function notifyCustomerBookingConfirmed(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    scheduledStart: string;
    professionalName: string;
  }
) {
  // Use centralized date formatting
  const date = formatDate(booking.scheduledStart, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return sendPushNotification({
    title: "Booking Confirmed! 🎉",
    body: `Your ${booking.serviceName} with ${booking.professionalName} is confirmed for ${date}`,
  });
}
```

**Benefits:**
- Cleaner, more declarative code
- Null-safe handling (original would crash on null)
- Consistent with other date formatting in app

---

## Migration Statistics

### Files Updated (Examples)
1. `/src/components/bookings/checkout-summary.tsx` - Currency formatting
2. `/src/components/payments/tip-selector.tsx` - Currency formatting
3. `/src/components/pricing/price-breakdown.tsx` - Currency formatting (2 components)
4. `/src/components/bookings/book-again-card.tsx` - Currency + Date formatting
5. `/src/lib/notifications.ts` - Date formatting

### Code Reduction
- **Lines removed:** ~50+ lines of duplicated formatting code
- **Functions eliminated:** 5+ inline formatting functions
- **Duplication instances:** 47+ files with similar patterns identified

### Quality Improvements
- ✅ Type-safe formatting with TypeScript
- ✅ Null/undefined safety
- ✅ Consistent locale handling
- ✅ Single source of truth for formatting
- ✅ Easier to maintain and update
- ✅ Better test coverage

## Next Steps

### Remaining Files to Migrate (47+ total)

High-priority files with duplicated formatting:
- `/src/lib/subscription-pricing.ts`
- `/src/lib/payout-calculator.ts`
- `/src/components/admin/professional-review-modal.tsx`
- `/src/components/referrals/referral-card.tsx`
- `/src/components/professionals/professionals-directory.tsx`
- `/src/components/professionals/professional-availability-calendar.tsx`
- `/src/components/bookings/customer-booking-list.tsx`
- `/src/components/bookings/cancel-booking-modal.tsx`
- And 39+ more files...

### Migration Strategy

1. **Phase 1: High-traffic components** (Completed)
   - Checkout flows
   - Payment components
   - Booking components

2. **Phase 2: Admin and dashboard components**
   - Financial reports
   - Analytics dashboards
   - Professional management

3. **Phase 3: API routes and server code**
   - Notification formatters
   - Email templates
   - API responses

4. **Phase 4: Edge cases**
   - Mobile components
   - Legacy code
   - External integrations

### Automation Opportunities

Consider creating a codemod script to automate the migration:

```typescript
// Example codemod pattern
const inlineFormatterPattern = /const formatCurrency.*?\.format\(.*?\);/gs;
const replacement = "import { formatCurrency } from '@/lib/format';";
```

## Testing Checklist

After migrating each file:

- [ ] Visual regression test
- [ ] Currency values display correctly
- [ ] Date/time values display correctly
- [ ] Null/undefined values don't crash
- [ ] Locale switching works
- [ ] TypeScript compilation passes
- [ ] No console errors in browser

## References

- [Formatting Utilities Documentation](/docs/formatting-utilities.md)
- [Migration PR #XXX](https://github.com/org/repo/pull/XXX)
- [Original Issue: Consolidate Formatting Logic](https://github.com/org/repo/issues/XXX)
