# Formatting Utilities Reference

Complete API reference for centralized formatting utilities in `/src/lib/format.ts`.

Replaces duplicated `Intl.NumberFormat` and date formatting patterns across 47+ files.

## Currency

### `formatCurrency(amount, options?)`
```typescript
formatCurrency(50000); // "$ 50.000" (COP, es-CO)
formatCurrency(50000, { currency: "USD" }); // "$50,000.00"
formatCurrency(null); // "$ 0"
```

**Options:** `locale`, `currency`, `minimumFractionDigits`, `maximumFractionDigits`

### `formatCOP(amount)`, `formatUSD(amount)`
Convenience functions for common currencies.

```typescript
formatCOP(50000); // "$ 50.000"
formatUSD(50.5); // "$50.50"
```

## Dates

### `formatDate(date, options?)`
```typescript
formatDate("2024-12-25"); // "Dec 25, 2024"
formatDate("2024-12-25", { weekday: "long" }); // "Wednesday, Dec 25, 2024"
formatDate("2024-12-25", { locale: "es-CO", month: "long" }); // "25 de diciembre de 2024"
formatDate(null); // ""
```

**Options:** `locale`, `weekday`, `year`, `month`, `day`

### `formatDateShort(date)`, `formatDateLong(date)`
Convenience functions for common date formats.

## Time

### `formatTime(date, options?)`
```typescript
formatTime("2024-12-25T14:30:00"); // "02:30 PM"
formatTime("2024-12-25T14:30:00", { hour12: false }); // "14:30"
formatTime(null); // ""
```

**Options:** `locale`, `hour`, `minute`, `second`, `hour12`

### `formatTime12(date)`, `formatTime24(date)`
Convenience functions for 12/24 hour formats.

## Date + Time

### `formatDateTime(date, options?)`
```typescript
formatDateTime("2024-12-25T14:30:00"); // "Dec 25, 2024, 02:30 PM"
formatDateTime("2024-12-25T14:30:00", { weekday: "short", hour12: false }); // "Wed, Dec 25, 2024, 14:30"
```

## Duration

### `formatDuration(minutes)`
```typescript
formatDuration(90); // "1h 30m"
formatDuration(60); // "1h"
formatDuration(45); // "45m"
formatDuration(null); // "0m"
```

### `formatDurationHours(hours)`
```typescript
formatDurationHours(1.5); // "1h 30m"
formatDurationHours(2); // "2h"
formatDurationHours(0.25); // "15m"
```

## Utilities

### `formatNumber(value, options?)`
```typescript
formatNumber(1000); // "1,000"
formatNumber(1234567); // "1,234,567"
formatNumber(null); // "0"
```

### `formatPercentage(value, options?)`
```typescript
formatPercentage(0.19); // "19%"
formatPercentage(0.5); // "50%"
formatPercentage(null); // "0%"
```

## Migration

### Before (Duplicated)
```typescript
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

const date = new Date(booking.scheduledStart).toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});
```

### After (Centralized)
```typescript
import { formatCOP, formatDate } from "@/lib/format";

formatCOP(amount);
formatDate(booking.scheduledStart, { weekday: "short", month: "short", day: "numeric" });
```

## Best Practices

1. Always import from `@/lib/format` - don't create inline formatting
2. Use `formatCOP()` for most currency cases
3. All functions handle null/undefined safely
4. Use TypeScript types for type safety
5. Use `es-CO` locale for Colombian Spanish, `en-US` for English

## Testing

Tests: `/src/lib/__tests__/format.test.ts` and `/src/lib/__tests__/format.manual.test.ts`

```bash
npx tsx src/lib/__tests__/format.manual.test.ts
```

## Updated Files

47+ files updated including:
- `/src/components/bookings/checkout-summary.tsx`
- `/src/components/payments/tip-selector.tsx`
- `/src/components/pricing/price-breakdown.tsx`
- `/src/components/bookings/book-again-card.tsx`
- `/src/lib/notifications.ts`

See `/docs/03-technical/utilities/formatting-migration-examples.md` for complete list.
