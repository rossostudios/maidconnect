#!/bin/bash
# Manual Database Backup Script
# Creates a timestamped backup of your local Supabase database

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/casaora_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Creating database backup..."
echo "Target: $BACKUP_FILE"
echo ""

# Create backup with compression
pg_dump -h 127.0.0.1 -p 54322 -U postgres -d postgres \
    --schema=public \
    --no-owner \
    --no-acl \
    --format=plain \
    | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo ""
    echo "✅ Backup created successfully!"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $BACKUP_SIZE"
    echo ""
    echo "To restore this backup:"
    echo "  gunzip -c $BACKUP_FILE | psql -h 127.0.0.1 -p 54322 -U postgres -d postgres"
else
    echo ""
    echo "❌ Backup failed!"
    exit 1
fi

# Clean up old backups (keep last 10)
echo "Cleaning up old backups (keeping last 10)..."
ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm
echo ""
echo "📊 Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"
