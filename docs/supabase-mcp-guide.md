# Supabase MCP Integration Guide

> **Leveraging Claude Code's Supabase MCP Server for Enhanced Workflows**

## Table of Contents

- [Overview](#overview)
- [Available MCP Tools](#available-mcp-tools)
- [Setup & Prerequisites](#setup--prerequisites)
- [Common Workflows](#common-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Casaora integrates with Supabase through both the Supabase CLI and Claude Code's MCP (Model Context Protocol) server. The MCP server provides 20+ specialized tools for database management, security monitoring, Edge Functions deployment, and more.

### Why Use MCP Tools?

- **Automation**: Automate complex database operations
- **Security**: Proactive security advisor checks
- **Type Safety**: Auto-generate TypeScript types from schema
- **Monitoring**: Real-time log analysis and health checks
- **Edge Functions**: Deploy and manage serverless functions
- **Branching**: Test migrations on preview branches

---

## Available MCP Tools

### Database Management

| Tool | Description |
|------|-------------|
| `mcp__supabase__list_tables` | List all tables in specified schemas |
| `mcp__supabase__list_extensions` | List PostgreSQL extensions |
| `mcp__supabase__execute_sql` | Execute raw SQL queries |
| `mcp__supabase__generate_typescript_types` | Generate TypeScript types from schema |

### Migrations

| Tool | Description |
|------|-------------|
| `mcp__supabase__list_migrations` | List all database migrations |
| `mcp__supabase__apply_migration` | Apply a new migration |

### Monitoring & Security

| Tool | Description |
|------|-------------|
| `mcp__supabase__get_logs` | Get logs for specific service (api, postgres, auth, etc.) |
| `mcp__supabase__get_advisors` | Get security or performance advisors |

### Project Information

| Tool | Description |
|------|-------------|
| `mcp__supabase__get_project_url` | Get API URL for the project |
| `mcp__supabase__get_publishable_keys` | Get publishable API keys |

### Edge Functions

| Tool | Description |
|------|-------------|
| `mcp__supabase__list_edge_functions` | List all Edge Functions |
| `mcp__supabase__get_edge_function` | Get Edge Function code |
| `mcp__supabase__deploy_edge_function` | Deploy Edge Function |

### Database Branching

| Tool | Description |
|------|-------------|
| `mcp__supabase__create_branch` | Create development branch |
| `mcp__supabase__list_branches` | List all branches |
| `mcp__supabase__delete_branch` | Delete a branch |
| `mcp__supabase__merge_branch` | Merge branch to production |
| `mcp__supabase__reset_branch` | Reset branch to specific migration |
| `mcp__supabase__rebase_branch` | Rebase branch on production |

---

## Setup & Prerequisites

### 1. Supabase CLI Installation

```bash
brew install supabase/tap/supabase
```

### 2. Link to Remote Project

```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Verify MCP Connection

Ask Claude Code:
```
Are the Supabase MCP tools available?
```

Claude should confirm the tools are accessible.

---

## Common Workflows

### 1. Security Audits

#### Check for Security Issues

**Via Claude Code:**
```
Check Supabase security advisors for missing RLS policies and exposed tables
```

**Via Script:**
```bash
bash scripts/supabase-check-advisors.sh security
```

**What it checks:**
- Missing Row Level Security (RLS) policies
- Exposed tables without authentication
- Vulnerable endpoints
- Insecure storage bucket policies

#### Example Output

```
Security Advisors Report:
⚠️  WARNING: Table 'users' is missing RLS policy
⚠️  WARNING: Storage bucket 'avatars' is publicly accessible
✅  PASS: All API endpoints require authentication
```

### 2. Performance Monitoring

#### Check Performance Advisors

**Via Claude Code:**
```
Check Supabase performance advisors and suggest optimizations
```

**What it checks:**
- Missing indexes on frequently queried columns
- Slow queries and N+1 query patterns
- Table scan performance
- Connection pool usage

#### Example Output

```
Performance Advisors Report:
⚠️  WARNING: Missing index on users.email (high sequential scan count)
⚠️  WARNING: Query on bookings table is slow (avg 2.3s)
💡  SUGGESTION: Add index: CREATE INDEX idx_users_email ON users(email);
```

### 3. Log Analysis

#### View Recent Errors

**Via Claude Code:**
```
Get Supabase logs for the last hour and show any errors
```

**Via Script:**
```bash
# Check multiple services
bash scripts/supabase-health-check.sh
```

#### Filter by Service

```
Show Supabase postgres logs with errors from the last 24 hours
```

Available services:
- `api` - REST API logs
- `postgres` - Database logs
- `auth` - Authentication logs
- `storage` - Storage API logs
- `realtime` - Realtime subscription logs
- `edge-function` - Edge Function logs

### 4. TypeScript Type Generation

#### Auto-Generate Types from Database

**Via Claude Code:**
```
Generate TypeScript types from the Supabase database schema
```

**Via Script:**
```bash
# From local database
bash scripts/supabase-generate-types.sh

# From remote database
bash scripts/supabase-generate-types.sh --remote

# Custom output location
bash scripts/supabase-generate-types.sh --output src/types/db.ts
```

#### Use Generated Types

```typescript
import type { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Now you get full type safety!
const { data, error } = await supabase
  .from('users') // ✅ Autocomplete available
  .select('id, email, name') // ✅ Column names validated
  .single();

// data is typed as { id: string; email: string; name: string | null }
```

### 5. Edge Functions Management

#### List All Edge Functions

**Via Claude Code:**
```
List all Supabase Edge Functions and their status
```

#### Deploy Edge Function

**Via Claude Code:**
```
Deploy the webhook-stripe Edge Function to Supabase
```

**Via CLI:**
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy webhook-stripe

# With environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_xxx
supabase functions deploy webhook-stripe
```

#### Get Function Code

**Via Claude Code:**
```
Show me the code for the example-function Edge Function
```

### 6. Database Branching Workflow

Database branches allow you to test migrations safely before applying to production.

#### Create Development Branch

**Via Claude Code:**
```
Create a Supabase development branch named 'feature-test'
```

This creates a fresh database with all current migrations applied.

#### Test Migrations on Branch

```
Apply this migration to the 'feature-test' branch:
CREATE TABLE test_feature (...);
```

#### Merge to Production

Once tested:
```
Merge the 'feature-test' branch to production
```

**⚠️ Important:** Only migrations and Edge Functions are merged. Data is NOT carried over.

#### List All Branches

```
Show all Supabase development branches and their status
```

### 7. Database Schema Inspection

#### List All Tables

**Via Claude Code:**
```
List all tables in the Supabase database
```

**Via CLI:**
```bash
supabase db list
```

#### List Extensions

```
Show all PostgreSQL extensions installed in Supabase
```

Common extensions:
- `uuid-ossp` - UUID generation
- `pgcrypto` - Encryption functions
- `postgis` - Geospatial queries
- `pg_stat_statements` - Query performance tracking

### 8. Migration Management

#### List Migrations

**Via Claude Code:**
```
List all Supabase migrations and their status
```

#### Apply New Migration

```
Create a migration to add a 'bio' column to the profiles table
```

Claude will:
1. Generate the migration SQL
2. Create the migration file
3. Apply it to the database
4. Verify success

#### Check Migration Status

```bash
supabase migration list
```

---

## Best Practices

### 1. Regular Security Audits

**Recommended Schedule:**
- Run security advisors: **Weekly**
- Check RLS policies: **After every schema change**
- Review storage policies: **Monthly**

**Automation:**
```bash
# Add to cron or CI/CD
bash scripts/supabase-check-advisors.sh security
```

### 2. Type Generation

**When to Regenerate Types:**
- ✅ After every migration
- ✅ After schema changes
- ✅ Before deploying
- ✅ When TypeScript errors suggest schema mismatch

**Automation:**
```json
// package.json
{
  "scripts": {
    "db:migrate": "supabase db push && bash scripts/supabase-generate-types.sh",
    "db:types": "bash scripts/supabase-generate-types.sh"
  }
}
```

### 3. Log Monitoring

**What to Monitor:**
- 🔴 **Critical**: `error`, `fatal`, `panic` in logs
- 🟡 **Warning**: Slow queries (>1s)
- 🔵 **Info**: High connection counts

**Use Claude Code for Analysis:**
```
Analyze Supabase logs for the last 6 hours and identify patterns
```

### 4. Edge Functions

**Deployment Checklist:**
- ✅ Test locally: `supabase functions serve`
- ✅ Set environment variables: `supabase secrets set`
- ✅ Deploy: `supabase functions deploy`
- ✅ Monitor logs: `supabase functions logs`
- ✅ Test in production

**See:** [Edge Functions README](../supabase/functions/README.md)

### 5. Database Branching

**Use Branches For:**
- ✅ Testing complex migrations
- ✅ Experimental schema changes
- ✅ Feature development with schema changes
- ❌ **NOT** for testing with production data (data doesn't carry over)

**Workflow:**
```
1. Create branch: "feature-xyz"
2. Apply migrations to branch
3. Test thoroughly
4. Merge to production
5. Delete branch
```

---

## Troubleshooting

### Issue: MCP Tools Not Available

**Symptoms:** Claude Code says "I don't have access to Supabase MCP tools"

**Solutions:**
1. Verify MCP server is running:
   ```
   Ask Claude: "List all available MCP servers"
   ```
2. Restart Claude Code
3. Check Supabase CLI is installed: `supabase --version`
4. Verify project is linked: `supabase projects list`

### Issue: "Not Linked to Project"

**Symptoms:** Tools fail with "project not linked" error

**Solution:**
```bash
# Get your project ref from Supabase Dashboard
# Settings > General > Reference ID

# Link project
supabase link --project-ref YOUR_REF
```

### Issue: Type Generation Fails

**Symptoms:** `supabase-generate-types.sh` fails

**Solutions:**
1. Check local Supabase is running:
   ```bash
   supabase status
   ```
2. If using `--remote`, verify you're linked:
   ```bash
   supabase projects list
   ```
3. Check for syntax errors in migrations:
   ```bash
   supabase db reset
   ```

### Issue: Edge Function Deployment Fails

**Symptoms:** Deploy fails with errors

**Solutions:**
1. Test locally first:
   ```bash
   supabase functions serve my-function
   ```
2. Check for import errors
3. Verify environment variables are set:
   ```bash
   supabase secrets list
   ```
4. Check function logs:
   ```bash
   supabase functions logs my-function
   ```

### Issue: Advisor Checks Show No Data

**Symptoms:** Advisor tools return empty or minimal results

**Possible Causes:**
- Using local database (advisors are limited locally)
- Remote project not linked
- No issues found (good!)

**Solution:** Use remote database for full advisor reports:
```
Check Supabase performance advisors on the remote production database
```

---

## Quick Reference

### Daily Tasks

```bash
# Health check
bash scripts/supabase-health-check.sh

# Check for errors in logs
# Via Claude: "Check Supabase logs for errors in the last hour"
```

### Weekly Tasks

```bash
# Security audit
bash scripts/supabase-check-advisors.sh security

# Performance check
# Via Claude: "Check Supabase performance advisors"
```

### After Schema Changes

```bash
# Generate types
bash scripts/supabase-generate-types.sh

# Check advisors
bash scripts/supabase-check-advisors.sh

# Test locally
bun run build
```

### Before Deployment

```bash
# Full health check
bash scripts/supabase-health-check.sh

# Security check
bash scripts/supabase-check-advisors.sh

# Verify migrations
supabase migration list
```

---

## Examples with Claude Code

### Example 1: Complete Security Audit

```
Can you:
1. Check Supabase security advisors
2. List all tables without RLS
3. Show any exposed storage buckets
4. Suggest fixes for each issue
```

### Example 2: Performance Optimization

```
Analyze Supabase performance:
1. Check for missing indexes
2. Find slow queries
3. Generate recommended indexes
4. Apply the most critical optimization
```

### Example 3: Deployment Preparation

```
Prepare for deployment:
1. Check security and performance advisors
2. Generate TypeScript types
3. List pending migrations
4. Show recent error logs
5. Summarize any blockers
```

### Example 4: Edge Function Development

```
Help me create an Edge Function:
1. Create a function called 'process-booking'
2. It should validate booking data
3. Insert into database
4. Send confirmation email
5. Deploy it when ready
```

---

## Related Documentation

- [Vercel CLI Guide](./vercel-cli-guide.md) - Vercel workflow documentation
- [Edge Functions README](../supabase/functions/README.md) - Edge Functions guide
- [Developer Onboarding](./developer-onboarding.md) - Setup guide
- [Supabase Official Docs](https://supabase.com/docs) - Official documentation

---

**Last Updated:** 2025-11-11
**Maintained By:** Casaora Development Team
