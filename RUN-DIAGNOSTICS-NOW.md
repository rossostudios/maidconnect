# 🔍 Run Database Diagnostics NOW

**Due to network/DNS issues with direct psql connection, use the Supabase Dashboard SQL Editor instead.**

## Quick Steps (5 minutes)

### 1. Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/hvnetxfsrtplextvtwfx/sql/new

### 2. Copy the Diagnostics SQL

Open: `supabase/scripts/dashboard-diagnostics.sql`

Copy ALL the content (⌘+A, ⌘+C)

### 3. Paste and Run

1. Paste into the SQL Editor
2. Click **"Run"** button (or press ⌘+Enter)
3. Wait ~10-30 seconds for results

### 4. Review Results

The query returns 10 sections with **color-coded recommendations**:

- ✅ **HEALTHY** - No action needed
- ⚠️ **WARNING** - Should address soon
- ❌ **CRITICAL** - Immediate action needed

### 5. Key Metrics to Check

**Priority 1 - Critical Issues:**
- [ ] **Cache Hit Ratio** - Should be >99% (Section 3)
  - If <95%: Missing indexes or queries need optimization

- [ ] **Sequential Scans** - Tables marked ❌ CRITICAL (Section 7)
  - Action: Run `quick-wins-optimization.sql` to create indexes

- [ ] **Connection Pool** - Should be <80% usage (Section 10)
  - If >80%: App needs to use Supabase pooler connection

**Priority 2 - Performance Optimizations:**
- [ ] **Table Bloat** - Tables with >20% dead tuples (Section 6)
  - Action: Run `VACUUM ANALYZE` on affected tables

- [ ] **Unused Indexes** - Indexes with 0 scans (Section 8)
  - Action: Consider dropping to free space

### 6. Next Steps Based on Results

**If you see ❌ CRITICAL issues:**
```bash
# Apply quick-win optimizations (creates missing indexes)
# Copy quick-wins-optimization.sql to Supabase Dashboard SQL Editor
cat supabase/scripts/quick-wins-optimization.sql
```

**If you see ⚠️ WARNING issues:**
```bash
# Run full optimization suite
./supabase/scripts/apply-all-optimizations.sh
```

**If everything is ✅ HEALTHY:**
🎉 Your database is well-optimized! Monitor these metrics weekly.

---

## Understanding the Results

### Section 1: Database Overview
- **Database Size**: Total storage used
- **Active Connections**: Current connections / max available
- **Connection Usage**: Should be <80%

### Section 3: Cache Hit Ratio
- **>99%**: ✅ Excellent - Data is served from memory
- **95-99%**: ⚠️ Good - Could be better
- **<95%**: ❌ Poor - Add indexes or optimize queries

### Section 7: Sequential Scans
- **High seq_scan_percent on large tables**: Missing indexes
- **Example**: `bookings` table with 90% sequential scans needs index on commonly queried columns

### Section 8: Unused Indexes
- **idx_scan = 0**: Index never used, safe to drop
- **Save space** by removing unused indexes

### Section 6: Table Bloat
- **>20% dead tuples**: Table needs VACUUM
- **Bloat slows queries** and wastes disk space

---

## Troubleshooting

**"Query took too long"**
- The diagnostic queries are read-only and safe
- Break them into smaller sections by running 1-2 sections at a time

**"Permission denied"**
- Make sure you're logged into the correct Supabase project
- Verify you have project owner/admin access

**"No results"**
- Check that you pasted the entire SQL file
- Ensure you clicked "Run" or pressed ⌘+Enter

---

## After Running Diagnostics

### Save Your Results

1. **Screenshot or copy** the critical sections (3, 6, 7, 8, 10)
2. **Compare** with optimization plan in `docs/database-100x-improvement-plan.md`
3. **Decide** which optimizations to apply

### Typical Results

**New projects (< 1 month old):**
- Usually healthy, minimal bloat
- May have some missing indexes
- Connection usage typically low

**Established projects (> 3 months old):**
- Likely has table bloat (Section 6)
- Missing indexes causing sequential scans (Section 7)
- Some unused indexes (Section 8)
- Connection pool may be saturated (Section 10)

**After optimizations:**
- Cache hit ratio improves to >99%
- Sequential scans drop by 70-90%
- Query times improve by 5-20x
- Connection pool usage decreases

---

## Quick Reference

**Run diagnostics:**
```
Supabase Dashboard → SQL Editor → Paste dashboard-diagnostics.sql → Run
```

**Apply quick fixes:**
```
Supabase Dashboard → SQL Editor → Paste quick-wins-optimization.sql → Run
```

**Apply full optimizations:**
```
./supabase/scripts/apply-all-optimizations.sh
```

---

**Created:** 2025-11-20
**Purpose:** Bypass psql connection issues by using Supabase Dashboard
**Time to complete:** 5-10 minutes
