# Row-Level Security (RLS) Policy Audit
**Last Updated:** 2025-01-14
**Status:** 🔴 In Progress
**Priority:** P0 (Critical Security Issue)

## Executive Summary

This document audits all user-facing database tables accessed by anonymous or authenticated clients through `src/lib/supabase/*` connections. It identifies RLS policy gaps, documents existing policies, and provides recommendations for closing security vulnerabilities.

**Critical Findings:**
- ✅ 4 tables have complete RLS policies
- ⚠️ 10 tables have RLS enabled but NO policies (CRITICAL)
- ⚠️ 15+ tables accessed by clients with unknown RLS status

---

## RLS Status Matrix

| Table | RLS Enabled | Has Policies | Client Access | Risk Level | Status |
|-------|-------------|--------------|---------------|------------|--------|
| `booking_addons` | ✅ | ✅ | Yes (booking creation) | ✅ Low | Complete |
| `booking_status_history` | ✅ | ✅ | Yes (booking updates) | ✅ Low | Complete |
| `spatial_ref_sys` | ✅ | ✅ | Yes (PostGIS) | ✅ Low | Complete |
| `stripe_webhook_events` | ✅ | ✅ | No (server-only) | ✅ Low | Complete |
| `help_articles` | ✅ | ❌ | Yes (help center) | 🔴 CRITICAL | **MISSING POLICIES** |
| `help_categories` | ✅ | ❌ | Yes (help center) | 🔴 CRITICAL | **MISSING POLICIES** |
| `help_article_tags` | ✅ | ❌ | Yes (help center) | 🔴 CRITICAL | **MISSING POLICIES** |
| `help_article_tags_relation` | ✅ | ❌ | Yes (help center) | 🔴 CRITICAL | **MISSING POLICIES** |
| `help_search_analytics` | ✅ | ❌ | Yes (search tracking) | 🟡 HIGH | **MISSING POLICIES** |
| `amara_tool_runs` | ✅ | ❌ | Yes (AI assistant) | 🟡 HIGH | **MISSING POLICIES** |
| `briefs` | ✅ | ❌ | Yes (API route) | 🟡 HIGH | **MISSING POLICIES** |
| `payout_batches` | ✅ | ❌ | No (admin/cron only) | 🟡 MEDIUM | **MISSING POLICIES** |
| `payout_transfers` | ✅ | ❌ | No (admin/cron only) | 🟡 MEDIUM | **MISSING POLICIES** |
| `platform_settings` | ✅ | ❌ | Yes (feature flags) | 🔴 CRITICAL | **MISSING POLICIES** |
| `bookings` | ❓ | ❓ | Yes (core feature) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `profiles` | ❓ | ❓ | Yes (auth) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `professional_profiles` | ❓ | ❓ | Yes (search/booking) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `customer_profiles` | ❓ | ❓ | Yes (addresses/favorites) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `customer_favorites` | ❓ | ❓ | Yes (favorites feature) | 🟡 HIGH | **NEEDS AUDIT** |
| `notifications` | ❓ | ❓ | Yes (notification center) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `notification_subscriptions` | ❓ | ❓ | Yes (push notifications) | 🟡 HIGH | **NEEDS AUDIT** |
| `messages` | ❓ | ❓ | Yes (messaging) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `conversations` | ❓ | ❓ | Yes (messaging) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `customer_reviews` | ❓ | ❓ | Yes (reviews) | 🟡 HIGH | **NEEDS AUDIT** |
| `reviews` | ❓ | ❓ | Yes (reviews) | 🟡 HIGH | **NEEDS AUDIT** |
| `payments` | ❓ | ❓ | Yes (payment history) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `payouts` | ❓ | ❓ | Yes (professional earnings) | 🔴 CRITICAL | **NEEDS AUDIT** |
| `background_checks` | ❓ | ❓ | No (admin/webhook only) | 🟡 MEDIUM | **NEEDS AUDIT** |
| `professional_availability` | ❓ | ❓ | Yes (calendar/booking) | 🟡 HIGH | **NEEDS AUDIT** |
| `platform_events` | ❓ | ❓ | Yes (analytics tracking) | 🟢 LOW | **NEEDS AUDIT** |
| `guest_sessions` | ❓ | ❓ | Yes (guest checkout) | 🟡 MEDIUM | **NEEDS AUDIT** |
| `mobile_push_tokens` | ❓ | ❓ | Yes (mobile notifications) | 🟡 MEDIUM | **NEEDS AUDIT** |
| `push_subscriptions` | ❓ | ❓ | Yes (web push) | 🟡 MEDIUM | **NEEDS AUDIT** |
| `admin_audit_logs` | ❓ | ❓ | No (admin only) | 🟡 HIGH | **NEEDS AUDIT** |
| `rebook_nudge_experiments` | ❓ | ❓ | No (cron only) | 🟢 LOW | **NEEDS AUDIT** |

---

## Existing RLS Policies (Documented)

### ✅ booking_addons
**Migration:** `20251111160000_add_booking_rls_policies.sql`

**Policies:**
1. **"Users can view their own booking addons"** (SELECT)
   - Users can view addons for bookings they created
   - `customer_id = auth.uid()`

2. **"Users can insert their own booking addons"** (INSERT)
   - Users can add addons when creating bookings
   - `customer_id = auth.uid()`

3. **"Professionals can view addons for their bookings"** (SELECT)
   - Professionals can view addons for assigned bookings
   - `professional_id = auth.uid()`

4. **"Admins have full access to booking addons"** (ALL)
   - Admin role has unrestricted access
   - `role = 'admin'`

---

### ✅ booking_status_history
**Migration:** `20251111160000_add_booking_rls_policies.sql`

**Policies:**
1. **"Users can view their booking history"** (SELECT)
   - Customers view status history for their bookings
   - `customer_id = auth.uid()`

2. **"Professionals can view their booking history"** (SELECT)
   - Professionals view status history for assigned bookings
   - `professional_id = auth.uid()`

3. **"System can insert status history"** (INSERT)
   - Authenticated users can create status entries
   - `customer_id = auth.uid() OR professional_id = auth.uid()`

4. **"Admins have full access to status history"** (ALL)
   - Admin role has unrestricted access
   - `role = 'admin'`

---

### ✅ spatial_ref_sys
**Migration:** `20251111160000_add_booking_rls_policies.sql`

**Policies:**
1. **"Public read access to spatial reference systems"** (SELECT)
   - Public read-only access (PostGIS requirement)
   - `USING (true)`

2. **"Service role can modify spatial reference systems"** (ALL)
   - Only service role can modify
   - `TO service_role`

---

### ✅ stripe_webhook_events
**Migration:** `20251111150000_create_stripe_webhook_events.sql` (assumed)

**Policies:**
- Needs verification (table has RLS enabled + policies exist)

---

## Critical Missing Policies

### 🔴 CRITICAL: help_articles
**Client Access:** `src/components/admin/help-center/article-actions.ts`
**Risk:** Unauthorized access to help content, potential data leak

**Required Policies:**
```sql
-- Public read access to published articles
CREATE POLICY "Public can view published articles"
  ON help_articles FOR SELECT
  TO public
  USING (status = 'published');

-- Authenticated users can view all articles (draft preview)
CREATE POLICY "Authenticated users can view all articles"
  ON help_articles FOR SELECT
  TO authenticated
  USING (true);

-- Admins have full access
CREATE POLICY "Admins have full access to articles"
  ON help_articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

---

### 🔴 CRITICAL: help_categories
**Client Access:** `src/components/admin/help-center/*`
**Risk:** Unauthorized category modifications

**Required Policies:**
```sql
-- Public read access
CREATE POLICY "Public can view help categories"
  ON help_categories FOR SELECT
  TO public
  USING (true);

-- Admins have full access
CREATE POLICY "Admins have full access to categories"
  ON help_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

---

### 🔴 CRITICAL: platform_settings
**Client Access:** `src/lib/utils/analytics/trackEvent.ts` (inferred)
**Risk:** Unauthorized access to sensitive platform configuration

**Required Policies:**
```sql
-- Authenticated users can read non-sensitive settings
CREATE POLICY "Authenticated users can view platform settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (is_public = true OR setting_key NOT LIKE '%_secret%');

-- Service role and admins can modify settings
CREATE POLICY "Admins can manage platform settings"
  ON platform_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to platform settings"
  ON platform_settings FOR ALL
  TO service_role
  USING (true);
```

---

### 🔴 CRITICAL: bookings (Needs Full Audit)
**Client Access:** Multiple files (search, booking creation, webhooks)
**Risk:** Unauthorized access to booking data

**Recommended Policies:**
```sql
-- Users can view their own bookings
CREATE POLICY "Customers can view their bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Professionals can view assigned bookings
CREATE POLICY "Professionals can view their bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

-- Users can create bookings
CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Users can update their own bookings (limited fields)
CREATE POLICY "Customers can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Professionals can update assigned bookings (limited fields)
CREATE POLICY "Professionals can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- Admins have full access
CREATE POLICY "Admins have full access to bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

---

## Tables Requiring Immediate Action

### Priority 1 (P0 - Deploy This Week)
1. **bookings** - Core feature, high traffic
2. **profiles** - Authentication, user data
3. **professional_profiles** - Search, booking
4. **customer_profiles** - User data, addresses
5. **notifications** - Notification center
6. **messages** - Messaging system
7. **conversations** - Messaging system
8. **payments** - Payment history
9. **payouts** - Professional earnings
10. **platform_settings** - Feature flags, config

### Priority 2 (P1 - Deploy Next Week)
11. **help_articles** - Help center
12. **help_categories** - Help center
13. **help_article_tags** - Help center
14. **help_article_tags_relation** - Help center
15. **customer_favorites** - Favorites feature
16. **customer_reviews** / **reviews** - Review system
17. **professional_availability** - Calendar/booking
18. **notification_subscriptions** - Push notifications

### Priority 3 (P2 - Deploy Within 2 Weeks)
19. **help_search_analytics** - Analytics
20. **amara_tool_runs** - AI assistant logs
21. **briefs** - Unknown feature
22. **platform_events** - Analytics tracking
23. **guest_sessions** - Guest checkout
24. **mobile_push_tokens** - Mobile notifications
25. **push_subscriptions** - Web push

### Priority 4 (P3 - Admin/Background Only)
26. **payout_batches** - Admin only
27. **payout_transfers** - Admin only
28. **background_checks** - Admin/webhook only
29. **admin_audit_logs** - Admin only
30. **rebook_nudge_experiments** - Cron only

---

## Next Steps

### 1. Complete RLS Status Audit (This Week)
- [ ] Use Supabase dashboard or SQL query to get full RLS status for all tables
- [ ] Document existing policies for core tables (bookings, profiles, etc.)
- [ ] Identify all tables accessed by client code

### 2. Create RLS Policy Migrations (Priority 1)
- [ ] `bookings` - Core booking table
- [ ] `profiles` - User authentication
- [ ] `professional_profiles` - Professional search/booking
- [ ] `customer_profiles` - Customer data
- [ ] `notifications` - Notification center
- [ ] `messages` - Messaging system
- [ ] `conversations` - Messaging system
- [ ] `payments` - Payment history
- [ ] `payouts` - Professional earnings
- [ ] `platform_settings` - Feature flags

### 3. Create RLS Policy Migrations (Priority 2)
- [ ] Help center tables (5 tables)
- [ ] Review/favorite tables (3 tables)
- [ ] Notification subscription tables (2 tables)
- [ ] Professional availability

### 4. Create RLS Policy Migrations (Priority 3)
- [ ] Analytics and tracking tables
- [ ] Push notification tables
- [ ] Guest session tables

### 5. Testing & Verification
- [ ] Test each RLS policy with different user roles
- [ ] Verify no unauthorized access
- [ ] Check query performance impact
- [ ] Document policy bypass scenarios (if any)

---

## SQL Query to Get RLS Status

```sql
-- Get all tables with RLS status and policy count
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled,
  (
    SELECT COUNT(*)
    FROM pg_policies
    WHERE schemaname = c.schemaname
    AND tablename = c.tablename
  ) AS policy_count
FROM pg_catalog.pg_tables c
WHERE schemaname = 'public'
ORDER BY rls_enabled DESC, policy_count ASC, tablename;
```

---

## RLS Policy Template

```sql
-- Migration: add_rls_policies_for_[table_name]
-- Description: Adds Row Level Security policies for [table_name]
-- Security: Ensures users can only access their own data
-- Date: YYYY-MM-DD

-- Enable RLS (if not already enabled)
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "[policy_name]" ON [table_name];

-- Policy 1: Users can view their own data
CREATE POLICY "Users can view their own [table_name]"
  ON [table_name]
  FOR SELECT
  TO authenticated
  USING ([user_id_column] = auth.uid());

-- Policy 2: Users can insert their own data
CREATE POLICY "Users can insert their own [table_name]"
  ON [table_name]
  FOR INSERT
  TO authenticated
  WITH CHECK ([user_id_column] = auth.uid());

-- Policy 3: Users can update their own data
CREATE POLICY "Users can update their own [table_name]"
  ON [table_name]
  FOR UPDATE
  TO authenticated
  USING ([user_id_column] = auth.uid())
  WITH CHECK ([user_id_column] = auth.uid());

-- Policy 4: Admins have full access
CREATE POLICY "Admins have full access to [table_name]"
  ON [table_name]
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_[table_name]_[user_id_column]
  ON [table_name]([user_id_column]);

-- Add comments
COMMENT ON POLICY "Users can view their own [table_name]" ON [table_name] IS
  'Allows users to view only their own records';
```

---

## Security Exceptions

### Tables Without RLS (By Design)
None identified yet. All tables should have RLS enabled for defense-in-depth.

### Public Read-Only Tables
- `spatial_ref_sys` - PostGIS requirement (public read-only)

### Service Role Only Tables
- `stripe_webhook_events` - Webhook processing (service role only)
- `admin_audit_logs` - Admin actions (service role + admin only)
- `rebook_nudge_experiments` - Cron jobs (service role only)

---

**Status Legend:**
- ✅ Complete - RLS enabled with comprehensive policies
- 🔴 CRITICAL - RLS enabled but no policies (data leak risk)
- 🟡 HIGH/MEDIUM - Missing or incomplete policies
- 🟢 LOW - Non-critical tables (analytics, logs)
- ❓ NEEDS AUDIT - Unknown RLS status

**Document Owner:** Engineering Team
**Review Cadence:** Weekly until all P0/P1 policies deployed
