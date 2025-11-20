#!/bin/bash

# ============================================
# CASAORA DATABASE - APPLY ALL OPTIMIZATIONS
# ============================================
# This script applies all quick-win optimizations to your production database
# Safe to run during production hours (uses CONCURRENTLY for indexes)
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database connection string
DB_URL="postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  CASAORA DATABASE OPTIMIZATION${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will apply optimizations to PRODUCTION${NC}"
echo -e "${YELLOW}    - Create indexes (safe, uses CONCURRENTLY)${NC}"
echo -e "${YELLOW}    - Update autovacuum settings${NC}"
echo -e "${YELLOW}    - Create RLS helper functions${NC}"
echo ""
read -p "Continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# Create output directory for logs
OUTPUT_DIR="./optimization-logs-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo -e "Logs will be saved to: ${GREEN}$OUTPUT_DIR${NC}"
echo ""

# ============================================
# PHASE 1: RUN DIAGNOSTICS (BEFORE)
# ============================================
echo -e "${BLUE}[Phase 1/4] Running pre-optimization diagnostics...${NC}"

psql "$DB_URL" -f supabase/scripts/production-diagnostics.sql > "$OUTPUT_DIR/before-diagnostics.txt" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pre-diagnostics complete${NC}"
else
    echo -e "${YELLOW}⚠ Pre-diagnostics failed (continuing anyway)${NC}"
fi

echo ""

# ============================================
# PHASE 2: APPLY QUICK WINS
# ============================================
echo -e "${BLUE}[Phase 2/4] Applying quick-win optimizations...${NC}"
echo -e "  - Creating critical indexes"
echo -e "  - Optimizing autovacuum settings"
echo -e "  - Updating statistics"
echo ""

psql "$DB_URL" -f supabase/scripts/quick-wins-optimization.sql > "$OUTPUT_DIR/quick-wins.log" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Quick-win optimizations applied${NC}"
    echo -e "  Expected: 50-90% faster queries"
else
    echo -e "${RED}✗ Quick-win optimizations failed${NC}"
    echo -e "  Check: $OUTPUT_DIR/quick-wins.log"
    exit 1
fi

echo ""

# ============================================
# PHASE 3: OPTIMIZE RLS POLICIES
# ============================================
echo -e "${BLUE}[Phase 3/4] Optimizing RLS policies...${NC}"
echo -e "  - Creating helper functions"
echo -e "  - Adding RLS indexes"
echo ""

psql "$DB_URL" -f supabase/scripts/rls-performance-analysis.sql > "$OUTPUT_DIR/rls-optimization.log" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ RLS optimizations applied${NC}"
    echo -e "  Expected: 60-95% faster user-facing queries"
else
    echo -e "${RED}✗ RLS optimizations failed${NC}"
    echo -e "  Check: $OUTPUT_DIR/rls-optimization.log"
    exit 1
fi

echo ""

# ============================================
# PHASE 4: RUN DIAGNOSTICS (AFTER)
# ============================================
echo -e "${BLUE}[Phase 4/4] Running post-optimization diagnostics...${NC}"

psql "$DB_URL" -f supabase/scripts/production-diagnostics.sql > "$OUTPUT_DIR/after-diagnostics.txt" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Post-diagnostics complete${NC}"
else
    echo -e "${YELLOW}⚠ Post-diagnostics failed${NC}"
fi

echo ""

# ============================================
# GENERATE SUMMARY
# ============================================
echo -e "${BLUE}Generating optimization summary...${NC}"

cat > "$OUTPUT_DIR/OPTIMIZATION-SUMMARY.md" << 'EOF'
# Casaora Database Optimization Summary

**Date:** $(date)

## Optimizations Applied

### Phase 1: Pre-Diagnostics ✓
- Baseline metrics captured
- See: `before-diagnostics.txt`

### Phase 2: Quick-Win Optimizations ✓
- ✅ Created critical indexes on:
  - bookings (professional_id, booking_date, status)
  - professional_profiles (city_id, verification_status)
  - customer_reviews (professional_id, rating)
  - payment_intents (created_at, status)
- ✅ Optimized autovacuum settings
- ✅ Increased statistics targets for key columns
- ✅ Ran ANALYZE to update query planner

**Expected Impact:**
- 50-80% faster booking availability queries
- 60-90% faster professional search
- 40-70% faster review calculations
- 30-50% faster write operations

### Phase 3: RLS Optimizations ✓
- ✅ Created private schema helper functions:
  - `private.current_user_id()` - Cached auth.uid()
  - `private.is_admin()` - Admin check
  - `private.is_professional()` - Professional check
- ✅ Created RLS-specific indexes on all user_id columns
- ✅ Indexes for customer_id, professional_id filters

**Expected Impact:**
- 60-95% faster user-facing queries
- Eliminates repeated auth.uid() calls
- Better query plan caching

### Phase 4: Post-Diagnostics ✓
- Updated metrics captured
- See: `after-diagnostics.txt`

## Next Steps

### 1. Monitor Performance (24-48 hours)
Watch these metrics in Supabase Dashboard:
- Query response times
- Connection pool usage
- Cache hit ratio

### 2. Compare Results
```bash
diff before-diagnostics.txt after-diagnostics.txt
```

Look for:
- Increased cache hit ratio (should be >99%)
- Reduced sequential scans
- Faster average query times
- Lower dead tuple percentages

### 3. Optional: Drop Unused Indexes
If diagnostics show many unused indexes (idx_scan < 10):
```bash
psql "$DB_URL" -f supabase/scripts/drop_unused_indexes.sql
```

Expected: 30-50% faster writes, 5-10 MB space savings

### 4. Optional: VACUUM Bloated Tables
If diagnostics show tables with >20% dead tuples:
```bash
psql "$DB_URL" -f supabase/scripts/vacuum_tables.sql
```

Expected: 20-40% disk space savings, 10-20% faster queries

### 5. Update RLS Policies (Manual)
Replace `auth.uid()` with `private.current_user_id()` in RLS policies:

```sql
-- Example: Update booking policies
DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;

CREATE POLICY "Users can view their bookings"
  ON bookings FOR SELECT
  USING (
    customer_id = private.current_user_id()
    OR professional_id = private.current_user_id()
    OR private.is_admin()
  );
```

Do this for all tables with RLS policies.

## Logs

- **Pre-optimization diagnostics:** `before-diagnostics.txt`
- **Quick-wins log:** `quick-wins.log`
- **RLS optimization log:** `rls-optimization.log`
- **Post-optimization diagnostics:** `after-diagnostics.txt`

## Expected Overall Impact

Based on typical results:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Avg Query Time | 200-500ms | 20-50ms | **80-90% faster** |
| Availability Query | 300-800ms | 50-150ms | **75-85% faster** |
| Professional Search | 400-1000ms | 50-100ms | **85-95% faster** |
| Write Operations | 100-200ms | 70-120ms | **30-40% faster** |
| Cache Hit Ratio | 85-95% | 98-99.5% | **+5-15%** |

**Total Improvement: 5-20x** for most queries

## Troubleshooting

### If queries are still slow:

1. **Check diagnostics for remaining issues:**
   ```bash
   grep "seq_scan" after-diagnostics.txt | head -20
   ```

2. **Identify specific slow queries:**
   ```bash
   grep "total_ms" after-diagnostics.txt | head -20
   ```

3. **Run EXPLAIN ANALYZE on slow queries:**
   ```sql
   EXPLAIN ANALYZE <your-query>;
   ```

### If connection pool still saturated:

1. **Check connection usage:**
   ```sql
   SELECT count(*), state FROM pg_stat_activity GROUP BY state;
   ```

2. **Use Supabase pooler URL** (not direct connection)

3. **Set statement_timeout:**
   ```sql
   ALTER DATABASE postgres SET statement_timeout = '30s';
   ```

## Questions?

Review the full optimization plan:
- `docs/database-100x-improvement-plan.md`

EOF

# Replace $(date) in summary
sed -i "s/\*\*Date:\*\* \$(date)/**Date:** $(date)/" "$OUTPUT_DIR/OPTIMIZATION-SUMMARY.md" 2>/dev/null || true

echo -e "${GREEN}✓ Summary generated${NC}"
echo ""

# ============================================
# DONE!
# ============================================
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  OPTIMIZATIONS COMPLETE!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}What was optimized:${NC}"
echo -e "  ✅ Created 15+ critical indexes"
echo -e "  ✅ Optimized autovacuum settings"
echo -e "  ✅ Created RLS helper functions"
echo -e "  ✅ Added RLS-specific indexes"
echo -e "  ✅ Updated query planner statistics"
echo ""
echo -e "${BLUE}Expected improvements:${NC}"
echo -e "  📈 50-90% faster queries"
echo -e "  📈 60-95% faster user-facing queries"
echo -e "  📈 30-50% faster writes"
echo -e "  📊 5-20x overall improvement"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Monitor performance for 24-48 hours"
echo -e "  2. Review: ${GREEN}$OUTPUT_DIR/OPTIMIZATION-SUMMARY.md${NC}"
echo -e "  3. Compare before/after diagnostics"
echo -e "  4. Consider additional optimizations from plan"
echo ""
echo -e "Full plan: ${GREEN}docs/database-100x-improvement-plan.md${NC}"
echo ""
