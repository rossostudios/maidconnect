# Multi-Country Data Model Migration Guide

**Status:** ✅ Complete - Ready for Staging Deployment
**Date:** 2025-11-19
**Author:** AI Assistant
**Ticket:** Request 2.1 - Data Model & RLS for Multi-Country Expansion

---

## 📋 Overview

This migration adds comprehensive multi-country support to Casaora, enabling operations across Colombia (CO), Paraguay (PY), Uruguay (UY), and Argentina (AR). The migration ensures data isolation, currency validation, and proper access control for multi-market operations.

---

## 🎯 What Was Accomplished

### 5 Migration Files Created

1. **[20251119190424_add_country_city_to_profiles.sql](../../supabase/migrations/20251119190424_add_country_city_to_profiles.sql)**
   - Adds `country_code` (ISO 3166-1 alpha-2) and `city_id` (UUID FK) to `profiles` table
   - Backfills from legacy text `country`/`city` columns
   - Creates foreign key constraints to `countries` and `cities` tables
   - Adds indexes for filtering and joins

2. **[20251119190516_add_country_city_to_professional_profiles.sql](../../supabase/migrations/20251119190516_add_country_city_to_professional_profiles.sql)**
   - Same pattern applied to `professional_profiles` table
   - Ensures all professionals have validated country and city references
   - Enables market-specific professional listings

3. **[20251119190601_add_country_city_to_bookings.sql](../../supabase/migrations/20251119190601_add_country_city_to_bookings.sql)**
   - Adds `country_code` and `city_id` to `bookings` table
   - Backfills from professional's location (services delivered in pro's city)
   - **Critical:** Adds check constraint: currency must match country (CO→COP, PY→PYG, UY→UYU, AR→ARS)
   - **Critical:** Adds trigger function: validates customer and professional are in same country (PostgreSQL doesn't support subqueries in CHECK constraints)
   - Creates composite indexes for admin dashboard filtering

4. **[20251119190656_fix_payout_tables_multi_currency.sql](../../supabase/migrations/20251119190656_fix_payout_tables_multi_currency.sql)**
   - Renames all `*_cop` columns to `*_cents` (currency-agnostic)
   - Tables affected:
     - `professional_profiles`: `available_balance_cents`, `pending_balance_cents`, `total_earnings_cents`, `direct_hire_fee_cents`
     - `bookings`: `trial_credit_applied_cents`, `original_price_cents`
     - `payout_batches`: `total_amount_cents` + `country_code`/`currency_code`
     - `payout_transfers`: `amount_cents`, `fee_amount_cents` + `country_code`/`currency_code`
   - Adds currency validation: ensures currency matches country across all tables

5. **[20251119190755_add_country_aware_rls_policies.sql](../../supabase/migrations/20251119190755_add_country_aware_rls_policies.sql)**
   - Adds `assigned_countries` text[] to `profiles` table for admin country assignment
   - Creates helper function `private.user_can_access_country(text)` for RLS checks
   - Updates all RLS policies to enforce country boundaries:
     - **Admins:** Can only see/edit data in their `assigned_countries` array
     - **Professionals:** Can only see their own bookings/data (unchanged)
     - **Customers:** Can only see their own bookings/data (unchanged)
   - Prevents cross-country data leakage for future country-by-country partnerships

---

## 🔒 Security Features

- ✅ **Currency Validation:** Bookings can't have mismatched currency (e.g., Colombian booking with PYG)
- ✅ **Same-Country Enforcement:** Bookings require customer and professional in same country
- ✅ **Admin Data Isolation:** Admins can only access data from their assigned countries
- ✅ **Professional Isolation:** Professionals can only see their own bookings across all markets
- ✅ **Foreign Key Constraints:** All country/city references validated via FK to reference tables

---

## 📊 Database Impact

### New Columns Added

| Table | New Columns |
|-------|-------------|
| `profiles` | `country_code`, `city_id`, `assigned_countries` |
| `professional_profiles` | `country_code`, `city_id`, `available_balance_cents`, `pending_balance_cents`, `total_earnings_cents`, `direct_hire_fee_cents` |
| `bookings` | `country_code`, `city_id`, `trial_credit_applied_cents`, `original_price_cents` |
| `payout_batches` | `total_amount_cents`, `country_code`, `currency_code` |
| `payout_transfers` | `amount_cents`, `fee_amount_cents`, `country_code`, `currency_code` |

### Indexes Created

- 12 new indexes for country/city filtering and joins
- 1 GIN index on `profiles.assigned_countries` for array containment queries
- Composite indexes for common query patterns (e.g., `country_code + status`)

### Legacy Columns Preserved

All migration files include commented-out `DROP COLUMN` statements for legacy columns:
- Text `country`/`city` columns in `profiles` and `professional_profiles`
- All `*_cop` columns in payout/booking tables

**⚠️ DO NOT uncomment these until after production validation!**

---

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Checklist

- [ ] Review all 5 migration files in `supabase/migrations/`
- [ ] Ensure you have database backup (automated by Supabase)
- [ ] Verify staging environment is accessible
- [ ] Coordinate with team (migrations affect core tables)

### Step 2: Repair Migration History (if needed)

If you see "migration history mismatch" errors:

```bash
# Revert problematic migrations
supabase migration repair --status reverted 20250117000000
supabase migration repair --status reverted 20251107210000
supabase migration repair --status reverted 20251107220000

# Mark new migrations as applied (after they succeed)
supabase migration repair --status applied 20251119190424
supabase migration repair --status applied 20251119190516
supabase migration repair --status applied 20251119190601
supabase migration repair --status applied 20251119190656
supabase migration repair --status applied 20251119190755
```

### Step 3: Apply Migrations (Staging First!)

```bash
# 1. Start local Supabase (for testing)
supabase start

# 2. Apply migrations locally
supabase db push

# 3. Run validation queries
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/migrations/VALIDATION_QUERIES.sql

# 4. If all validation passes, apply to staging
supabase link --project-ref <staging-project-ref>
supabase db push

# 5. Run validation queries on staging
supabase db remote exec --file supabase/migrations/VALIDATION_QUERIES.sql

# 6. If staging validates, apply to production
supabase link --project-ref <production-project-ref>
supabase db push

# 7. Run validation queries on production
supabase db remote exec --file supabase/migrations/VALIDATION_QUERIES.sql
```

### Step 4: Run Validation Queries

Execute queries from `supabase/migrations/VALIDATION_QUERIES.sql`:

**Expected Results:**
1. ✅ All rows in `profiles`, `professional_profiles`, `bookings` have `country_code` and `city_id`
2. ✅ Zero currency mismatches (currency matches country for all bookings)
3. ✅ Zero cross-country bookings (customer and professional in same country)
4. ✅ All `payout_batches` and `payout_transfers` have `country_code` and `currency_code`
5. ✅ All admin users have `assigned_countries` (defaulted to `{CO,PY,UY,AR}`)
6. ✅ No orphaned cities (all cities have valid `country_code` FK)
7. ✅ RLS policies exist with "_country_aware" suffix

**If any violations found:** Investigate before proceeding!

### Step 5: Regenerate TypeScript Types

```bash
# After migrations applied successfully
supabase gen types typescript --linked > src/types/database.types.ts
```

### Step 6: Drop Legacy Columns (Production Only, After 30 Days)

After 30 days of production operation with zero issues:

1. Uncomment `DROP COLUMN` statements in migration files
2. Create new migration: `supabase migration new drop_legacy_country_columns`
3. Copy uncommented DROP statements to new migration
4. Test on staging → Apply to production

---

## 🧪 Testing & Validation

### Local Testing

```bash
# 1. Start local Supabase
supabase start

# 2. Apply migrations
supabase db push

# 3. Seed test data (optional)
# - Create profiles in different countries
# - Create bookings with different currencies
# - Test cross-country booking rejection

# 4. Run validation queries
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/migrations/VALIDATION_QUERIES.sql
```

### Manual Validation Checklist

- [ ] Create Colombian professional (country_code=CO, city_id=Bogotá)
- [ ] Create Paraguayan customer (country_code=PY, city_id=Asunción)
- [ ] Attempt cross-country booking → Should fail with constraint error
- [ ] Create same-country booking → Should succeed
- [ ] Verify admin assigned_countries limits data access
- [ ] Test currency validation (booking with wrong currency should fail)

---

## 🔧 Rollback Plan

If issues arise after deployment:

### Immediate Rollback (Within 1 Hour)

```bash
# Option 1: Revert migrations
supabase migration repair --status reverted 20251119190424
supabase migration repair --status reverted 20251119190516
supabase migration repair --status reverted 20251119190601
supabase migration repair --status reverted 20251119190656
supabase migration repair --status reverted 20251119190755

# Option 2: Restore from backup
supabase db restore --backup-id <backup-id>
```

### Data Preservation Rollback (After 1 Hour)

If migrations applied successfully but business logic issues found:

1. **DO NOT DROP NEW COLUMNS** - Data loss risk
2. Create reverse migration that:
   - Backfills legacy columns from new columns
   - Drops new FK constraints (but keeps columns)
   - Restores old RLS policies
3. Application code continues using legacy columns temporarily

---

## 📚 Related Documentation

- [Architecture Guide](../architecture.md) - Database schema overview
- [Security Guide](../security.md) - RLS policies and data isolation
- [Territory Configuration](../../src/lib/shared/config/territories.ts) - Application-layer country mapping
- [VALIDATION_QUERIES.sql](../../supabase/migrations/VALIDATION_QUERIES.sql) - Data validation queries

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Manual Admin Country Assignment:** Admins must be manually assigned countries via SQL:
   ```sql
   UPDATE profiles
   SET assigned_countries = ARRAY['CO', 'PY']
   WHERE id = '<admin-user-id>';
   ```

2. **Guest Bookings:** Guest bookings (anonymous) default to Colombia (CO) market
   - Future: Detect country from IP geolocation

3. **Migration Dependencies:** Requires `20251119170320_add_multi_country_support.sql` to have been applied first
   - This migration created `countries` and `cities` reference tables

### Potential Issues

**Issue:** Backfill city matching fails due to typos
**Solution:** Validation queries identify unmatched cities → Manual review required

**Issue:** Admin loses access to data after assigned_countries added
**Solution:** Default all existing admins to `{CO,PY,UY,AR}` (handled in migration)

**Issue:** Currency mismatch constraint blocks existing bookings
**Solution:** Migration backfills currency from country → No existing violations expected

### Implementation Notes

**Fixed:** Original migration used CHECK constraint with subquery to validate same-country bookings
**Solution:** Replaced with trigger function `private.validate_booking_same_country()` (PostgreSQL doesn't support subqueries in CHECK constraints)

**Fixed:** Original RLS policy attempted to use `user_agent` column from guest_sessions table
**Solution:** Simplified to match existing pattern: `guest_session_id IN (SELECT id FROM guest_sessions)`

---

## 📞 Support & Questions

**For Migration Issues:**
- Check Supabase logs: `supabase db logs`
- Run validation queries to identify specific issues
- Review migration file comments for troubleshooting tips

**For RLS Policy Issues:**
- Test policies as different user roles: `SET LOCAL ROLE authenticated; SET LOCAL "request.jwt.claims" = '{"sub":"<user-id>"}'`
- Review policy definitions: `SELECT * FROM pg_policies WHERE schemaname = 'public'`

**For Data Validation Issues:**
- Use `VALIDATION_QUERIES.sql` to identify violations
- Check foreign key constraints: `SELECT * FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY'`

---

## ✅ Post-Deployment Checklist

After successful production deployment:

- [ ] All validation queries return zero violations
- [ ] Admin dashboard can filter by country
- [ ] TypeScript types regenerated
- [ ] Build passes (`bun run build`)
- [ ] E2E tests pass (if available)
- [ ] Monitor error logs for constraint violations (first 24 hours)
- [ ] Update team documentation on multi-country operations
- [ ] Schedule legacy column drop (30 days post-deployment)

---

**Last Updated:** 2025-11-19
**Migration Version:** 20251119190424 → 20251119190755
**Status:** ✅ Ready for Staging Deployment
