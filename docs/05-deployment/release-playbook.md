# Release Playbook

**Purpose:** Step-by-step guide for deploying changes to production safely. Follow this checklist to ensure successful releases and minimize risk of incidents.

---

## Table of Contents

- [Release Types](#release-types)
- [Pre-Release Checklist](#pre-release-checklist)
- [Deployment Process](#deployment-process)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedures](#rollback-procedures)
- [Communication Plan](#communication-plan)
- [Emergency Hotfix Process](#emergency-hotfix-process)
- [Release Calendar](#release-calendar)
- [Lessons Learned](#lessons-learned)

---

## Release Types

### Standard Release (Weekly)

**Timing:** Tuesdays, 10am-12pm UTC (avoid Monday & Friday)

**Characteristics:**
- Multiple features/fixes bundled
- Full pre-release checklist
- Planned communication
- Team monitoring

**Example:**
```
Release: Week 45 - November 2025
- 5 bug fixes
- 2 new features
- 1 performance improvement
- 0 breaking changes
```

---

### Hotfix Release (As Needed)

**Timing:** Anytime (emergency only)

**Characteristics:**
- Single critical fix
- Minimal testing (focus on fix)
- Fast deployment
- Post-incident review required

**Example:**
```
Hotfix: Payment Processing Error
- Critical bug: Bookings failing
- Single fix: Stripe API call error
- Deploy time: 15 minutes
- No other changes
```

---

### Database Migration Release

**Timing:** Tuesdays only, early (9am UTC)

**Characteristics:**
- Includes schema changes
- Extra verification required
- Rollback complexity higher
- Database expert on standby

**Example:**
```
Release: Add recurring bookings
- New table: recurring_booking_schedules
- Modified table: bookings (add recurring_id column)
- New RLS policies
- Backward compatible migration
```

---

## Pre-Release Checklist

### 1. Code Quality Checks (15 minutes)

**Run locally before creating PR:**

```bash
# 1. Lint check (Biome)
bun run check
# ✓ All files pass linting

# 2. Format check
bun run check:fix
# ✓ All files formatted

# 3. Type check (build includes typecheck)
bun run build
# ✓ Build successful
# ✓ No TypeScript errors

# 4. Run tests
bun test
# ✓ All tests passing
```

**Criteria for passing:**
- [ ] Zero Biome errors
- [ ] Zero TypeScript errors
- [ ] All tests passing
- [ ] Build successful

---

### 2. Feature Validation (30 minutes)

**Manual testing:**

```
Test Scenarios:
[ ] Authentication
   - Sign up (new user)
   - Sign in (existing user)
   - Sign out
   - Session persistence

[ ] Core Flows
   - Search professionals
   - View professional profile
   - Create booking
   - Process payment (test mode)
   - View booking in dashboard

[ ] New Features (if any)
   - [List specific features to test]

[ ] Regression Testing
   - Test features changed in last 2 releases
   - Verify no breakage
```

---

### 3. Database Migration Review (if applicable)

**Migration Checklist:**

```bash
# 1. Review migration file
cat supabase/migrations/[timestamp]_description.sql

# 2. Verify migration is idempotent
# Can it run multiple times safely?
# Does it use IF NOT EXISTS / IF EXISTS?

# 3. Test migration locally
supabase db reset
# ✓ All migrations apply successfully

# 4. Check for data loss risk
# Does migration drop columns/tables?
# Is data backed up?

# 5. Prepare rollback migration
# Create rollback SQL if needed
# Test rollback locally

# 6. Verify RLS policies
# New table has RLS enabled?
# Policies tested?
```

**Migration Safety:**
- [ ] Migration tested locally
- [ ] Migration is backward compatible (if possible)
- [ ] Rollback migration prepared
- [ ] No data loss risk (or data backed up)
- [ ] RLS policies included and tested

---

### 4. Environment Variables Check

**Verify all required env vars present:**

```bash
# Check Vercel environment variables
# Vercel Dashboard → Settings → Environment Variables

Required for Production:
[ ] NEXT_PUBLIC_SUPABASE_URL
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] SUPABASE_SERVICE_ROLE_KEY
[ ] STRIPE_SECRET_KEY
[ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
[ ] STRIPE_WEBHOOK_SECRET
[ ] RESEND_API_KEY
[ ] ANTHROPIC_API_KEY
[ ] CRON_SECRET
[ ] LOGTAIL_SOURCE_TOKEN
[ ] NEXT_PUBLIC_LOGTAIL_TOKEN

Optional:
[ ] UPSTASH_REDIS_REST_URL
[ ] UPSTASH_REDIS_REST_TOKEN
[ ] GOOGLE_TRANSLATE_API_KEY

New Variables (if added this release):
[ ] [List any new env vars]
```

---

### 5. Preview Deployment Testing (20 minutes)

**Test in Vercel preview:**

```bash
# 1. Create PR (if not already done)
gh pr create --title "Release: [description]" --body "[changes]"

# 2. Wait for Vercel preview deployment
# Vercel posts preview URL in PR comments

# 3. Test in preview environment
# Click preview URL
# Run through test scenarios
# Verify functionality

# 4. Check preview logs
# Better Stack → Filter by preview deployment ID
# Any errors?
```

**Preview Testing:**
- [ ] Preview deployment successful
- [ ] All features work in preview
- [ ] No console errors
- [ ] No API errors in Better Stack

---

### 6. Team Communication (5 minutes)

**Notify team of upcoming release:**

```markdown
# In team channel:

📦 RELEASE PLANNED: [Date/Time]

**Changes:**
- [Feature/fix 1]
- [Feature/fix 2]
- [Feature/fix 3]

**Impact:**
- User-facing changes: [Yes/No - describe]
- Database migration: [Yes/No]
- Downtime expected: [None]
- Rollback complexity: [Low/Medium/High]

**Testing:**
- Tests passing: ✓
- Preview tested: ✓
- Code reviewed: ✓

**Deployment time:** [Time in UTC]
**Monitoring:** [Who will monitor]

@team - Any concerns?
```

---

## Deployment Process

### Standard Deployment Flow

**Timeline: 10-15 minutes**

```bash
# Step 1: Final checks (2 minutes)
# Verify all pre-release checklist items complete
# Confirm team is ready

# Step 2: Merge PR (1 minute)
# GitHub → Pull Request → Merge
# Choose "Squash and merge"
# Confirm merge

# Step 3: Monitor Vercel build (3-5 minutes)
# Vercel Dashboard → Deployments
# Watch build progress
# Wait for "Ready" status

# Step 4: Deployment completes (automatic)
# Vercel promotes to production
# New deployment goes live

# Step 5: Quick smoke test (2 minutes)
# Visit https://maidconnect.com
# Test key flows:
#   - Home page loads
#   - Sign in works
#   - Dashboard loads

# Step 6: Monitor for 15 minutes
# Watch Better Stack for errors
# Check Vercel analytics
# Monitor user reports
```

---

### Deployment Steps (Detailed)

**1. Merge to Main (1 minute)**

```bash
# Option A: GitHub UI
# 1. Go to Pull Request
# 2. Click "Squash and merge"
# 3. Edit commit message if needed
# 4. Confirm merge

# Option B: Command line
gh pr merge --squash
# Merges PR with squash commit
```

---

**2. Monitor Vercel Build (3-5 minutes)**

```
Open Vercel Dashboard:
1. Go to: https://vercel.com/dashboard
2. Click on "maidconnect" project
3. Click "Deployments" tab
4. Watch latest deployment

Build stages:
  ├── Queued (< 10 seconds)
  ├── Building (2-3 minutes)
  │   ├── Running checks
  │   ├── Installing dependencies
  │   ├── Building application
  │   └── Uploading artifacts
  ├── Ready (30 seconds)
  └── Live (automatic)

What to watch for:
- Build time: Should be 2-4 minutes
- Status: Should turn green "Ready"
- Errors: Should be zero
```

---

**3. Automatic Production Deployment**

```
Vercel automatically:
1. ✓ Completes build successfully
2. ✓ Runs health checks
3. ✓ Promotes to production domain
4. ✓ Updates edge network
5. ✓ Invalidates CDN cache

No manual intervention required!
```

---

**4. First Smoke Test (2 minutes)**

```bash
# Open production site
open https://maidconnect.com

# Visual check:
[ ] Page loads within 3 seconds
[ ] No console errors (F12 → Console)
[ ] No visual glitches

# Quick functionality test:
[ ] Navigation works
[ ] Sign in page loads (/en/auth/sign-in)
[ ] Dashboard loads (sign in if needed)
[ ] Search professionals works
[ ] Professional profiles load

# If new feature deployed:
[ ] Test new feature specifically
```

---

## Post-Deployment Verification

### Monitoring Window: 15 Minutes

**Watch for anomalies:**

```bash
# 1. Better Stack Logs (5 minutes)
# Open: https://logs.betterstack.com
# Filter: created_at:>now-10m

Check for:
[ ] No error spike (error rate < 5%)
[ ] No new error types
[ ] API response times normal (< 3s)
[ ] No database errors

# 2. Vercel Analytics (5 minutes)
# Open: https://vercel.com/analytics

Check for:
[ ] Traffic levels normal
[ ] No increase in 5xx errors
[ ] Page load times consistent

# 3. Supabase Dashboard (5 minutes)
# Open: https://supabase.com/dashboard

Check for:
[ ] Database CPU/memory normal
[ ] Query performance unchanged
[ ] No connection issues
[ ] Migration applied (if applicable)
```

---

### Extended Testing (30 minutes)

**Comprehensive feature testing:**

```markdown
Core Flows (test each):

Authentication:
[ ] Sign up new user (test mode)
[ ] Sign in existing user
[ ] Password reset flow
[ ] Sign out

Booking Flow (Critical Path):
[ ] Search for professionals
[ ] View professional profile
[ ] Select service
[ ] Choose date/time
[ ] Enter payment details (test card: 4242 4242 4242 4242)
[ ] Complete booking
[ ] View booking in customer dashboard
[ ] Professional sees booking in their dashboard

Payment Processing:
[ ] Payment intent created
[ ] Stripe webhook received
[ ] Booking status updated
[ ] Customer charged (test mode)
[ ] Professional receives payout (test mode)

Messaging:
[ ] Send message
[ ] Receive message
[ ] Real-time updates work

If Migration Deployed:
[ ] New database columns/tables accessible
[ ] Old queries still work
[ ] RLS policies enforcing correctly
[ ] No data loss
```

---

### Success Criteria

**Release is considered successful when:**

- [ ] No error rate increase (< 5% baseline)
- [ ] No performance degradation (response times normal)
- [ ] Core flows working (auth, booking, payments)
- [ ] No user reports of issues (first 30 minutes)
- [ ] Database migration successful (if applicable)
- [ ] Monitoring dashboards green

---

## Rollback Procedures

### When to Rollback

**Immediate rollback required if:**
- Error rate > 20% of requests
- Critical feature completely broken (auth, payments)
- Data loss or corruption detected
- Security vulnerability introduced

**Consider rollback if:**
- Error rate 5-20% of requests
- Major feature degraded
- User complaints increasing
- Can't identify root cause quickly

---

### Fast Rollback (< 2 minutes)

**Use Vercel Dashboard:**

```bash
# 1. Open Vercel Dashboard
https://vercel.com/dashboard → Deployments

# 2. Find last known good deployment
# Look for deployment before current one
# Should have green "Ready" status
# Should be timestamped before issues started

# 3. Promote to production
# Click "..." on good deployment
# Click "Promote to Production"
# Confirm

# 4. Wait for propagation (1-2 minutes)

# 5. Verify rollback successful
# Test site: https://maidconnect.com
# Check Better Stack for error rate drop
# Monitor for 10 minutes
```

---

### Rollback with Database Migration

**⚠️ More complex - requires care:**

```bash
# 1. Assess migration impact
# Can app run with new schema?
# Can we rollback just code?

# Option A: Code rollback only (if backward compatible)
# Rollback application code via Vercel
# Keep database schema (safe)

# Option B: Full rollback (if breaking change)
# 1. Rollback application code (Vercel)
# 2. Rollback database migration (Supabase)

# Rollback migration:
# Supabase → SQL Editor
# Run rollback SQL (prepared in pre-release)

# Example rollback:
DROP TABLE IF EXISTS new_table CASCADE;
ALTER TABLE bookings DROP COLUMN IF EXISTS new_column;

# 3. Verify app + DB aligned
# 4. Test functionality
```

---

### Post-Rollback Actions

**After successful rollback:**

```markdown
1. [ ] Confirm service restored
   - Error rate returned to normal
   - Core features working
   - Users can access site

2. [ ] Create incident report
   - What failed?
   - When did it fail?
   - Impact (users, duration)
   - Root cause (if known)

3. [ ] Notify team
   - Post in incident channel
   - Explain what happened
   - Share rollback details

4. [ ] Create hotfix plan
   - Identify root cause
   - Develop fix
   - Test thoroughly
   - Schedule re-deployment

5. [ ] Post-incident review
   - Schedule review meeting
   - Document lessons learned
   - Update runbooks
   - Create action items
```

---

## Communication Plan

### Internal Communication

**Before Release:**

```markdown
# Team Channel:
📦 RELEASE IN PROGRESS

**Time:** [HH:MM UTC]
**Release:** [Description]
**Expected duration:** 10-15 minutes
**Monitoring:** @[engineer-name]

**Changes:**
- [Change 1]
- [Change 2]

**Heads up:** [Any known impacts]
```

---

**After Release:**

```markdown
# Team Channel:
✅ RELEASE COMPLETE

**Time:** [HH:MM UTC]
**Status:** Deployed successfully
**Verification:** All systems green

**Deployed changes:**
- [Change 1]
- [Change 2]

**Monitoring:** Will monitor for 30 minutes

**Next steps:** [If any]
```

---

### External Communication

**Customer Communication (rarely needed):**

**When to communicate:**
- New customer-facing features
- Major UI changes
- Planned maintenance (> 5 minutes)
- Known temporary issues

**Channels:**
- Email (for major changes)
- In-app banner (for features)
- Status page (for issues)

**Template:**

```markdown
Subject: New Feature: [Feature Name]

Hello MaidConnect users,

We're excited to announce [feature name] is now live!

**What's new:**
- [Benefit 1]
- [Benefit 2]

**How to use it:**
1. [Step 1]
2. [Step 2]

**Questions?**
Contact support: support@maidconnect.com

Thanks for using MaidConnect!
```

---

## Emergency Hotfix Process

### When Standard Release is Too Slow

**Use hotfix process when:**
- Critical bug in production
- Payment processing broken
- Security vulnerability
- Data loss risk

**Expedited process:**

```bash
# 1. Create hotfix branch (from main)
git checkout main
git pull
git checkout -b hotfix/critical-issue

# 2. Make minimal fix (ONE THING ONLY)
# Edit files with critical fix only
# No refactoring, no extras

# 3. Test locally
bun run build  # Must pass
bun test      # Critical tests must pass

# 4. Create PR with "HOTFIX" label
gh pr create --title "HOTFIX: [issue]" --body "[fix description]"

# 5. Fast-track review
# Tag reviewer: @team-lead
# Request immediate review

# 6. Merge and deploy
# As soon as approved
# Monitor closely

# 7. Post-incident review
# After hotfix deployed
# Document what happened
# Plan proper fix
```

**Hotfix Checklist:**

- [ ] Fix is minimal (single issue only)
- [ ] Fix tested locally
- [ ] Build passes
- [ ] Team notified
- [ ] Reviewer assigned
- [ ] Monitoring plan in place
- [ ] Post-incident review scheduled

---

## Release Calendar

### Recommended Schedule

**Weekly Releases:**
- **Day:** Tuesday (avoid Monday & Friday)
- **Time:** 10am-12pm UTC (business hours, team available)
- **Frequency:** Once per week (more if needed)

**Why Tuesday:**
- Monday: Catch up after weekend
- Tuesday: Team fresh, full week ahead
- Wednesday-Thursday: Backup days if needed
- Friday: Avoid (limited incident response)

---

### Release Windows

**Safe Windows:**
- ✅ Tuesday-Thursday, 9am-3pm UTC
- ✅ Team available for monitoring
- ✅ Business hours (support available)

**Avoid:**
- ❌ Monday morning (post-weekend catch-up)
- ❌ Friday afternoon (limited support window)
- ❌ Before holidays
- ❌ During high-traffic periods

---

## Lessons Learned

### Common Release Pitfalls

**Mistake:** Deploying on Friday afternoon
**Impact:** Bug discovered, team offline for weekend
**Prevention:** Only deploy Tuesday-Thursday

**Mistake:** Skipping preview testing
**Impact:** Bug reached production
**Prevention:** Always test in preview first

**Mistake:** Not preparing rollback migration
**Impact:** Couldn't rollback database change
**Prevention:** Prepare rollback SQL before deploying

**Mistake:** Deploying without monitoring
**Impact:** Error spike unnoticed for 30 minutes
**Prevention:** Dedicated monitoring for 30 min after

---

### Release Retrospective Template

**After each release, document:**

```markdown
# Release Retrospective: [Date]

**What was deployed:**
- [Feature/fix 1]
- [Feature/fix 2]

**What went well:**
- [Positive 1]
- [Positive 2]

**What could be improved:**
- [Improvement 1]
- [Improvement 2]

**Action items:**
- [ ] [Action 1] - @owner - [due date]
- [ ] [Action 2] - @owner - [due date]

**Metrics:**
- Build time: [X minutes]
- Deployment time: [X minutes]
- Issues found: [X]
- Rollbacks needed: [X]
```

---

## Best Practices

### DO:
- ✅ Test in preview deployment first
- ✅ Deploy Tuesday-Thursday only
- ✅ Monitor for 30 minutes after deploy
- ✅ Prepare rollback plan before deploying
- ✅ Communicate with team
- ✅ Document releases

### DON'T:
- ❌ Deploy on Friday afternoon
- ❌ Skip code review
- ❌ Deploy without testing
- ❌ Ignore build warnings
- ❌ Deploy database migration without rollback plan
- ❌ Leave deploy unmonitored

---

## Resources

**Deployment Tools:**
- Vercel Dashboard: https://vercel.com/dashboard
- Better Stack: https://logs.betterstack.com
- Supabase: https://supabase.com/dashboard

**Related Documentation:**
- [CI/CD Guide](./ci-cd.md)
- [Incident Response](../06-operations/incident-response.md)
- [On-Call Runbook](../06-operations/on-call-runbook.md)
- [Monitoring Guide](../06-operations/monitoring.md)

**External Resources:**
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Next.js Production Checklist](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)

---

**Version:** 2.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team

**Changelog:**
- 2.0.0 (2025-01-06): Comprehensive expansion with detailed deployment procedures
- 1.0.0: Initial concise version
