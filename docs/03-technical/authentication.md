# Authentication & Authorization Guide

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Auth Provider:** Supabase Auth

## Table of Contents

- [Overview](#overview)
- [Supabase Client Implementations](#supabase-client-implementations)
- [Authentication Flows](#authentication-flows)
- [Session Management](#session-management)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Onboarding System](#onboarding-system)
- [Security Features](#security-features)
- [Compliance](#compliance)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Authentication Architecture

MaidConnect uses **Supabase Auth** for authentication and authorization. All user accounts are stored in the `auth.users` table with extended profile data in `public.profiles`.

**Key Features:**
- Email/password authentication
- Magic link authentication (email-based passwordless)
- Session management with HTTP-only cookies
- Row Level Security (RLS) for database access
- Role-based access control (customer, professional, admin)
- CSRF protection via `proxy.ts`
- Rate limiting on authentication endpoints

**Security Model:**
```
User Signs Up/In
    ↓
Supabase Auth (auth.users)
    ↓
Profile Created (public.profiles)
    ↓
Role Assigned (customer, professional, admin)
    ↓
Session Token (HTTP-only cookie)
    ↓
RLS Policies Enforce Access
```

---

## Supabase Client Implementations

MaidConnect uses three distinct Supabase client implementations depending on the context:

### 1. Server Client (`@/lib/supabase/server-client`)

**Use Case:** Server-side operations (Server Components, Server Actions, API Routes)

**Location:** [`src/lib/supabase/server-client.ts`](../../src/lib/supabase/server-client.ts)

**Features:**
- Accesses request/response cookies
- Manages session refresh automatically
- Used for authenticated server-side operations
- Respects RLS policies

**Example Usage:**
```typescript
import { createClient } from '@/lib/supabase/server-client';

export async function getBookings() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', user.id);

  if (error) throw error;
  return data;
}
```

**Implementation:**
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Cookie setting can fail in Server Components
          }
        },
      },
    }
  );
}
```

---

### 2. Browser Client (`@/lib/supabase/browser-client`)

**Use Case:** Client-side operations (Client Components, browser-only code)

**Location:** [`src/lib/supabase/browser-client.ts`](../../src/lib/supabase/browser-client.ts)

**Features:**
- Uses browser cookies
- Singleton pattern (one instance per app)
- Used for client-side auth operations
- Real-time subscriptions
- Respects RLS policies

**Example Usage:**
```typescript
'use client';

import { createClient } from '@/lib/supabase/browser-client';
import { useState, useEffect } from 'react';

export function UserProfile() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <div>Welcome, {user?.email}</div>;
}
```

**Implementation:**
```typescript
import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseInstance;
}
```

---

### 3. Admin Client (`@/lib/supabase/admin-client`)

**Use Case:** Administrative operations that bypass RLS

**Location:** [`src/lib/supabase/admin-client.ts`](../../src/lib/supabase/admin-client.ts)

**Features:**
- Uses service role key (bypasses RLS)
- Server-side only (NEVER expose to client)
- Used for admin operations, system tasks
- Full database access

⚠️ **SECURITY WARNING:** Admin client bypasses all RLS policies. Use with extreme caution.

**Example Usage:**
```typescript
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function suspendUser(userId: string, reason: string) {
  const supabaseAdmin = createAdminClient();

  // This bypasses RLS and can modify any user's profile
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      suspended_at: new Date().toISOString(),
      suspension_reason: reason
    })
    .eq('id', userId);

  if (error) throw error;
}
```

**Implementation:**
```typescript
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
```

---

## Authentication Flows

### Sign Up Flow

**User Journey:**
1. User navigates to `/[locale]/auth/sign-up`
2. Fills out registration form (email, password, role)
3. Submits form to Server Action
4. Profile created with consent tracking
5. Redirected to appropriate dashboard

**Implementation:** [`src/app/[locale]/auth/sign-up/actions.ts`](../../src/app/[locale]/auth/sign-up/actions.ts)

```typescript
'use server';

import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'customer' | 'professional';
  const fullName = formData.get('fullName') as string;
  const locale = formData.get('locale') as string || 'en-US';

  const supabase = await createClient();

  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
        locale
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // 2. Profile is automatically created by trigger handle_new_user()
  // 3. Set consent flags (Colombian Law 1581 compliance)
  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        privacy_policy_accepted: true,
        privacy_policy_accepted_at: new Date().toISOString(),
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        data_processing_consent: true,
        data_processing_consent_at: new Date().toISOString()
      })
      .eq('id', data.user.id);
  }

  // 4. Redirect based on role
  if (role === 'professional') {
    redirect('/dashboard/pro/onboarding');
  } else {
    redirect('/dashboard/customer');
  }
}
```

**Database Trigger:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, locale)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en-US')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### Sign In Flow

**User Journey:**
1. User navigates to `/[locale]/auth/sign-in`
2. Enters email and password
3. Submits form to Server Action
4. Session created, cookies set
5. Redirected to appropriate dashboard

**Implementation:** [`src/app/[locale]/auth/sign-in/actions.ts`](../../src/app/[locale]/auth/sign-in/actions.ts)

```typescript
'use server';

import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  // 1. Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  // 2. Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_status')
    .eq('id', data.user.id)
    .single();

  if (!profile) {
    return { error: 'Profile not found' };
  }

  // 3. Redirect based on role and onboarding status
  if (profile.role === 'professional') {
    if (profile.onboarding_status === 'active') {
      redirect('/dashboard/pro');
    } else {
      redirect('/dashboard/pro/onboarding');
    }
  } else if (profile.role === 'customer') {
    redirect('/dashboard/customer');
  } else if (profile.role === 'admin') {
    redirect('/admin/dashboard');
  }
}
```

---

### Sign Out Flow

**User Journey:**
1. User clicks "Sign Out" button
2. Server Action called
3. Session cleared, cookies removed
4. Redirected to home page

**Implementation:**
```typescript
'use server';

import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect('/');
}
```

---

### Password Reset Flow

**User Journey:**
1. User clicks "Forgot Password" on sign-in page
2. Enters email address
3. Receives password reset email
4. Clicks link in email
5. Redirected to password reset page
6. Sets new password
7. Redirected to sign-in page

**Request Reset:**
```typescript
'use server';

import { createClient } from '@/lib/supabase/server-client';

export async function requestPasswordReset(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Password reset email sent' };
}
```

**Update Password:**
```typescript
'use server';

import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/auth/sign-in?message=Password updated successfully');
}
```

---

## Session Management

### Session Storage

Sessions are stored as HTTP-only cookies, making them inaccessible to client-side JavaScript (XSS protection).

**Cookie Names:**
- `sb-<project-ref>-auth-token` - Access token
- `sb-<project-ref>-auth-token.0` - Refresh token (chunked)
- `sb-<project-ref>-auth-token.1` - Additional chunk if needed

**Cookie Attributes:**
- `HttpOnly: true` - Not accessible via JavaScript
- `Secure: true` - HTTPS only (production)
- `SameSite: Lax` - CSRF protection
- `Path: /` - Available site-wide

---

### Session Refresh

Supabase automatically refreshes access tokens when they expire (default: 1 hour).

**Server-Side:**
```typescript
// Session refresh is automatic
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// If token is expired, it will be refreshed automatically
```

**Client-Side:**
```typescript
const supabase = createClient();

// Subscribe to auth state changes (handles refresh)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed automatically');
  }
});
```

---

### Session Validation

**Server Components/Actions:**
```typescript
import { createClient } from '@/lib/supabase/server-client';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/sign-in');
  }

  return user;
}
```

**API Routes:**
```typescript
import { createClient } from '@/lib/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Proceed with authenticated request
  return NextResponse.json({ data: user });
}
```

---

## Role-Based Access Control (RBAC)

### User Roles

MaidConnect has three primary roles:

| Role | Description | Access |
|------|-------------|--------|
| `customer` | End user booking services | Customer dashboard, bookings, messages, payments |
| `professional` | Cleaning professional | Professional dashboard, availability, earnings, messages |
| `admin` | Platform administrator | Full platform access, user management, analytics |

**Role Storage:**
```sql
-- profiles.role
CHECK (role IN ('customer', 'professional', 'admin'))
```

---

### Route Protection (`proxy.ts`)

The `proxy.ts` file (Next.js 16 pattern, NOT `middleware.ts`) handles route-level authorization.

**Location:** [`proxy.ts`](../../proxy.ts) (project root)

**Protected Route Patterns:**
```typescript
const PROTECTED_ROUTES: RouteRule[] = [
  {
    pattern: /^\/(?:en|es)?\/dashboard\/pro(?:\/|$)/,
    allowedRoles: ['professional']
  },
  {
    pattern: /^\/(?:en|es)?\/dashboard\/customer(?:\/|$)/,
    allowedRoles: ['customer']
  },
  {
    pattern: /^\/(?:en|es)?\/admin(?:\/|$)/,
    allowedRoles: ['admin']
  }
];
```

**Authorization Logic:**
```typescript
export default async function proxy(request: NextRequest) {
  const supabase = createServerClient(/* ... */);

  // CRITICAL: Use getUser() not getSession()
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const matchedRule = PROTECTED_ROUTES.find(rule =>
    rule.pattern.test(pathname)
  );

  if (!matchedRule) {
    return NextResponse.next(); // Public route
  }

  // Protected route - require authentication
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/sign-in';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check role authorization
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.role) {
    return NextResponse.redirect(new URL('/auth/sign-out', request.url));
  }

  if (!matchedRule.allowedRoles.includes(profile.role as AppRole)) {
    // Redirect to appropriate dashboard
    const dashboardRoute = getDashboardRouteForRole(profile.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  return NextResponse.next();
}
```

---

### Database-Level RLS

Row Level Security (RLS) provides database-level authorization.

**Example:** Bookings table
```sql
-- Customers can view their own bookings
CREATE POLICY "Customers can view their bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Professionals can view their assigned bookings
CREATE POLICY "Professionals can view assigned bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
```

**Helper Function for Role Checks:**
```sql
CREATE OR REPLACE FUNCTION private.has_role(check_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = check_role
  );
$$;

-- Use in policies
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (private.has_role('admin'));
```

---

## Onboarding System

### Professional Onboarding States

```sql
CREATE TYPE onboarding_status AS ENUM (
  'application_pending',      -- Initial state
  'application_in_review',    -- Admin reviewing
  'approved',                 -- Approved, completing onboarding
  'active',                   -- Fully onboarded
  'rejected',                 -- Application rejected
  'suspended',                -- Account suspended
  'banned'                    -- Permanently banned
);
```

**Onboarding Flow:**
```
Sign Up → application_pending
    ↓
Submit Application → application_in_review
    ↓
Admin Approval → approved
    ↓
Complete Profile → approved
Complete Stripe Connect → approved
Complete Background Check → approved
    ↓
All Steps Complete → active
```

**Gating Logic:**
```typescript
// In proxy.ts
if (role === 'professional' && profile.onboarding_status === 'suspended') {
  return NextResponse.redirect(
    new URL('/support/account-suspended', request.url)
  );
}
```

**Onboarding Step Tracking:**
```typescript
// Check onboarding completion
export async function checkOnboardingComplete(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const stepsComplete = {
    profileSubmitted: profile.status !== 'draft',
    stripeConnected: profile.stripe_onboarding_complete === true,
    backgroundCheckPassed: profile.background_check_status === 'approved',
    documentsVerified: profile.verification_level !== 'none'
  };

  const allComplete = Object.values(stepsComplete).every(Boolean);

  if (allComplete && profile.onboarding_status === 'approved') {
    // Upgrade to active
    await supabase
      .from('profiles')
      .update({ onboarding_status: 'active' })
      .eq('id', userId);
  }

  return { stepsComplete, allComplete };
}
```

---

## Security Features

### CSRF Protection

**Implementation:** `proxy.ts` validates Origin/Referer headers for state-changing requests.

```typescript
function validateCSRF(request: NextRequest): boolean {
  const { method } = request;

  // Only validate state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  // Exempt webhook routes (signature verification instead)
  const pathname = request.nextUrl.pathname;
  if (CSRF_EXEMPT_ROUTES.some(pattern => pattern.test(pathname))) {
    return true;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // Validate origin or referer matches host
  if (origin) {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      console.warn('[CSRF] Blocked request with mismatched origin');
      return false;
    }
    return true;
  }

  if (referer) {
    const refererUrl = new URL(referer);
    if (refererUrl.host !== host) {
      console.warn('[CSRF] Blocked request with mismatched referer');
      return false;
    }
    return true;
  }

  // No origin or referer - block
  console.warn('[CSRF] Blocked request with no origin/referer');
  return false;
}
```

---

### Rate Limiting

**Authentication Endpoints:**
- Sign up: 5 requests per 15 minutes
- Sign in: 5 requests per 15 minutes
- Password reset: 5 requests per 15 minutes

**Implementation:** Uses Upstash Redis (production) or in-memory (development)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true
});

export async function checkAuthRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await authRateLimiter.limit(
    `auth:${identifier}`
  );

  if (!success) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return { remaining, reset };
}
```

---

### Security Headers

**Applied via `proxy.ts`:**
```typescript
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none';");
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}
```

---

## Compliance

### Colombian Law 1581 de 2012

**Consent Tracking:**
All users must accept privacy policy, terms of service, and data processing consent before using the platform.

**Database Fields:**
```sql
-- profiles table
privacy_policy_accepted BOOLEAN DEFAULT FALSE
privacy_policy_accepted_at TIMESTAMPTZ
terms_accepted BOOLEAN DEFAULT FALSE
terms_accepted_at TIMESTAMPTZ
data_processing_consent BOOLEAN DEFAULT FALSE
data_processing_consent_at TIMESTAMPTZ
marketing_consent BOOLEAN DEFAULT FALSE
marketing_consent_at TIMESTAMPTZ
```

**Consent Protection:**
```sql
CREATE OR REPLACE FUNCTION public.protect_required_consents()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Prevent revoking required consents
  IF OLD.privacy_policy_accepted = TRUE AND NEW.privacy_policy_accepted = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke privacy policy consent';
  END IF;

  IF OLD.terms_accepted = TRUE AND NEW.terms_accepted = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke terms acceptance';
  END IF;

  IF OLD.data_processing_consent = TRUE AND NEW.data_processing_consent = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke data processing consent';
  END IF;

  -- Marketing consent can be changed freely (GDPR)
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_required_consents_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_required_consents();
```

**Data Export (Right to Access):**
```typescript
'use server';

import { createClient } from '@/lib/supabase/server-client';

export async function exportUserData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Gather all user data
  const [profile, bookings, messages, reviews] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('bookings').select('*').eq('customer_id', user.id),
    supabase.from('messages').select('*').eq('sender_id', user.id),
    supabase.from('reviews').select('*').eq('customer_id', user.id)
  ]);

  return {
    exportDate: new Date().toISOString(),
    userId: user.id,
    profile: profile.data,
    bookings: bookings.data,
    messages: messages.data,
    reviews: reviews.data
  };
}
```

**Account Deletion (Right to Erasure):**
```typescript
'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';

export async function scheduleAccountDeletion(userId: string) {
  const supabaseAdmin = createAdminClient();

  // Soft delete with 30-day grace period
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 30);

  await supabaseAdmin
    .from('profiles')
    .update({
      deletion_requested_at: new Date().toISOString(),
      deletion_scheduled_for: deletionDate.toISOString()
    })
    .eq('id', userId);

  return {
    success: true,
    deletionDate: deletionDate.toISOString()
  };
}
```

---

## Common Patterns

### Require Authenticated User

```typescript
import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/sign-in');
  }

  return user;
}

// Usage in Server Component
export default async function DashboardPage() {
  const user = await requireUser();

  return <div>Welcome, {user.email}</div>;
}
```

---

### Require Specific Role

```typescript
import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

type AppRole = 'customer' | 'professional' | 'admin';

interface RequireUserOptions {
  allowedRoles?: AppRole[];
  fallback?: string;
}

export async function requireUser(options?: RequireUserOptions) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/sign-in');
  }

  if (options?.allowedRoles) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !options.allowedRoles.includes(profile.role as AppRole)) {
      redirect(options.fallback || '/');
    }

    return { user, profile };
  }

  return { user };
}

// Usage
export default async function ProDashboard() {
  const { user, profile } = await requireUser({
    allowedRoles: ['professional'],
    fallback: '/dashboard/customer'
  });

  return <div>Professional Dashboard</div>;
}
```

---

### Get Current User Profile

```typescript
import { createClient } from '@/lib/supabase/server-client';

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, professional_profiles(*), customer_profiles(*)')
    .eq('id', user.id)
    .single();

  return profile;
}
```

---

### Client-Side Auth State

```typescript
'use client';

import { createClient } from '@/lib/supabase/browser-client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// Usage in Client Component
export function UserMenu() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Link href="/auth/sign-in">Sign In</Link>;
  }

  return <div>Welcome, {user.email}</div>;
}
```

---

## Troubleshooting

### Common Issues

**1. "User not authenticated" errors**

**Cause:** Session cookies not being set or read correctly

**Solution:**
- Ensure you're using the correct Supabase client for the context
- Check that cookies are enabled in browser
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

**2. "Forbidden" or 403 errors**

**Cause:** RLS policies blocking access or role mismatch

**Solution:**
- Check user's role in database
- Verify RLS policies on the table
- Use admin client for debugging (development only)

```sql
-- Check user role
SELECT id, email, role, onboarding_status
FROM public.profiles
WHERE email = 'user@example.com';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'bookings';
```

---

**3. Session not persisting**

**Cause:** Cookie settings or proxy.ts issues

**Solution:**
- Verify `proxy.ts` is calling `getUser()` not `getSession()`
- Check that cookies are being set with correct attributes
- Ensure `NEXT_PUBLIC_SUPABASE_URL` doesn't have trailing slash

```typescript
// ❌ WRONG
const { data: { session } } = await supabase.auth.getSession();

// ✅ CORRECT
const { data: { user } } = await supabase.auth.getUser();
```

---

**4. Redirects not working**

**Cause:** `proxy.ts` configuration or locale handling

**Solution:**
- Check route patterns in `PROTECTED_ROUTES`
- Verify locale detection logic
- Ensure `redirect()` is being called correctly

```typescript
// Check proxy.ts logs
console.log('[proxy.ts] Pathname:', pathname);
console.log('[proxy.ts] Matched rule:', matchedRule);
console.log('[proxy.ts] User role:', profile?.role);
```

---

**5. Rate limiting issues**

**Cause:** Too many authentication attempts

**Solution:**
- Wait for rate limit window to reset
- Check Upstash Redis dashboard for limits
- Increase limits in development if needed

```typescript
// Development: Disable rate limiting
if (process.env.NODE_ENV === 'development') {
  return true; // Skip rate limit check
}
```

---

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js 16 Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [API Reference](./api-reference.md)
- [Database Schema](./database-schema.md)
- [Colombian Law 1581 Overview](../07-compliance/colombian-data-protection.md)

---

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team
