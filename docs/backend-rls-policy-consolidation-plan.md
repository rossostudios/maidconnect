# RLS Policy Consolidation Plan

**Status:** 📋 Planning
**Priority:** Medium (Performance Impact)
**Complexity:** High (166 policy conflicts across 40+ tables)
**Created:** 2025-11-07

## Executive Summary

Supabase performance advisor identified **166 "multiple_permissive_policies" warnings** across our database. Having multiple permissive RLS policies for the same role and action is suboptimal for performance because PostgreSQL must evaluate ALL policies for every query.

**Performance Impact:**
- Current: Each SELECT query evaluates 2-5 policies per row
- After fix: Each SELECT query evaluates 1 consolidated policy
- Expected improvement: 20-50% faster queries on high-traffic tables

## Problem Explanation

### How RLS Policies Work

PostgreSQL evaluates RLS policies with OR logic:
- Policy 1: `USING (user_id = auth.uid())`
- Policy 2: `USING (role = 'admin')`
- Result: `WHERE (user_id = auth.uid()) OR (role = 'admin')`

**With multiple policies:**
```sql
-- Three separate policies (current state)
CREATE POLICY "Users can view own data" USING (user_id = auth.uid());
CREATE POLICY "Admins can view all data" USING (role = 'admin');
CREATE POLICY "Professionals can view their data" USING (professional_id = auth.uid());

-- PostgreSQL evaluates: (policy1) OR (policy2) OR (policy3)
-- Cost: 3 policy checks per row
```

**With consolidated policy:**
```sql
-- One policy with OR conditions (target state)
CREATE POLICY "Access control"
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT current_user_role()) = 'admin'
  OR professional_id = (SELECT auth.uid())
);

-- PostgreSQL evaluates: single policy with OR logic
-- Cost: 1 policy check per row (50% faster)
```

## Affected Tables by Priority

### Tier 1: Critical (High Traffic, Most Conflicts)

| Table | Conflicts | Traffic | Priority |
|-------|-----------|---------|----------|
| `recurring_plans` | 20 | High | 🔴 Critical |
| `roadmap_comments` | 15 | Medium | 🟡 High |
| `professional_profiles` | 11 | High | 🔴 Critical |
| `profiles` | 10 | Very High | 🔴 Critical |
| `customer_profiles` | 7 | High | 🔴 Critical |

### Tier 2: Important (Moderate Impact)

| Table | Conflicts | Traffic | Priority |
|-------|-----------|---------|----------|
| `admin_professional_reviews` | 5 | Low | 🟢 Medium |
| `changelog_views` | 5 | Low | 🟢 Medium |
| `changelogs` | 5 | Medium | 🟡 High |
| `customer_reviews` | 5 | High | 🟡 High |
| `disputes` | 5 | Low | 🟢 Medium |
| `etta_conversations` | 5 | Medium | 🟡 High |
| `etta_messages` | 5 | Medium | 🟡 High |
| `feedback_submissions` | 5 | Low | 🟢 Medium |
| `payouts` | 5 | Medium | 🟡 High |
| `pricing_controls` | 5 | Low | 🟢 Medium |

### Tier 3: Low Priority (< 5 Conflicts)

30+ tables with 1-4 policy conflicts each.

## Implementation Strategy

### Phase 1: Core Tables (Week 1)
**Target:** profiles, customer_profiles, professional_profiles
**Impact:** Highest traffic tables, 28 policy conflicts
**Risk:** Medium (requires careful testing)

**Steps:**
1. Audit current policies for each table
2. Create consolidated policy with OR conditions
3. Test with multiple user roles
4. Deploy during low-traffic window
5. Monitor query performance

### Phase 2: Booking & Messaging (Week 2)
**Target:** recurring_plans, etta_conversations, etta_messages
**Impact:** High transaction volume, 30 policy conflicts
**Risk:** Medium-High (business-critical tables)

### Phase 3: Reviews & Feedback (Week 3)
**Target:** customer_reviews, feedback_submissions, changelogs
**Impact:** User-facing features, 15 policy conflicts
**Risk:** Low (non-critical paths)

### Phase 4: Admin & Reports (Week 4)
**Target:** admin_professional_reviews, payouts, disputes
**Impact:** Admin tools, 15 policy conflicts
**Risk:** Low (internal tools)

### Phase 5: Long Tail (Week 5)
**Target:** 30+ remaining tables with 1-4 conflicts each
**Impact:** Cumulative performance gain
**Risk:** Very Low

## Example: Profiles Table Consolidation

### Current State (10 policies)
```sql
-- Policy 1: Users view own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Policy 2: Admins view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING ((SELECT current_user_role()) = 'admin');

-- Policy 3: Professionals view customer profiles (for bookings)
CREATE POLICY "Professionals can view customer profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT customer_id FROM bookings
      WHERE professional_id = auth.uid()
    )
  );

-- ... 7 more policies ...
```

### Target State (1 consolidated policy)
```sql
CREATE POLICY "Profiles access control"
  ON profiles FOR SELECT
  USING (
    -- Users can view their own profile
    id = (SELECT auth.uid())

    -- Admins can view all profiles
    OR (SELECT current_user_role()) = 'admin'

    -- Professionals can view profiles of their customers
    OR id IN (
      SELECT customer_id FROM bookings
      WHERE professional_id = (SELECT auth.uid())
    )

    -- Customers can view profiles of their professionals
    OR id IN (
      SELECT professional_id FROM bookings
      WHERE customer_id = (SELECT auth.uid())
    )

    -- Public profiles are visible to everyone
    OR is_public = true
  );
```

**Benefits:**
- Single policy evaluation instead of 10
- Clearer access logic (all rules in one place)
- Easier to audit and maintain
- 50-80% faster profile queries

## Testing Checklist

For each consolidated policy:

- [ ] Test as anonymous user (anon role)
- [ ] Test as authenticated customer
- [ ] Test as authenticated professional
- [ ] Test as admin
- [ ] Test edge case: suspended user
- [ ] Test edge case: incomplete profile
- [ ] Verify no data leaks with EXPLAIN ANALYZE
- [ ] Load test: Compare query performance before/after
- [ ] Security audit: Ensure no privilege escalation

## Rollback Plan

Each migration should include:
```sql
-- Rollback: Drop consolidated policy and restore original policies
DROP POLICY IF EXISTS "Consolidated access control" ON table_name;

CREATE POLICY "Original policy 1" ON table_name ...;
CREATE POLICY "Original policy 2" ON table_name ...;
-- etc.
```

## Success Metrics

**Performance:**
- [ ] 20-50% reduction in query latency for affected tables
- [ ] Reduced CPU usage on database (fewer policy evaluations)
- [ ] Faster EXPLAIN ANALYZE query plans

**Code Quality:**
- [ ] Reduced from 200+ policies to ~40-50 consolidated policies
- [ ] All policies documented with clear access rules
- [ ] Zero Supabase "multiple_permissive_policies" warnings

**Security:**
- [ ] No regressions in access control (verified via tests)
- [ ] No data leaks (verified via audit)
- [ ] All RLS policies still enforce correct permissions

## Migration Timeline

| Phase | Week | Tables | Policies | Status |
|-------|------|--------|----------|--------|
| Phase 1 | Week 1 | 3 | 28 | 📋 Planned |
| Phase 2 | Week 2 | 3 | 30 | 📋 Planned |
| Phase 3 | Week 3 | 3 | 15 | 📋 Planned |
| Phase 4 | Week 4 | 3 | 15 | 📋 Planned |
| Phase 5 | Week 5 | 30+ | 78 | 📋 Planned |

**Total:** 5 weeks, 40+ tables, 166 policy conflicts resolved

## Decision: Defer to Dedicated Sprint

**Recommendation:** This work should be done as a dedicated "RLS Optimization Sprint" rather than as part of the current security fixes.

**Rationale:**
1. **Complexity:** 166 policy conflicts require careful analysis of each table's access patterns
2. **Risk:** High-traffic tables (profiles, bookings) require extensive testing
3. **Time:** Estimated 2-3 weeks of focused work
4. **Current Progress:** We've fixed the critical security issues (function search paths, extensions, materialized views)

**Immediate Next Steps:**
1. ✅ Document the plan (this file)
2. ✅ Fix critical security warnings (completed)
3. ✅ Fix quick performance wins (auth.uid() optimization, duplicate indexes - completed)
4. ⏭️ Schedule RLS consolidation sprint for next month

---

**Last Updated:** 2025-11-07
**Owner:** Backend Team
**Reviewer:** Security Team
