# API Middleware & Authentication

Reusable authentication, authorization, and response utilities for API routes.

## Quick Start

### Basic Authenticated Route
```typescript
import { withAuth, ok } from "@/lib/api";

export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  // Your logic here
  return ok({ success: true });
});
```

## Middleware Functions

### Authentication
- **`withAuth`** - Requires any authenticated user
- **`withProfessional`** - Requires professional role
- **`withCustomer`** - Requires customer role
- **`withAdmin`** - Requires admin role

```typescript
export const POST = withProfessional(async ({ user, supabase }, request) => {
  // Only professionals reach here
  return ok({ data });
});
```

### Validation
```typescript
import { withValidation } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().optional()
});

export const POST = withValidation(
  schema,
  async (validatedData, request) => {
    // validatedData is type-safe
    return ok({ success: true });
  }
);
```

## Authorization Helpers

Verify ownership and permissions:

```typescript
import { requireProfessionalOwnership, requireCustomerOwnership } from "@/lib/api";

// Verify professional owns booking
const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);

// Verify customer owns booking
const booking = await requireCustomerOwnership(supabase, user.id, bookingId);

// Verify professional profile exists
const profile = await requireProfessionalProfile(supabase, user.id);

// Generic resource ownership
const addon = await requireResourceOwnership(
  supabase,
  "professional_addons",
  addonId,
  user.id,
  "professional_id"
);
```

## Response Helpers

Consistent response formatting:

```typescript
import { ok, created, noContent, paginated } from "@/lib/api";

// 200 OK
return ok({ data }, "Optional message");

// 201 Created
return created({ id: newId }, { location: `/api/resource/${newId}` });

// 204 No Content
return noContent();

// Paginated response
return paginated({
  items: results,
  page: 1,
  limit: 20,
  total: 150
});
```

## Error Handling

Throw typed errors - middleware catches and formats them:

```typescript
import {
  AuthenticationError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  InvalidBookingStatusError
} from "@/lib/errors";

// These are automatically caught and formatted
throw new AuthenticationError("Not authenticated");
throw new UnauthorizedError("Not authorized");
throw new NotFoundError("Booking", bookingId);
throw new ValidationError("Invalid input");
throw new InvalidBookingStatusError(booking.status, "accept");
```

## Complete Example

### Before (148 lines)
```typescript
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // ... validation, ownership checks, logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### After (62 lines - 58% reduction)
```typescript
import { withProfessional, ok, requireProfessionalOwnership } from "@/lib/api";
import { InvalidBookingStatusError } from "@/lib/errors";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().uuid()
});

export const POST = withProfessional(async ({ user, supabase }, request) => {
  const body = await request.json();
  const { bookingId } = schema.parse(body);

  // Verify ownership (throws if not found or unauthorized)
  const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);

  // Validate status
  if (booking.status !== "authorized") {
    throw new InvalidBookingStatusError(booking.status, "accept");
  }

  // Update booking
  await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);

  return ok({ booking: { id: bookingId, status: "confirmed" } });
});
```

## Multiple Methods

Wrap multiple HTTP methods with same middleware:

```typescript
import { withAuthMethods, ok, noContent } from "@/lib/api";

export const { GET, POST, DELETE } = withAuthMethods({
  GET: async ({ user, supabase }) => {
    const { data } = await supabase.from("items").select("*").eq("user_id", user.id);
    return ok({ items: data || [] });
  },

  POST: async ({ user, supabase }, request) => {
    const body = await request.json();
    await supabase.from("items").insert({ ...body, user_id: user.id });
    return created({ id: body.id });
  },

  DELETE: async ({ user, supabase }, request) => {
    const { searchParams } = new URL(request.url);
    await supabase.from("items").delete().eq("id", searchParams.get("id"));
    return noContent();
  }
});
```

## Best Practices

1. **Use typed errors** instead of returning error responses
2. **Validate input with Zod** for type safety
3. **Use ownership helpers** instead of manual checks
4. **Return consistent responses** using helper functions
5. **Document your routes** with JSDoc comments

## Benefits

- **48% average code reduction** across 68+ API routes
- **Eliminated ~3,600 lines** of duplicate code
- **Consistent error handling** across all routes
- **Type-safe** with full TypeScript support
- **Better maintainability** with centralized logic

## Migration Guide

See `/docs/08-archives/migration-2025-11/API_MIGRATION_PLAN.md` for detailed migration steps.

## Examples

Complete examples in:
- `/src/app/api/bookings/**/route.refactored.ts`
- `/src/app/api/professional/**/route.refactored.ts`
- `/src/app/api/customer/**/route.refactored.ts`
