# Database Docker Toolkit

Comprehensive Docker-based tools for optimizing your Supabase PostgreSQL database development workflow.

## 🚀 Quick Start

```bash
# Start core database tools (pgAdmin + PgHero)
docker compose -f docker-compose.db.yml up -d

# Access tools:
# - pgAdmin: http://localhost:5050
# - PgHero: http://localhost:8080
```

## 📦 Available Tools

### 1. **pgAdmin** - Visual Database Management
- **URL:** http://localhost:5050
- **Credentials:** admin@casaora.local / admin
- **Features:**
  - Visual query builder
  - Schema designer
  - Query execution and analysis
  - Import/export data
  - Database monitoring

**Pre-configured connections:**
- **Casaora Local** - Your running Supabase instance (port 54322)
- **Casaora Test** - Isolated testing environment

### 2. **PgHero** - Performance Monitoring
- **URL:** http://localhost:8080
- **Credentials:** admin / admin
- **Features:**
  - Slow query analysis
  - Index suggestions
  - Query performance charts
  - Real-time database metrics
  - Connection pool monitoring

### 3. **Test Database** - Migration Testing
- **Port:** 54325
- **Purpose:** Isolated environment for testing migrations
- **Usage:**

```bash
# Start test database
docker compose -f docker-compose.db.yml --profile testing up -d db-test

# Test a migration
./supabase/scripts/test-migration.sh supabase/migrations/20250119_new_feature.sql

# Verify manually
docker exec -it casaora-db-test psql -U postgres -d postgres

# Clean up
docker compose -f docker-compose.db.yml --profile testing down -v
```

### 4. **Automated Backups**
- **Schedule:** Daily at midnight (configurable)
- **Retention:** 7 days, 4 weeks, 6 months
- **Location:** `./backups/`

```bash
# Start automated backup service
docker compose -f docker-compose.db.yml --profile backup up -d db-backup

# Create manual backup
./supabase/scripts/backup-now.sh

# Restore from backup
gunzip -c backups/casaora_backup_20250119_120000.sql.gz | \
  psql -h 127.0.0.1 -p 54322 -U postgres -d postgres
```

### 5. **Redis Cache** (Optional)
- **Port:** 6379
- **Purpose:** Future caching optimization
- **Usage:**

```bash
# Start Redis
docker compose -f docker-compose.db.yml --profile cache up -d redis

# Connect with redis-cli
docker exec -it casaora-redis redis-cli
```

## 🛠️ Database Analysis Scripts

### Slow Query Analysis
Identify performance bottlenecks:

```bash
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/scripts/analyze-slow-queries.sql
```

**What it shows:**
- Top 20 slowest queries by total time
- Queries with highest average execution time
- Most frequently called queries
- High variability queries (optimization targets)
- Sequential scans (missing indexes)
- Cache hit ratio
- Table bloat analysis

### Index Optimization
Find missing, unused, or duplicate indexes:

```bash
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/scripts/optimize-indexes.sql
```

**Recommendations include:**
- Missing indexes on foreign keys
- Unused indexes (candidates for removal)
- Duplicate indexes (same columns)
- Index bloat analysis
- Suggested indexes based on sequential scans

### Database Maintenance
Prevent bloat and update statistics:

```bash
./supabase/scripts/vacuum-analyze.sh
```

**Actions performed:**
- VACUUM ANALYZE all tables
- Update query planner statistics
- Report table sizes
- Clear dead tuples

## 📊 Performance Monitoring Workflow

### Daily Workflow
1. **Check PgHero dashboard** - http://localhost:8080
   - Review slow queries
   - Check for new index suggestions
   - Monitor cache hit ratio (should be >99%)

2. **Run weekly analysis:**
   ```bash
   # Slow queries
   psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
     -f supabase/scripts/analyze-slow-queries.sql > reports/slow-queries-$(date +%Y%m%d).txt

   # Index analysis
   psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
     -f supabase/scripts/optimize-indexes.sql > reports/indexes-$(date +%Y%m%d).txt
   ```

3. **Monthly maintenance:**
   ```bash
   ./supabase/scripts/vacuum-analyze.sh
   ```

### Before Deploying Migrations

1. **Test in isolated environment:**
   ```bash
   ./supabase/scripts/test-migration.sh supabase/migrations/20250119_new_feature.sql
   ```

2. **Verify migration safety:**
   - Check for blocking locks
   - Validate index creation strategy
   - Test rollback if needed

3. **Apply to local Supabase:**
   ```bash
   supabase db push
   ```

4. **Monitor performance:**
   - Run slow query analysis
   - Check PgHero for new bottlenecks
   - Verify cache hit ratio remains high

## 🔍 Common Optimization Tasks

### Finding Missing Indexes

**Symptom:** Slow queries on filtered columns

```bash
# Check sequential scans
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
  SELECT schemaname, tablename, seq_scan, idx_scan
  FROM pg_stat_user_tables
  WHERE seq_scan > 1000
  ORDER BY seq_scan DESC;
"

# Get index suggestions
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/scripts/optimize-indexes.sql
```

### Removing Unused Indexes

**Symptom:** High disk usage, slow writes

```bash
# Find unused indexes
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
  SELECT schemaname, tablename, indexname,
         pg_size_pretty(pg_relation_size(indexrelid)) AS size
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
  ORDER BY pg_relation_size(indexrelid) DESC;
"

# Drop unused index (after verification!)
# CREATE MIGRATION: supabase migration new drop_unused_index_xyz
# Add: DROP INDEX IF EXISTS idx_xyz;
```

### Optimizing Large Tables

**Symptom:** Table bloat, slow queries

```bash
# Check table sizes and bloat
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
  SELECT
    schemaname, tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
    n_dead_tup AS dead_tuples
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
  LIMIT 20;
"

# Fix with VACUUM
./supabase/scripts/vacuum-analyze.sh
```

### Optimizing Slow Queries

**Workflow:**
1. **Identify slow query** (PgHero or slow query script)
2. **Analyze execution plan:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM bookings WHERE professional_id = 'xxx';
   ```
3. **Check for:**
   - Sequential scans → Add index
   - High cost operations → Rewrite query
   - Missing statistics → Run ANALYZE
4. **Test optimization in isolated environment**
5. **Create migration if schema change needed**

## 📈 Key Metrics to Monitor

### Database Health
- **Cache Hit Ratio:** >99% (check PgHero)
- **Connection Pool:** <80% utilization
- **Query Duration:** P95 <100ms
- **Dead Tuples:** <5% of live tuples

### Query Performance
- **Slow Query Threshold:** >100ms
- **Sequential Scans:** Minimize on large tables
- **Index Usage:** >95% index scans vs seq scans

### Storage
- **Table Bloat:** <10% dead tuples
- **Index Bloat:** Monitor unused indexes >100MB
- **Database Size Growth:** Linear, predictable

## 🔧 Docker Compose Profiles

Control which services run:

```bash
# Core tools only (pgAdmin + PgHero)
docker compose -f docker-compose.db.yml up -d

# Add testing database
docker compose -f docker-compose.db.yml --profile testing up -d

# Add automated backups
docker compose -f docker-compose.db.yml --profile backup up -d

# Add Redis cache
docker compose -f docker-compose.db.yml --profile cache up -d

# All services
docker compose -f docker-compose.db.yml \
  --profile testing \
  --profile backup \
  --profile cache \
  up -d

# Stop all services
docker compose -f docker-compose.db.yml down
```

## 🚨 Troubleshooting

### pgAdmin won't connect
```bash
# Verify Supabase is running
supabase status

# Check pgAdmin logs
docker logs casaora-pgadmin

# Recreate pgAdmin container
docker compose -f docker-compose.db.yml up -d --force-recreate pgadmin
```

### PgHero shows "Connection refused"
```bash
# Verify database is accessible
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "SELECT version();"

# Check PgHero logs
docker logs casaora-pghero

# Restart PgHero
docker compose -f docker-compose.db.yml restart pghero
```

### Migration test fails
```bash
# Check test database logs
docker logs casaora-db-test

# Connect to debug
docker exec -it casaora-db-test psql -U postgres -d postgres

# Reset test database
docker compose -f docker-compose.db.yml --profile testing down -v
docker compose -f docker-compose.db.yml --profile testing up -d db-test
```

## 📚 Additional Resources

- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [PgHero Documentation](https://github.com/ankane/pghero)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

## 🔐 Security Notes

**Local Development Only:**
- Default credentials are for local use only
- Never commit credentials to git
- Use strong passwords in production
- Enable SSL/TLS for remote connections
- Restrict network access in production

**Backup Security:**
- Backups are stored unencrypted locally
- Encrypt backups before uploading to cloud storage
- Rotate backups regularly
- Test restore procedures monthly

---

**Last Updated:** 2025-01-19
**Version:** 1.0.0
