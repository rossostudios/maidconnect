# Vercel CLI Guide

> **Quick reference for Casaora's Vercel workflows and CLI scripts**

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variable Management](#environment-variable-management)
- [Deployment Management](#deployment-management)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

Casaora uses Vercel for hosting and deployment. This guide covers the enhanced CLI workflows we've built on top of Vercel's native CLI.

### Available Commands

| Command | Description |
|---------|-------------|
| `bun run vercel:env:pull` | Pull environment variables from Vercel |
| `bun run vercel:env:compare` | Compare local vs Vercel env vars |
| `bun run vercel:env:push` | Push a single env var to Vercel |
| `bun run vercel:logs` | View production logs |
| `bun run vercel:logs:follow` | Follow production logs in real-time |
| `bun run vercel:rollback` | Rollback to a previous deployment |
| `bun run vercel:deploy` | Create a preview deployment |
| `bun run vercel:deploy:prod` | Deploy to production |

---

## Prerequisites

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Link Project

```bash
vercel link
```

Follow the prompts to link your local project to the Vercel project.

---

## Environment Variable Management

### Pull Environment Variables

Pull production environment variables to your local `.env.local`:

```bash
# Pull production environment variables
bun run vercel:env:pull

# Or use the script directly with options
bash scripts/sync-env-from-vercel.sh production
bash scripts/sync-env-from-vercel.sh preview
bash scripts/sync-env-from-vercel.sh development
```

**What it does:**
- Creates a backup of your existing `.env.local`
- Pulls all environment variables from Vercel
- Saves them to `.env.local` (or `.env.preview.local` / `.env.development.local`)

**Output Example:**
```
🔄 Syncing environment variables from Vercel...
Environment: production
Output file: .env.local

⚠️  Creating backup: .env.local.backup.20251111_143000

📥 Pulling environment variables from Vercel...
✅ Success! Environment variables synced to .env.local
Variables: 42 environment variables pulled

Sample variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - STRIPE_SECRET_KEY
  - DATABASE_URL
  ... and 37 more
```

### Compare Environment Variables

Check if your local environment variables match what's in Vercel:

```bash
# Compare with production
bun run vercel:env:compare

# Compare with other environments
bash scripts/compare-env.sh preview
bash scripts/compare-env.sh development
```

**What it does:**
- Shows variables only in local
- Shows variables only in Vercel
- Shows variables in both (doesn't compare values for security)

**Output Example:**
```
🔍 Comparing environment variables...
Environment: production
Local file: .env.local

📊 Summary:
  Local variables:  42
  Vercel variables: 45

⚠️  Variables ONLY in Vercel:
  - NEW_API_KEY
  - FEATURE_FLAG_X
  - THIRD_PARTY_TOKEN

✅ Variables in BOTH local and Vercel:
  Total: 42 variables
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  ... and 40 more
```

### Push Environment Variable

Add or update a single environment variable in Vercel:

```bash
# Push to all environments (production, preview, development)
bash scripts/push-env-to-vercel.sh API_KEY "sk-123456"

# Push to specific environment
bash scripts/push-env-to-vercel.sh DEBUG "true" development
bash scripts/push-env-to-vercel.sh DATABASE_URL "postgres://..." production
```

**⚠️ Warning:** This script requires confirmation before pushing to production.

**What it does:**
- Validates inputs
- Requires confirmation for production changes
- Pushes the variable to specified environment(s)
- Provides instructions for redeployment

---

## Deployment Management

### Create Preview Deployment

Deploy your current branch as a preview:

```bash
# Create preview deployment
bun run vercel:deploy

# Deploy and open in browser
bash scripts/vercel-deploy-preview.sh --open

# Deploy without waiting for completion
bash scripts/vercel-deploy-preview.sh --no-wait
```

**What it does:**
- Checks current branch and commit info
- Warns about uncommitted changes
- Builds and deploys to Vercel
- Returns preview URL

### Deploy to Production

Deploy current branch to production:

```bash
# Deploy to production (requires confirmation)
bun run vercel:deploy:prod

# Or with options
bash scripts/vercel-deploy-preview.sh --prod --open
```

**⚠️ Warning:** This deploys to production and requires confirmation.

### Rollback Deployment

Quickly rollback to a previous deployment:

```bash
# Interactive mode - shows recent deployments
bun run vercel:rollback

# Rollback to specific deployment
bash scripts/vercel-rollback.sh your-app-abc123.vercel.app
```

**Interactive Mode:**
```
🔄 Vercel Deployment Rollback Tool

📋 Fetching recent production deployments...

URL: casaora-xyz123.vercel.app
Date: 2025-11-11 14:30:00
Message: feat: add new feature

URL: casaora-abc456.vercel.app
Date: 2025-11-11 12:15:00
Message: fix: resolve critical bug

📝 Instructions:
  1. Review the deployments above
  2. Choose the deployment URL you want to rollback to
  3. Run: bash scripts/vercel-rollback.sh <deployment-url>
```

**Direct Rollback:**
```bash
bash scripts/vercel-rollback.sh casaora-abc456.vercel.app
```

**What it does:**
- Shows current production deployment
- Requires confirmation
- Promotes the selected deployment to production
- Provides verification steps

---

## Monitoring & Logs

### View Production Logs

View logs from production deployment:

```bash
# View last 100 lines (default)
bun run vercel:logs

# View last 50 lines
bash scripts/vercel-logs.sh production -n 50

# Follow logs in real-time
bun run vercel:logs:follow
```

**Options:**
- `-f, --follow` - Follow logs in real-time
- `-n, --lines N` - Number of lines to show (default: 100)
- `-d, --deployment URL` - View logs from specific deployment

**Filtering Logs:**
```bash
# Filter for errors
bun run vercel:logs | grep ERROR

# Filter for specific status codes
bun run vercel:logs | grep "status: 500"

# Filter for specific API routes
bun run vercel:logs | grep "/api/bookings"
```

### View Preview Logs

View logs from preview deployments:

```bash
bash scripts/vercel-logs.sh preview
bash scripts/vercel-logs.sh preview -f
```

---

## Troubleshooting

### Common Issues

#### Not Logged In

**Problem:** Commands fail with authentication error

**Solution:**
```bash
vercel login
```

#### Not Linked to Project

**Problem:** Commands fail with "No project linked"

**Solution:**
```bash
vercel link
```

#### Environment Variables Not Syncing

**Problem:** `vercel:env:pull` fails or shows empty

**Solution:**
1. Check you're logged in: `vercel whoami`
2. Check project is linked: `vercel project ls`
3. Verify you have access to the project in Vercel dashboard
4. Try re-linking: `vercel link --yes`

#### Deployment Fails

**Problem:** Deployment fails during build

**Solution:**
1. Test build locally: `bun run build`
2. Check environment variables are set
3. Review build logs in Vercel dashboard
4. Check for TypeScript errors: `bun run check`

#### Can't Find Recent Deployment for Rollback

**Problem:** Rollback script doesn't show deployments

**Solution:**
1. Check deployments manually: `vercel ls --prod`
2. Ensure you're logged in and linked
3. Try accessing Vercel dashboard directly

---

## Best Practices

### 1. Environment Variables

- **Always backup before pulling:** The script automatically creates backups, but keep your own copy of critical values
- **Use environment-specific files:** Use `.env.production.local`, `.env.preview.local`, etc. for different environments
- **Never commit `.env` files:** Keep them in `.gitignore`
- **Audit regularly:** Run `vercel:env:compare` weekly to ensure sync

### 2. Deployments

- **Test locally first:** Always run `bun run build` before deploying
- **Use preview deployments:** Test features in preview before promoting to production
- **Monitor after deployment:** Check logs immediately after deploying: `bun run vercel:logs:follow`
- **Keep rollback ready:** Know how to rollback in case of issues

### 3. Production Changes

- **Use confirmation prompts:** Never bypass confirmation for production changes
- **Document changes:** Add clear commit messages for production deployments
- **Notify team:** Let team know about production deployments
- **Monitor metrics:** Watch analytics and error rates after deployment

### 4. Logs Monitoring

- **Follow logs during deployment:** Use `vercel:logs:follow` when deploying
- **Set up alerts:** Configure Vercel notifications for errors
- **Check regularly:** Review logs daily for unusual patterns
- **Filter strategically:** Use grep to find specific issues quickly

### 5. Branch Strategy

Our release process:
- **Develop on `develop` branch:** All feature branches merge here
- **Weekly releases to `main`:** Use `bash scripts/create-release.sh` on Fridays
- **Hotfixes to `main`:** Critical fixes go directly to main
- **See:** [Release Strategy](./release-strategy.md) for details

---

## Quick Reference Card

### Common Workflows

**Setup New Machine:**
```bash
vercel login
vercel link
bun run vercel:env:pull
```

**Before Starting Work:**
```bash
bun run vercel:env:compare  # Check for new env vars
bun run vercel:env:pull      # Pull if needed
```

**Test Feature:**
```bash
bun run build                # Test locally
bun run vercel:deploy        # Deploy preview
```

**Production Deployment:**
```bash
bash scripts/create-release.sh  # Use release script (Friday)
# Or manual:
bun run vercel:deploy:prod      # Deploy to prod (with confirmation)
bun run vercel:logs:follow       # Monitor logs
```

**Emergency Rollback:**
```bash
bun run vercel:rollback
# Select deployment to rollback to
```

**Debug Production Issue:**
```bash
bun run vercel:logs | grep ERROR
bun run vercel:logs:follow
```

---

## Related Documentation

- [Release Strategy](./release-strategy.md) - Full release and deployment process
- [Developer Onboarding](./developer-onboarding.md) - Setup guide for new developers
- [Vercel Official Docs](https://vercel.com/docs) - Official Vercel documentation

---

**Last Updated:** 2025-11-11
**Maintained By:** Casaora Development Team
