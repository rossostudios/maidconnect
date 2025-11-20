-- ============================================
-- CASAORA PRODUCTION DATABASE DIAGNOSTICS
-- ============================================
-- Run this script to identify performance bottlenecks
-- Usage: psql "postgresql://postgres:Rosso082190@!@db.hvnetxfsrtplextvtwfx.supabase.co:5432/postgres" -f production-diagnostics.sql > diagnostics-report.txt
-- ============================================

\echo '============================================'
\echo 'CASAORA DATABASE DIAGNOSTICS REPORT'
\echo '============================================'
\echo ''

-- Connection Info
\echo '1. DATABASE INFORMATION'
\echo '----------------------------------------'
SELECT
    current_database() AS database_name,
    version() AS postgres_version,
    pg_size_pretty(pg_database_size(current_database())) AS database_size,
    (SELECT count(*) FROM pg_stat_activity) AS active_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections;

\echo ''
\echo '2. TOP 10 LARGEST TABLES'
\echo '----------------------------------------'
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename) - COALESCE(pg_total_relation_size(schemaname||'.'||tablename||'_pkey'), 0)) AS bloat_estimate
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

\echo ''
\echo '3. CACHE HIT RATIO (Should be >99%)'
\echo '----------------------------------------'
SELECT
    'Index Hit Rate' AS metric,
    ROUND(
        (sum(idx_blks_hit)) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) * 100,
        2
    ) AS percentage
FROM pg_statio_user_indexes
UNION ALL
SELECT
    'Table Hit Rate' AS metric,
    ROUND(
        (sum(heap_blks_hit)) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0) * 100,
        2
    ) AS percentage
FROM pg_statio_user_tables;

\echo ''
\echo '4. ACTIVE CONNECTIONS & STATES'
\echo '----------------------------------------'
SELECT
    state,
    count(*) AS connection_count,
    max(now() - query_start) AS max_duration
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
GROUP BY state
ORDER BY connection_count DESC;

\echo ''
\echo '5. LONG-RUNNING QUERIES (>1 second)'
\echo '----------------------------------------'
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    state,
    left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '1 seconds'
    AND state != 'idle'
    AND pid <> pg_backend_pid()
ORDER BY duration DESC
LIMIT 10;

\echo ''
\echo '6. TABLE BLOAT ANALYSIS'
\echo '----------------------------------------'
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
    n_dead_tup AS dead_tuples,
    n_live_tup AS live_tuples,
    ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 2) AS dead_tuple_percent,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC
LIMIT 15;

\echo ''
\echo '7. SEQUENTIAL SCANS (Missing Indexes?)'
\echo '----------------------------------------'
SELECT
    schemaname,
    tablename,
    seq_scan AS sequential_scans,
    seq_tup_read AS rows_read_sequentially,
    idx_scan AS index_scans,
    ROUND((seq_scan::numeric / NULLIF(seq_scan + COALESCE(idx_scan, 0), 0)) * 100, 2) AS seq_scan_percent,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS table_size
FROM pg_stat_user_tables
WHERE seq_scan > 100
    AND pg_total_relation_size(schemaname||'.'||tablename) > 1000000 -- Tables > 1MB
ORDER BY seq_scan DESC
LIMIT 15;

\echo ''
\echo '8. UNUSED INDEXES (Candidates for Removal)'
\echo '----------------------------------------'
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS scans,
    pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) AS index_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS table_size
FROM pg_stat_user_indexes
WHERE idx_scan < 10
    AND indexrelname NOT LIKE '%pkey%'
    AND schemaname = 'public'
ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC
LIMIT 20;

\echo ''
\echo '9. DUPLICATE/REDUNDANT INDEXES'
\echo '----------------------------------------'
SELECT
    pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS total_size,
    string_agg(indexrelname, ', ') AS duplicate_indexes,
    tablename
FROM (
    SELECT
        indexrelid::regclass AS idx,
        indrelid::regclass AS tablename,
        indrelid,
        indkey::text,
        indexrelname
    FROM pg_index
    JOIN pg_class ON pg_class.oid = pg_index.indexrelid
    WHERE indisunique = false
        AND pg_class.relnamespace = 'public'::regnamespace
) sub
GROUP BY tablename, indkey
HAVING count(*) > 1
ORDER BY SUM(pg_relation_size(idx)) DESC;

\echo ''
\echo '10. MOST FREQUENTLY UPDATED TABLES'
\echo '----------------------------------------'
SELECT
    schemaname,
    tablename,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    n_tup_ins + n_tup_upd + n_tup_del AS total_writes,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_stat_user_tables
WHERE n_tup_upd > 0 OR n_tup_ins > 0 OR n_tup_del > 0
ORDER BY (n_tup_ins + n_tup_upd + n_tup_del) DESC
LIMIT 15;

-- Enable pg_stat_statements if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

\echo ''
\echo '11. TOP 20 SLOWEST QUERIES BY TOTAL TIME'
\echo '----------------------------------------'
SELECT
    ROUND(total_exec_time::numeric, 2) AS total_ms,
    calls,
    ROUND(mean_exec_time::numeric, 2) AS avg_ms,
    ROUND(max_exec_time::numeric, 2) AS max_ms,
    ROUND((total_exec_time / SUM(total_exec_time) OVER ()) * 100, 2) AS percent_total,
    left(query, 120) AS query_preview
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
    AND query NOT LIKE '%pg_catalog%'
ORDER BY total_exec_time DESC
LIMIT 20;

\echo ''
\echo '12. QUERIES WITH HIGHEST AVERAGE TIME'
\echo '----------------------------------------'
SELECT
    ROUND(mean_exec_time::numeric, 2) AS avg_ms,
    calls,
    ROUND(max_exec_time::numeric, 2) AS max_ms,
    ROUND(stddev_exec_time::numeric, 2) AS stddev_ms,
    left(query, 120) AS query_preview
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
    AND query NOT LIKE '%pg_catalog%'
    AND calls > 10
ORDER BY mean_exec_time DESC
LIMIT 20;

\echo ''
\echo '13. MOST FREQUENTLY CALLED QUERIES'
\echo '----------------------------------------'
SELECT
    calls,
    ROUND(total_exec_time::numeric, 2) AS total_ms,
    ROUND(mean_exec_time::numeric, 2) AS avg_ms,
    left(query, 120) AS query_preview
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
    AND query NOT LIKE '%pg_catalog%'
ORDER BY calls DESC
LIMIT 20;

\echo ''
\echo '14. CONNECTION POOL STATISTICS'
\echo '----------------------------------------'
SELECT
    count(*) FILTER (WHERE state = 'active') AS active,
    count(*) FILTER (WHERE state = 'idle') AS idle,
    count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
    count(*) FILTER (WHERE state = 'idle in transaction (aborted)') AS idle_in_transaction_aborted,
    count(*) AS total_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    ROUND((count(*)::numeric / (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')) * 100, 2) AS usage_percent
FROM pg_stat_activity
WHERE pid <> pg_backend_pid();

\echo ''
\echo '15. LOCKS AND BLOCKING QUERIES'
\echo '----------------------------------------'
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

\echo ''
\echo '============================================'
\echo 'DIAGNOSTICS COMPLETE'
\echo '============================================'
\echo 'Review the output above to identify:'
\echo '  1. Tables with high bloat (need VACUUM)'
\echo '  2. Missing indexes (high sequential scans)'
\echo '  3. Unused indexes (candidates for removal)'
\echo '  4. Slow queries (optimization targets)'
\echo '  5. Connection pool issues'
\echo '============================================'
