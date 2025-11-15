# Booking Query Index Verification

**Epic:** B-2 – Add composite indexes for hot booking queries
**Migration:** `20251114160000_add_hot_booking_query_indexes.sql`
**Date:** 2025-01-14
**Status:** ✅ Ready for deployment

---

## Executive Summary

This document provides verification queries for the 5 new composite indexes created in Epic B-2. Each query includes:
- Query pattern and use case
- EXPLAIN ANALYZE command for performance testing
- Expected index usage
- Performance targets

---

## Index 1: Professional Dashboard Queries

### Index Details
```sql
CREATE INDEX idx_bookings_pro_status_scheduled
  ON bookings(professional_id, status, scheduled_start)
  WHERE scheduled_start IS NOT NULL;
```

### Use Case
Professional calendar showing confirmed/in-progress bookings sorted by scheduled_start

### Verification Query
```sql
EXPLAIN ANALYZE
SELECT
  id,
  scheduled_start,
  scheduled_end,
  status,
  customer_id,
  service_name,
  total_amount
FROM bookings
WHERE professional_id = 'REPLACE_WITH_REAL_UUID'
  AND status IN ('confirmed', 'in_progress')
  AND scheduled_start >= CURRENT_DATE
ORDER BY scheduled_start ASC
LIMIT 50;
```

### Expected Results
- ✅ **Index Scan** using `idx_bookings_pro_status_scheduled`
- ✅ **Execution Time:** <100ms (down from 500-800ms)
- ✅ **Rows Scanned:** Only relevant bookings (not full table)

### Verification Checklist
- [ ] Query uses index scan (not sequential scan)
- [ ] Execution time <200ms
- [ ] "Rows Removed by Filter" = 0 (efficient filtering)
- [ ] Planner estimates match actual rows

---

## Index 2: Customer Booking History

### Index Details
```sql
CREATE INDEX idx_bookings_customer_status_created
  ON bookings(customer_id, status, created_at DESC);
```

### Use Case
Customer dashboard showing booking history by status, newest first

### Verification Query
```sql
EXPLAIN ANALYZE
SELECT
  id,
  scheduled_start,
  status,
  professional_id,
  service_name,
  total_amount,
  created_at
FROM bookings
WHERE customer_id = 'REPLACE_WITH_REAL_UUID'
  AND status IN ('confirmed', 'completed', 'cancelled')
ORDER BY created_at DESC
LIMIT 20;
```

### Expected Results
- ✅ **Index Scan** using `idx_bookings_customer_status_created`
- ✅ **Execution Time:** <50ms (down from 300-500ms)
- ✅ **Sort:** No explicit sort needed (index provides ordering)

### Verification Checklist
- [ ] Query uses index scan
- [ ] Execution time <100ms
- [ ] No "Sort" operation in plan (index provides DESC order)
- [ ] "Rows Removed by Filter" = 0

---

## Index 3: Professional Availability Checks

### Index Details
```sql
CREATE INDEX idx_bookings_pro_active_schedule
  ON bookings(professional_id, scheduled_start, scheduled_end)
  WHERE status IN ('confirmed', 'in_progress', 'payment_authorized');
```

### Use Case
Real-time availability checking for booking creation

### Verification Query
```sql
EXPLAIN ANALYZE
SELECT
  scheduled_start,
  scheduled_end,
  id,
  status
FROM bookings
WHERE professional_id = 'REPLACE_WITH_REAL_UUID'
  AND status IN ('confirmed', 'in_progress', 'payment_authorized')
  AND scheduled_start BETWEEN '2025-01-14 08:00:00' AND '2025-01-14 18:00:00';
```

### Expected Results
- ✅ **Index Scan** using `idx_bookings_pro_active_schedule`
- ✅ **Execution Time:** <50ms (down from 200-400ms)
- ✅ **Small Result Set:** Only active bookings (partial index advantage)

### Verification Checklist
- [ ] Query uses partial index `idx_bookings_pro_active_schedule`
- [ ] Execution time <100ms
- [ ] Index size is much smaller than full bookings table
- [ ] No sequential scan

---

## Index 4: Recent Customer Activity

### Index Details
```sql
CREATE INDEX idx_bookings_customer_recent
  ON bookings(customer_id, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '90 days';
```

### Use Case
Customer dashboard "recent activity" section (last 30-90 days)

### Verification Query
```sql
EXPLAIN ANALYZE
SELECT
  id,
  scheduled_start,
  status,
  professional_id,
  service_name,
  total_amount,
  created_at
FROM bookings
WHERE customer_id = 'REPLACE_WITH_REAL_UUID'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 10;
```

### Expected Results
- ✅ **Index Scan** using `idx_bookings_customer_recent`
- ✅ **Execution Time:** <30ms (very fast due to small index)
- ✅ **Covers 90%+ of customer queries** (most users check recent activity)

### Verification Checklist
- [ ] Query uses partial index (when querying last 30-90 days)
- [ ] Execution time <50ms
- [ ] Index is significantly smaller than full table
- [ ] No sort operation needed

---

## Index 5: Upcoming Bookings for Notifications

### Index Details
```sql
CREATE INDEX idx_bookings_scheduled_upcoming
  ON bookings(scheduled_start)
  WHERE status IN ('confirmed', 'payment_authorized')
    AND scheduled_start > NOW()
    AND scheduled_start < NOW() + INTERVAL '24 hours';
```

### Use Case
Notification system sending arrival alerts for bookings starting soon

### Verification Query
```sql
EXPLAIN ANALYZE
SELECT
  id,
  professional_id,
  customer_id,
  scheduled_start,
  status,
  service_name
FROM bookings
WHERE status IN ('confirmed', 'payment_authorized')
  AND scheduled_start > NOW()
  AND scheduled_start < NOW() + INTERVAL '1 hour'
ORDER BY scheduled_start ASC;
```

### Expected Results
- ✅ **Index Scan** using `idx_bookings_scheduled_upcoming`
- ✅ **Execution Time:** <100ms (down from 1-2s full table scan)
- ✅ **Tiny Index:** Only future bookings in next 24 hours

### Verification Checklist
- [ ] Query uses partial index
- [ ] Execution time <200ms (critical for notification system)
- [ ] Index is extremely small (only ~1% of bookings)
- [ ] No sequential scan

---

## Index Size Analysis

Run this query to compare index sizes:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size,
  idx_scan AS number_of_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'bookings'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### Expected Results

| Index | Type | Approx Size | Notes |
|-------|------|-------------|-------|
| `idx_bookings_pro_status_scheduled` | Composite | ~10-20MB | Full index on 3 columns |
| `idx_bookings_customer_status_created` | Composite | ~10-20MB | Full index with DESC |
| `idx_bookings_pro_active_schedule` | Partial | ~2-5MB | Only active bookings (~20%) |
| `idx_bookings_customer_recent` | Partial | ~3-8MB | Only last 90 days (~25%) |
| `idx_bookings_scheduled_upcoming` | Partial | <1MB | Only next 24 hours (~0.5%) |

**Note:** Partial indexes are much smaller and faster because they only index a subset of rows.

---

## Query Performance Benchmark

### Methodology

1. **Baseline (Before Indexes):**
   ```bash
   # Run each query 10 times, record average execution time
   for i in {1..10}; do
     psql -c "EXPLAIN ANALYZE [query]" | grep "Execution Time"
   done
   ```

2. **After Indexes:**
   - Run same benchmark
   - Compare execution times
   - Verify index usage in EXPLAIN output

### Performance Targets

| Query Type | Before | Target | Improvement |
|------------|--------|--------|-------------|
| Professional Dashboard | 500-800ms | <100ms | 80-90% |
| Customer History | 300-500ms | <50ms | 85-90% |
| Availability Check | 200-400ms | <50ms | 75-87% |
| Recent Activity | 200-300ms | <30ms | 85-90% |
| Notification Query | 1-2s | <100ms | 90-95% |

---

## Deployment Checklist

### Pre-Deployment
- [ ] Review migration SQL syntax
- [ ] Verify index names don't conflict
- [ ] Check IF NOT EXISTS clauses
- [ ] Backup production database

### Deployment
- [ ] Apply migration: `supabase db push`
- [ ] Monitor index creation (may take 5-10 minutes on large tables)
- [ ] Check for errors in Supabase logs

### Post-Deployment Verification
- [ ] Run all EXPLAIN ANALYZE queries above
- [ ] Verify each query uses the correct index
- [ ] Check execution times meet targets (<200ms)
- [ ] Monitor index size (should be reasonable)
- [ ] Check `pg_stat_user_indexes` for index usage after 24 hours

### Rollback Plan (if needed)
```sql
-- Drop indexes if causing issues
DROP INDEX IF EXISTS idx_bookings_pro_status_scheduled;
DROP INDEX IF EXISTS idx_bookings_customer_status_created;
DROP INDEX IF EXISTS idx_bookings_pro_active_schedule;
DROP INDEX IF EXISTS idx_bookings_customer_recent;
DROP INDEX IF EXISTS idx_bookings_scheduled_upcoming;
```

---

## Common Issues & Troubleshooting

### Issue 1: Index Not Being Used
**Symptom:** EXPLAIN shows "Seq Scan" instead of "Index Scan"

**Possible Causes:**
- Table statistics are outdated
- Query doesn't match index columns exactly
- PostgreSQL thinks sequential scan is faster (small table)

**Fix:**
```sql
-- Update table statistics
ANALYZE bookings;

-- Force index usage (testing only)
SET enable_seqscan = off;
[run query]
SET enable_seqscan = on;
```

### Issue 2: Index Creation Takes Too Long
**Symptom:** Migration runs for >30 minutes

**Possible Causes:**
- Table has millions of rows
- Database is under heavy load
- Concurrent writes blocking index creation

**Fix:**
```sql
-- Create indexes CONCURRENTLY (doesn't block writes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_pro_status_scheduled
  ON bookings(professional_id, status, scheduled_start)
  WHERE scheduled_start IS NOT NULL;
```

### Issue 3: Slower Writes After Indexes
**Symptom:** INSERT/UPDATE on bookings table is 2-3x slower

**Expected Behavior:** Some write slowdown is normal (index maintenance)

**Acceptable Degradation:** 20-40% slower writes for 80-90% faster reads

**Monitor:**
```sql
-- Check insert/update performance
SELECT
  schemaname,
  tablename,
  n_tup_ins,
  n_tup_upd,
  n_tup_del
FROM pg_stat_user_tables
WHERE tablename = 'bookings';
```

---

## Success Criteria

### B-2 Task Completion

Task is **DONE** when:

- ✅ All 5 indexes created successfully
- ✅ EXPLAIN ANALYZE confirms index usage for each query
- ✅ Execution times meet targets (<200ms for all dashboard queries)
- ✅ No performance regressions on write operations (>50% slowdown)
- ✅ Index sizes are reasonable (<100MB total)
- ✅ Documentation updated with verification results

---

## Next Steps

1. **Apply Migration:** `supabase db push`
2. **Run Verification Queries:** Use EXPLAIN ANALYZE for each index
3. **Document Results:** Update this file with actual performance numbers
4. **Monitor Production:** Check `pg_stat_user_indexes` after 24-48 hours
5. **Proceed to B-3:** Add performance guardrails for remaining slow queries

---

**Document Owner:** Engineering Team
**Review Status:** Ready for deployment
**Last Updated:** 2025-01-14
