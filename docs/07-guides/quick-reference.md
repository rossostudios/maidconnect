# Quick Reference

**One-page cheat sheet for Casaora development**

---

## Common Imports

### API Middleware
```typescript
import { withAuth, withProfessional, withCustomer, withAdmin } from "@/lib/api";
import { ok, created, noContent } from "@/lib/api";
import { requireProfessionalOwnership, requireCustomerOwnership } from "@/lib/api";
import { requireProfessionalProfile, requireCustomerProfile } from "@/lib/api";
```

### Modals
```typescript
import { BaseModal } from "@/components/shared/base-modal";
import { FormModal } from "@/components/shared/form-modal";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { useModalForm } from "@/hooks/use-modal-form";
import { useApiMutation } from "@/hooks/use-api-mutation";
```

### Calendars
```typescript
import { AvailabilityCalendar } from "@/components/shared/availability-calendar";
import { useCalendarMonth } from "@/hooks/use-calendar-month";
import { useAvailabilityData } from "@/hooks/use-availability-data";
import { useCalendarGrid } from "@/hooks/use-calendar-grid";
```

### Utilities
```typescript
import { formatCurrency, formatDate, formatPhoneNumber } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils"; // Tailwind class merger
import { z } from "zod"; // Validation
```

### Database
```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseClient } from "@/lib/supabase/client"; // Client-side only
```

### Errors
```typescript
import {
  AuthenticationError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
```

---

## Hook Usage

### useModalForm
```typescript
const form = useModalForm<FormData>({
  initialData: { name: "", email: "" },
  resetOnClose: true,
});

// Access
form.formData              // Current form data
form.updateField(key, val) // Update single field
form.setFormData(data)     // Set all data
form.reset()               // Reset to initial
form.isLoading             // Loading state
form.error                 // Error message
form.setError(msg)         // Set error
```

### useApiMutation
```typescript
const mutation = useApiMutation({
  url: "/api/endpoint",
  method: "POST",
  refreshOnSuccess: true,
  onSuccess: (data) => {},
  onError: (error) => {},
});

// Use
await mutation.mutate(data);

// State
mutation.isLoading
mutation.error
mutation.data
```

### useCalendarMonth
```typescript
const {
  currentMonth,
  goToNextMonth,
  goToPreviousMonth,
  goToToday,
  monthLabel,
} = useCalendarMonth(initialDate);
```

### useAvailabilityData
```typescript
const {
  data,
  loading,
  error,
  refetch,
  getDateAvailability,
} = useAvailabilityData({
  professionalId,
  startDate,
  endDate,
});
```

---

## Middleware Patterns

### Basic Auth
```typescript
export const POST = withAuth(async ({ user, supabase }, req) => {
  // user guaranteed to exist
  return ok({ success: true });
});
```

### Role-Based
```typescript
export const POST = withProfessional(async ({ user, supabase }) => {
  // user.role === "professional"
});

export const POST = withCustomer(async ({ user, supabase }) => {
  // user.role === "customer"
});

export const POST = withAdmin(async ({ user, supabase }) => {
  // user.role === "admin"
});
```

### Ownership Check
```typescript
export const POST = withProfessional(async ({ user, supabase }, req) => {
  const { bookingId } = await req.json();

  const booking = await requireProfessionalOwnership(
    supabase,
    user.id,
    bookingId
  );

  // Ownership verified, safe to proceed
});
```

### With Validation
```typescript
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = withAuth(async ({ user, supabase }, req) => {
  const body = await req.json();
  const validated = schema.parse(body); // Throws if invalid
  return ok(validated);
});
```

---

## Modal Patterns

### FormModal
```typescript
<FormModal
  isOpen={isOpen}
  onClose={onClose}
  title="My Form"
  onSubmit={handleSubmit}
  isSubmitting={isLoading}
  submitText="Save"
  cancelText="Cancel"
>
  {/* Form inputs */}
</FormModal>
```

### BaseModal
```typescript
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Custom Modal"
  size="lg"
>
  {/* Custom content */}
</BaseModal>
```

### ConfirmationModal
```typescript
<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure?"
  variant="danger"
  confirmText="Delete"
  cancelText="Cancel"
/>
```

---

## Calendar Patterns

### Standard Booking
```typescript
<AvailabilityCalendar
  dataSource={{ type: "api", professionalId }}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  selectedTime={selectedTime}
  onTimeSelect={setSelectedTime}
/>
```

### Size Variants
```typescript
size="compact"   // Minimal spacing
size="medium"    // Default
size="large"     // Generous spacing
```

### Theme Variants
```typescript
theme="default"      // Standard
theme="professional" // Pro dashboard
theme="customer"     // Customer booking
```

### Feature Toggles
```typescript
showTimeSlots={false}
showLegend={false}
showTodayButton={false}
```

---

## Formatting Patterns

### Currency
```typescript
formatCurrency(50000, "COP")    // "$50.000"
formatCurrency(50000, "USD")    // "$50,000.00"
```

### Dates
```typescript
formatDate(date)                // "Nov 3, 2025"
formatDateTime(date)            // "Nov 3, 2025 at 2:30 PM"
formatRelativeTime(date)        // "2 hours ago"
formatTimeSlot("09:00")         // "9:00 AM"
```

### Phone
```typescript
formatPhoneNumber("3001234567", "CO")  // "+57 300 123 4567"
```

### Text
```typescript
truncate(text, 50)              // "Long text..."
capitalize("hello")             // "Hello"
pluralize(5, "booking")         // "5 bookings"
```

---

## Validation Patterns

### Common Schemas
```typescript
// Email
z.string().email()

// UUID
z.string().uuid()

// Phone
z.string().regex(/^\d{10}$/)

// Enum
z.enum(["pending", "confirmed", "completed"])

// Number range
z.number().min(0).max(100)

// Optional with default
z.string().optional().default("default")

// Custom
z.string().refine(
  (val) => val.length >= 3,
  "Min 3 characters"
)
```

---

## Database Patterns

### Simple Query
```typescript
const { data } = await supabase
  .from("bookings")
  .select("*")
  .eq("id", id)
  .single();
```

### With Relations
```typescript
const { data } = await supabase
  .from("bookings")
  .select(`
    *,
    customer:customer_id (full_name),
    professional:professional_id (business_name)
  `)
  .eq("id", id)
  .single();
```

### Pagination
```typescript
const { data, count } = await supabase
  .from("bookings")
  .select("*", { count: "exact" })
  .range(offset, offset + limit - 1);
```

### RPC Call
```typescript
const { data } = await supabase
  .rpc("function_name", {
    param1: "value",
  });
```

---

## Response Patterns

### Success Responses
```typescript
return ok(data);                      // 200
return ok(data, "Success message");   // 200 with message
return created(data, { id: "123" });  // 201
return noContent();                   // 204
```

### Paginated Response
```typescript
return paginated({
  data: items,
  page: 1,
  limit: 20,
  total: 100,
});
```

---

## Error Patterns

### Throw Errors
```typescript
throw new AuthenticationError("Not authenticated");
throw new UnauthorizedError("Access denied");
throw new NotFoundError("Booking", id);
throw new ValidationError("Invalid input");
```

### Client Error Handling
```typescript
try {
  await mutation.mutate(data);
} catch (error) {
  console.error(error);
  setError(error.message);
}
```

---

## Common Mistakes

### ❌ Don't
```typescript
// Manual auth check
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "..." }, { status: 401 });

// Duplicate client creation
const supabase = createSupabaseServerClient();

// Hardcoded text
<button>Save</button>
```

### ✅ Do
```typescript
// Use middleware
export const POST = withAuth(async ({ user, supabase }) => {
  // user exists, supabase ready
});

// Middleware provides client
export const POST = withAuth(async ({ supabase }) => {
  // Use provided client
});

// Localized or configurable text
<button>{submitText || "Save"}</button>
```

---

## File Paths

### Components
- Shared: `/src/components/shared/`
- Feature-specific: `/src/components/{feature}/`

### Hooks
- All hooks: `/src/hooks/`

### API Routes
- All routes: `/src/app/api/`

### Utils
- Formatting: `/src/lib/utils/formatting.ts`
- General: `/src/lib/utils/index.ts`

### API Library
- All API utils: `/src/lib/api/`

---

## Quick Commands

```bash
# Dev server
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm test

# Format
npm run format
```

---

**See also:**
- [Development Guide](/docs/07-guides/development-guide.md) - Detailed how-to guide
- [API Middleware Guide](/docs/07-guides/api-middleware-guide.md) - API patterns
- [Modal Patterns Guide](/docs/07-guides/modal-patterns-guide.md) - Modal patterns
