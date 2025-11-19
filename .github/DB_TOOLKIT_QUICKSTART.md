# Database Toolkit - Quick Reference

## 🎯 One-Command Workflows

### Daily Development
```bash
# Start database tools
docker compose -f docker-compose.db.yml up -d

# Access:
# pgAdmin:  http://localhost:5050 (admin@casaora.local / admin)
# PgHero:   http://localhost:8080 (admin / admin)
```

### Before Merging PR
```bash
# Test migration
./supabase/scripts/test-migration.sh supabase/migrations/20250119_new.sql

# Check performance impact
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/scripts/analyze-slow-queries.sql

# Create backup
./supabase/scripts/backup-now.sh
```

### Weekly Maintenance
```bash
# Optimize database
./supabase/scripts/vacuum-analyze.sh

# Check indexes
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/scripts/optimize-indexes.sql
```

## 🔥 Emergency Commands

### Database Running Slow
```bash
# 1. Check PgHero: http://localhost:8080
# 2. Find slow queries:
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/scripts/analyze-slow-queries.sql

# 3. Quick fix - vacuum and analyze:
./supabase/scripts/vacuum-analyze.sh
```

### Migration Broke Production
```bash
# Restore from latest backup
LATEST_BACKUP=$(ls -t backups/*.sql.gz | head -1)
gunzip -c "$LATEST_BACKUP" | psql -h 127.0.0.1 -p 54322 -U postgres -d postgres

# Or use Supabase CLI:
supabase db reset
```

### Need to Debug Complex Query
```bash
# Open pgAdmin: http://localhost:5050
# Connect to "Casaora Local"
# Use visual EXPLAIN tool
```

## 📋 Common Tasks

### Create & Test Migration
```bash
# 1. Create migration
supabase migration new add_instant_payouts

# 2. Write SQL in: supabase/migrations/20250119_xxx.sql

# 3. Test in isolation
./supabase/scripts/test-migration.sh supabase/migrations/20250119_xxx.sql

# 4. Apply to local
supabase db push

# 5. Verify
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "\dt"
```

### Optimize Slow Endpoint
```bash
# 1. Identify slow endpoint in app logs
# 2. Find corresponding query in PgHero slow queries
# 3. Get execution plan:
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres
\x
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;

# 4. Add index if needed:
supabase migration new optimize_booking_queries
# Add: CREATE INDEX CONCURRENTLY ...

# 5. Test migration
./supabase/scripts/test-migration.sh supabase/migrations/20250119_optimize.sql
```

### Clean Up Unused Indexes
```bash
# 1. Find unused indexes
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/scripts/optimize-indexes.sql | grep "unused"

# 2. Verify they're truly unused (check production!)
# 3. Create migration to drop them
supabase migration new cleanup_unused_indexes
# Add: DROP INDEX IF EXISTS idx_xyz;
```

## 🚦 Health Check Checklist

Run weekly before standup:

```bash
# ✅ Cache hit ratio >99%
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
  SELECT ROUND((SUM(blks_hit) / NULLIF(SUM(blks_hit + blks_read), 0)) * 100, 2)
  FROM pg_stat_database WHERE datname = 'postgres';
"

# ✅ No runaway queries (all <1s)
# Check PgHero: http://localhost:8080

# ✅ Dead tuples <5%
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
  SELECT tablename, ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 2)
  FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;
"

# ✅ Backups exist
ls -lh backups/*.sql.gz | tail -5
```

## 🛑 Stop All Services
```bash
docker compose -f docker-compose.db.yml down
```

## 📖 Full Documentation
See [docs/database-docker-toolkit.md](../docs/database-docker-toolkit.md)
