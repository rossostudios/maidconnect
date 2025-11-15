# Epic F - Manual Implementation Log

**Started:** [Fill in date/time]
**Completed:** [Fill in when done]
**Implemented By:** [Your name]

---

## 🎯 Implementation Progress

- [ ] **F-1.1:** Supabase Staging Project
- [ ] **F-1.2:** Stripe Test Mode Keys
- [ ] **F-1.3:** Resend Test Environment
- [ ] **F-1.4:** Vercel Staging Environment
- [ ] **F-3.5:** GitHub Branch Protection
- [ ] **Verification:** Test end-to-end flow

---

## F-1.1: Supabase Staging Project

**Status:** ⏳ Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked

**Started:** _______________
**Completed:** _______________

### Configuration Values

```bash
# Record your actual values here:
STAGING_SUPABASE_URL=
STAGING_SUPABASE_ANON_KEY=
STAGING_SUPABASE_SERVICE_ROLE_KEY=
```

**Supabase Project Details:**
- Project Name: `casaora-staging`
- Project Ref: `_________________`
- Region: `_________________`
- Database Password: `[Saved in 1Password/LastPass]`

### Steps Completed

- [ ] Created new Supabase project
- [ ] Saved database password to password manager
- [ ] Linked local project: `supabase link --project-ref <ref>`
- [ ] Applied migrations: `supabase db push`
- [ ] Verified migrations applied successfully
- [ ] Configured authentication URL: `https://casaora-git-develop.vercel.app`
- [ ] Added redirect URLs: `https://casaora-git-develop.vercel.app/**`
- [ ] Enabled Email/Password auth provider
- [ ] Configured OAuth providers (if needed)
- [ ] Copied API keys (URL, Anon Key, Service Role Key)
- [ ] Added keys to GitHub Secrets

### GitHub Secrets Added

- [ ] `STAGING_SUPABASE_URL`
- [ ] `STAGING_SUPABASE_ANON_KEY`
- [ ] `STAGING_SUPABASE_SERVICE_ROLE_KEY`

### Notes / Issues

```
[Record any issues encountered or notes here]
```

---

## F-1.2: Stripe Test Mode Keys

**Status:** ⏳ Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked

**Started:** _______________
**Completed:** _______________

### Configuration Values

```bash
# Record your actual values here:
STAGING_STRIPE_SECRET_KEY=sk_test_
STAGING_STRIPE_PUBLISHABLE_KEY=pk_test_
STAGING_STRIPE_WEBHOOK_SECRET=whsec_
```

**Webhook Endpoint:**
- URL: `https://casaora-git-develop.vercel.app/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.created`, `customer.subscription.deleted`

### Steps Completed

- [ ] Toggled Stripe to "View test data"
- [ ] Copied test secret key: `sk_test_...`
- [ ] Copied test publishable key: `pk_test_...`
- [ ] Created webhook endpoint for staging
- [ ] Configured webhook events
- [ ] Copied webhook signing secret: `whsec_...`
- [ ] Added keys to GitHub Secrets

### GitHub Secrets Added

- [ ] `STAGING_STRIPE_SECRET_KEY`
- [ ] `STAGING_STRIPE_PUBLISHABLE_KEY`
- [ ] `STAGING_STRIPE_WEBHOOK_SECRET`

### Test Cards Verified

- [ ] Success: `4242 4242 4242 4242` ✅
- [ ] 3D Secure: `4000 0025 0000 3155` ✅
- [ ] Decline: `4000 0000 0000 9995` ✅

### Notes / Issues

```
[Record any issues encountered or notes here]
```

---

## F-1.3: Resend Test Environment

**Status:** ⏳ Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked

**Started:** _______________
**Completed:** _______________

### Configuration Values

```bash
# Record your actual values here:
STAGING_RESEND_API_KEY=re_
```

**Resend Details:**
- API Key Name: `Staging - Casaora`
- Permission: Full access
- Test Email: `staging+test@casaora.co` (if needed)

### Steps Completed

- [ ] Created new Resend API key: "Staging - Casaora"
- [ ] Copied API key: `re_...`
- [ ] Added key to GitHub Secrets
- [ ] Verified test mode behavior in Resend dashboard

### GitHub Secrets Added

- [ ] `STAGING_RESEND_API_KEY`

### Notes / Issues

```
[Record any issues encountered or notes here]
```

---

## F-1.4: Vercel Staging Environment

**Status:** ⏳ Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked

**Started:** _______________
**Completed:** _______________

### Configuration Values

**Staging URL:** `_____________________________________`
(Example: `https://casaora-git-develop.vercel.app`)

### Steps Completed

#### Vercel Project Setup

- [ ] Verified Vercel project exists
- [ ] Configured Git settings:
  - [ ] Production Branch: `main`
  - [ ] Preview Branches: `develop`, `feature/*`

#### Environment Variables Added (Preview - develop branch only)

**Core Services:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (from F-1.1)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from F-1.1)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (from F-1.1)
- [ ] `STRIPE_SECRET_KEY` (from F-1.2)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (from F-1.2)
- [ ] `STRIPE_WEBHOOK_SECRET` (from F-1.2)
- [ ] `RESEND_API_KEY` (from F-1.3)

**Sanity CMS:**
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` (same as production)
- [ ] `NEXT_PUBLIC_SANITY_DATASET` = `staging`
- [ ] `SANITY_API_READ_TOKEN` (same as production or staging-specific)
- [ ] `NEXT_PUBLIC_SANITY_API_READ_TOKEN` (same as read token)
- [ ] `SANITY_API_WRITE_TOKEN` (staging-specific)
- [ ] `SANITY_WEBHOOK_SECRET` (same as production or staging-specific)

**Application URLs:**
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://casaora-git-develop.vercel.app`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://casaora-git-develop.vercel.app`
- [ ] `SITE_URL` = `https://casaora-git-develop.vercel.app`

**Monitoring (Optional):**
- [ ] `LOGTAIL_SOURCE_TOKEN` (staging token)
- [ ] `NEXT_PUBLIC_LOGTAIL_TOKEN` (staging token)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` (same as production or staging project)
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com`

**Other:**
- [ ] `CRON_SECRET` (generate with: `openssl rand -base64 32`)
- [ ] `ANTHROPIC_API_KEY` (same as production)
- [ ] `NEXT_PUBLIC_FEATURE_AMARA_ENABLED` = `true`

#### Deployment

- [ ] Pushed to develop branch: `git push origin develop`
- [ ] Verified Vercel deployment started
- [ ] Deployment completed successfully
- [ ] Staging URL accessible: `___________________________________`

### Staging URL Verification

- [ ] Homepage loads: `https://casaora-git-develop.vercel.app`
- [ ] Professional search works: `/professionals`
- [ ] Auth redirects work: `/dashboard/pro` → `/auth/login`

### Notes / Issues

```
[Record any issues encountered or notes here]
```

---

## F-3.5: GitHub Branch Protection

**Status:** ⏳ Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked

**Started:** _______________
**Completed:** _______________

### Steps Completed

#### Branch Protection Rule for `develop`

- [ ] Navigated to GitHub → Settings → Branches
- [ ] Clicked "Add rule"
- [ ] Branch name pattern: `develop`

**Settings Enabled:**

- [ ] ☑️ Require a pull request before merging
  - [ ] Required approvals: `1`
  - [ ] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from Code Owners (if applicable)

- [ ] ☑️ Require status checks to pass before merging
  - [ ] Require branches to be up to date before merging
  - [ ] Required status checks selected:
    - [ ] `Build Verification`
    - [ ] `Code Quality Check`
    - [ ] `Smoke Tests (E2E)`

- [ ] ☑️ Require conversation resolution before merging

- [ ] ☑️ Require linear history (optional)

- [ ] ☑️ Include administrators

- [ ] ☑️ Restrict force pushes → Nobody

- [ ] ☑️ Do not allow deletions

- [ ] Saved changes

### Verification Test

- [ ] Created test PR: `git checkout -b test/branch-protection`
- [ ] Verified "Merge" button disabled (checks pending)
- [ ] Verified PR checks running:
  - [ ] Build Verification
  - [ ] Code Quality Check
  - [ ] Smoke Tests (E2E)
- [ ] Verified review required
- [ ] All checks passed → Merge button enabled ✅

### Notes / Issues

```
[Record any issues encountered or notes here]
```

---

## Final Verification

**Status:** ⏳ Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked

**Started:** _______________
**Completed:** _______________

### End-to-End Test Flow

#### 1. Create Test PR

```bash
git checkout develop
git pull origin develop
git checkout -b test/epic-f-verification
echo "# Epic F Test" > test-epic-f.md
git add test-epic-f.md
git commit -m "test: Epic F verification"
git push origin test/epic-f-verification
```

- [ ] Test PR created
- [ ] PR opened on GitHub

#### 2. Verify PR Checks

- [ ] ✅ Build Verification job started
- [ ] ✅ Code Quality Check job started
- [ ] ✅ Smoke Tests (E2E) job started
- [ ] ✅ All jobs running in parallel
- [ ] ✅ PR summary comment added by bot

**Check Results:**
- Build Verification: ⏳ Running | ✅ Passed | ❌ Failed
- Code Quality Check: ⏳ Running | ✅ Passed | ❌ Failed
- Smoke Tests: ⏳ Running | ✅ Passed | ❌ Failed

#### 3. Verify Vercel Staging Deployment

- [ ] Vercel preview deployment created
- [ ] Deployment linked in PR
- [ ] Deployment completed successfully
- [ ] Staging URL accessible

**Staging URL:** `_____________________________________`

#### 4. Verify Staging Smoke Tests

- [ ] Staging smoke tests job triggered
- [ ] Tests ran against staging URL
- [ ] Test results commented on PR
- [ ] Deployment status updated

**Test Results:** ⏳ Running | ✅ Passed | ❌ Failed

#### 5. Verify Branch Protection

- [ ] "Merge" button disabled until checks pass
- [ ] "Merge" button disabled until review approved
- [ ] Requested review from teammate
- [ ] Review approved
- [ ] All checks passed
- [ ] "Merge" button enabled ✅

#### 6. Merge Test PR

- [ ] Merged test PR to develop
- [ ] Verified develop branch updated
- [ ] Cleaned up test branch

### Manual Testing on Staging

- [ ] Professional search page: `https://[staging-url]/professionals`
- [ ] Signup flow: `https://[staging-url]/auth/sign-up`
- [ ] Test Stripe payment with card `4242 4242 4242 4242`
- [ ] Verified payment in Stripe test dashboard
- [ ] Checked email in Resend logs
- [ ] Verified user in Supabase staging database

### Notes / Issues

```
[Record any issues encountered or notes here]
```

---

## Post-Implementation Checklist

### Documentation

- [ ] Updated team wiki with staging URLs
- [ ] Shared staging environment access with team
- [ ] Documented Stripe test cards in team docs
- [ ] Added staging credentials to password manager

### Communication

- [ ] Announced staging environment in #engineering
- [ ] Demoed staging workflow to team
- [ ] Documented any gotchas or known issues

### Next Steps

- [ ] Schedule weekly staging database resets
- [ ] Set up monitoring for staging
- [ ] Create runbook for common staging issues
- [ ] Schedule staging environment review (1 month)

---

## Issues & Resolutions

### Issue 1

**Date:** _______________
**Issue:**
```
[Describe the issue]
```

**Resolution:**
```
[How it was resolved]
```

---

### Issue 2

**Date:** _______________
**Issue:**
```
[Describe the issue]
```

**Resolution:**
```
[How it was resolved]
```

---

## Summary

**Total Time Spent:** ___________ hours

**Completion Status:**
- F-1.1 Supabase: ⏳ | ✅ | ❌
- F-1.2 Stripe: ⏳ | ✅ | ❌
- F-1.3 Resend: ⏳ | ✅ | ❌
- F-1.4 Vercel: ⏳ | ✅ | ❌
- F-3.5 Branch Protection: ⏳ | ✅ | ❌
- Verification: ⏳ | ✅ | ❌

**Overall Status:** 🎉 COMPLETE | ⚠️ PARTIAL | ❌ BLOCKED

**Key Learnings:**
```
[What went well? What could be improved?]
```

**Recommendations for Future Epics:**
```
[Any process improvements or lessons learned]
```

---

**Signed Off By:** _______________
**Date:** _______________
