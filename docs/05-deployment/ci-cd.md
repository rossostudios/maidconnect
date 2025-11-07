# Continuous Integration & Continuous Deployment (CI/CD)

**Purpose:** This document describes MaidConnect's CI/CD pipeline, automated deployments, quality gates, and continuous delivery practices.

---

## Table of Contents

- [Overview](#overview)
- [Deployment Pipeline](#deployment-pipeline)
- [Vercel Integration](#vercel-integration)
- [Environment Management](#environment-management)
- [Build Process](#build-process)
- [Quality Gates](#quality-gates)
- [Automated Testing](#automated-testing)
- [Preview Deployments](#preview-deployments)
- [Production Deployments](#production-deployments)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring & Alerts](#monitoring--alerts)
- [Future Enhancements](#future-enhancements)

---

## Overview

### Current CI/CD Architecture

**Platform:** Vercel (Serverless deployment platform)
**Source Control:** GitHub
**Automation:** Git-based deployments (push to deploy)
**Testing:** Manual + Automated (Playwright)

### Deployment Flow

```
Developer → Git Push → GitHub → Vercel Build → Deploy
                          ↓
                    Quality Checks
                    - TypeScript
                    - Build Success
                    - Lint (Biome)
```

---

## Deployment Pipeline

### Automatic Deployments

**Main Branch (Production):**
```
git push origin main
  ↓
GitHub receives push event
  ↓
Vercel webhook triggered
  ↓
Vercel starts build process
  ↓
Build succeeds
  ↓
Automatic deployment to production
  ↓
Production URL updated
```

**Feature Branches (Preview):**
```
git push origin feat/new-feature
  ↓
GitHub receives push event
  ↓
Vercel webhook triggered
  ↓
Vercel creates preview build
  ↓
Preview deployment created
  ↓
Unique preview URL generated
  ↓
GitHub PR updated with preview link
```

---

### Manual Triggers

**Redeploy from Vercel Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on project
3. Go to "Deployments"
4. Click "..." on any deployment
5. Click "Redeploy"

**Useful for:**
- Applying environment variable changes
- Testing without code changes
- Emergency redeployments

---

## Vercel Integration

### Configuration

**Project Settings:**
- **Framework:** Next.js 16
- **Build Command:** `bun run build`
- **Output Directory:** `.next`
- **Install Command:** `bun install`
- **Development Command:** `bun run dev`

**Git Integration:**
- **Repository:** `maidconnect/maidconnect`
- **Production Branch:** `main`
- **Deploy Hooks:** Enabled for all branches
- **Automatic Preview Deployments:** Enabled

---

### Vercel Build Settings

**Environment Variables per Environment:**

| Environment | Purpose | Variables |
|-------------|---------|-----------|
| **Production** | Live site | All production secrets |
| **Preview** | PR previews | Staging/test credentials |
| **Development** | Local dev | Local credentials (via `.env.local`) |

**Build Performance:**
- **Caching:** Enabled (node_modules, .next cache)
- **Turbopack:** Enabled (dev only)
- **Output Caching:** Enabled
- **Average Build Time:** 2-3 minutes

---

### Deployment Regions

**Primary Region:** `iad1` (Washington, D.C., USA)
**Edge Network:** Global (Vercel Edge Network)

**Why Washington D.C.:**
- Close to Supabase US East region
- Low latency for database queries
- Close to majority of initial users (Colombia via Miami)

---

## Environment Management

### Environment Structure

```
Production (main branch)
├── Domain: https://maidconnect.com
├── Database: Production Supabase project
├── Stripe: Live mode keys
└── Secrets: Production credentials

Preview (feature branches)
├── Domain: https://maidconnect-git-[branch]-[team].vercel.app
├── Database: Staging Supabase project
├── Stripe: Test mode keys
└── Secrets: Test credentials

Development (local)
├── Domain: http://localhost:3000
├── Database: Local Supabase (Docker)
├── Stripe: Test mode keys
└── Secrets: Local .env.local file
```

---

### Environment Variables

**Production Environment Variables:**

```bash
# Required for all environments
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
ANTHROPIC_API_KEY=
CRON_SECRET=

LOGTAIL_SOURCE_TOKEN=
NEXT_PUBLIC_LOGTAIL_TOKEN=

# Optional (production)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GOOGLE_TRANSLATE_API_KEY=
```

**Managing Environment Variables:**

```bash
# View environment variables
# Vercel Dashboard → Project → Settings → Environment Variables

# Add new variable
# Vercel Dashboard → Settings → Environment Variables → Add

# Update variable
# Edit value → Save → Redeploy required

# Delete variable
# Click X → Confirm → Redeploy required
```

---

## Build Process

### Build Steps

**1. Installation (30-60 seconds):**
```bash
bun install
# Installs dependencies from package.json
# Uses Bun's global cache for speed
```

**2. Build (90-120 seconds):**
```bash
bun run build
# Runs Next.js production build
# - Compiles TypeScript
# - Optimizes bundles
# - Generates static pages
# - Type checks
```

**3. Deployment (10-30 seconds):**
```
# Vercel uploads build artifacts
# Routes configured
# Edge functions deployed
# CDN cache invalidated
```

**Total Build Time:** 2-4 minutes

---

### Build Optimizations

**Caching Strategy:**
```
Dependencies Cache:
- node_modules cached between builds
- Only reinstalls if package.json changes

Build Cache:
- .next cache reused when possible
- Incremental builds for unchanged pages

Asset Optimization:
- Images optimized during build
- Fonts subset and optimized
- JavaScript minified and compressed
```

---

### Build Outputs

**Generated Artifacts:**
```
.next/
├── static/         # Static assets (hashed for caching)
├── server/         # Server-side code
├── cache/          # Build cache
└── standalone/     # Standalone build (if configured)

public/             # Static files (copied as-is)
```

**Bundle Analysis:**
```bash
# Analyze bundle size
bun run analyze

# Generates report at:
# .next/analyze/client.html
# .next/analyze/server.html
```

---

## Quality Gates

### Pre-Deployment Checks

**Automated (Run by Vercel):**
- [x] TypeScript compilation succeeds
- [x] Next.js build succeeds
- [x] No build errors or warnings

**Manual (Required before merge):**
- [ ] Biome linting passes (`bun run check`)
- [ ] Tests pass (`bun test`)
- [ ] Code review approved
- [ ] Preview deployment tested

---

### Build Failure Handling

**When Build Fails:**

1. **Vercel stops deployment automatically**
   - No broken code reaches production
   - Previous deployment remains active

2. **Developer notified via:**
   - GitHub commit status (red X)
   - Vercel deployment notification
   - Email (if configured)

3. **View build logs:**
   - Vercel Dashboard → Deployments → Failed build → Logs
   - GitHub → Checks tab → Vercel deployment

4. **Common build failures:**
   - TypeScript errors
   - Missing environment variables
   - Import errors
   - Out of memory (large builds)

---

## Automated Testing

### Current Testing Setup

**Playwright E2E Tests:**
```bash
# Run all tests
bun test

# Run specific test
bun test tests/booking-flow.spec.ts

# Run in UI mode
bun test:ui
```

**Test Execution:**
- **Local:** Manual execution before pushing
- **CI:** Not yet automated (manual for now)
- **Future:** GitHub Actions on PR

---

### Testing Strategy

**What We Test:**
- [ ] Authentication flows (sign up, sign in, sign out)
- [ ] Booking creation and management
- [ ] Payment processing (test mode)
- [ ] Professional dashboard functionality
- [ ] Customer dashboard functionality
- [ ] Search and filtering
- [ ] Messaging system

**Coverage Goals:**
- Critical paths: 100% (auth, payments, bookings)
- Major features: 80%
- Minor features: 60%

---

## Preview Deployments

### Automatic Preview for Every PR

**When You Create a PR:**

```
1. Push branch to GitHub:
   git push origin feat/new-feature

2. Create Pull Request:
   GitHub → New Pull Request

3. Vercel automatically:
   - Detects new PR
   - Builds preview deployment
   - Posts comment with preview URL

4. Preview URL format:
   https://maidconnect-git-feat-new-feature-team.vercel.app

5. Test your changes:
   - Click preview link
   - Test functionality
   - Check for errors
```

---

### Preview Environment Characteristics

**Differences from Production:**
- Uses test Stripe keys (test mode)
- Uses staging Supabase database
- Separate environment variables
- Unique URL per branch
- Automatically deleted after PR merge

**Useful For:**
- Testing before merge
- Sharing work-in-progress with team
- Design reviews
- QA testing
- Stakeholder demos

---

### Preview Deployment Workflow

```markdown
Developer workflow:

1. Create feature branch
   git checkout -b feat/new-booking-ui

2. Make changes and commit
   git add .
   git commit -m "feat(bookings): redesign booking modal"

3. Push to GitHub
   git push origin feat/new-booking-ui

4. Create PR
   - GitHub automatically creates PR
   - Vercel builds preview
   - Preview URL posted in PR comments

5. Review and iterate
   - Test preview deployment
   - Make changes if needed
   - Push updates (preview auto-updates)

6. Merge when ready
   - Approval from reviewer
   - Merge to main
   - Production deployment triggered
   - Preview deployment deleted
```

---

## Production Deployments

### Deployment Process

**Standard Deployment (via Git):**

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Merge your feature branch
git merge feat/your-feature

# 3. Push to trigger deployment
git push origin main

# 4. Vercel automatically:
#    - Starts build
#    - Runs quality checks
#    - Deploys to production (if successful)

# 5. Monitor deployment
# Vercel Dashboard → Deployments → Watch status
```

**Deployment Timeline:**
```
Push to main
  ↓ (10 seconds)
Build starts
  ↓ (2-4 minutes)
Build completes
  ↓ (30 seconds)
Deployment active
  ↓ (1-2 minutes)
Global CDN propagation complete
```

**Total Time:** 4-7 minutes from push to live

---

### Zero-Downtime Deployments

**How Vercel Ensures Zero Downtime:**

1. **Atomic Deployments**
   - New deployment built completely
   - Only switched when ready
   - Old deployment still serving traffic

2. **Instant Rollover**
   - DNS/routing updated atomically
   - No intermediate state
   - No dropped requests

3. **Gradual Rollout (Edge Network)**
   - New deployment propagates to edge
   - Old deployment removed from edge
   - Seamless transition for users

---

### Post-Deployment Verification

**Automated Checks (Vercel):**
- [x] Deployment successful
- [x] Health check passes
- [x] No immediate 500 errors

**Manual Checks (After Deploy):**
```bash
# 1. Visit production site
open https://maidconnect.com

# 2. Quick smoke test
# - Home page loads
# - Sign in works
# - Create booking works
# - Dashboard loads

# 3. Check monitoring
# Better Stack → No error spikes?
# Vercel Analytics → Traffic normal?

# 4. Check specific features (if changed)
# Test what you deployed

# 5. Monitor for 15 minutes
# Watch Better Stack for errors
# Check user reports
```

---

## Rollback Procedures

### When to Rollback

- Recent deployment causing errors
- Critical bug discovered
- Performance degradation
- Security issue

### Fast Rollback (< 2 minutes)

**Option 1: Vercel Dashboard (FASTEST)**

```bash
1. Go to Vercel Dashboard → Deployments
2. Find last known good deployment (before issue)
3. Click "..." → "Promote to Production"
4. Confirm promotion
5. Wait 1-2 minutes for propagation
6. Verify issue resolved
```

**Option 2: Git Revert + Redeploy**

```bash
# 1. Revert bad commit
git checkout main
git pull
git log --oneline -10  # Find bad commit
git revert <commit-hash>

# 2. Push to trigger new deployment
git push origin main

# 3. Wait for Vercel build + deploy (4-7 minutes)

# 4. Verify issue resolved
```

---

### Rollback with Database Migration

**⚠️ CAUTION: More complex**

If deployment included database migration:

```bash
# 1. Rollback application code first
# Use Vercel dashboard to promote previous deployment

# 2. Rollback database migration
# Supabase dashboard → Create rollback migration

# 3. Verify application + database aligned

# 4. Test functionality

# See: Database Migration Rollback guide
```

---

## Monitoring & Alerts

### Build Notifications

**GitHub:**
- Commit status checks (green check / red X)
- PR comments with deployment URLs
- Failed build notifications

**Vercel:**
- Email on deployment (optional)
- Slack webhook (if configured)
- Dashboard notifications

**Better Stack:**
- Error spikes after deployment
- Performance degradation alerts
- Custom deployment markers

---

### Deployment Monitoring

**Key Metrics to Watch:**
- Error rate (should not spike)
- Response times (should stay consistent)
- Build success rate (> 95%)
- Deployment frequency (healthy: multiple per week)

**Dashboards:**
- Vercel Analytics: https://vercel.com/analytics
- Better Stack: https://logs.betterstack.com
- Supabase: https://supabase.com/dashboard

---

## Future Enhancements

### Planned CI/CD Improvements

**Short-Term (1-3 months):**
- [ ] Automated Playwright tests on PR
- [ ] Automated Biome linting on PR
- [ ] GitHub Actions workflow for quality gates
- [ ] Automated changelog generation

**Medium-Term (3-6 months):**
- [ ] Automated visual regression testing
- [ ] Automated performance budgets
- [ ] Automated accessibility testing
- [ ] Canary deployments (gradual rollout)

**Long-Term (6-12 months):**
- [ ] Feature flag system integration
- [ ] A/B testing infrastructure
- [ ] Blue-green deployments
- [ ] Multi-region deployments

---

### GitHub Actions (Planned)

**Proposed Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
```

---

## Dependency Management

### Dependabot Configuration

**Current Setup:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**What Dependabot Does:**
- Checks for dependency updates weekly
- Creates PRs for security updates
- Creates PRs for version updates
- Groups related updates

**Managing Dependabot PRs:**
```bash
# Review PR
# 1. Check changelog in PR description
# 2. Review changes in package.json
# 3. Test in preview deployment
# 4. Merge if safe

# Merge multiple Dependabot PRs
# 1. Create new branch
# 2. Merge all Dependabot branches
# 3. Test together
# 4. Create single PR
```

---

## Best Practices

### DO:
- ✅ Test in preview deployments before merging
- ✅ Monitor deployments for 15 minutes after
- ✅ Keep environment variables in sync
- ✅ Use conventional commits
- ✅ Review Dependabot PRs weekly
- ✅ Run `bun run check` before pushing

### DON'T:
- ❌ Push directly to main (use PR workflow)
- ❌ Deploy untested code
- ❌ Ignore build warnings
- ❌ Skip monitoring after deployment
- ❌ Deploy late on Friday (if possible)
- ❌ Deploy without communication

---

## Troubleshooting

### Build Fails with "Out of Memory"

**Solution:**
```
1. Check bundle size: bun run analyze
2. Reduce bundle size:
   - Remove unused dependencies
   - Use dynamic imports
   - Optimize images
3. Contact Vercel support to increase memory limit
```

---

### Environment Variables Not Working

**Solution:**
```
1. Verify variable is set in correct environment
   Vercel → Settings → Environment Variables

2. Check variable name (exact match required)
   NEXT_PUBLIC_* for client-side
   No prefix for server-side

3. Redeploy to apply changes
   git commit --allow-empty -m "Apply env vars"
   git push origin main
```

---

### Preview Deployment Not Creating

**Solution:**
```
1. Check Vercel integration
   GitHub → Settings → Integrations → Vercel

2. Check branch protection
   GitHub → Settings → Branches → Branch protection rules

3. Check Vercel project settings
   Vercel → Project → Settings → Git

4. Manual trigger
   Vercel Dashboard → Redeploy
```

---

## Resources

**Official Documentation:**
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)

**Internal Documentation:**
- [Release Playbook](./release-playbook.md)
- [Environment Variables](./.env.example)
- [Monitoring Guide](../06-operations/monitoring.md)
- [Incident Response](../06-operations/incident-response.md)

---

**Version:** 2.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team

**Changelog:**
- 2.0.0 (2025-01-06): Comprehensive expansion with detailed pipeline documentation
- 1.0.0: Initial concise version

