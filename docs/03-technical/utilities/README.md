# Utilities

Centralized utility functions for formatting, validation, and common operations.

## Formatting Utilities

Location: `/src/lib/format.ts`

### Currency
```typescript
import { formatCurrency } from "@/lib/format";

formatCurrency(50000); // "$ 50.000" (COP, es-CO)
formatCurrency(50000, { currency: "USD" }); // "$50,000.00"
formatCurrency(null); // "$ 0" (handles null/undefined)
```

**Options:**
- `locale`: "es-CO" | "en-US" (default: "es-CO")
- `currency`: "COP" | "USD" (default: "COP")
- `minimumFractionDigits`: number (default: 0)

### Dates
```typescript
import { formatDate, formatDateRange } from "@/lib/format";

formatDate("2025-11-03"); // "Nov 3, 2025"
formatDate("2025-11-03", { style: "full" }); // "November 3, 2025"
formatDate("2025-11-03", { locale: "es-CO" }); // "3 nov 2025"

formatDateRange("2025-11-03", "2025-11-05"); // "Nov 3 - Nov 5, 2025"
```

**Date Options:**
- `locale`: "es-CO" | "en-US" (default: "en-US")
- `style`: "short" | "medium" | "long" | "full" (default: "medium")
- `includeYear`: boolean (default: true)

### Time
```typescript
import { formatTime } from "@/lib/format";

formatTime("14:30:00"); // "2:30 PM"
formatTime("14:30:00", { locale: "es-CO" }); // "14:30"
formatTime("14:30:00", { use24Hour: true }); // "14:30"
```

**Time Options:**
- `locale`: "es-CO" | "en-US" (default: "en-US")
- `use24Hour`: boolean (default: false)
- `includeSeconds`: boolean (default: false)

### Duration
```typescript
import { formatDuration, formatDurationFromMinutes } from "@/lib/format";

formatDuration(90); // "1h 30m"
formatDuration(45); // "45m"
formatDurationFromMinutes(120); // "2h"
```

**Duration Options:**
- `style`: "short" | "long" (default: "short")
- `includeSeconds`: boolean (default: false)

### Relative Time
```typescript
import { formatRelativeTime } from "@/lib/format";

formatRelativeTime("2025-11-03T10:00:00"); // "in 2 hours"
formatRelativeTime("2025-11-02T10:00:00"); // "1 day ago"
```

**Options:**
- `locale`: "es-CO" | "en-US" (default: "en-US")
- `style`: "long" | "short" | "narrow" (default: "long")

## Benefits

- **Consistency**: Uniform formatting across the app
- **Type Safety**: Full TypeScript support
- **Null Safety**: All functions handle null/undefined gracefully
- **Performance**: Reusable formatters reduce duplication
- **Maintainability**: Single source of truth

## Migration

Before migration, 47+ files had duplicate formatting logic. See `/docs/03-technical/utilities/formatting-migration-examples.md` for specific examples.

## Related Files

- Implementation: `/src/lib/format.ts`
- Types: `/src/types/format.ts`
- Tests: `/src/lib/__tests__/format.test.ts`
