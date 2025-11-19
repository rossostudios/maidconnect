#!/bin/bash
# Database Health Check Script
# Comprehensive health report for Supabase PostgreSQL database

set -e

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Casaora Database Health Check Report              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Target: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Check 1: Connection Test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Connection Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    VERSION=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();")
    echo "✅ Connected successfully"
    echo "   $VERSION"
else
    echo "❌ Connection failed!"
    exit 1
fi
echo ""

# Check 2: Cache Hit Ratio
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Cache Hit Ratio (Target: >99%)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CACHE_HIT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT ROUND((SUM(blks_hit) / NULLIF(SUM(blks_hit + blks_read), 0)) * 100, 2)
    FROM pg_stat_database
    WHERE datname = '$DB_NAME';
")

if (( $(echo "$CACHE_HIT > 99" | bc -l) )); then
    echo "✅ $CACHE_HIT% - Excellent"
elif (( $(echo "$CACHE_HIT > 95" | bc -l) )); then
    echo "⚠️  $CACHE_HIT% - Good, but could be better"
else
    echo "❌ $CACHE_HIT% - Poor! Consider increasing shared_buffers"
fi
echo ""

# Check 3: Database Size
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Database Size"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
        pg_size_pretty(pg_database_size('$DB_NAME')) AS total_size,
        (SELECT COUNT(*) FROM pg_stat_user_tables) AS tables,
        (SELECT COUNT(*) FROM pg_stat_user_indexes) AS indexes;
"
echo ""

# Check 4: Top 10 Largest Tables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Top 10 Largest Tables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
        schemaname || '.' || tablename AS table_name,
        pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
        pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) AS index_size,
        ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 1) AS dead_pct
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
    LIMIT 10;
"
echo ""

# Check 5: Dead Tuples (Bloat)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Table Bloat (Dead Tuples >5% need VACUUM)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
BLOATED_TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*)
    FROM pg_stat_user_tables
    WHERE n_dead_tup > 0
      AND ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 1) > 5;
")

if [ "$BLOATED_TABLES" -eq 0 ]; then
    echo "✅ No bloated tables found"
else
    echo "⚠️  $BLOATED_TABLES table(s) with >5% dead tuples"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            schemaname || '.' || tablename AS table_name,
            n_live_tup AS live_tuples,
            n_dead_tup AS dead_tuples,
            ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 1) AS dead_pct,
            last_vacuum,
            last_autovacuum
        FROM pg_stat_user_tables
        WHERE n_dead_tup > 0
          AND ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 1) > 5
        ORDER BY dead_pct DESC;
    "
    echo ""
    echo "💡 Run: ./supabase/scripts/vacuum-analyze.sh"
fi
echo ""

# Check 6: Sequential Scans (Missing Indexes)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Sequential Scans (High values may need indexes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HIGH_SEQ_SCANS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*)
    FROM pg_stat_user_tables
    WHERE seq_scan > 1000
      AND schemaname = 'public';
")

if [ "$HIGH_SEQ_SCANS" -eq 0 ]; then
    echo "✅ No tables with excessive sequential scans"
else
    echo "⚠️  $HIGH_SEQ_SCANS table(s) with >1000 sequential scans"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            schemaname || '.' || tablename AS table_name,
            seq_scan,
            seq_tup_read,
            idx_scan,
            ROUND((seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0)) * 100, 1) AS seq_pct
        FROM pg_stat_user_tables
        WHERE seq_scan > 1000
          AND schemaname = 'public'
        ORDER BY seq_scan DESC
        LIMIT 10;
    "
    echo ""
    echo "💡 Run: psql ... -f supabase/scripts/optimize-indexes.sql"
fi
echo ""

# Check 7: Slow Queries (if pg_stat_statements enabled)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Slow Queries (Top 5 by total time)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;" > /dev/null 2>&1; then
    SLOW_QUERIES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*)
        FROM pg_stat_statements
        WHERE mean_exec_time > 100;
    ")

    if [ "$SLOW_QUERIES" -eq 0 ]; then
        echo "✅ No queries with average time >100ms"
    else
        echo "⚠️  $SLOW_QUERIES queries with average time >100ms"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
            SELECT
                LEFT(query, 80) AS query_preview,
                calls,
                ROUND(mean_exec_time::numeric, 2) AS avg_ms,
                ROUND(total_exec_time::numeric, 2) AS total_ms
            FROM pg_stat_statements
            WHERE query NOT LIKE '%pg_stat_statements%'
              AND mean_exec_time > 100
            ORDER BY total_exec_time DESC
            LIMIT 5;
        "
        echo ""
        echo "💡 Run: psql ... -f supabase/scripts/analyze-slow-queries.sql"
    fi
else
    echo "ℹ️  pg_stat_statements not available"
fi
echo ""

# Check 8: Connection Stats
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Connection Statistics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
        COUNT(*) AS total_connections,
        COUNT(*) FILTER (WHERE state = 'active') AS active,
        COUNT(*) FILTER (WHERE state = 'idle') AS idle,
        COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
        MAX(backend_start) AS oldest_connection
    FROM pg_stat_activity
    WHERE datname = '$DB_NAME';
"
echo ""

# Check 9: Recent Errors
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Recent Errors (Last 10 from pg_stat_database)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ERRORS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT deadlocks + conflicts + temp_files
    FROM pg_stat_database
    WHERE datname = '$DB_NAME';
")

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ No recent deadlocks, conflicts, or temp files"
else
    echo "⚠️  Found $ERRORS issues"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            deadlocks,
            conflicts,
            temp_files,
            pg_size_pretty(temp_bytes) AS temp_size
        FROM pg_stat_database
        WHERE datname = '$DB_NAME';
    "
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Health Check Summary                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Calculate overall health score
ISSUES=0

if (( $(echo "$CACHE_HIT < 99" | bc -l) )); then
    ((ISSUES++))
fi

if [ "$BLOATED_TABLES" -gt 0 ]; then
    ((ISSUES++))
fi

if [ "$HIGH_SEQ_SCANS" -gt 0 ]; then
    ((ISSUES++))
fi

if [ "$SLOW_QUERIES" -gt 5 ]; then
    ((ISSUES++))
fi

if [ "$ISSUES" -eq 0 ]; then
    echo "✅ Overall Status: HEALTHY"
    echo "   No critical issues found"
elif [ "$ISSUES" -le 2 ]; then
    echo "⚠️  Overall Status: NEEDS ATTENTION"
    echo "   $ISSUES issue(s) found - review recommendations above"
else
    echo "❌ Overall Status: CRITICAL"
    echo "   $ISSUES issue(s) found - immediate action recommended"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Report completed: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "For detailed analysis:"
echo "  • PgHero:   http://localhost:8080"
echo "  • pgAdmin:  http://localhost:5050"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
