# Epic F - Quick Reference Guide

**Use this as a cheat sheet while implementing Epic F**

---

## 📋 Implementation Order

1. ✅ **Code Review** - Review PR with infrastructure code
2. 🔧 **F-1.1** - Supabase Staging (15 min)
3. 🔧 **F-1.2** - Stripe Test Mode (10 min)
4. 🔧 **F-1.3** - Resend Test (5 min)
5. 🔧 **F-1.4** - Vercel Staging (15 min)
6. 🔧 **F-3.5** - Branch Protection (10 min)
7. ✅ **Test** - End-to-end verification (15 min)

**Total Time:** ~70 minutes

---

## 🔗 Quick Links

| Service | URL |
|---------|-----|
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **Stripe Dashboard** | https://dashboard.stripe.com (toggle test mode) |
| **Resend Dashboard** | https://resend.com/api-keys |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **GitHub Settings** | https://github.com/[org]/casaora/settings/branches |
| **GitHub Secrets** | https://github.com/[org]/casaora/settings/secrets/actions |

---

## 💻 Essential Commands

### Supabase

```bash
# Link to staging project
supabase link --project-ref <staging-ref>

# Apply migrations
supabase db push

# Verify migrations
supabase db diff

# Check status
supabase status
```

### Generate Secrets

```bash
# Generate random secret (for CRON_SECRET, etc.)
openssl rand -base64 32

# Generate another
openssl rand -hex 32
```

### Vercel

```bash
# Deploy to staging (develop branch)
git checkout develop
git push origin develop

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

### Git

```bash
# Create test PR
git checkout -b test/epic-f-verification
git commit --allow-empty -m "test: Epic F verification"
git push origin test/epic-f-verification
```

### Testing

```bash
# Run smoke tests locally
bun run test:smoke

# Run against staging
PLAYWRIGHT_BASE_URL=https://casaora-git-develop.vercel.app bun run test:smoke

# Run with UI
bun run test:smoke:ui

# View test report
bun run test:report
```

---

## 🔑 GitHub Secrets to Add

```bash
# F-1.1: Supabase
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_SUPABASE_SERVICE_ROLE_KEY

# F-1.2: Stripe
STAGING_STRIPE_SECRET_KEY
STAGING_STRIPE_PUBLISHABLE_KEY
STAGING_STRIPE_WEBHOOK_SECRET

# F-1.3: Resend
STAGING_RESEND_API_KEY

# Also add to Vercel (same names, Preview environment)
```

---

## 🎯 Vercel Environment Variables

**Scope:** Preview (develop branch only)

```bash
# Core
NEXT_PUBLIC_SUPABASE_URL=[from Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase]
SUPABASE_SERVICE_ROLE_KEY=[from Supabase]

STRIPE_SECRET_KEY=[from Stripe]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[from Stripe]
STRIPE_WEBHOOK_SECRET=[from Stripe]

RESEND_API_KEY=[from Resend]

# URLs (update after first deployment)
NEXT_PUBLIC_BASE_URL=https://casaora-git-develop.vercel.app
NEXT_PUBLIC_APP_URL=https://casaora-git-develop.vercel.app
SITE_URL=https://casaora-git-develop.vercel.app

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=[same as production]
NEXT_PUBLIC_SANITY_DATASET=staging
SANITY_API_READ_TOKEN=[same as production]
NEXT_PUBLIC_SANITY_API_READ_TOKEN=[same as production]
SANITY_API_WRITE_TOKEN=[staging-specific]

# Other
CRON_SECRET=[generate with: openssl rand -base64 32]
ANTHROPIC_API_KEY=[same as production]
```

---

## 💳 Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0025 0000 3155` | 🔒 3D Secure |
| `4000 0000 0000 9995` | ❌ Declined |

**Expiry:** Any future date (e.g., `12/34`)
**CVC:** Any 3 digits (e.g., `123`)
**ZIP:** Any 5 digits (e.g., `12345`)

---

## 🛡️ Branch Protection Checklist

**GitHub → Settings → Branches → Add rule**

**Branch:** `develop`

Required settings:
- ☑️ Require pull request reviews (1 approval)
- ☑️ Require status checks to pass before merging
  - ☑️ Require branches to be up to date
  - ☑️ Select: `Build Verification`
  - ☑️ Select: `Code Quality Check`
  - ☑️ Select: `Smoke Tests (E2E)`
- ☑️ Require conversation resolution
- ☑️ Include administrators
- ☑️ Restrict force pushes → Nobody
- ☑️ Do not allow deletions

---

## ✅ Verification Checklist

### After Each Step

**F-1.1 (Supabase):**
```bash
# Test database connection
curl https://[project-ref].supabase.co

# Verify in dashboard
# → Tables exist
# → Auth configured
```

**F-1.2 (Stripe):**
```bash
# Check test mode
# → Dashboard shows "TEST MODE" badge
# → Webhook endpoint configured
```

**F-1.3 (Resend):**
```bash
# Verify API key
# → Shows in Resend Dashboard → API Keys
```

**F-1.4 (Vercel):**
```bash
# Check deployment
curl https://casaora-git-develop.vercel.app

# Should return 200 OK
```

**F-3.5 (Branch Protection):**
```bash
# Create test PR
# → "Merge" button disabled
# → Status checks visible
```

### End-to-End Test

```bash
# 1. Create test PR
git checkout -b test/epic-f-complete
git commit --allow-empty -m "test: Epic F complete"
git push origin test/epic-f-complete

# 2. Verify in GitHub
# ✅ PR checks run automatically
# ✅ Build passes
# ✅ Lint passes
# ✅ Smoke tests pass
# ✅ Vercel deploys to staging
# ✅ Staging smoke tests pass
# ✅ PR shows summary comment

# 3. Verify staging works
# Visit: https://casaora-git-develop.vercel.app
# ✅ Homepage loads
# ✅ Professional search works
# ✅ Auth redirects work
```

---

## 🚨 Common Issues

### Issue: Supabase migrations fail

```bash
# Reset and retry
supabase db reset
supabase db push
```

### Issue: Vercel build fails

```bash
# Check environment variables
# → All required vars set?
# → Correct values?

# Check build logs in Vercel Dashboard
```

### Issue: Smoke tests fail

```bash
# Run locally to debug
bun run test:smoke:headed

# Check staging URL accessibility
curl https://casaora-git-develop.vercel.app
```

### Issue: Branch protection not showing checks

```bash
# Checks only appear after first run
# 1. Create test PR
# 2. Wait for checks to complete
# 3. Return to branch protection settings
```

---

## 📞 Support

- **Documentation:** [docs/ops/staging-environment-setup.md](./staging-environment-setup.md)
- **Implementation Log:** [docs/ops/EPIC-F-MANUAL-IMPLEMENTATION-LOG.md](./EPIC-F-MANUAL-IMPLEMENTATION-LOG.md)
- **Checklist:** [docs/ops/EPIC-F-IMPLEMENTATION-CHECKLIST.md](./EPIC-F-IMPLEMENTATION-CHECKLIST.md)

---

**Last Updated:** 2025-01-14
**Quick Reference Version:** 1.0
