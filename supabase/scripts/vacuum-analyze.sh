#!/bin/bash
# Database Maintenance Script - VACUUM and ANALYZE
# Prevents table bloat and updates query planner statistics

set -e

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

echo "🧹 Running database maintenance..."
echo "Target: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo ""

# VACUUM ANALYZE all tables (lightweight, safe for production)
echo "Running VACUUM ANALYZE on all tables..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "VACUUM ANALYZE;"

# Get table sizes before and after
echo ""
echo "Table sizes after maintenance:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
        pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) AS indexes_size
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
    LIMIT 20;
"

# Update statistics for query planner
echo ""
echo "Updating query planner statistics..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE;"

echo ""
echo "✅ Database maintenance complete!"
