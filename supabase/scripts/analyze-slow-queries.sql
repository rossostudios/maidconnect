-- Analyze Slow Queries
-- Run this to identify performance bottlenecks in your database
-- Usage: psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f analyze-slow-queries.sql

-- Enable pg_stat_statements if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 20 slowest queries by total execution time
SELECT
    query,
    calls,
    ROUND(total_exec_time::numeric, 2) AS total_time_ms,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    ROUND(max_exec_time::numeric, 2) AS max_time_ms,
    ROUND(stddev_exec_time::numeric, 2) AS stddev_time_ms,
    ROUND((total_exec_time / SUM(total_exec_time) OVER ()) * 100, 2) AS percent_total
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 20;

-- Queries with highest average execution time
SELECT
    query,
    calls,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    ROUND(min_exec_time::numeric, 2) AS min_time_ms,
    ROUND(max_exec_time::numeric, 2) AS max_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
    AND calls > 10
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Most frequently called queries
SELECT
    query,
    calls,
    ROUND(total_exec_time::numeric, 2) AS total_time_ms,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 20;

-- Queries with high variability (potential optimization targets)
SELECT
    query,
    calls,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    ROUND(stddev_exec_time::numeric, 2) AS stddev_time_ms,
    ROUND((stddev_exec_time / NULLIF(mean_exec_time, 0)) * 100, 2) AS coefficient_variation
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
    AND calls > 10
    AND mean_exec_time > 0
ORDER BY (stddev_exec_time / NULLIF(mean_exec_time, 0)) DESC
LIMIT 20;

-- Queries causing sequential scans (missing indexes?)
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    ROUND((seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0)) * 100, 2) AS seq_scan_percent
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_scan DESC
LIMIT 20;

-- Cache hit ratio (should be > 99% in production)
SELECT
    'Cache Hit Ratio' AS metric,
    ROUND(
        (SUM(blks_hit) / NULLIF(SUM(blks_hit + blks_read), 0)) * 100,
        2
    ) AS percentage
FROM pg_stat_database
WHERE datname = current_database();

-- Table bloat analysis
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
    n_dead_tup AS dead_tuples,
    ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 2) AS dead_tuple_percent
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC
LIMIT 20;
