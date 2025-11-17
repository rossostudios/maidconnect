# CMS Migration Scripts

This directory contains scripts to migrate content from Supabase + Custom BlockEditor to Sanity CMS.

## Prerequisites

1. **Docker Desktop running** (for local Supabase)
   ```bash
   # Start Docker Desktop, then:
   supabase start
   ```

2. **Sanity authentication**
   ```bash
   # Get your Sanity token from: https://www.sanity.io/manage
   export SANITY_TOKEN="your_token_here"
   ```

3. **Environment variables**
   ```bash
   # Ensure these are set in .env.local:
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

## Migration Order

**IMPORTANT:** Follow this exact order:

1. ✅ **Backup database** (CRITICAL - do this first!)
2. **Phase 2:** Migrate help tags
3. **Phase 3:** Migrate help articles
4. **Phase 4:** Migrate changelog
5. **Phase 5:** Test in development
6. **Phase 6:** Drop old tables

## Quick Start

```bash
# 1. Backup database (CRITICAL!)
bun run scripts/cms-migration/01-backup-database.ts

# 2. Migrate help tags
bun run scripts/cms-migration/02-migrate-help-tags.ts

# 3. Migrate help articles
bun run scripts/cms-migration/03-migrate-help-articles.ts

# 4. Migrate changelog
bun run scripts/cms-migration/04-migrate-changelog.ts

# 5. Verify migration
bun run scripts/cms-migration/05-verify-migration.ts

# 6. After verification, clean up old tables
psql -U postgres -d postgres < scripts/cms-migration/06-cleanup-tables.sql
```

## Scripts Overview

| Script | Purpose | Risk | Duration |
|--------|---------|------|----------|
| `01-backup-database.ts` | Creates full database backup | None | 1 min |
| `02-migrate-help-tags.ts` | Migrates 9 help tags to Sanity | Low | 1 min |
| `03-migrate-help-articles.ts` | Migrates help articles + converts markdown → Portable Text | Medium | 5-10 min |
| `04-migrate-changelog.ts` | Migrates changelog + converts markdown → Portable Text | Medium | 5 min |
| `05-verify-migration.ts` | Verifies all content migrated correctly | None | 2 min |
| `06-cleanup-tables.sql` | Drops old Supabase CMS tables | **High** | 1 min |

## Rollback Plan

If something goes wrong:

```bash
# Restore from backup
psql -U postgres -d postgres < backups/cms_backup_YYYY-MM-DD.sql

# Revert code changes
git reset --hard HEAD~1
```

## Manual Steps (Done via UI)

Some steps are easier done manually in Sanity Studio:

### Step 1: Create Help Tags in Sanity Studio

Navigate to `/studio` → Help Tags, create these 9 tags:

| Slug | Name (EN) | Name (ES) | Color |
|------|-----------|-----------|-------|
| `getting-started` | Getting Started | Primeros Pasos | `#3B82F6` |
| `payment` | Payment | Pago | `#10B981` |
| `troubleshooting` | Troubleshooting | Solución de Problemas | `#EF4444` |
| `mobile` | Mobile App | App Móvil | `#8B5CF6` |
| `verification` | Verification | Verificación | `#F59E0B` |
| `booking` | Booking | Reservas | `#EC4899` |
| `professional` | For Professionals | Para Profesionales | `#14B8A6` |
| `customer` | For Customers | Para Clientes | `#6366F1` |
| `account` | Account | Cuenta | `#64748B` |

## Common Issues

### Issue: "Cannot connect to Docker daemon"
**Solution:** Start Docker Desktop, then run `supabase start`

### Issue: "Sanity authentication failed"
**Solution:** Get token from https://www.sanity.io/manage and set `SANITY_TOKEN`

### Issue: "Markdown conversion failed"
**Solution:** Check help article content for invalid markdown syntax

### Issue: "Duplicate documents in Sanity"
**Solution:** Scripts check for duplicates and skip them automatically

## Safety Features

All migration scripts include:
- ✅ Dry-run mode (preview changes without applying)
- ✅ Duplicate detection (won't create duplicates)
- ✅ Progress logging (see what's happening)
- ✅ Error handling (graceful failures)
- ✅ Rollback instructions (if things go wrong)

## Post-Migration Checklist

After migration completes:

- [ ] Test help center (`/help`)
- [ ] Test changelog (`/changelog`)
- [ ] Test Sanity Studio (`/studio`)
- [ ] Verify search works
- [ ] Check PostHog analytics
- [ ] Monitor for errors (first 24 hours)
- [ ] Update team documentation

---

**Need Help?**
- Review [docs/cms-migration-guide.md](../../docs/cms-migration-guide.md)
- Check Sanity docs: https://www.sanity.io/docs
- Check script comments for detailed explanations
