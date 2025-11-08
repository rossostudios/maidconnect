# Apply Help Center Migration to Production

The Supabase CLI is having connectivity issues. Please apply the migration manually via the Supabase Dashboard.

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/hvnetxfsrtplextvtwfx/sql
2. Click "New Query"

## Step 2: Copy & Paste This SQL

Copy the entire contents of this file:
```
supabase/migrations/20251108120000_help_center_diagnostic_fix.sql
```

Or use this direct link:
[supabase/migrations/20251108120000_help_center_diagnostic_fix.sql](supabase/migrations/20251108120000_help_center_diagnostic_fix.sql)

## Step 3: Run the Migration

1. Paste the SQL into the editor
2. Click "Run" (or press Cmd+Enter)
3. Wait for completion (should take 2-5 seconds)

## Step 4: Verify Success

After the migration runs, verify it worked by running this diagnostic query:

```sql
SELECT * FROM public.diagnose_help_center();
```

### Expected Output:

```
check_name              | status  | details
------------------------|---------|---------------------------
Total Articles          | INFO    | X articles
Published Articles      | OK      | X articles
Total Categories        | INFO    | X categories
RLS on Articles         | OK      | Enabled
RLS on Categories       | OK      | Enabled
Orphaned Articles       | OK      | All articles have valid categories
```

### If You See Errors:

**"help_articles table does not exist!"**
- The help_articles table hasn't been created yet
- You need to create the base help center schema first

**"relation already exists"**
- The migration was already applied (safe to ignore)
- Just run the diagnostic query to verify

## Step 5: Test Help Center

After applying:

1. Visit: https://casaora.co/en/help (production)
2. Check that articles load without logging in
3. Try both: `/en/help` and `/es/help`

## Troubleshooting

If articles still don't appear:
- See: [docs/06-operations/help-center-troubleshooting.md](docs/06-operations/help-center-troubleshooting.md)
- Run the diagnostic: `SELECT * FROM diagnose_help_center();`

---

**Migration File:** `supabase/migrations/20251108120000_help_center_diagnostic_fix.sql`
**Production URL:** https://hvnetxfsrtplextvtwfx.supabase.co
