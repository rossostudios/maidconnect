#!/bin/bash

# ============================================
# CASAORA DATABASE DIAGNOSTICS RUNNER
# ============================================
# This script runs comprehensive diagnostics on your production database
# and saves the results for analysis
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

# Output directory
OUTPUT_DIR="./diagnostics-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  CASAORA DATABASE DIAGNOSTICS${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "Output directory: ${GREEN}$OUTPUT_DIR${NC}"
echo ""

# ============================================
# 1. RUN DIAGNOSTICS
# ============================================
echo -e "${YELLOW}[1/3] Running diagnostics...${NC}"
psql "$DB_URL" -f supabase/scripts/production-diagnostics.sql > "$OUTPUT_DIR/diagnostics-report.txt" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Diagnostics complete${NC}"
    echo -e "  Report saved to: $OUTPUT_DIR/diagnostics-report.txt"
else
    echo -e "${RED}✗ Diagnostics failed${NC}"
    exit 1
fi

echo ""

# ============================================
# 2. RUN RLS ANALYSIS
# ============================================
echo -e "${YELLOW}[2/3] Analyzing RLS performance...${NC}"
psql "$DB_URL" -f supabase/scripts/rls-performance-analysis.sql > "$OUTPUT_DIR/rls-analysis.txt" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ RLS analysis complete${NC}"
    echo -e "  Report saved to: $OUTPUT_DIR/rls-analysis.txt"
else
    echo -e "${RED}✗ RLS analysis failed${NC}"
    exit 1
fi

echo ""

# ============================================
# 3. GENERATE SUMMARY
# ============================================
echo -e "${YELLOW}[3/3] Generating summary...${NC}"

cat > "$OUTPUT_DIR/SUMMARY.md" << 'EOF'
# Casaora Database Diagnostics Summary

Generated: $(date)

## Files Generated

1. **diagnostics-report.txt** - Complete database health analysis
   - Database size and connection stats
   - Largest tables and indexes
   - Cache hit ratios
   - Slow queries
   - Table bloat
   - Missing indexes
   - Unused indexes

2. **rls-analysis.txt** - RLS performance analysis
   - RLS policies per table
   - Complex policies that may be slow
   - Recommended indexes for RLS
   - Helper functions created

## Quick Analysis

### Review These Sections First:

1. **Cache Hit Ratio** (Should be >99%)
   - If below 95%, you need more memory or better indexes

2. **Sequential Scans** (High seq_scan = missing indexes)
   - Tables with >1000 sequential scans need indexes

3. **Table Bloat** (Dead tuples >20% = need VACUUM)
   - Tables with high dead_tuple_percent need optimization

4. **Slow Queries** (Total time >1000ms = optimization targets)
   - Focus on queries with highest total_ms

5. **Unused Indexes** (idx_scan < 10 = candidates for removal)
   - Removing unused indexes improves write performance

## Next Steps

1. **Review diagnostics-report.txt**
   - Identify biggest issues from sections above

2. **Apply Quick Wins**
   ```bash
   psql "$DB_URL" -f supabase/scripts/quick-wins-optimization.sql
   ```

3. **Drop Unused Indexes** (if diagnostics show many)
   ```bash
   psql "$DB_URL" -f supabase/scripts/drop_unused_indexes.sql
   ```

4. **Run VACUUM on Bloated Tables**
   ```bash
   psql "$DB_URL" -f supabase/scripts/vacuum_tables.sql
   ```

5. **Monitor for 24-48 hours**
   - Check if performance improves
   - Run diagnostics again to measure impact

## Expected Improvements

After running all optimizations:

- **50-90% faster queries** (with proper indexes)
- **30-50% faster writes** (removing unused indexes)
- **20-40% less disk space** (VACUUM reclaims space)
- **Better connection pooling** (optimized autovacuum)
- **10-100x overall improvement** (depending on current state)

## Questions?

Review the optimization plan in:
- `docs/database-100x-improvement-plan.md`

EOF

# Replace $(date) in SUMMARY.md
sed -i "s/Generated: \$(date)/Generated: $(date)/" "$OUTPUT_DIR/SUMMARY.md" 2>/dev/null || true

echo -e "${GREEN}✓ Summary generated${NC}"
echo -e "  Summary saved to: $OUTPUT_DIR/SUMMARY.md"

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}  DIAGNOSTICS COMPLETE!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "Review the reports in: ${GREEN}$OUTPUT_DIR${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. cat $OUTPUT_DIR/SUMMARY.md"
echo -e "  2. Review $OUTPUT_DIR/diagnostics-report.txt"
echo -e "  3. Apply optimizations if needed"
echo ""
