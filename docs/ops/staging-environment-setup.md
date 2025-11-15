# Staging Environment Setup Guide

**Epic F-1: Provision Full Staging Stack**

This guide walks through setting up a complete staging environment for Casaora with automated testing and CI/CD integration.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [F-1.1: Supabase Staging Project](#f-11-supabase-staging-project)
- [F-1.2: Stripe Test Mode](#f-12-stripe-test-mode)
- [F-1.3: Resend Test Environment](#f-13-resend-test-environment)
- [F-1.4: Vercel Staging Environment](#f-14-vercel-staging-environment)
- [F-1.5: Environment Variables Reference](#f-15-environment-variables-reference)
- [Testing the Setup](#testing-the-setup)
- [Maintenance](#maintenance)

---

## Overview

The staging environment is a **production-like environment** for testing changes before they reach production. It includes:

- Separate Supabase database (fresh migrations, no production data)
- Stripe test mode keys (use test credit cards)
- Resend test environment (emails go to sandbox)
- Vercel Preview environment (auto-deployed from `develop` branch)
- Automated smoke tests on every deployment

**Architecture:**

```
develop branch push
  ↓
Vercel builds & deploys to staging
  ↓
GitHub Actions runs smoke tests
  ↓
PR status updated (✅ pass / ❌ fail)
```

---

## Prerequisites

- Admin access to Supabase organization
- Admin access to Stripe account
- Admin access to Resend account
- Admin access to Vercel team/project
- Admin access to GitHub repository settings

---

## F-1.1: Supabase Staging Project

### Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Configure:
   - **Name**: `casaora-staging`
   - **Database Password**: Generate strong password (save in 1Password)
   - **Region**: Same as production (e.g., `us-east-1`)
   - **Pricing Plan**: Free tier (suitable for staging)

4. Wait for provisioning (~2 minutes)

### Step 2: Apply Database Migrations

```bash
# Navigate to project root
cd /path/to/casaora

# Link to staging project (you'll need the project ref)
supabase link --project-ref <staging-project-ref>

# Apply all migrations
supabase db push

# Verify tables exist
supabase db diff
```

### Step 3: Configure Authentication

1. In Supabase Dashboard → Authentication → URL Configuration:
   - **Site URL**: `https://casaora-staging.vercel.app` (will update after Vercel setup)
   - **Redirect URLs**: Add `https://casaora-staging.vercel.app/**`

2. In Authentication → Providers:
   - Enable Email/Password
   - Configure OAuth providers (Google, Facebook) with **test app credentials**

### Step 4: Copy API Keys

From Supabase Dashboard → Settings → API:

```bash
# Copy these values for Vercel environment setup:
STAGING_SUPABASE_URL=https://[project-ref].supabase.co
STAGING_SUPABASE_ANON_KEY=eyJhbG...
STAGING_SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Keep secret!
```

**Security Note:** Never commit staging keys to `.env` files. Store in GitHub Secrets.

---

## F-1.2: Stripe Test Mode

### Step 1: Get Test API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle **"View test data"** (top right)
3. Navigate to Developers → API keys
4. Copy test keys:

```bash
STAGING_STRIPE_SECRET_KEY=sk_test_...
STAGING_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Step 2: Configure Test Webhooks

1. Navigate to Developers → Webhooks
2. Click **"Add endpoint"** (test mode)
3. Configure:
   - **Endpoint URL**: `https://casaora-staging.vercel.app/api/webhooks/stripe`
   - **Events to send**:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.deleted`

4. Copy signing secret:

```bash
STAGING_STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 3: Test with Stripe Test Cards

Use these test cards in staging:

| Card Number          | Scenario              |
|----------------------|-----------------------|
| `4242 4242 4242 4242` | Successful payment   |
| `4000 0025 0000 3155` | 3D Secure required   |
| `4000 0000 0000 9995` | Card declined        |

**Expiry**: Any future date (e.g., `12/34`)
**CVC**: Any 3 digits (e.g., `123`)

---

## F-1.3: Resend Test Environment

### Step 1: Create Test API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click **"Create API Key"**
3. Configure:
   - **Name**: `Staging - Casaora`
   - **Permission**: Full access
   - **Domain**: Use default testing domain or add staging subdomain

```bash
STAGING_RESEND_API_KEY=re_...
```

### Step 2: Test Email Delivery

Resend test mode behavior:
- Emails are **not actually delivered**
- View sent emails in Resend Dashboard → Logs
- Perfect for testing email templates without spamming

**Recommended**: Create a dedicated `staging+test@casaora.co` email for testing real delivery.

---

## F-1.4: Vercel Staging Environment

### Step 1: Create Vercel Project (if not exists)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..." → Project**
3. Import your GitHub repository: `your-org/casaora`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `bun run build`
   - **Install Command**: `bun install`

### Step 2: Configure Preview Deployments

Vercel automatically creates preview deployments for every PR. We'll configure staging as a persistent preview environment.

1. In Project Settings → Git:
   - **Production Branch**: `main`
   - **Preview Branches**: `develop`, `feature/*`

2. This ensures:
   - `main` → Production deployment (`casaora.vercel.app`)
   - `develop` → Staging deployment (`casaora-git-develop.vercel.app`)
   - PRs → Ephemeral preview deployments

### Step 3: Add Environment Variables

In Vercel Project Settings → Environment Variables:

**Target:** Preview (develop branch only)

| Variable Name                      | Value                          |
|------------------------------------|--------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`         | (from F-1.1 Step 4)           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | (from F-1.1 Step 4)           |
| `SUPABASE_SERVICE_ROLE_KEY`        | (from F-1.1 Step 4)           |
| `STRIPE_SECRET_KEY`                | (from F-1.2 Step 1)           |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (from F-1.2 Step 1)         |
| `STRIPE_WEBHOOK_SECRET`            | (from F-1.2 Step 2)           |
| `RESEND_API_KEY`                   | (from F-1.3 Step 1)           |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`    | (same as production)          |
| `NEXT_PUBLIC_SANITY_DATASET`       | `staging` (create in Sanity)  |
| `SANITY_API_READ_TOKEN`            | (same as production)          |
| `SANITY_API_WRITE_TOKEN`           | (staging-specific token)      |
| `NEXT_PUBLIC_BASE_URL`             | `https://casaora-git-develop.vercel.app` |
| `NEXT_PUBLIC_APP_URL`              | `https://casaora-git-develop.vercel.app` |
| `SITE_URL`                         | `https://casaora-git-develop.vercel.app` |

**Security Best Practice:** Copy from GitHub Secrets (don't type manually).

### Step 4: Add GitHub Secrets

In GitHub Repository → Settings → Secrets → Actions:

```bash
# Add all staging environment variables as secrets:
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_STRIPE_SECRET_KEY
STAGING_STRIPE_PUBLISHABLE_KEY
# ... etc
```

These secrets are used by GitHub Actions for smoke tests.

### Step 5: Deploy to Staging

```bash
# Push to develop branch
git checkout develop
git push origin develop

# Vercel automatically deploys
# Check deployment at: https://casaora-git-develop.vercel.app
```

---

## F-1.5: Environment Variables Reference

### Complete `.env.staging` Template

**Do not commit this file!** Use as reference for Vercel/GitHub Secrets.

```bash
# ============================================
# Casaora Staging Environment Variables
# ============================================

# Supabase (Staging Project)
NEXT_PUBLIC_SUPABASE_URL=https://[staging-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (Test API Key)
RESEND_API_KEY=re_...

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=staging
NEXT_PUBLIC_SANITY_STUDIO_URL=https://casaora-git-develop.vercel.app/studio
SANITY_API_READ_TOKEN=sk...
NEXT_PUBLIC_SANITY_API_READ_TOKEN=sk...
SANITY_API_WRITE_TOKEN=sk...
SANITY_WEBHOOK_SECRET=your-webhook-secret

# Application URLs
NEXT_PUBLIC_BASE_URL=https://casaora-git-develop.vercel.app
NEXT_PUBLIC_APP_URL=https://casaora-git-develop.vercel.app
SITE_URL=https://casaora-git-develop.vercel.app

# Monitoring (Optional: same as production or separate project)
LOGTAIL_SOURCE_TOKEN=your-staging-token
NEXT_PUBLIC_LOGTAIL_TOKEN=your-staging-token
NEXT_PUBLIC_POSTHOG_KEY=phc_staging_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Feature Flags (staging-specific)
NEXT_PUBLIC_FEATURE_AMARA_ENABLED=true
NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS=true
```

---

## Testing the Setup

### Manual Verification

1. **Staging URL loads:**
   ```bash
   curl https://casaora-git-develop.vercel.app
   # Should return 200 OK
   ```

2. **Database connectivity:**
   - Navigate to staging URL
   - Try to sign up (should create user in staging Supabase)
   - Check Supabase Dashboard → Authentication → Users

3. **Stripe test payment:**
   - Create a test booking
   - Use test card: `4242 4242 4242 4242`
   - Verify payment intent in Stripe Dashboard (test mode)

4. **Email sending:**
   - Trigger password reset
   - Check Resend Dashboard → Logs for email log

### Automated Smoke Tests

Run locally against staging:

```bash
# Set staging URL
export PLAYWRIGHT_BASE_URL=https://casaora-git-develop.vercel.app

# Run smoke tests
bun run test:smoke

# View report
bun run test:report
```

### CI/CD Integration Test

1. Create a test PR to `develop`:
   ```bash
   git checkout -b test/staging-setup
   git commit --allow-empty -m "test: verify staging CI/CD"
   git push origin test/staging-setup
   ```

2. Open PR on GitHub

3. Verify GitHub Actions:
   - ✅ Build job passes
   - ✅ Lint job passes
   - ✅ Smoke tests job passes
   - ✅ PR summary comment appears

4. Verify Vercel deployment:
   - Preview deployment created
   - Deployment status linked in PR
   - Smoke tests run after deployment

---

## Maintenance

### Weekly Tasks

- [ ] Review staging logs (Logtail/Better Stack)
- [ ] Check Stripe test mode for any issues
- [ ] Verify database migrations apply cleanly
- [ ] Run smoke tests manually

### Monthly Tasks

- [ ] Rotate Supabase service role key
- [ ] Review Vercel preview deployment costs
- [ ] Clean up old preview deployments
- [ ] Update test data in staging database

### When Things Break

**Staging deployment fails:**
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check GitHub Actions logs for build errors
4. Compare with production build

**Smoke tests fail:**
1. Run tests locally: `bun run test:smoke`
2. Check test output for specific failure
3. Verify staging URL is accessible
4. Check Supabase/Stripe connectivity

**Database out of sync:**
```bash
# Reset staging database to match migrations
supabase link --project-ref <staging-ref>
supabase db reset
```

---

## Next Steps

- [ ] **F-3.5**: Add required status checks to GitHub branch protection
- [ ] Configure Slack/Discord notifications for failed smoke tests
- [ ] Set up automated weekly staging database resets
- [ ] Document rollback procedures

---

**Last Updated:** 2025-01-14
**Owner:** DevOps Team
**Status:** Ready for implementation
