# Operations Documentation

Infrastructure, deployment, and automation guides for Casaora.

## Table of Contents

- [Staging Environment](#staging-environment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Smoke Testing](#smoke-testing)
- [Branch Protection](#branch-protection)

---

## Staging Environment

**Status:** ✅ Infrastructure code complete, awaiting manual setup

### What is Staging?

A production-like environment for testing changes before deployment. Includes:

- Separate Supabase database (no production data)
- Stripe test mode (use test cards)
- Resend email sandbox (no real emails sent)
- Vercel preview deployment (auto-deployed from `develop`)

### Implementation Guides

📖 **[Quick Reference Guide](./EPIC-F-QUICK-REFERENCE.md)** - Cheat sheet with commands and links (5 min read)

📖 **[Staging Environment Setup](./staging-environment-setup.md)** - Complete step-by-step guide (45-60 min)

📋 **[Manual Implementation Log](./EPIC-F-MANUAL-IMPLEMENTATION-LOG.md)** - Track your progress as you implement

📊 **[Implementation Checklist](./EPIC-F-IMPLEMENTATION-CHECKLIST.md)** - Overview and status

**Estimated Time:** 45-60 minutes

### Accessing Staging

| Service | URL |
|---------|-----|
| **Staging App** | `https://casaora-git-develop.vercel.app` |
| **Staging Supabase** | `https://[project-ref].supabase.co` |
| **Stripe Test Dashboard** | `https://dashboard.stripe.com` (toggle test mode) |
| **Resend Logs** | `https://resend.com/logs` |

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. PR Checks (`.github/workflows/pr-checks.yml`)

**Triggers:** Every PR to `develop`

**Jobs:**
- ✅ **Build Verification** - Ensures code compiles
- ✅ **Code Quality Check** - Runs Biome linter
- ✅ **Smoke Tests (E2E)** - Runs critical Playwright tests

**Duration:** ~10-15 minutes

**What happens:**
1. PR opened/updated
2. GitHub Actions runs all jobs in parallel
3. PR status updated (✅ all pass / ❌ any fail)
4. PR summary comment added

#### 2. Staging Smoke Tests (`.github/workflows/staging-smoke-tests.yml`)

**Triggers:** After Vercel staging deployment completes

**Jobs:**
- ✅ Runs smoke tests against live staging URL
- ✅ Updates deployment status
- ✅ Comments on PR with results

**Duration:** ~5-10 minutes

**What happens:**
1. Vercel deploys to staging
2. Workflow waits for deployment to be ready
3. Runs smoke tests against staging URL
4. Reports results in PR

### Running Locally

```bash
# Run full test suite
bun test

# Run smoke tests only (faster)
bun run test:smoke

# Run smoke tests with UI
bun run test:smoke:ui

# Run smoke tests against staging
PLAYWRIGHT_BASE_URL=https://casaora-git-develop.vercel.app bun run test:smoke
```

---

## Smoke Testing

### What is a Smoke Test?

A **minimal subset of critical E2E tests** that verify core functionality:

✅ Professional search page loads
✅ Authentication gates work (redirect to login)
✅ Navigation flows work

**Purpose:** Fast feedback on critical user journeys.

### Smoke Suite vs Full Suite

| Feature | Smoke Suite | Full Test Suite |
|---------|-------------|-----------------|
| **Runtime** | 2-3 minutes | 15-20 minutes |
| **Tests** | ~5-8 critical tests | ~50+ comprehensive tests |
| **When** | Every PR, every deploy | Nightly, pre-release |
| **Coverage** | Happy paths only | Full edge cases |

### Configuration

Smoke tests use a separate Playwright config:

- **Config File:** [`playwright.smoke.config.ts`](../../playwright.smoke.config.ts)
- **Test Files:** Same files as full suite, filtered by grep pattern
- **Pattern:** Tests matching core navigation and auth keywords

### Adding Tests to Smoke Suite

To include a test in the smoke suite, ensure it matches the grep pattern:

```typescript
// tests/playwright/e2e/your-test.spec.ts

test("should display search page", async ({ page }) => {
  // This test is automatically included (matches "should display" pattern)
  await navigateTo(page, "/professionals");
  await expectTextPresent(page, "Find");
});
```

Current grep pattern:
```typescript
grep: /(should display search page|should require authentication|should navigate to professional signup|should redirect to login when accessing)/
```

To add more tests, update the pattern in [`playwright.smoke.config.ts:18`](../../playwright.smoke.config.ts#L18).

---

## Branch Protection

### Required Status Checks

Before merging to `develop`, these checks **must pass**:

1. ✅ Build Verification
2. ✅ Code Quality Check (Biome)
3. ✅ Smoke Tests (E2E)
4. ✅ At least 1 code review approval

### Setup Guide

📖 **[GitHub Branch Protection Setup](./github-branch-protection.md)**

**Estimated Time:** 10-15 minutes

### Quick Setup

1. Go to GitHub → Settings → Branches
2. Add rule for `develop`
3. Enable:
   - ☑️ Require pull request reviews
   - ☑️ Require status checks to pass
   - ☑️ Require conversation resolution
4. Select required checks:
   - `Build Verification`
   - `Code Quality Check`
   - `Smoke Tests (E2E)`
5. Save changes

---

## Troubleshooting

### PR checks failing?

**Build Verification fails:**
```bash
# Run build locally
bun run build

# Check for TypeScript errors
# Fix errors and push again
```

**Code Quality Check fails:**
```bash
# Run Biome check locally
bun run check

# Auto-fix issues
bun run check:fix

# Commit and push
git add .
git commit -m "fix: resolve Biome lint errors"
git push
```

**Smoke tests fail:**
```bash
# Run smoke tests locally
bun run test:smoke

# Run with UI to debug
bun run test:smoke:ui

# Check specific test output
# Fix failing tests and push
```

### Staging environment issues?

See troubleshooting section in:
📖 [Staging Environment Setup Guide](./staging-environment-setup.md#when-things-break)

---

## Deployment Flow

### Development → Staging → Production

```
1. Feature branch
   ├─ Create PR to develop
   ├─ PR checks run (build, lint, smoke tests)
   └─ ✅ Merge after approval + passing checks

2. Develop branch (staging)
   ├─ Auto-deploys to Vercel staging
   ├─ Staging smoke tests run
   ├─ Manual QA testing
   └─ ✅ Ready for production

3. Production release (Friday 4pm)
   ├─ Run: bash scripts/create-release.sh
   ├─ Merges develop → main
   ├─ Creates Git tag + GitHub release
   └─ Auto-deploys to production
```

---

## Monitoring

### Where to Check Status

| System | Dashboard |
|--------|-----------|
| **Deployments** | [Vercel Dashboard](https://vercel.com/dashboard) |
| **CI/CD** | [GitHub Actions](https://github.com/your-org/casaora/actions) |
| **Logs** | [Better Stack](https://logs.betterstack.com) |
| **Errors** | [PostHog](https://us.posthog.com) |
| **Database** | [Supabase Dashboard](https://supabase.com/dashboard) |

### Key Metrics

- **PR Check Success Rate:** Target > 95%
- **Smoke Test Pass Rate:** Target 100%
- **Staging Deployment Time:** Target < 5 minutes
- **PR Review Time:** Target < 24 hours

---

## Maintenance

### Weekly Tasks

- [ ] Review failed smoke test reports
- [ ] Check staging deployment logs
- [ ] Verify all services operational

### Monthly Tasks

- [ ] Rotate staging secrets
- [ ] Review CI/CD costs (GitHub Actions minutes)
- [ ] Update smoke test suite
- [ ] Clean up old preview deployments

---

## Related Documentation

- [Staging Environment Setup](./staging-environment-setup.md)
- [GitHub Branch Protection](./github-branch-protection.md)
- [Release Strategy](../release-strategy.md)
- [Deployment Scripts](../../scripts/README.md)

---

**Last Updated:** 2025-01-14
**Maintained By:** DevOps Team
