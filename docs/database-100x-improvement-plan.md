# Casaora Database 100x Improvement Plan

**Goal:** Improve PostgreSQL database performance by 10-100x through systematic optimization

**Last Updated:** 2025-11-20

---

## Executive Summary

Your Casaora production database can be optimized dramatically through:

1. **Index Optimization** (50-90% query speedup)
2. **RLS Policy Optimization** (60-95% speedup for user-facing queries)
3. **Connection Pooling** (Eliminate MaxClientsInSessionMode errors)
4. **VACUUM & Bloat Cleanup** (20-40% disk space savings, faster queries)
5. **Query Optimization** (Identify and fix slow queries)

**Expected Overall Improvement:** 10-100x depending on current bottlenecks

---

## Phase 1: Diagnostics (15 minutes)

### Step 1: Run Diagnostics

```bash
cd /home/user/casaora
./supabase/scripts/run-diagnostics.sh
```

This creates a timestamped report with:
- Database size and connection stats
- Slow queries analysis
- Missing/unused indexes
- Table bloat analysis
- RLS performance analysis
- Cache hit ratios

### Step 2: Review Reports

```bash
# View summary
cat diagnostics-YYYYMMDD-HHMMSS/SUMMARY.md

# View full diagnostics
less diagnostics-YYYYMMDD-HHMMSS/diagnostics-report.txt

# View RLS analysis
less diagnostics-YYYYMMDD-HHMMSS/rls-analysis.txt
```

### Key Metrics to Check

| Metric | Target | Action if Below Target |
|--------|--------|------------------------|
| Cache Hit Ratio | >99% | Add more indexes, increase shared_buffers |
| Sequential Scans | <100/table | Add indexes on filtered columns |
| Dead Tuple % | <10% | Run VACUUM ANALYZE |
| Connection Usage | <80% | Optimize connection pooling |
| Slow Queries | <100ms avg | Add indexes, optimize queries |

---

## Phase 2: Quick Wins (30 minutes)

### Step 1: Apply Quick-Win Optimizations

```bash
# Apply critical indexes and autovacuum settings
psql "postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres" \
  -f supabase/scripts/quick-wins-optimization.sql
```

**What This Does:**
- ✅ Creates 15+ critical missing indexes
- ✅ Optimizes autovacuum for high-traffic tables
- ✅ Enables pg_stat_statements extension
- ✅ Updates query planner statistics

**Expected Impact:**
- 50-80% faster booking availability queries
- 60-90% faster professional search
- 40-70% faster review calculations
- 30-50% faster write operations

### Step 2: Optimize RLS Policies

```bash
# Create RLS helper functions and indexes
psql "postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres" \
  -f supabase/scripts/rls-performance-analysis.sql
```

**What This Does:**
- ✅ Creates private.current_user_id() helper (caches auth.uid())
- ✅ Creates private.is_admin() helper
- ✅ Creates private.is_professional() helper
- ✅ Adds indexes for all RLS policy columns

**Expected Impact:**
- 60-95% faster user-facing queries
- Eliminates repeated auth.uid() calls
- Better query plan caching

### Step 3: Drop Unused Indexes

```bash
# Review unused indexes first
psql "postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres" \
  -c "SELECT schemaname, tablename, indexname, idx_scan, pg_size_pretty(pg_relation_size(schemaname||'.'||indexname))
      FROM pg_stat_user_indexes
      WHERE idx_scan < 10 AND indexrelname NOT LIKE '%pkey%'
      ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;"

# Apply (only if diagnostics show many unused indexes)
psql "postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres" \
  -f supabase/scripts/drop_unused_indexes.sql
```

**Expected Impact:**
- 5-10 MB storage savings
- 30-50% faster writes on affected tables
- Reduced maintenance overhead

---

## Phase 3: Deep Optimizations (1-2 hours)

### Optimization 1: Fix Slow Queries

Based on diagnostics report section 11-13 (slowest queries):

1. **Identify slow queries** from diagnostics
2. **Run EXPLAIN ANALYZE** on each:
   ```sql
   EXPLAIN ANALYZE <your-slow-query>;
   ```
3. **Look for:**
   - Sequential Scans → Add indexes
   - High row counts → Add WHERE filters
   - Nested Loops → Better join conditions
   - RLS overhead → Use service role for admin

4. **Common fixes:**
   ```sql
   -- Example: Booking availability query
   CREATE INDEX CONCURRENTLY idx_bookings_pro_date_status
   ON bookings(professional_id, booking_date, status)
   WHERE status NOT IN ('cancelled', 'declined');

   -- Example: Professional search by city
   CREATE INDEX CONCURRENTLY idx_pro_profiles_city_verified
   ON professional_profiles(city_id, verification_status)
   WHERE is_active = true;
   ```

### Optimization 2: Fix Table Bloat

Based on diagnostics report section 6 (table bloat):

```bash
# Run VACUUM on bloated tables (safe, non-blocking)
psql "postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres" \
  -f supabase/scripts/vacuum_tables.sql
```

For tables with >20% bloat, consider VACUUM FULL during maintenance window:

```sql
-- VACUUM FULL requires table lock - run during low traffic
VACUUM FULL bookings;
VACUUM FULL professional_profiles;
VACUUM FULL payment_intents;
```

### Optimization 3: Fix Connection Pool Saturation

**Problem:** MaxClientsInSessionMode errors (from CLAUDE.md)

**Root Cause:** Connection pool exhaustion due to:
- Long-running queries
- Idle connections
- Inefficient RLS policies

**Solutions:**

1. **Enable Connection Pooling in Supabase** (if not already enabled):
   - Go to Supabase Dashboard → Settings → Database
   - Enable "Connection Pooler"
   - Use pooler URL for API routes: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

2. **Optimize API Route Connections:**
   ```typescript
   // src/lib/integrations/supabase/server.ts

   // Use connection pooling for API routes
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
     {
       db: {
         schema: 'public',
       },
       auth: {
         persistSession: false,  // ✅ Critical for API routes!
         autoRefreshToken: false, // ✅ Prevents idle connections
       },
     }
   );
   ```

3. **Set Statement Timeout:**
   ```sql
   -- Kill queries that run >30 seconds
   ALTER DATABASE postgres SET statement_timeout = '30s';

   -- Or per-connection in API routes
   -- SET statement_timeout = '10s';
   ```

4. **Close Idle Connections:**
   ```sql
   -- Find idle connections
   SELECT pid, usename, state, state_change
   FROM pg_stat_activity
   WHERE state = 'idle'
     AND state_change < now() - interval '5 minutes';

   -- Kill them (if safe)
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
     AND state_change < now() - interval '10 minutes';
   ```

### Optimization 4: Update RLS Policies to Use Helpers

Replace direct `auth.uid()` calls with cached helpers:

```sql
-- BEFORE (slow - auth.uid() called multiple times)
CREATE POLICY "Users can view their bookings"
  ON bookings FOR SELECT
  USING (customer_id = auth.uid() OR professional_id = auth.uid());

-- AFTER (fast - cached in transaction)
CREATE POLICY "Users can view their bookings"
  ON bookings FOR SELECT
  USING (customer_id = private.current_user_id() OR professional_id = private.current_user_id());
```

Script to update all policies:

```bash
# Generate policy updates
psql "postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres" \
  -c "SELECT 'DROP POLICY \"' || policyname || '\" ON ' || tablename || ';'
      FROM pg_policies WHERE schemaname = 'public';" > /tmp/drop-policies.sql

# Review and apply manually after updating policy definitions
```

---

## Phase 4: Advanced Optimizations (Optional)

### 1. Enable Query Caching

Use Next.js `unstable_cache()` for public data (already in place per CLAUDE.md):

```typescript
import { unstable_cache } from 'next/cache';

export const getCachedProfessionals = unstable_cache(
  async (cityId: string) => {
    // Your query here
  },
  ['professionals', cityId],
  {
    revalidate: 3600, // 1 hour
    tags: ['professionals'],
  }
);
```

### 2. Implement Redis Caching

For frequently accessed data:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache professional profiles
const cached = await redis.get(`pro:${professionalId}`);
if (cached) return cached;

const data = await fetchProfessional(professionalId);
await redis.set(`pro:${professionalId}`, data, { ex: 3600 });
```

### 3. Partition Large Tables

For tables with >10M rows (bookings, messages):

```sql
-- Partition bookings by month
CREATE TABLE bookings_partitioned (
  LIKE bookings INCLUDING ALL
) PARTITION BY RANGE (booking_date);

-- Create partitions
CREATE TABLE bookings_2025_01 PARTITION OF bookings_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE bookings_2025_02 PARTITION OF bookings_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Migrate data
INSERT INTO bookings_partitioned SELECT * FROM bookings;

-- Rename tables
ALTER TABLE bookings RENAME TO bookings_old;
ALTER TABLE bookings_partitioned RENAME TO bookings;
```

### 4. Enable Connection Pooling (PgBouncer)

Already enabled via Supabase Pooler, but ensure using pooler URL:

```env
# .env.local (for API routes)
DIRECT_URL="postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres"
DATABASE_URL="postgresql://postgres.hvnetxfsrtplextvtwfx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

---

## Phase 5: Monitoring & Verification (Ongoing)

### 1. Re-run Diagnostics

After 24-48 hours, re-run diagnostics to measure impact:

```bash
./supabase/scripts/run-diagnostics.sh

# Compare reports
diff diagnostics-BEFORE/diagnostics-report.txt diagnostics-AFTER/diagnostics-report.txt
```

### 2. Monitor Key Metrics

**Supabase Dashboard:**
- Database → Reports → Query Performance
- Database → Reports → Table Size
- Database → Reports → Index Usage

**Custom Monitoring:**
```sql
-- Run this daily
SELECT
  'Cache Hit Ratio' AS metric,
  ROUND((sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0)) * 100, 2) AS value
FROM pg_statio_user_tables
UNION ALL
SELECT
  'Connection Usage' AS metric,
  ROUND((count(*) / (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')::numeric) * 100, 2)
FROM pg_stat_activity
UNION ALL
SELECT
  'Average Query Time' AS metric,
  ROUND(mean_exec_time::numeric, 2)
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 1;
```

### 3. Set Up Alerts

**PostHog or Logtail:**
- Alert if API response time >1s
- Alert if database connections >80%
- Alert if cache hit ratio <95%

---

## Expected Results Summary

| Optimization | Time | Difficulty | Expected Improvement |
|--------------|------|------------|---------------------|
| **Quick Wins** | 30 min | Easy | 5-10x faster queries |
| **Drop Unused Indexes** | 20 min | Easy | 30-50% faster writes |
| **RLS Optimization** | 1 hour | Medium | 60-95% faster user queries |
| **VACUUM Bloat** | 30 min | Easy | 20-40% disk savings, 20% faster |
| **Connection Pooling** | 1 hour | Medium | Eliminate errors, 2-3x throughput |
| **Query Optimization** | 2 hours | Hard | 50-500x for specific queries |
| **Advanced (Redis, etc.)** | 4+ hours | Hard | 10-100x for cached data |

**Total Potential:** **10-100x overall improvement** (depending on current bottlenecks)

---

## Troubleshooting

### Issue: MaxClientsInSessionMode Error

**Symptoms:**
```
error: connection to server was lost
MaxClientsInSessionMode: 1000
```

**Solutions:**
1. Use Supabase pooler URL (not direct connection)
2. Set `persistSession: false` in Supabase client for API routes
3. Add statement_timeout to prevent long-running queries
4. Close connections immediately after use

### Issue: Slow Queries After Adding Indexes

**Possible Causes:**
- Stale statistics (run ANALYZE)
- Index not being used (check with EXPLAIN)
- Wrong index type (use GIN for arrays, GiST for spatial)

**Solutions:**
```sql
-- Update statistics
ANALYZE bookings;

-- Check if index is used
EXPLAIN ANALYZE SELECT * FROM bookings WHERE professional_id = '123';

-- Force index usage (if needed)
SET enable_seqscan = off;
```

### Issue: VACUUM FULL Takes Too Long

**Symptoms:**
- VACUUM FULL running for hours
- Table locked, app unavailable

**Solutions:**
1. Use `VACUUM` instead (non-blocking, slower space reclaim)
2. Run VACUUM FULL during maintenance window
3. Use `pg_repack` extension (online table rebuild)

---

## Maintenance Schedule

### Daily
- [x] Monitor cache hit ratio (should be >99%)
- [x] Check connection usage (should be <80%)
- [x] Review slow query log

### Weekly
- [x] Run diagnostics script
- [x] Review unused indexes
- [x] Check table bloat

### Monthly
- [x] Run VACUUM ANALYZE on all tables
- [x] Review and optimize slow queries
- [x] Update database statistics

### Quarterly
- [x] Review and update RLS policies
- [x] Audit and drop unused indexes
- [x] Consider partitioning large tables

---

## Resources

### Internal Docs
- [Database Docker Toolkit](./database-docker-toolkit.md)
- [Architecture Guide](./architecture.md)
- [CLAUDE.md](../CLAUDE.md)

### External Resources
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/performance)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PgAnalyze Blog](https://pganalyze.com/blog)
- [Use The Index, Luke!](https://use-the-index-luke.com/)

---

## Questions?

**Having issues?** Review diagnostics output and check:
1. Cache hit ratio section
2. Slow queries section
3. Sequential scans section
4. Table bloat section

**Need help?** Check:
- Supabase Dashboard → Database → Reports
- PostHog analytics for API performance
- Logtail logs for errors

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Author:** Claude (AI Assistant)
