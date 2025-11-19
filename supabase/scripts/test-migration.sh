#!/bin/bash
# Migration Testing Script
# Tests migrations in isolated Docker environment before applying to local/production

set -e

MIGRATION_FILE="$1"

if [ -z "$MIGRATION_FILE" ]; then
    echo "Usage: ./test-migration.sh <migration_file.sql>"
    echo ""
    echo "Example: ./test-migration.sh supabase/migrations/20250119_new_feature.sql"
    exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "🧪 Testing migration: $(basename "$MIGRATION_FILE")"
echo ""

# Start test database
echo "Starting isolated test database..."
docker compose -f docker-compose.db.yml --profile testing up -d db-test

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Test the migration
echo ""
echo "Applying migration to test database..."
docker exec -i casaora-db-test psql -U postgres -d postgres < "$MIGRATION_FILE"

# Verify migration success
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Verifying database state..."

    # Show tables
    docker exec -i casaora-db-test psql -U postgres -d postgres -c "\dt"

    echo ""
    echo "Run manual verification queries if needed:"
    echo "  docker exec -it casaora-db-test psql -U postgres -d postgres"
    echo ""
    echo "When done testing:"
    echo "  docker compose -f docker-compose.db.yml --profile testing down -v"
else
    echo ""
    echo "❌ Migration failed! Check output above for errors."
    echo ""
    echo "Debug with:"
    echo "  docker exec -it casaora-db-test psql -U postgres -d postgres"
    exit 1
fi
