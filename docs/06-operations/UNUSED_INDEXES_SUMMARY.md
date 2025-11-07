# Unused Index Analysis - Quick Summary

**Date:** 2025-11-07  
**Analyzed:** 200 unused indexes across 55 tables  
**Action Required:** Review and apply Phase 1 migration

---

## TL;DR - What You Need to Know

**Status:** 200 indexes reported as unused by Supabase linter  
**Safe to Drop:** 35 indexes (Phase 1 - ready to apply)  
**Must Keep:** 9 RLS indexes + 3 search indexes (critical)  
**Needs Investigation:** 30+ indexes (Phase 2)  
**Future Features:** 53 indexes (monitor)  

**Impact:** 
- Storage: -30-50MB
- Write speed: +3-5% improvement
- Maintenance: Reduced VACUUM/REINDEX time

---

## Critical Finding: RLS Indexes

⚠️ **IMPORTANT:** The database linter CANNOT detect indexes used by Row-Level Security policies.

**These 9 indexes are reported as "unused" but are CRITICAL - DO NOT DROP:**

```sql
idx_customer_profiles_profile_id_rls
idx_professional_profiles_profile_id_rls  
idx_customer_reviews_customer_id_rls
customer_reviews_customer_id_idx
notifications_user_id_idx
idx_notification_subscriptions_user_id
mobile_push_tokens_user_idx
idx_professional_documents_profile_id
profiles_stripe_customer_id_idx
```

Dropping these would cause severe performance degradation for authenticated queries.

---

## Quick Action Guide

### ✅ Phase 1 - Apply Immediately (Low Risk)

**File:** `supabase/migrations/20251107200000_drop_unused_indexes_phase1.sql`  
**Indexes to Drop:** 35  
**Tables Affected:** Admin tables, revenue analytics, bookings composites  

**Command:**
```bash
# Review the migration
cat supabase/migrations/20251107200000_drop_unused_indexes_phase1.sql

# Apply via Supabase CLI
supabase db push

# Or apply manually in Supabase dashboard
```

**What's being dropped:**
- Admin/moderation tables (31 indexes) - Dashboard not fully built
- Revenue analytics (2 indexes) - Feature not implemented  
- Overly specific composites (2 indexes) - Redundant

**Risk:** Low - These tables/features aren't actively used in production.

---

### ⚠️ Phase 2 - Investigate First (Medium Risk)

**Before dropping these, verify feature status:**

1. **Guest Checkout (3 indexes)**
   ```sql
   -- Check if feature is used
   SELECT COUNT(*) FROM guest_sessions 
   WHERE created_at > NOW() - INTERVAL '30 days';
   ```
   If count = 0, safe to drop.

2. **Referral System (7 indexes)**
   ```sql
   -- Check if referrals are active
   SELECT COUNT(*) FROM referrals 
   WHERE status = 'active';
   ```
   If count = 0, safe to drop.

3. **Query Indexes (9 indexes)**
   - Need to analyze actual query patterns
   - Check pg_stat_statements for usage
   - Medium risk - investigate before dropping

---

### 📊 Phase 3 - Keep & Monitor

**NEVER DROP - Critical for performance:**
- RLS indexes (9) - Security critical
- Search/text indexes (3) - Search functionality
- Foreign key indexes (29) - JOIN performance
- Help center indexes (18) - Active feature
- AI assistant indexes (6) - Active feature
- Recurring plans indexes (4) - Active feature

---

## Files & Documentation

**Full Analysis:**
- `docs/06-operations/unused-indexes-analysis-2025-11-07.md`

**Migration Files:**
- Phase 1: `supabase/migrations/20251107200000_drop_unused_indexes_phase1.sql`
- Phase 2: TBD (after investigation)

**Data Files:**
- `/tmp/categorized_indexes.json` - All indexes by category
- `/tmp/core_active_analysis.json` - Core table analysis
- `/tmp/unused_indexes_report.txt` - Raw analysis output

---

## Next Steps

1. **Review Phase 1 migration** - Check the SQL looks correct
2. **Test on staging** - Apply to staging environment first
3. **Monitor for 48 hours** - Check query performance metrics
4. **Apply to production** - If no issues detected
5. **Investigate Phase 2** - Answer questions below
6. **Schedule quarterly review** - Monitor index usage ongoing

---

## Questions to Answer (Phase 2)

Before proceeding with Phase 2 drops, need clarity on:

1. **Is guest checkout actively used?** (3 indexes at risk)
2. **Is the referral system launched?** (7 indexes at risk)  
3. **Which future features are delayed > 6 months?** (53 indexes at risk)
4. **Is platform event tracking planned?** (7 indexes at risk)
5. **Is the portfolio feature used by professionals?** (1 index at risk)

---

## Monitoring Commands

**Check index sizes:**
```sql
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

**Check query performance after migration:**
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%bookings%' OR query LIKE '%profiles%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Check for new unused indexes (monthly):**
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes  
WHERE schemaname = 'public' AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## Red Flags - When NOT to Drop

🚫 **DO NOT drop an index if:**
1. It has `_rls` suffix (RLS policy index)
2. It's on a user_id/customer_id/professional_id column (likely RLS)
3. It's a text search index (trgm, vector)
4. It's a foreign key index (improves JOINs)
5. The feature is actively used in production
6. Query performance degrades after dropping

---

## Rollback Procedure

If performance issues occur after dropping indexes:

1. **Identify the problematic query**
   ```sql
   SELECT query, mean_exec_time 
   FROM pg_stat_statements 
   WHERE mean_exec_time > 1000 -- queries slower than 1 second
   ORDER BY mean_exec_time DESC;
   ```

2. **Check which index was used before**
   - Review migration archive in `supabase/migrations-archive/`
   - Find original CREATE INDEX statement

3. **Recreate the index**
   ```sql
   -- Example
   CREATE INDEX idx_admin_audit_logs_admin_id 
     ON public.admin_audit_logs(admin_id);
   ```

4. **Monitor for improvement**
   - Wait 5-10 minutes for index to be used
   - Re-check query performance

---

## Estimated Timeline

**Week 1 (This Week):**
- Day 1: Review Phase 1 migration
- Day 2: Apply to staging, monitor
- Day 3-4: Apply to production, monitor
- Day 5: Document results

**Week 2-3:**
- Investigate Phase 2 questions
- Analyze query patterns
- Prepare Phase 2 migration (if needed)

**Ongoing:**
- Monthly index usage review
- Quarterly comprehensive audit

---

## Success Metrics

After Phase 1 migration, expect to see:
- ✅ 35 fewer indexes in `pg_indexes` 
- ✅ Reduced index storage size (~30-50MB)
- ✅ Faster INSERT/UPDATE on admin tables
- ✅ Lower VACUUM/REINDEX times
- ✅ No query performance degradation

---

**Questions?** Review full analysis: `docs/06-operations/unused-indexes-analysis-2025-11-07.md`

