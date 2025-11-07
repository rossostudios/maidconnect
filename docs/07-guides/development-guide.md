# Development Guide

Practical guide for common development tasks in Casaora.

**Focus:** How-to examples, not theory. Keep each section under 50 lines.

---

## Table of Contents

1. [Creating API Routes](#creating-api-routes)
2. [Creating Modals](#creating-modals)
3. [Creating Calendars](#creating-calendars)
4. [Using Formatting Utilities](#using-formatting-utilities)
5. [Database Queries](#database-queries)
6. [Authentication & Authorization](#authentication--authorization)
7. [Form Validation](#form-validation)
8. [Error Handling](#error-handling)

---

## Creating API Routes

### Standard Authenticated Route

```typescript
// /src/app/api/my-endpoint/route.ts
import { withAuth, ok } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  const { name, email } = schema.parse(body);

  // Your logic here
  const result = await supabase
    .from("my_table")
    .insert({ name, email, user_id: user.id })
    .select()
    .single();

  return ok(result.data);
});
```

### Role-Based Route (Professional Only)

```typescript
import { withProfessional, ok } from "@/lib/api";

export const POST = withProfessional(async ({ user, supabase }) => {
  // Only professionals can access this
  // user.role === "professional" guaranteed
});
```

### Ownership Verification

```typescript
import { withProfessional, ok, requireProfessionalOwnership } from "@/lib/api";

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  const { bookingId } = await request.json();

  // Throws 403 if user doesn't own booking
  const booking = await requireProfessionalOwnership(
    supabase,
    user.id,
    bookingId
  );

  // Safe to proceed - ownership verified
  return ok(booking);
});
```

**See also:** [API Middleware Guide](/docs/07-guides/api-middleware-guide.md)

---

## Creating Modals

### Simple Form Modal

```typescript
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use-modal-form";
import { useApiMutation } from "@/hooks/use-api-mutation";

type FormData = {
  name: string;
  email: string;
};

export function MyModal({ isOpen, onClose }: Props) {
  const form = useModalForm<FormData>({
    initialData: { name: "", email: "" },
    resetOnClose: true,
  });

  const mutation = useApiMutation({
    url: "/api/submit",
    method: "POST",
  });

  const handleSubmit = async () => {
    await mutation.mutate(form.formData);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="My Form"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isLoading}
    >
      <input
        value={form.formData.name}
        onChange={(e) => form.updateField("name", e.target.value)}
        className="input"
      />
      <input
        value={form.formData.email}
        onChange={(e) => form.updateField("email", e.target.value)}
        className="input"
      />
    </FormModal>
  );
}
```

### Complex Layout Modal

```typescript
import { BaseModal } from "@/components/shared/base-modal";

export function CustomModal({ isOpen, onClose }: Props) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Custom Layout">
      {/* Custom layout - tables, images, multi-column, etc */}
      <div className="grid grid-cols-2 gap-4">
        <div>Left content</div>
        <div>Right content</div>
      </div>

      {/* Custom footer */}
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleAction}>Confirm</button>
      </div>
    </BaseModal>
  );
}
```

### Confirmation Dialog

```typescript
import { ConfirmationModal } from "@/components/shared/confirmation-modal";

export function DeleteConfirm({ isOpen, onClose, onConfirm }: Props) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Item"
      message="Are you sure? This cannot be undone."
      variant="danger"
    />
  );
}
```

**See also:** [Modal Patterns Guide](/docs/07-guides/modal-patterns-guide.md)

---

## Creating Calendars

### Standard Booking Calendar

```typescript
import { AvailabilityCalendar } from "@/components/shared/availability-calendar";
import { useState } from "react";

export function BookingCalendar({ professionalId }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <AvailabilityCalendar
      dataSource={{
        type: "api",
        professionalId,
      }}
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      selectedTime={selectedTime}
      onTimeSelect={setSelectedTime}
      size="medium"
      theme="customer"
    />
  );
}
```

### Large Dashboard Calendar (No Time Slots)

```typescript
<AvailabilityCalendar
  dataSource={{ type: "api", professionalId }}
  size="large"
  theme="professional"
  showTimeSlots={false}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
/>
```

### Custom Data Source

```typescript
const customAvailability = [
  {
    date: "2025-11-15",
    status: "available",
    availableSlots: ["09:00", "10:00"],
    bookingCount: 0,
    maxBookings: 10,
  },
];

<AvailabilityCalendar
  dataSource={{
    type: "props",
    availability: customAvailability,
    getDateAvailability: (date) =>
      customAvailability.find(a => a.date === formatDate(date))
  }}
/>
```

**Calendar Props:**
- `size`: `"compact"` | `"medium"` | `"large"`
- `theme`: `"default"` | `"professional"` | `"customer"`
- `showTimeSlots`: boolean (default: true)
- `showLegend`: boolean (default: true)
- `showTodayButton`: boolean (default: true)

---

## Using Formatting Utilities

### Currency Formatting

```typescript
import { formatCurrency } from "@/lib/utils/formatting";

formatCurrency(50000, "COP")     // "$50.000"
formatCurrency(50000, "USD")     // "$50,000.00"
formatCurrency(0, "COP")         // "$0"
```

### Date Formatting

```typescript
import { formatDate, formatDateTime, formatRelativeTime } from "@/lib/utils/formatting";

formatDate(new Date())                    // "Nov 3, 2025"
formatDate(date, { locale: "es-CO" })     // "3 nov 2025"
formatDateTime(new Date())                // "Nov 3, 2025 at 2:30 PM"
formatRelativeTime(pastDate)              // "2 hours ago"
```

### Phone Number Formatting

```typescript
import { formatPhoneNumber } from "@/lib/utils/formatting";

formatPhoneNumber("3001234567", "CO")     // "+57 300 123 4567"
formatPhoneNumber("5551234567", "US")     // "+1 (555) 123-4567"
```

### Text Utilities

```typescript
import { truncate, capitalize, pluralize } from "@/lib/utils/formatting";

truncate("Long text...", 20)              // "Long text..."
capitalize("hello world")                 // "Hello world"
pluralize(1, "booking")                   // "1 booking"
pluralize(5, "booking")                   // "5 bookings"
```

---

## Database Queries

### Simple Query

```typescript
const { data, error } = await supabase
  .from("bookings")
  .select("*")
  .eq("professional_id", userId)
  .order("created_at", { ascending: false });

if (error) throw error;
```

### Query with Relations

```typescript
const { data } = await supabase
  .from("bookings")
  .select(`
    *,
    customer:customer_id (
      id,
      full_name,
      email
    ),
    professional:professional_id (
      id,
      business_name
    )
  `)
  .eq("id", bookingId)
  .single();
```

### Pagination

```typescript
const page = 1;
const limit = 20;
const offset = (page - 1) * limit;

const { data, count } = await supabase
  .from("bookings")
  .select("*", { count: "exact" })
  .range(offset, offset + limit - 1);

const totalPages = Math.ceil((count || 0) / limit);
```

### Using RPC Functions

```typescript
const { data } = await supabase
  .rpc("get_available_professionals", {
    service_type: "cleaning",
    location: [lat, lng],
    radius_km: 10,
  });
```

**See also:** [Database Schema](/docs/03-technical/database-schema.md)

---

## Authentication & Authorization

### Get Current User (Server)

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Not authenticated
}
```

### Check User Role

```typescript
const userRole = user.user_metadata?.role;

if (userRole === "professional") {
  // Professional-only logic
}
```

### Verify Profile Exists

```typescript
import { requireProfessionalProfile } from "@/lib/api";

// Throws 404 if profile doesn't exist
const profile = await requireProfessionalProfile(supabase, user.id);
```

### Row Level Security (RLS)

All database queries automatically respect RLS policies.

**Example policy:**
```sql
-- Professionals can only see their own bookings
CREATE POLICY "Professionals see own bookings"
  ON bookings FOR SELECT
  USING (professional_id = auth.uid());
```

---

## Form Validation

### Zod Schema Basics

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\d{10}$/, "Must be 10 digits"),
  age: z.number().min(18, "Must be 18+"),
  terms: z.boolean().refine((val) => val === true, "Must accept terms"),
});

// Validate
const result = schema.safeParse(formData);
if (!result.success) {
  console.log(result.error.errors);
}
```

### Common Validation Patterns

```typescript
// UUID
z.string().uuid()

// Date string
z.string().datetime()

// Enum
z.enum(["pending", "confirmed", "completed"])

// Optional field with default
z.string().optional().default("default value")

// Custom validation
z.string().refine(
  (val) => val.length >= 3,
  "Must be at least 3 characters"
)
```

---

## Error Handling

### Throw Typed Errors (API Routes)

```typescript
import {
  AuthenticationError,
  UnauthorizedError,
  NotFoundError,
  ValidationError
} from "@/lib/errors";

// Middleware catches and formats automatically
throw new AuthenticationError("Please log in");
throw new UnauthorizedError("Access denied");
throw new NotFoundError("Booking", bookingId);
throw new ValidationError("Invalid input");
```

### Client-Side Error Handling

```typescript
try {
  const response = await fetch("/api/endpoint", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  const result = await response.json();
  return result;
} catch (error) {
  console.error("API error:", error);
  // Show error to user
  setError(error.message);
}
```

### useApiMutation Hook (Recommended)

```typescript
const mutation = useApiMutation({
  url: "/api/endpoint",
  method: "POST",
  onSuccess: (data) => {
    console.log("Success:", data);
  },
  onError: (error) => {
    console.error("Error:", error);
  },
});

// Automatic loading/error states
await mutation.mutate(formData);
```

---

## Quick Tips

### Performance
- Use React Server Components by default
- Only add `"use client"` when needed (hooks, interactivity)
- Optimize images with `next/image`
- Use `loading.tsx` and `error.tsx` files

### Code Quality
- TypeScript strict mode enabled
- Validate all inputs with Zod
- Use shared hooks and components
- Follow existing patterns

### Security
- All API routes require authentication (use middleware)
- Validate all user inputs
- Use RLS policies in database
- Never expose API keys to client

---

**See also:**
- [Quick Reference](/docs/07-guides/quick-reference.md) - Cheat sheet
- [API Middleware Guide](/docs/07-guides/api-middleware-guide.md) - Deep dive on API patterns
- [Modal Patterns Guide](/docs/07-guides/modal-patterns-guide.md) - Deep dive on modal patterns
- [Architecture](/docs/03-technical/architecture.md) - System overview
