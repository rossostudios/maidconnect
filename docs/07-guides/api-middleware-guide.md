# API Middleware & Authentication System

## Overview

This guide documents the new API middleware system that eliminates duplication across 68+ API routes by providing reusable authentication, authorization, error handling, and response formatting utilities.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [API Reference](#api-reference)
4. [Migration Guide](#migration-guide)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

---

## Quick Start

### Basic Authenticated Route

**Before (18 lines):**
```typescript
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // ... your logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

**After (5 lines):**
```typescript
import { withAuth, ok } from "@/lib/api";

export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  // ... your logic
  return ok({ success: true });
});
```

---

## Core Concepts

### 1. Authentication Middleware

Middleware functions that wrap your route handlers with automatic authentication checks:

- **`withAuth`** - Requires any authenticated user
- **`withProfessional`** - Requires professional role
- **`withCustomer`** - Requires customer role
- **`withAdmin`** - Requires admin role

### 2. Authorization Helpers

Functions that verify ownership and permissions:

- **`requireProfessionalOwnership`** - Verify professional owns a booking
- **`requireCustomerOwnership`** - Verify customer owns a booking
- **`requireProfessionalProfile`** - Verify user has professional profile
- **`requireCustomerProfile`** - Verify user has customer profile
- **`requireResourceOwnership`** - Generic resource ownership check

### 3. Response Helpers

Consistent response formatting:

- **`ok(data, message)`** - 200 OK response
- **`created(data, options)`** - 201 Created response
- **`noContent()`** - 204 No Content response
- **`paginated(options)`** - Paginated response

### 4. Error Handling

Throw typed errors anywhere in your handler - they're automatically caught and formatted:

```typescript
throw new AuthenticationError("Not authenticated");
throw new UnauthorizedError("Not authorized");
throw new NotFoundError("Booking", bookingId);
throw new ValidationError("Invalid input");
```

---

## API Reference

### Authentication Functions

#### `requireAuth(request: Request): Promise<AuthContext>`

Gets authenticated user or throws 401.

```typescript
const { user, supabase } = await requireAuth(request);
```

#### `getOptionalAuth(request: Request): Promise<AuthContext | null>`

Gets authenticated user or returns null (for public routes that enhance with auth).

```typescript
const auth = await getOptionalAuth(request);
if (auth) {
  // User is logged in
}
```

### Middleware Functions

#### `withAuth(handler, context?)`

Wraps handler with authentication requirement.

```typescript
export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // Handler receives authenticated context
  return ok({ userId: user.id });
});
```

#### `withProfessional(handler, context?)`

Requires professional role.

```typescript
export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Only professionals can reach here
  return ok({ success: true });
});
```

#### `withCustomer(handler, context?)`

Requires customer role.

```typescript
export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  // Only customers can reach here
  return ok({ success: true });
});
```

#### `withAdmin(handler, context?)`

Requires admin role.

```typescript
export const POST = withAdmin(async ({ user, supabase }, request: Request) => {
  // Only admins can reach here
  return ok({ success: true });
});
```

#### `withValidation(schema, handler, context?)`

Validates request body against a Zod schema.

```typescript
const schema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().optional()
});

export const POST = withValidation(
  schema,
  async (validatedData, request: Request) => {
    // validatedData is type-safe
    return ok({ success: true });
  }
);
```

### Authorization Functions

#### `requireProfessionalOwnership(supabase, userId, bookingId)`

Verifies professional owns the booking and returns booking data.

```typescript
const { user, supabase } = await requireAuth(request);
const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);
// booking is guaranteed to exist and be owned by user
```

#### `requireCustomerOwnership(supabase, userId, bookingId)`

Verifies customer owns the booking and returns booking data.

```typescript
const { user, supabase } = await requireAuth(request);
const booking = await requireCustomerOwnership(supabase, user.id, bookingId);
```

#### `requireProfessionalProfile(supabase, userId)`

Verifies user has a professional profile.

```typescript
const profile = await requireProfessionalProfile(supabase, user.id);
```

#### `requireCustomerProfile(supabase, userId)`

Verifies user has a customer profile.

```typescript
const profile = await requireCustomerProfile(supabase, user.id);
```

#### `requireResourceOwnership(supabase, table, resourceId, userId, ownerField?)`

Generic resource ownership check.

```typescript
const addon = await requireResourceOwnership(
  supabase,
  "professional_addons",
  addonId,
  user.id,
  "professional_id"
);
```

### Response Functions

#### `ok(data?, message?)`

Creates 200 OK response.

```typescript
return ok({ bookings: [...] });
return ok(null, "Operation completed");
return ok({ user }, "User fetched successfully");
```

#### `created(data?, options?)`

Creates 201 Created response.

```typescript
return created({ booking: newBooking }, {
  message: "Booking created",
  location: `/api/bookings/${id}`
});
```

#### `noContent()`

Creates 204 No Content response.

```typescript
return noContent();
```

#### `paginated(options)`

Creates paginated response with metadata.

```typescript
return paginated({
  items: bookings,
  page: 1,
  limit: 20,
  total: 150
});

// Response includes:
// - data: items array
// - metadata.pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
```

### Utility Functions

#### `withAuthMethods(handlers)`

Wraps multiple HTTP methods with the same middleware.

```typescript
export const { GET, POST, PUT } = withAuthMethods({
  GET: async ({ user, supabase }) => ok({ user }),
  POST: async ({ user, supabase }, request) => {
    const body = await request.json();
    return created({ data: body });
  },
  PUT: async ({ user, supabase }, request) => {
    const body = await request.json();
    return ok({ updated: true });
  }
});
```

---

## Migration Guide

### Step-by-Step Migration

#### 1. Import the utilities

```typescript
import { withAuth, withProfessional, ok, requireProfessionalOwnership } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
```

#### 2. Replace manual auth checks

**Before:**
```typescript
const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}
```

**After:**
```typescript
export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // user and supabase are provided
});
```

#### 3. Replace role checks

**Before:**
```typescript
if (user.user_metadata?.role !== "professional") {
  return NextResponse.json({ error: "Not authorized" }, { status: 403 });
}
```

**After:**
```typescript
export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Role is verified automatically
});
```

#### 4. Replace ownership checks

**Before:**
```typescript
const { data: booking, error } = await supabase
  .from("bookings")
  .select("*")
  .eq("id", bookingId)
  .maybeSingle();

if (error || !booking) {
  return NextResponse.json({ error: "Booking not found" }, { status: 404 });
}

if (booking.professional_id !== user.id) {
  return NextResponse.json(
    { error: "You are not authorized to access this booking" },
    { status: 403 }
  );
}
```

**After:**
```typescript
const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);
// Booking exists and is owned by user
```

#### 5. Replace response formatting

**Before:**
```typescript
return NextResponse.json({ success: true, data: result });
```

**After:**
```typescript
return ok({ data: result });
```

#### 6. Replace try-catch blocks

**Before:**
```typescript
try {
  // ... logic
  return NextResponse.json({ success: true });
} catch (error) {
  return NextResponse.json({ error: "Failed" }, { status: 500 });
}
```

**After:**
```typescript
// No try-catch needed - middleware handles it
// Just throw typed errors
if (!valid) {
  throw new ValidationError("Invalid input");
}
return ok({ success: true });
```

#### 7. Add validation schemas

```typescript
const bookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  reason: z.string().optional()
});

const body = await request.json();
const { bookingId, reason } = bookingSchema.parse(body);
```

---

## Examples

### Example 1: Simple Authenticated Endpoint

```typescript
import { withAuth, ok } from "@/lib/api";

export const GET = withAuth(async ({ user, supabase }) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return ok({ profile });
});
```

### Example 2: Professional Booking Action

```typescript
import { withProfessional, ok, requireProfessionalOwnership } from "@/lib/api";
import { InvalidBookingStatusError } from "@/lib/errors";
import { z } from "zod";

const acceptBookingSchema = z.object({
  bookingId: z.string().uuid()
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  const { bookingId } = acceptBookingSchema.parse(body);

  // Verify ownership
  const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);

  // Validate status
  if (booking.status !== "authorized") {
    throw new InvalidBookingStatusError(booking.status, "accept");
  }

  // Update booking
  const { error } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);

  if (error) throw new ValidationError("Failed to accept booking");

  return ok({ booking: { id: bookingId, status: "confirmed" } });
});
```

### Example 3: Customer Favorites Management

```typescript
import { withCustomer, ok, requireCustomerProfile } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  professionalId: z.string().uuid(),
  action: z.enum(["add", "remove"])
});

export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  const { professionalId, action } = schema.parse(body);

  const profile = await requireCustomerProfile(supabase, user.id);
  let favorites = (profile.favorite_professionals as string[]) || [];

  if (action === "add") {
    favorites = [...favorites, professionalId];
  } else {
    favorites = favorites.filter(id => id !== professionalId);
  }

  const { error } = await supabase
    .from("customer_profiles")
    .update({ favorite_professionals: favorites })
    .eq("profile_id", user.id);

  if (error) throw new ValidationError("Failed to update favorites");

  return ok({ favorites, isFavorite: action === "add" });
});
```

### Example 4: Multiple Methods with Same Auth

```typescript
import { withAuthMethods, ok, notFound } from "@/lib/api";

export const { GET, PUT, DELETE } = withAuthMethods({
  GET: async ({ user, supabase }) => {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", user.id);

    return ok({ items: data || [] });
  },

  PUT: async ({ user, supabase }, request) => {
    const body = await request.json();
    const { error } = await supabase
      .from("items")
      .update(body)
      .eq("id", body.id)
      .eq("user_id", user.id);

    if (error) throw new ValidationError("Update failed");
    return ok({ updated: true });
  },

  DELETE: async ({ user, supabase }, request) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new ValidationError("Delete failed");
    return noContent();
  }
});
```

### Example 5: Admin-Only Endpoint

```typescript
import { withAdmin, ok, paginated } from "@/lib/api";

export const GET = withAdmin(async ({ supabase }, request: Request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const [{ data: users }, { count }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .range(offset, offset + limit - 1),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
  ]);

  return paginated({
    items: users || [],
    page,
    limit,
    total: count || 0
  });
});
```

---

## Best Practices

### 1. Use Typed Errors

Always throw typed errors instead of returning error responses:

```typescript
// Good
throw new NotFoundError("Booking", bookingId);
throw new UnauthorizedError("Not authorized");

// Bad
return NextResponse.json({ error: "Not found" }, { status: 404 });
```

### 2. Validate Input with Zod

Use Zod schemas for type-safe validation:

```typescript
const schema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  amount: z.number().positive("Amount must be positive")
});

const body = await request.json();
const data = schema.parse(body); // Throws ValidationError on failure
```

### 3. Use Ownership Helpers

Don't manually check ownership:

```typescript
// Good
const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);

// Bad
const { data: booking } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
if (booking.professional_id !== user.id) {
  throw new UnauthorizedError();
}
```

### 4. Return Consistent Responses

Use response helpers for consistency:

```typescript
// Good
return ok({ data: result }, "Operation successful");
return created({ id: newId }, { location: `/api/resource/${newId}` });

// Bad
return NextResponse.json({ success: true, data: result });
```

### 5. Handle Async Operations Properly

Use `Promise.all` for parallel operations:

```typescript
// Good - Parallel
const [profile, bookings] = await Promise.all([
  supabase.from("profiles").select("*").eq("id", user.id).single(),
  supabase.from("bookings").select("*").eq("user_id", user.id)
]);

// Bad - Sequential (slower)
const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
const { data: bookings } = await supabase.from("bookings").select("*").eq("user_id", user.id);
```

### 6. Document Your Routes

Add JSDoc comments explaining what each route does:

```typescript
/**
 * Accept a booking request
 *
 * Requirements:
 * - Professional role
 * - Professional must own the booking
 * - Booking status must be "authorized"
 *
 * @returns Confirmed booking details
 */
export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // ...
});
```

---

## Line Count Comparison

### Before and After Statistics

| Route | Before | After | Reduction |
|-------|--------|-------|-----------|
| `/api/bookings/accept` | 148 lines | 62 lines | 58% |
| `/api/bookings/cancel` | 214 lines | 108 lines | 50% |
| `/api/professional/profile` | 114 lines | 53 lines | 54% |
| `/api/customer/favorites` | 131 lines | 78 lines | 40% |
| `/api/notifications/mark-read` | 66 lines | 40 lines | 39% |

**Average reduction: 48%**

With 68 API routes, assuming average reduction:
- **Before:** ~7,500 lines
- **After:** ~3,900 lines
- **Saved:** ~3,600 lines of duplicated code

---

## Migration Checklist

For each route you migrate:

- [ ] Import utilities from `@/lib/api`
- [ ] Replace manual auth check with `withAuth`, `withProfessional`, `withCustomer`, or `withAdmin`
- [ ] Replace manual ownership checks with `requireXxxOwnership` helpers
- [ ] Replace manual role checks with middleware
- [ ] Replace `NextResponse.json()` with response helpers (`ok`, `created`, etc.)
- [ ] Remove try-catch blocks (middleware handles errors)
- [ ] Add Zod validation schemas
- [ ] Throw typed errors instead of returning error responses
- [ ] Test the route thoroughly
- [ ] Delete the old implementation

---

## Troubleshooting

### Issue: TypeScript errors about Database types

**Solution:** Ensure `/src/types/database.types.ts` is up to date. Regenerate types:

```bash
npm run supabase:generate-types
```

### Issue: Middleware not catching errors

**Solution:** Make sure you're throwing errors, not returning error responses:

```typescript
// Good
throw new ValidationError("Invalid input");

// Bad
return badRequest("Invalid input");
```

### Issue: User role not working

**Solution:** Verify that user metadata contains the role:

```typescript
console.log(user.user_metadata?.role); // Should be "professional", "customer", or "admin"
```

---

## Support

For questions or issues:

1. Check this guide
2. Look at refactored examples in `/src/app/api/**/route.refactored.ts`
3. Review the implementation in `/src/lib/api/`
4. Ask the team in #backend-help

---

## Future Enhancements

Planned improvements:

- [ ] Rate limiting middleware
- [ ] Request caching
- [ ] Automatic API documentation generation
- [ ] Request/response logging
- [ ] Performance monitoring
- [ ] WebSocket authentication
- [ ] GraphQL integration
