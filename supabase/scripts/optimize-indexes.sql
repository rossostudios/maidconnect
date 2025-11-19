-- Database Index Optimization Script
-- Identifies missing indexes and suggests optimizations

-- Find missing indexes on foreign key columns
SELECT
    c.conrelid::regclass AS table_name,
    a.attname AS column_name,
    'CREATE INDEX idx_' || c.conrelid::regclass || '_' || a.attname ||
    ' ON ' || c.conrelid::regclass || '(' || a.attname || ');' AS suggested_index
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.contype = 'f'
    AND NOT EXISTS (
        SELECT 1
        FROM pg_index i
        WHERE i.indrelid = c.conrelid
            AND a.attnum = ANY(i.indkey)
    )
ORDER BY table_name, column_name;

-- Unused indexes (candidates for removal)
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexrelid::regclass::text NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Duplicate indexes (same columns, different names)
SELECT
    a.indrelid::regclass AS table_name,
    a.indexrelid::regclass AS index1,
    b.indexrelid::regclass AS index2,
    pg_get_indexdef(a.indexrelid) AS index1_def,
    pg_get_indexdef(b.indexrelid) AS index2_def
FROM pg_index a
JOIN pg_index b ON a.indrelid = b.indrelid
    AND a.indexrelid > b.indexrelid
    AND a.indkey = b.indkey
ORDER BY table_name;

-- Index bloat analysis
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    ROUND((idx_tup_read / NULLIF(idx_scan, 0)), 2) AS avg_tuples_per_scan
FROM pg_stat_user_indexes
WHERE idx_scan > 0
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- Recommended indexes based on sequential scans
SELECT
    schemaname || '.' || tablename AS table_name,
    'CREATE INDEX idx_' || tablename || '_common ON ' ||
    schemaname || '.' || tablename || ' (/* Add frequently filtered columns */);' AS suggested_index,
    seq_scan AS sequential_scans,
    seq_tup_read AS rows_read_sequentially
FROM pg_stat_user_tables
WHERE seq_scan > 1000
    AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY seq_tup_read DESC
LIMIT 20;
