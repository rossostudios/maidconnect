# MaidConnect Project Rules

**Critical: Always use Exa MCP server BEFORE starting development and AFTER implementation to validate approach.**

## Table of Contents
- [Pre-Development Research Protocol](#pre-development-research-protocol)
- [Project Overview](#project-overview)
- [Next.js 16 Critical Patterns](#nextjs-16-critical-patterns)
- [Code Style & Architecture](#code-style--architecture)
- [Database Migration Guidelines](#database-migration-guidelines)
- [Component Patterns](#component-patterns)
- [Security Considerations](#security-considerations)
- [Testing Requirements](#testing-requirements)
- [Commit Message Format](#commit-message-format)
- [Deployment Procedures](#deployment-procedures)

---

## Pre-Development Research Protocol

**MANDATORY: Before implementing ANY feature or fix:**

```bash
# 1. Research the approach using Exa MCP server
mcp__exa__get_code_context_exa: "Next.js 16 [your feature] best practices patterns"
mcp__exa__get_code_context_exa: "Supabase [your feature] RLS implementation patterns"
mcp__exa__web_search_exa: "[your feature] security considerations 2025"

# 2. After implementation, validate your approach
mcp__exa__get_code_context_exa: "[your feature] common mistakes pitfalls"
mcp__exa__web_search_exa: "[your feature] production checklist"
```

**Why:** Research shows that skipping this step leads to using outdated patterns like `middleware.ts` when Next.js now uses `proxy.ts`, or missing critical security considerations.

---

## Project Overview

### Tech Stack
- **Framework:** Next.js 16.0 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Database:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Package Manager:** Bun (NOT npm/yarn)
- **Styling:** TailwindCSS 4
- **Linting:** Biome (NOT ESLint/Prettier)
- **Testing:** Playwright
- **i18n:** next-intl (Spanish-first for Colombian market)
- **State:** React Query (@tanstack/react-query)
- **Validation:** Zod 4
- **Payments:** Stripe

### Project Structure
```
maidconnect/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── [locale]/     # i18n routes (en, es)
│   │   └── api/          # API routes (NOT middleware!)
│   ├── components/       # React components
│   │   ├── ui/          # Shadcn UI components
│   │   └── [feature]/   # Feature-specific components
│   ├── lib/             # Utilities and helpers
│   ├── types/           # TypeScript types
│   └── i18n.ts          # i18n configuration
├── supabase/
│   └── migrations/      # SQL migration files
├── proxy.ts             # Request proxy (NOT middleware.ts!)
└── next.config.ts       # Next.js configuration
```

---

## Next.js 16 Critical Patterns

### ⚠️ CRITICAL: NO middleware.ts - Use proxy.ts Instead

**WRONG (Outdated Pattern):**
```typescript
// ❌ DO NOT CREATE middleware.ts
// This is the OLD Next.js pattern
export function middleware(request: NextRequest) {
  // ...
}
```

**CORRECT (Next.js 16 Pattern):**
```typescript
// ✅ ALWAYS use proxy.ts
export default async function proxy(request: NextRequest) {
  // Server-side logic
  // Auth checks
  // CSRF validation
  // Session management
}

export const config = {
  matcher: [/* routes */],
};
```

**File Location:** `proxy.ts` in project root (same level as `next.config.ts`)

**Reference:** See @proxy.ts for our complete implementation with:
- Supabase session management
- CSRF protection
- Role-based routing
- i18n detection
- Security headers

### Server Actions Best Practices

**Always use Server Actions for mutations:**
```typescript
// ✅ In a separate actions file
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server-client';

export async function createBooking(formData: FormData) {
  const supabase = await createClient();

  // 1. Validate with Zod
  const validated = BookingSchema.parse({
    // ...
  });

  // 2. Perform mutation
  const { data, error } = await supabase
    .from('bookings')
    .insert(validated);

  if (error) throw error;

  // 3. Revalidate affected pages
  revalidatePath('/dashboard/customer/bookings');

  return data;
}
```

### Dynamic Imports for Performance

```typescript
// ✅ Use dynamic imports for heavy components
const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false, // Client-only if needed
});
```

---

## Code Style & Architecture

### Tailwind CSS Design System

**CRITICAL: Use Tailwind classes exclusively for styling. Do NOT create custom CSS variables for spacing or colors.**

#### Spacing Guidelines

✅ **CORRECT: Use Tailwind's built-in spacing scale**
```tsx
// Section spacing
<section className="py-16 sm:py-20 lg:py-24">

// Component gaps
<div className="flex flex-col gap-6">

// Card padding
<article className="p-8 rounded-3xl border">
```

❌ **WRONG: Custom CSS variables**
```tsx
// DO NOT DO THIS
<section className="py-[var(--spacing-section)]">
<div className="gap-[--spacing-gap]">
```

#### Tailwind Spacing Scale (8px base unit)

| Class | Pixels | Use Case |
|-------|--------|----------|
| `gap-2` | 8px | Minimal gaps (icon + text) |
| `gap-4` | 16px | Default element spacing |
| `gap-6` | 24px | Card/component internal spacing |
| `gap-8` | 32px | Related component groups |
| `gap-12` | 48px | Major element separation |
| `gap-16` | 64px | Component group spacing |
| `gap-24` | 96px | Section spacing |

#### Section Spacing Patterns

```tsx
// Standard sections (most content)
<section className="py-16 sm:py-20 lg:py-24">

// Feature sections (high visual impact)
<section className="py-20 sm:py-24 lg:py-32">

// Hero sections
<section className="py-24 sm:py-32 lg:py-40">
```

#### Color Usage - Tailwind Classes Only

✅ **CORRECT:**
```tsx
<div className="bg-white border-gray-200 text-gray-600">
<button className="bg-red-600 hover:bg-red-700 text-white">
<p className="text-gray-900">
```

❌ **WRONG:**
```tsx
<div className="bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)]">
<button className="bg-[var(--red)] hover:bg-[var(--red-hover)]">
```

**Brand Color Palette:**
- Primary: `bg-red-600` (actions), `bg-red-50` (backgrounds)
- Text: `text-gray-900` (headings), `text-gray-600` (body)
- Borders: `border-gray-200` (default), `border-gray-300` (strong)
- Backgrounds: `bg-white` (cards), `bg-gray-50` (sections)

#### Component Layout Patterns

**Use flexbox/grid with `gap-*` instead of margin on children:**

```tsx
// ✅ CORRECT: Flex with gap
<div className="flex flex-col gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// ❌ WRONG: Margin on children
<div className="flex flex-col">
  <div className="mb-6">Item 1</div>
  <div className="mb-6">Item 2</div>
  <div>Item 3</div>
</div>
```

**Reference:** See `docs/component-library.md` for complete design system documentation.

### TypeScript Configuration

**Strict Mode is MANDATORY** - See @tsconfig.json:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### TypeScript Best Practices & Anti-Patterns

**⚠️ CRITICAL: NEVER use `as any` - This defeats the entire purpose of TypeScript!**

```typescript
// ❌ WRONG: Using 'as any' to bypass type checking
const data = response.data as any;
data.someProperty; // No type safety!

// ❌ WRONG: Using 'any' type
function processData(data: any) {
  return data.value;
}

// ✅ CORRECT: Define proper types
interface ResponseData {
  id: string;
  value: number;
  metadata?: Record<string, unknown>;
}

const data = response.data as ResponseData;
data.value; // Type-safe!

// ✅ CORRECT: Use generics for flexible typing
function processData<T extends { value: number }>(data: T) {
  return data.value;
}

// ✅ CORRECT: Use 'unknown' if type is truly unknown, then narrow it
function handleUnknownData(data: unknown) {
  // Type guard to narrow the type
  if (typeof data === 'object' && data !== null && 'value' in data) {
    const validated = ResponseDataSchema.parse(data); // Use Zod for runtime validation
    return validated;
  }
  throw new Error('Invalid data structure');
}
```

**Type Narrowing Techniques - Use These Instead of `as any`:**

```typescript
// ✅ Type guards
function isBooking(value: unknown): value is Booking {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'status' in value
  );
}

if (isBooking(data)) {
  // TypeScript knows data is Booking here
  console.log(data.status);
}

// ✅ Discriminated unions
type Response =
  | { success: true; data: BookingData }
  | { success: false; error: string };

function handleResponse(response: Response) {
  if (response.success) {
    // TypeScript knows response.data exists here
    return response.data;
  } else {
    // TypeScript knows response.error exists here
    throw new Error(response.error);
  }
}

// ✅ Use Zod for runtime validation + type inference
const BookingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'completed']),
  total: z.number().positive(),
});

type Booking = z.infer<typeof BookingSchema>;

// Validates at runtime AND provides type safety
const booking = BookingSchema.parse(unknownData);
```

**Avoid Non-Null Assertions (!) Unless Absolutely Necessary:**

```typescript
// ❌ WRONG: Using ! to bypass null checks
const user = users.find(u => u.id === id)!;
user.name; // Runtime error if user is undefined!

// ✅ CORRECT: Handle the null case
const user = users.find(u => u.id === id);
if (!user) {
  throw new Error(`User ${id} not found`);
}
user.name; // Type-safe!

// ✅ CORRECT: Use optional chaining
const userName = users.find(u => u.id === id)?.name ?? 'Unknown';

// ⚠️ ACCEPTABLE: Only use ! when you have a guarantee
// (e.g., after validation, in test setup, etc.)
const form = document.getElementById('booking-form')!; // We know it exists in this context
```

**NEVER Use @ts-ignore or @ts-expect-error to Hide Problems:**

```typescript
// ❌ WRONG: Hiding type errors
// @ts-ignore
const result = someFunction(wrongType);

// ❌ WRONG: Suppressing valid errors
// @ts-expect-error
data.nonExistentProperty = value;

// ✅ CORRECT: Fix the actual type issue
interface DataWithProperty {
  existingProperty: string;
  newProperty?: string;
}

const data: DataWithProperty = { existingProperty: 'value' };
data.newProperty = 'new value'; // Type-safe!
```

**Proper Error Handling with Types:**

```typescript
// ❌ WRONG: Catching and ignoring type information
try {
  await someOperation();
} catch (error) {
  console.error(error.message); // error is 'any'
}

// ✅ CORRECT: Properly type errors
try {
  await someOperation();
} catch (error) {
  if (error instanceof Error) {
    console.error('Operation failed:', error.message);
  } else if (typeof error === 'string') {
    console.error('Operation failed:', error);
  } else {
    console.error('Unknown error:', error);
  }
}

// ✅ BETTER: Use error handling utilities
import { PostgrestError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

try {
  await someOperation();
} catch (error) {
  if (error instanceof PostgrestError) {
    console.error('Database error:', error.message);
    return { error: 'Database operation failed' };
  }

  if (error instanceof ZodError) {
    console.error('Validation error:', error.errors);
    return { error: 'Invalid data format' };
  }

  if (error instanceof Error) {
    console.error('Error:', error.message);
    return { error: 'An unexpected error occurred' };
  }

  console.error('Unknown error:', error);
  return { error: 'An unknown error occurred' };
}
```

**Array and Object Access:**

```typescript
// ❌ WRONG: Unsafe array access
const firstItem = items[0];
firstItem.name; // Could be undefined!

// ✅ CORRECT: With noUncheckedIndexedAccess enabled
const firstItem = items[0]; // Type is Item | undefined
if (firstItem) {
  firstItem.name; // Type-safe!
}

// ✅ CORRECT: Use optional chaining
const firstName = items[0]?.name ?? 'No items';

// ❌ WRONG: Unsafe object access
const config: Record<string, string> = loadConfig();
const value = config['key'].toUpperCase(); // Could be undefined!

// ✅ CORRECT: Handle undefined
const value = config['key'];
if (value !== undefined) {
  console.log(value.toUpperCase());
}
```

**Function Return Types - Always Explicit:**

```typescript
// ❌ WRONG: Implicit return type
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ CORRECT: Explicit types everywhere
function calculateTotal(items: BookingItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ CORRECT: Async functions return Promise
async function fetchBooking(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
```

**Component Props - No Inline Types:**

```typescript
// ❌ WRONG: Inline prop types
export function BookingCard({ booking }: { booking: any }) {
  // ...
}

// ❌ WRONG: Partial typing
export function BookingCard({ booking, onCancel }: any) {
  // ...
}

// ✅ CORRECT: Defined interface with proper types
interface BookingCardProps {
  booking: Database['public']['Tables']['bookings']['Row'];
  onCancel?: (id: string) => Promise<void>;
  className?: string;
}

export function BookingCard({ booking, onCancel, className }: BookingCardProps) {
  // Full type safety!
}
```

**Code Quality Checklist Before Committing:**

- [ ] **NO `as any` anywhere in the code**
- [ ] **NO `any` types (use `unknown` if truly unknown, then validate)**
- [ ] **NO `@ts-ignore` or `@ts-expect-error` (fix the actual issue)**
- [ ] **Minimal use of `!` non-null assertions (handle null cases properly)**
- [ ] **All functions have explicit return types**
- [ ] **All component props use interfaces, not inline types**
- [ ] **Error handling properly types caught errors**
- [ ] **Array/object access handles undefined (noUncheckedIndexedAccess)**
- [ ] **Use Zod schemas for runtime validation + type inference**
- [ ] **No implicit 'any' parameters or return types**

**When You Think You Need `as any`, Do This Instead:**

1. **Define the correct type** - Create interfaces/types that match your data
2. **Use Zod validation** - Validate unknown data at runtime and infer types
3. **Use type guards** - Narrow types safely with proper checks
4. **Use generics** - Make functions flexible while maintaining type safety
5. **Ask for help** - If you can't figure out the types, ask the team!

### Component Guidelines

**Always use functional components with TypeScript:**
```typescript
// ✅ CORRECT: Explicit prop types with interface
interface BookingCardProps {
  booking: Database['public']['Tables']['bookings']['Row'];
  onCancel?: (id: string) => Promise<void>;
  className?: string;
}

export function BookingCard({ booking, onCancel, className }: BookingCardProps) {
  // 1. Hooks at the top
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useMutation({ /* ... */ });

  // 2. Derived state and handlers
  const canCancel = booking.status === 'pending';

  // 3. Event handlers
  const handleCancel = async () => {
    setIsLoading(true);
    await onCancel?.(booking.id);
    setIsLoading(false);
  };

  // 4. Return JSX
  return (
    <Card className={cn('relative', className)}>
      {/* ... */}
    </Card>
  );
}
```

### Custom Hooks Pattern

```typescript
// ✅ hooks/use-bookings.ts
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useBookings(userId: string) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bookings')
        .select('*, professional:profiles!bookings_professional_id_fkey(*)')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
```

### File Naming Conventions

```
✅ CORRECT:
- booking-card.tsx          (component)
- use-bookings.ts           (hook)
- booking-actions.ts        (server actions)
- booking.types.ts          (types)
- format-currency.ts        (utility)

❌ WRONG:
- BookingCard.tsx           (PascalCase files)
- bookings_card.tsx         (snake_case)
- bookingCard.tsx           (camelCase)
```

### Import Organization

```typescript
// 1. React/Next.js imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party imports
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { BookingCard } from '@/components/bookings/booking-card';

// 4. Utilities and types
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/supabase';

// 5. Styles (if any)
import './styles.css';
```

### API Route Pattern

```typescript
// ✅ app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Query logic...

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Database Migration Guidelines

### Migration File Naming

**Format:** `YYYYMMDDHHMMSS_description.sql`

```bash
# ✅ CORRECT
20251105120000_create_bookings_table.sql
20251105120100_add_rls_policies_bookings.sql
20251105120200_create_booking_status_enum.sql

# ❌ WRONG
create_bookings.sql
migration_001.sql
2025-11-05-bookings.sql
```

### Migration Best Practices (Based on Supabase Official Guidelines)

```sql
-- ✅ TEMPLATE: Use this structure for ALL migrations

-- Migration: Create bookings table with RLS
-- Description: Core booking system with row-level security
-- Author: Your Name
-- Date: 2025-11-05

-- ============================================================================
-- SCHEMA CHANGES
-- ============================================================================

-- Create enum types first
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
);

-- Create tables
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status booking_status NOT NULL DEFAULT 'pending',
  scheduled_date timestamptz NOT NULL,
  total_amount integer NOT NULL CHECK (total_amount > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_professional_id ON public.bookings(professional_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON public.bookings(scheduled_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS (MANDATORY for all tables with user data)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- SELECT policies (separate for each role)
CREATE POLICY "Customers can view their own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = (SELECT auth.uid()));

CREATE POLICY "Professionals can view their assigned bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (professional_id = (SELECT auth.uid()));

-- INSERT policies
CREATE POLICY "Customers can create bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = (SELECT auth.uid()));

-- UPDATE policies
CREATE POLICY "Customers can update their pending bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (customer_id = (SELECT auth.uid()) AND status = 'pending')
  WITH CHECK (customer_id = (SELECT auth.uid()));

CREATE POLICY "Professionals can update their assigned bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (professional_id = (SELECT auth.uid()))
  WITH CHECK (professional_id = (SELECT auth.uid()));

-- DELETE policies
CREATE POLICY "Customers can delete their pending bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (customer_id = (SELECT auth.uid()) AND status = 'pending');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.bookings IS 'Stores all booking records';
COMMENT ON COLUMN public.bookings.total_amount IS 'Amount in cents (e.g., 5000 = $50.00)';
```

### Migration Testing Checklist

Before committing a migration:
```bash
# 1. Test locally
supabase db reset  # Resets and applies all migrations
supabase db diff   # Check for unexpected changes

# 2. Check RLS policies
# Test as different users to ensure RLS works

# 3. Check indexes
# Ensure all foreign keys have indexes
```

### RLS Policy Patterns

**✅ Use security definer functions for complex checks:**
```sql
-- Create in private schema to avoid exposure
CREATE SCHEMA IF NOT EXISTS private;

-- Helper function for role checks
CREATE OR REPLACE FUNCTION private.has_role(check_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role = check_role
  );
$$;

-- Use in policies
CREATE POLICY "Admins can view all bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (private.has_role('admin'));
```

---

## Component Patterns

### Composition Over Inheritance

```typescript
// ✅ CORRECT: Composable components
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      {children}
    </div>
  );
}

// Sub-components as properties
Card.Header = function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn('text-lg font-semibold', className)}>
      {children}
    </h3>
  );
};

// Usage
<Card>
  <Card.Header>
    <Card.Title>Booking Details</Card.Title>
  </Card.Header>
  <Card.Content>
    {/* ... */}
  </Card.Content>
</Card>
```

### Client vs Server Components

```typescript
// ✅ Default to Server Components
// NO 'use client' directive

export async function BookingList() {
  // Direct database access (server-side)
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*');

  return (
    <div>
      {bookings?.map(booking => (
        // ClientBookingCard handles interactivity
        <ClientBookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}

// ✅ Client Component only when needed
'use client';

export function ClientBookingCard({ booking }: { booking: Booking }) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Interactive logic here
}
```

### Form Patterns with React Hook Form + Zod

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define schema
const BookingSchema = z.object({
  service_id: z.string().uuid(),
  scheduled_date: z.string().datetime(),
  notes: z.string().min(10).max(500).optional(),
});

type BookingFormData = z.infer<typeof BookingSchema>;

// 2. Create form component
export function BookingForm() {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      notes: '',
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    // Call server action
    await createBooking(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Security Considerations

### CRITICAL: Never Trust Client Input

```typescript
// ❌ WRONG: Direct client input to database
'use server';
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  // DANGEROUS: No validation, no auth check
  await supabase
    .from('profiles')
    .update({
      role: formData.get('role'), // ⚠️ User could set themselves as admin!
    });
}

// ✅ CORRECT: Validate, authenticate, authorize
'use server';

import { z } from 'zod';

const ProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  // role is NOT included - only admins can change roles
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Validate input
  const validated = ProfileUpdateSchema.parse({
    name: formData.get('name'),
    bio: formData.get('bio'),
  });

  // 3. RLS handles authorization
  const { error } = await supabase
    .from('profiles')
    .update(validated)
    .eq('id', user.id);  // ✅ User can only update their own profile

  if (error) throw error;
}
```

### Environment Variables

**See @.env.example for complete list**

```bash
# ✅ CORRECT: Prefix public vars
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# ✅ CORRECT: Private server-only vars (no prefix)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
STRIPE_SECRET_KEY=sk_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...

# ❌ WRONG: Exposing secrets
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_xxx...  # Exposed to client!
```

### API Route Security Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const body = await request.json();
    const validated = YourSchema.parse(body);

    // 3. Check authorization
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 4. Process request
    // ...

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### XSS Prevention

```typescript
// ✅ CORRECT: Sanitize user-generated content
import DOMPurify from 'isomorphic-dompurify';

export function UserBio({ bio }: { bio: string }) {
  const sanitized = DOMPurify.sanitize(bio, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitized }}
      className="prose"
    />
  );
}

// ❌ WRONG: Direct HTML rendering
<div dangerouslySetInnerHTML={{ __html: bio }} />
```

---

## Testing Requirements

### Playwright Configuration

**See @package.json scripts:**
```bash
bun test              # Run all tests
bun test:ui           # Interactive UI
bun test:headed       # See browser
bun test:debug        # Debug mode
```

### Test Structure

```typescript
// tests/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login as customer
    await page.goto('/es/auth/sign-in');
    // ... login steps
  });

  test('customer can create a booking', async ({ page }) => {
    // Navigate to professionals
    await page.goto('/es/professionals');

    // Find and click on a professional
    await page.getByRole('link', { name: /ver perfil/i }).first().click();

    // Click book button
    await page.getByRole('button', { name: /reservar/i }).click();

    // Fill booking form
    await page.getByLabel(/fecha/i).fill('2025-12-15');
    await page.getByLabel(/hora/i).selectOption('10:00');

    // Submit
    await page.getByRole('button', { name: /confirmar/i }).click();

    // Verify success
    await expect(page.getByText(/reserva creada/i)).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/customer\/bookings/);
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/es/professionals');
    await page.getByRole('link', { name: /ver perfil/i }).first().click();
    await page.getByRole('button', { name: /reservar/i }).click();

    // Try to submit without filling
    await page.getByRole('button', { name: /confirmar/i }).click();

    // Check for validation errors
    await expect(page.getByText(/fecha es requerida/i)).toBeVisible();
  });
});
```

### Testing Best Practices

1. **Test user flows, not implementation details**
2. **Use semantic selectors:** `getByRole`, `getByLabel`, `getByText`
3. **Test in Spanish (primary language)**
4. **Mock external services** (Stripe, email)
5. **Test edge cases:** errors, loading states, empty states

---

## Commit Message Format

**Use Conventional Commits specification:**

### Structure
```
<type>(<scope>): <description>

[optional body]

[optional footer]

🤖 Generated with Claude Code
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(bookings): add cancellation flow` |
| `fix` | Bug fix | `fix(auth): correct session refresh logic` |
| `docs` | Documentation | `docs(readme): update setup instructions` |
| `style` | Code formatting | `style(components): run biome format` |
| `refactor` | Code refactoring | `refactor(api): extract auth middleware` |
| `perf` | Performance improvement | `perf(images): implement lazy loading` |
| `test` | Add/update tests | `test(booking): add e2e flow tests` |
| `build` | Build system changes | `build(deps): upgrade next to 16.0` |
| `ci` | CI/CD changes | `ci(github): add playwright workflow` |
| `chore` | Maintenance | `chore(lint): fix biome warnings` |

### Examples

```bash
# ✅ Feature
feat(bookings): implement recurring booking system

- Add weekly/monthly recurrence options
- Update database schema with recurrence fields
- Add RLS policies for recurring bookings

Closes #123

🤖 Generated with Claude Code

# ✅ Bug fix
fix(proxy): prevent CSRF on webhook routes

Added CSRF exemption for Stripe webhooks as they use
signature verification instead.

🤖 Generated with Claude Code

# ✅ Breaking change
feat(auth)!: migrate to new Supabase auth helpers

BREAKING CHANGE: Updated to @supabase/ssr package.
Requires updating all auth imports.

Migration guide: docs/AUTH_MIGRATION.md

🤖 Generated with Claude Code
```

### Commit Guidelines

1. **Use imperative mood:** "add" not "added"
2. **Keep first line under 72 characters**
3. **Reference issues:** `Closes #123`, `Fixes #456`
4. **Explain WHY, not WHAT** in the body
5. **Use Spanish for user-facing changes**

---

## Deployment Procedures

### Pre-Deployment Checklist

```bash
# ✅ RUN BEFORE EVERY DEPLOYMENT

# 1. Validate TypeScript
bun run build

# 2. Run linting
bun run check

# 3. Run tests
bun test

# 4. Check for type errors
bun run tsc --noEmit

# 5. Validate environment variables
# Ensure all required vars are in Vercel dashboard
```

### Environment Setup (Vercel)

**Production Environment Variables:**
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://maidconnect.com

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# Monitoring
LOGTAIL_SOURCE_TOKEN=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Deployment Steps

```bash
# 1. Create feature branch
git checkout -b feat/your-feature

# 2. Commit with conventional commits
git add .
git commit -m "feat(scope): description"

# 3. Push to GitHub
git push origin feat/your-feature

# 4. Create PR
# Vercel will automatically create preview deployment

# 5. After review, merge to main
# Vercel will automatically deploy to production
```

### Database Migrations in Production

```bash
# ⚠️ CRITICAL: Test migrations on staging first

# 1. Create migration
supabase migration new your_migration_name

# 2. Write migration SQL (see guidelines above)

# 3. Test locally
supabase db reset
bun run dev  # Verify application works

# 4. Commit migration
git add supabase/migrations/
git commit -m "feat(db): add migration description"

# 5. Deploy
# Migrations run automatically via Supabase dashboard
```

### Rollback Procedure

**If deployment fails:**

1. **Instant Rollback in Vercel:**
   - Go to Vercel Dashboard > Deployments
   - Find previous working deployment
   - Click "Promote to Production"

2. **Database Rollback:**
   ```sql
   -- Create rollback migration
   -- supabase/migrations/TIMESTAMP_rollback_migration_name.sql

   -- Reverse your changes
   DROP TABLE IF EXISTS new_table;
   ALTER TABLE existing_table DROP COLUMN new_column;
   ```

3. **Notify Team:**
   - Post in team Slack/Discord
   - Document what went wrong
   - Create issue for proper fix

### Performance Optimization

**Before production:**

```bash
# 1. Analyze bundle size
bun run analyze

# 2. Check for large dependencies
# Review the bundle analyzer output
# Look for:
# - Duplicate dependencies
# - Large libraries that could be lazy-loaded
# - Unused exports

# 3. Optimize images
# Ensure all images use Next.js Image component
# Check image formats (prefer AVIF/WebP)

# 4. Check Lighthouse scores
# Aim for 90+ on all metrics
```

---

## Additional Guidelines

### i18n (Internationalization)

```typescript
// ✅ CORRECT: Use next-intl
import { useTranslations } from 'next-intl';

export function BookingCard() {
  const t = useTranslations('bookings');

  return (
    <Card>
      <h3>{t('title')}</h3>
      <p>{t('description', { count: 5 })}</p>
    </Card>
  );
}

// ❌ WRONG: Hardcoded strings
<h3>Booking Details</h3>
```

### Error Handling

```typescript
// ✅ CORRECT: Comprehensive error handling
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  // 1. Log to monitoring service
  console.error('Operation failed:', error);

  // 2. Return user-friendly error
  if (error instanceof ZodError) {
    return {
      success: false,
      error: 'Invalid input data'
    };
  }

  if (error instanceof PostgrestError) {
    return {
      success: false,
      error: 'Database operation failed'
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred'
  };
}
```

### Code Review Checklist

Before requesting review:

**Type Safety & Code Quality:**
- [ ] TypeScript strict mode passing (no errors)
- [ ] **NO `as any` anywhere in the code**
- [ ] **NO `any` types (use `unknown` with validation)**
- [ ] **NO `@ts-ignore` or `@ts-expect-error`**
- [ ] Minimal use of `!` non-null assertions (justified with comments)
- [ ] All functions have explicit return types
- [ ] All component props use interfaces, not inline types
- [ ] Error handling properly types caught errors
- [ ] Array/object access handles undefined cases

**Testing & Quality:**
- [ ] All tests passing
- [ ] Biome checks passing
- [ ] No console.logs (except error logging)

**Security & Data:**
- [ ] Security considerations addressed
- [ ] RLS policies tested (if applicable)
- [ ] Input validation with Zod schemas
- [ ] No direct client input to database

**i18n & Standards:**
- [ ] i18n strings added (no hardcoded text)
- [ ] Conventional commit message format
- [ ] Migration tested locally (if applicable)

---

## Questions or Issues?

1. **Check existing code:** Search codebase for similar patterns
2. **Use Exa MCP:** Research best practices for your specific case
3. **Consult documentation:** See links in each section
4. **Ask team:** Create GitHub issue or discussion

---

**Last Updated:** 2025-11-05
**Version:** 1.1.0
