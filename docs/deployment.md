# Casaora - Deployment Guide

## Overview

Casaora uses **Vercel** for hosting with automatic deployments triggered by GitHub. This guide covers the deployment workflow, environment management, and best practices for the free (Hobby) plan.

---

## Environment Strategy

### Single-Branch Workflow

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Production** | `main` | [casaora.vercel.app](https://casaora.vercel.app) | Live site |
| **Preview** | Feature branches | `casaora-*.vercel.app` (auto-generated) | PR testing |

**Why this approach:**
- Maximizes free tier resources (100GB bandwidth/month shared across all deploys)
- Preview deployments serve as on-demand staging
- Each PR gets an isolated preview URL automatically
- Existing GitHub workflows run smoke tests on preview deployments

---

## Deployment Workflow

```
┌─────────────────────┐
│   Feature Branch    │  (local development)
└──────────┬──────────┘
           │ git push
           ▼
┌─────────────────────┐
│    PR Created       │  → Vercel Preview Deployment (automatic)
│                     │  → GitHub Actions: build, lint, smoke tests
└──────────┬──────────┘
           │ Review & approve
           ▼
┌─────────────────────┐
│   Merge to main     │  → Vercel Production Deployment (automatic)
└─────────────────────┘
```

### Step-by-Step

1. **Create Feature Branch:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature
   ```

2. **Make Changes and Commit:**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Push to GitHub:**
   ```bash
   git push origin feature/your-feature
   ```

4. **Create Pull Request:**
   - Vercel automatically creates a preview deployment
   - GitHub Actions run build verification, linting, and smoke tests
   - Review the preview URL in the PR comments

5. **Merge to Main:**
   - Once approved and all checks pass, merge the PR
   - Vercel automatically deploys to production

---

## GitHub Actions CI/CD

### Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| **PR Checks** | `pr-checks.yml` | Build verification, Biome linting |
| **Staging Smoke Tests** | `staging-smoke-tests.yml` | Playwright tests on preview URLs |
| **Deployment Guard** | `deployment-guard.yml` | Skips unnecessary Dependabot previews |

### Automatic Checks

Every PR triggers:
1. Build verification (`bun run build`)
2. Code quality checks (`bun run check`)
3. Smoke tests on preview deployment (Playwright)

---

## Vercel Configuration

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-decline-bookings",
      "schedule": "0 */4 * * *"
    },
    {
      "path": "/api/cron/process-payouts",
      "schedule": "0 15 * * 2,5"
    }
  ]
}
```

### Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Auto-decline bookings | Every 4 hours | Declines expired booking requests |
| Process payouts | Tue & Fri 10am COT | Batch processes professional payouts |

**Monitor cron jobs:** Vercel Dashboard → Project → Cron Jobs

---

## Environment Variables

### Required Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=xxx

# Cron Authentication
CRON_SECRET=xxx
```

### Environment Scopes

| Scope | Use Case |
|-------|----------|
| **Production** | Only applied to production deployment |
| **Preview** | Applied to all preview deployments |
| **Development** | Used with `vercel dev` locally |

---

## Rollback Procedures

### Via Vercel Dashboard

1. Go to **Vercel Dashboard** → **Project** → **Deployments**
2. Find the previous working deployment
3. Click the **...** menu → **Promote to Production**

### Via Git

```bash
# Revert the problematic commit
git revert HEAD
git push origin main
# Vercel will automatically deploy the revert
```

### Via Vercel CLI

```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

---

## Pre-Deployment Checklist

Before merging to production:

```bash
# 1. Type check
bun run type-check

# 2. Lint code
bun run check

# 3. Run tests
bun test

# 4. Build verification
bun run build

# 5. Test production build locally
bun run build && bun start
```

---

## Skipping Deployments

Use commit prefixes to skip unnecessary deployments:

```bash
# These commits won't trigger Vercel deployments
git commit -m "chore: update dependencies [skip deploy]"
git commit -m "docs: update README"
git commit -m "test: add unit tests"
```

Commits prefixed with `chore:`, `docs:`, or `test:` automatically skip deployment via `vercel.json` configuration.

---

## Monitoring Production

### Vercel Dashboard

- **Analytics:** Real-time traffic and performance metrics
- **Functions:** Serverless function logs and invocations
- **Cron Jobs:** Execution history and errors

### PostHog

- **Session Replays:** Debug user issues
- **Error Tracking:** Monitor frontend errors
- **Feature Flags:** Control feature rollouts

### Better Stack / Logtail

- **Structured Logs:** Application logs from API routes
- **Alerts:** Set up notifications for errors

---

## Future: Dedicated Staging (Pro Plan)

When scaling requires dedicated staging:

1. **Create `staging` branch:**
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

2. **Configure Vercel:**
   - Dashboard → Domains → Add `staging.casaora.vercel.app`
   - Map to `staging` branch

3. **Separate Database:**
   - Create new Supabase project for staging
   - Configure staging-specific environment variables

---

## Common Issues

### Preview Deployment Not Created

**Cause:** Dependabot PRs or certain commit prefixes skip previews.

**Solution:** Check if `deployment-guard.yml` workflow blocked it intentionally.

### Build Failing on Vercel

**Cause:** Usually TypeScript or dependency issues.

**Solution:**
```bash
# Test build locally
bun run build

# Check for type errors
bun run type-check
```

### Cron Job Not Running

**Cause:** Missing `CRON_SECRET` or incorrect schedule.

**Solution:**
1. Verify `CRON_SECRET` is set in Vercel environment variables
2. Check Vercel Dashboard → Cron Jobs for execution logs

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

**Last Updated:** 2025-11-24
**Version:** 1.0.0
