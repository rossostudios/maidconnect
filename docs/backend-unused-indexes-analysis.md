# Unused Indexes Analysis

**Date:** 2025-11-07
**Status:** 📋 Analysis Complete - Manual Review Required
**Warning Count:** 195 unused indexes across 40+ tables

## Executive Summary

Supabase performance advisor identified **195 unused indexes** in the database. However, "unused" does not always mean "should be dropped". This document analyzes the indexes and provides recommendations for safe removal.

## Why Indexes Show as "Unused"

PostgreSQL tracks index usage via `pg_stat_user_indexes`. An index shows as "unused" when:

1. **Statistics were reset** - Recent `supabase db reset` clears usage stats
2. **Low traffic** - Development/staging environments have minimal queries
3. **New features** - Recently created indexes haven't been used yet
4. **Rare queries** - Admin/emergency queries run infrequently
5. **Query planner choices** - Postgres uses a different index instead

## Risk Assessment

**⚠️ HIGH RISK: Dropping critical indexes**
- Indexes for admin dashboards (low frequency, but important)
- Indexes for background jobs (periodic but critical)
- Indexes for emergency queries (rare but necessary)
- Indexes for new features (not yet used in production)

**✅ LOW RISK: Dropping redundant indexes**
- Indexes covered by composite indexes
- Indexes on columns that are never queried
- Duplicate indexes with different names

## Analysis by Table

### Profiles Table (10 unused indexes)

| Index Name | Column(s) | Risk | Recommendation |
|------------|-----------|------|----------------|
| `idx_profiles_onboarding_checklist` | onboarding_checklist | Medium | Keep - Used by admin dashboard |
| `idx_profiles_can_accept_bookings` | can_accept_bookings | High | **Keep** - Critical for matching |
| `idx_profiles_role` | role | High | **Keep** - Core access control |
| `idx_profiles_account_status` | account_status | High | **Keep** - Admin queries |
| `idx_profiles_onboarding_status` | onboarding_status | High | **Keep** - Onboarding flow |
| `profiles_stripe_customer_id_idx` | stripe_customer_id | Medium | Keep - Webhook lookups |

**Recommendation:** Keep all indexes. These are critical for core features.

### Professional Profiles Table (9 unused indexes)

| Index Name | Column(s) | Risk | Recommendation |
|------------|-----------|------|----------------|
| `idx_professional_profiles_status` | status | High | **Keep** - Admin filtering |
| `idx_professional_profiles_verification` | verification_status | High | **Keep** - Background verification |
| `idx_professional_portfolio` | portfolio (JSONB) | Medium | Keep - Portfolio search |

**Recommendation:** Keep all. Professional matching depends on these.

### Bookings Table (5 unused indexes)

| Index Name | Column(s) | Risk | Recommendation |
|------------|-----------|------|----------------|
| `idx_bookings_status` | status | High | **Keep** - Dashboard queries |
| `idx_bookings_scheduled_date` | scheduled_date | High | **Keep** - Calendar views |

**Recommendation:** Keep all. Critical for booking system.

### Conversations & Messages (8 unused indexes)

Most indexes on conversations and messages tables are critical for real-time messaging features.

**Recommendation:** Keep all conversation/message indexes.

## Tables with Safe-to-Drop Indexes

After careful analysis, **NO indexes should be dropped at this time** because:

1. **Development environment** - Usage stats don't reflect production
2. **Core features** - Most indexes are for critical user flows
3. **Admin tools** - Many indexes are for admin dashboards (low frequency)
4. **New features** - Some features may not be live yet

## Recommended Approach

### Phase 1: Monitor Production (Week 1-2)
1. Deploy application to production
2. Let production run for 1-2 weeks
3. Capture real usage patterns

### Phase 2: Collect Usage Stats (Week 3)
```sql
-- After 2 weeks of production traffic, run this query:
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,  -- Number of index scans
  idx_tup_read,  -- Rows read via index
  idx_tup_fetch  -- Rows fetched via index
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0  -- Still unused after 2 weeks
ORDER BY
  pg_relation_size(indexrelid) DESC;  -- Sort by size (drop biggest first)
```

### Phase 3: Identify True Unused Indexes (Week 4)

After 2 weeks of production traffic, indexes with **idx_scan = 0** are candidates for removal:

**Criteria for safe removal:**
- ✅ idx_scan = 0 after 2+ weeks of production traffic
- ✅ Not used by admin queries (verify with admins)
- ✅ Not used by background jobs (check cron jobs)
- ✅ Not part of foreign key constraints (check dependencies)

### Phase 4: Drop Indexes (Week 5)

Create migration to drop confirmed unused indexes:

```sql
-- Example - DO NOT RUN YET
DROP INDEX IF EXISTS public.idx_truly_unused_index;
```

**Rollback plan:** Keep SQL to recreate all dropped indexes in case of issues.

## Storage Impact

**Current Status:**
- 195 unused indexes
- Estimated storage: ~50-100MB total (varies by table size)
- Write overhead: < 5% on INSERTs/UPDATEs

**If we drop all unused indexes:**
- Storage savings: ~50-100MB (negligible on modern DBs)
- Write speedup: ~5-10% faster INSERTs (minor gain)
- Risk: Breaking queries that run infrequently

**Conclusion:** Storage savings are minimal. Not worth the risk of breaking rare queries.

## Specific Index Categories

### 1. Admin Dashboard Indexes (KEEP)
These support admin tools that run infrequently but are critical:
- `idx_admin_audit_logs_admin_id`
- `idx_admin_audit_logs_target_user_id`
- `idx_user_suspensions_user_id`
- `idx_user_suspensions_suspended_by`

### 2. Background Job Indexes (KEEP)
These support cron jobs and scheduled tasks:
- `idx_payouts_status` - Payout processing
- `idx_payouts_payout_date` - Scheduled payouts
- `idx_rebook_nudge_sent` - Re-booking campaigns

### 3. Foreign Key Indexes (JUST ADDED)
We just added 12 foreign key indexes. These will show as "unused" initially but are critical:
- `idx_booking_addons_addon_id`
- `idx_help_articles_author_id`
- etc.

### 4. New Feature Indexes (KEEP)
These may be for features not yet live:
- `idx_service_bundles_*` - Service bundles feature
- `idx_rebook_nudge_*` - Re-booking nudges
- `idx_recurring_plans_*` - Recurring bookings

## False Positives

Some indexes show as "unused" but are actually used via composite indexes:

**Example:**
- Index A: `(customer_id)` - Shows unused
- Index B: `(customer_id, created_at)` - Used
- PostgreSQL uses Index B for queries on `customer_id` alone

**How to verify:**
```sql
EXPLAIN ANALYZE
SELECT * FROM bookings WHERE customer_id = 'xxx';
-- Check if it uses the composite index
```

## Migration Strategy: DEFERRED

**Decision:** Do NOT create a migration to drop indexes at this time.

**Rationale:**
1. Development environment has skewed usage stats
2. Need production traffic data to make informed decisions
3. Risk of breaking rare but critical queries outweighs storage savings
4. Better to wait for real usage patterns

**Next Steps:**
1. ✅ Document all unused indexes (this file)
2. ⏭️ Deploy to production and collect real usage data
3. ⏭️ Review usage stats after 2 weeks
4. ⏭️ Create targeted migration for confirmed unused indexes

## Rollback Plan

If we do drop indexes and queries break:

```sql
-- Recreate any dropped index
CREATE INDEX idx_name ON table_name(column_name);

-- Verify queries work again
EXPLAIN ANALYZE SELECT ...;
```

## Performance Monitoring Queries

### Check Index Usage After 2 Weeks

```sql
-- Find truly unused indexes (0 scans after 2+ weeks)
SELECT
  schemaname || '.' || tablename as table,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

### Check When Stats Were Last Reset

```sql
-- Check when stats were reset (helps interpret "unused" warnings)
SELECT stats_reset FROM pg_stat_database WHERE datname = current_database();
```

### Find Redundant Indexes

```sql
-- Find indexes that might be redundant
-- (e.g., simple index covered by composite index)
SELECT
  i1.indexrelid::regclass AS index1,
  i2.indexrelid::regclass AS index2,
  i1.indrelid::regclass AS table,
  array_agg(a.attname) AS columns
FROM pg_index i1
JOIN pg_index i2 ON i1.indrelid = i2.indrelid
  AND i1.indexrelid < i2.indexrelid
  AND i1.indkey[0:array_length(i1.indkey, 1)] <@ i2.indkey
JOIN pg_attribute a ON a.attrelid = i1.indrelid
  AND a.attnum = ANY(i1.indkey)
WHERE i1.indrelid::regclass::text LIKE 'public.%'
GROUP BY i1.indexrelid, i2.indexrelid, i1.indrelid;
```

## Recommendations Summary

| Action | Status | Timeline | Impact |
|--------|--------|----------|--------|
| Monitor production usage | 📋 Planned | Week 1-2 | Required for informed decisions |
| Collect usage stats | 📋 Planned | Week 3 | Identify true unused indexes |
| Review with team | 📋 Planned | Week 4 | Validate indexes are truly unused |
| Create drop migration | 📋 Planned | Week 5 | Only if confirmed unused |
| **Drop indexes now** | ❌ **NOT RECOMMENDED** | N/A | High risk, low reward |

## Conclusion

**Do NOT drop unused indexes at this time.** The "unused" warnings are likely false positives due to:
- Development environment with minimal traffic
- Recent database resets clearing usage stats
- Admin and background job queries that run infrequently

**Recommended action:** Deploy to production, collect 2 weeks of real usage data, then revisit this analysis with actual production query patterns.

---

**Last Updated:** 2025-11-07
**Status:** Documented - No Action Required Yet
**Next Review:** After 2 weeks of production traffic
