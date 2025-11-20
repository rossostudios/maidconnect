#!/bin/bash

# =====================================================
# Supabase Schema Validation Script
# =====================================================
# Compares local database schema with production to detect drift
# Run before migrations to ensure consistency

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCAL_DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"
REMOTE_PROJECT_REF="${SUPABASE_PROJECT_REF:-hvnetxfsrtplextvtwfx}"

# =====================================================
# Helper Functions
# =====================================================

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Supabase Schema Validation${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check prerequisites
if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
    log_error "SUPABASE_DB_PASSWORD environment variable not set"
    echo ""
    echo "To get your database password:"
    echo "  1. Go to: https://supabase.com/dashboard/project/${REMOTE_PROJECT_REF}/settings/database"
    echo "  2. Copy the 'Database Password' under 'Connection string'"
    echo "  3. Export it: export SUPABASE_DB_PASSWORD='your-password-here'"
    echo ""
    exit 1
fi

if ! command -v psql &> /dev/null; then
    log_error "psql command not found"
    echo ""
    echo "Please install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo ""
    exit 1
fi

log_success "Prerequisites checked"
echo ""

run_local_query() {
    docker exec -i supabase_db_maidconnect psql -U postgres -d postgres -t -A -c "$1" 2>/dev/null || echo "ERROR"
}

run_remote_query() {
    # Get connection string from Supabase
    # Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
    local REMOTE_PASSWORD="${SUPABASE_DB_PASSWORD:-}"

    if [ -z "$REMOTE_PASSWORD" ]; then
        echo "ERROR: SUPABASE_DB_PASSWORD not set" >&2
        echo "ERROR"
        return 1
    fi

    PGPASSWORD="$REMOTE_PASSWORD" psql \
        "postgresql://postgres@db.${REMOTE_PROJECT_REF}.supabase.co:5432/postgres" \
        -t -A -c "$1" 2>/dev/null || echo "ERROR"
}

# =====================================================
# 1. Check Migration Status
# =====================================================

echo -e "${BLUE}[1/7] Checking Migration Status...${NC}"
echo ""

# Get local migrations
LOCAL_MIGRATIONS=$(run_local_query "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;")
LOCAL_COUNT=$(echo "$LOCAL_MIGRATIONS" | grep -v "^ERROR$" | wc -l | tr -d ' ')

# Get remote migrations
REMOTE_MIGRATIONS=$(run_remote_query "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;")
REMOTE_COUNT=$(echo "$REMOTE_MIGRATIONS" | grep -v "^ERROR$" | wc -l | tr -d ' ')

echo "Local migrations applied: $LOCAL_COUNT"
echo "Remote migrations applied: $REMOTE_COUNT"
echo ""

# Find differences
MISSING_LOCAL=$(comm -13 <(echo "$LOCAL_MIGRATIONS" | sort) <(echo "$REMOTE_MIGRATIONS" | sort) | grep -v "^$")
MISSING_REMOTE=$(comm -23 <(echo "$LOCAL_MIGRATIONS" | sort) <(echo "$REMOTE_MIGRATIONS" | sort) | grep -v "^$")

if [ -n "$MISSING_LOCAL" ]; then
    log_error "Migrations in REMOTE but not LOCAL:"
    echo "$MISSING_LOCAL" | sed 's/^/  /'
    echo ""
fi

if [ -n "$MISSING_REMOTE" ]; then
    log_warning "Migrations in LOCAL but not REMOTE:"
    echo "$MISSING_REMOTE" | sed 's/^/  /'
    echo ""
fi

if [ -z "$MISSING_LOCAL" ] && [ -z "$MISSING_REMOTE" ]; then
    log_success "Migration versions match"
fi

echo ""

# =====================================================
# 2. Compare Table Schemas
# =====================================================

echo -e "${BLUE}[2/7] Comparing Table Schemas...${NC}"
echo ""

# Get table list from local
LOCAL_TABLES=$(run_local_query "
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
")

# Get table list from remote
REMOTE_TABLES=$(run_remote_query "
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
")

# Find table differences
TABLES_MISSING_LOCAL=$(comm -13 <(echo "$LOCAL_TABLES" | sort) <(echo "$REMOTE_TABLES" | sort) | grep -v "^$")
TABLES_MISSING_REMOTE=$(comm -23 <(echo "$LOCAL_TABLES" | sort) <(echo "$REMOTE_TABLES" | sort) | grep -v "^$")

if [ -n "$TABLES_MISSING_LOCAL" ]; then
    log_error "Tables in REMOTE but not LOCAL:"
    echo "$TABLES_MISSING_LOCAL" | sed 's/^/  /'
    echo ""
fi

if [ -n "$TABLES_MISSING_REMOTE" ]; then
    log_warning "Tables in LOCAL but not REMOTE:"
    echo "$TABLES_MISSING_REMOTE" | sed 's/^/  /'
    echo ""
fi

if [ -z "$TABLES_MISSING_LOCAL" ] && [ -z "$TABLES_MISSING_REMOTE" ]; then
    log_success "Table lists match"
fi

echo ""

# =====================================================
# 3. Compare Column Definitions
# =====================================================

echo -e "${BLUE}[3/7] Comparing Column Definitions...${NC}"
echo ""

COLUMN_DIFFS=0

for table in $(echo "$LOCAL_TABLES" | sort); do
    # Get local columns
    LOCAL_COLUMNS=$(run_local_query "
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '$table'
        ORDER BY ordinal_position;
    ")

    # Get remote columns
    REMOTE_COLUMNS=$(run_remote_query "
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '$table'
        ORDER BY ordinal_position;
    ")

    # Compare
    if [ "$LOCAL_COLUMNS" != "$REMOTE_COLUMNS" ]; then
        log_error "Column mismatch in table: $table"
        COLUMN_DIFFS=$((COLUMN_DIFFS + 1))

        # Find specific differences
        COLS_MISSING_LOCAL=$(comm -13 <(echo "$LOCAL_COLUMNS" | sort) <(echo "$REMOTE_COLUMNS" | sort) | grep -v "^$")
        COLS_MISSING_REMOTE=$(comm -23 <(echo "$LOCAL_COLUMNS" | sort) <(echo "$REMOTE_COLUMNS" | sort) | grep -v "^$")

        if [ -n "$COLS_MISSING_LOCAL" ]; then
            echo "  Columns in REMOTE but not LOCAL:"
            echo "$COLS_MISSING_LOCAL" | sed 's/^/    /'
        fi

        if [ -n "$COLS_MISSING_REMOTE" ]; then
            echo "  Columns in LOCAL but not REMOTE:"
            echo "$COLS_MISSING_REMOTE" | sed 's/^/    /'
        fi
        echo ""
    fi
done

if [ $COLUMN_DIFFS -eq 0 ]; then
    log_success "All column definitions match"
else
    log_error "Found $COLUMN_DIFFS tables with column mismatches"
fi

echo ""

# =====================================================
# 4. Check for *_cop Columns (Should Be Removed)
# =====================================================

echo -e "${BLUE}[4/7] Checking for Legacy *_cop Columns...${NC}"
echo ""

LOCAL_COP_COLUMNS=$(run_local_query "
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name LIKE '%_cop'
    ORDER BY table_name, column_name;
")

REMOTE_COP_COLUMNS=$(run_remote_query "
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name LIKE '%_cop'
    ORDER BY table_name, column_name;
")

if [ -n "$LOCAL_COP_COLUMNS" ] && [ "$LOCAL_COP_COLUMNS" != "ERROR" ]; then
    log_error "Legacy *_cop columns found in LOCAL:"
    echo "$LOCAL_COP_COLUMNS" | sed 's/^/  /'
    echo ""
else
    log_success "No legacy *_cop columns in LOCAL"
fi

if [ -n "$REMOTE_COP_COLUMNS" ] && [ "$REMOTE_COP_COLUMNS" != "ERROR" ]; then
    log_warning "Legacy *_cop columns found in REMOTE:"
    echo "$REMOTE_COP_COLUMNS" | sed 's/^/  /'
    echo ""
else
    log_success "No legacy *_cop columns in REMOTE"
fi

echo ""

# =====================================================
# 5. Compare Constraints
# =====================================================

echo -e "${BLUE}[5/7] Comparing Table Constraints...${NC}"
echo ""

LOCAL_CONSTRAINTS=$(run_local_query "
    SELECT conname, conrelid::regclass::text, contype
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
    ORDER BY conname;
")

REMOTE_CONSTRAINTS=$(run_remote_query "
    SELECT conname, conrelid::regclass::text, contype
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
    ORDER BY conname;
")

CONSTRAINTS_MISSING_LOCAL=$(comm -13 <(echo "$LOCAL_CONSTRAINTS" | sort) <(echo "$REMOTE_CONSTRAINTS" | sort) | grep -v "^$")
CONSTRAINTS_MISSING_REMOTE=$(comm -23 <(echo "$LOCAL_CONSTRAINTS" | sort) <(echo "$REMOTE_CONSTRAINTS" | sort) | grep -v "^$")

if [ -n "$CONSTRAINTS_MISSING_LOCAL" ]; then
    log_error "Constraints in REMOTE but not LOCAL:"
    echo "$CONSTRAINTS_MISSING_LOCAL" | sed 's/^/  /'
    echo ""
fi

if [ -n "$CONSTRAINTS_MISSING_REMOTE" ]; then
    log_warning "Constraints in LOCAL but not REMOTE:"
    echo "$CONSTRAINTS_MISSING_REMOTE" | sed 's/^/  /'
    echo ""
fi

if [ -z "$CONSTRAINTS_MISSING_LOCAL" ] && [ -z "$CONSTRAINTS_MISSING_REMOTE" ]; then
    log_success "Constraints match"
fi

echo ""

# =====================================================
# 6. Compare RLS Policies
# =====================================================

echo -e "${BLUE}[6/7] Comparing RLS Policies...${NC}"
echo ""

LOCAL_POLICIES=$(run_local_query "
    SELECT schemaname, tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
")

REMOTE_POLICIES=$(run_remote_query "
    SELECT schemaname, tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
")

POLICIES_MISSING_LOCAL=$(comm -13 <(echo "$LOCAL_POLICIES" | sort) <(echo "$REMOTE_POLICIES" | sort) | grep -v "^$")
POLICIES_MISSING_REMOTE=$(comm -23 <(echo "$LOCAL_POLICIES" | sort) <(echo "$REMOTE_POLICIES" | sort) | grep -v "^$")

if [ -n "$POLICIES_MISSING_LOCAL" ]; then
    log_error "RLS Policies in REMOTE but not LOCAL:"
    echo "$POLICIES_MISSING_LOCAL" | sed 's/^/  /'
    echo ""
fi

if [ -n "$POLICIES_MISSING_REMOTE" ]; then
    log_warning "RLS Policies in LOCAL but not REMOTE:"
    echo "$POLICIES_MISSING_REMOTE" | sed 's/^/  /'
    echo ""
fi

if [ -z "$POLICIES_MISSING_LOCAL" ] && [ -z "$POLICIES_MISSING_REMOTE" ]; then
    log_success "RLS policies match"
fi

echo ""

# =====================================================
# 7. Compare Functions
# =====================================================

echo -e "${BLUE}[7/7] Comparing Database Functions...${NC}"
echo ""

LOCAL_FUNCTIONS=$(run_local_query "
    SELECT n.nspname || '.' || p.proname as function_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public', 'private')
    ORDER BY function_name;
")

REMOTE_FUNCTIONS=$(run_remote_query "
    SELECT n.nspname || '.' || p.proname as function_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public', 'private')
    ORDER BY function_name;
")

FUNCTIONS_MISSING_LOCAL=$(comm -13 <(echo "$LOCAL_FUNCTIONS" | sort) <(echo "$REMOTE_FUNCTIONS" | sort) | grep -v "^$")
FUNCTIONS_MISSING_REMOTE=$(comm -23 <(echo "$LOCAL_FUNCTIONS" | sort) <(echo "$REMOTE_FUNCTIONS" | sort) | grep -v "^$")

if [ -n "$FUNCTIONS_MISSING_LOCAL" ]; then
    log_error "Functions in REMOTE but not LOCAL:"
    echo "$FUNCTIONS_MISSING_LOCAL" | sed 's/^/  /'
    echo ""
fi

if [ -n "$FUNCTIONS_MISSING_REMOTE" ]; then
    log_warning "Functions in LOCAL but not REMOTE:"
    echo "$FUNCTIONS_MISSING_REMOTE" | sed 's/^/  /'
    echo ""
fi

if [ -z "$FUNCTIONS_MISSING_LOCAL" ] && [ -z "$FUNCTIONS_MISSING_REMOTE" ]; then
    log_success "Functions match"
fi

echo ""

# =====================================================
# Summary
# =====================================================

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Count total issues
TOTAL_ISSUES=0

[ -n "$MISSING_LOCAL" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$MISSING_REMOTE" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$TABLES_MISSING_LOCAL" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$TABLES_MISSING_REMOTE" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ $COLUMN_DIFFS -gt 0 ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$CONSTRAINTS_MISSING_LOCAL" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$CONSTRAINTS_MISSING_REMOTE" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$POLICIES_MISSING_LOCAL" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$POLICIES_MISSING_REMOTE" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$FUNCTIONS_MISSING_LOCAL" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ -n "$FUNCTIONS_MISSING_REMOTE" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))

if [ $TOTAL_ISSUES -eq 0 ]; then
    log_success "LOCAL and REMOTE databases are in sync!"
else
    log_error "Found $TOTAL_ISSUES schema differences between LOCAL and REMOTE"
    echo ""
    echo -e "${YELLOW}Recommended actions:${NC}"

    if [ -n "$MISSING_REMOTE" ]; then
        echo "  1. Push local migrations to remote: supabase db push"
    fi

    if [ -n "$MISSING_LOCAL" ] || [ -n "$TABLES_MISSING_LOCAL" ] || [ -n "$CONSTRAINTS_MISSING_LOCAL" ]; then
        echo "  2. Pull remote schema changes: supabase db pull"
    fi

    if [ $COLUMN_DIFFS -gt 0 ]; then
        echo "  3. Review column mismatches manually"
    fi

    echo ""
    echo "  After fixing, re-run this script to verify sync."
fi

echo ""

# Exit with error code if issues found
exit $TOTAL_ISSUES
