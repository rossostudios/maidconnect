# Incident Response Runbook

**Purpose:** This guide provides step-by-step procedures for responding to production incidents in MaidConnect. Follow these processes to minimize downtime, communicate effectively, and learn from incidents.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Severity Levels](#severity-levels)
- [Incident Roles](#incident-roles)
- [Detection & Alert Response](#detection--alert-response)
- [Incident Triage Process](#incident-triage-process)
- [Mitigation Strategies](#mitigation-strategies)
- [Communication Templates](#communication-templates)
- [Post-Incident Review](#post-incident-review)
- [Common Incident Scenarios](#common-incident-scenarios)
- [Tools & Access](#tools--access)

---

## Quick Start

**When you receive an alert or report of an issue:**

1. **Acknowledge immediately** - Respond in incident channel
2. **Assess severity** - Determine SEV level (1, 2, or 3)
3. **Declare incident** - Create incident thread if SEV-1 or SEV-2
4. **Assign roles** - IC, Ops, Dev, Comms
5. **Triage** - Check logs, recent deploys, external status
6. **Mitigate** - Rollback, disable features, or apply hotfix
7. **Communicate** - Update team and affected users
8. **Resolve** - Verify fix and monitor
9. **Document** - Complete post-incident review

---

## Severity Levels

### SEV-1: Critical Outage 🔴

**Definition:** Complete service outage or critical functionality completely broken affecting all or most users.

**Examples:**
- Entire site down (500 errors, DNS failure)
- Payment processing completely failed
- Database unreachable
- Authentication broken for all users
- Data loss or corruption

**Response Time:** Immediate (< 5 minutes)

**Actions:**
- [ ] Page on-call engineer immediately
- [ ] Declare incident in team channel
- [ ] Assign Incident Commander
- [ ] All hands on deck
- [ ] Hourly status updates
- [ ] Customer communication required

**SLA:** Resolve within 1 hour

---

### SEV-2: Major Degradation 🟡

**Definition:** Major feature significantly degraded or broken for many users, but core service still functional.

**Examples:**
- Authentication slow or failing intermittently
- Booking creation failures (> 10% error rate)
- Payment processing degraded
- Messaging system down
- Search not working
- Database performance severely degraded

**Response Time:** < 15 minutes

**Actions:**
- [ ] Notify on-call engineer
- [ ] Create incident thread
- [ ] Assign Incident Commander
- [ ] Team mobilization
- [ ] Every 2 hours status updates
- [ ] Customer communication if prolonged (> 1 hour)

**SLA:** Resolve within 4 hours

---

### SEV-3: Minor Issue 🔵

**Definition:** Minor feature degradation or isolated errors affecting small number of users.

**Examples:**
- Non-critical feature broken (profile photos, notifications)
- Isolated errors (< 5% error rate)
- Performance degradation on specific pages
- UI glitches or display issues
- Non-critical API endpoints failing

**Response Time:** < 1 hour (during business hours)

**Actions:**
- [ ] Log in issue tracker
- [ ] Assign to relevant team
- [ ] Daily status updates
- [ ] Customer communication typically not needed

**SLA:** Resolve within 24 hours

---

## Incident Roles

### Incident Commander (IC)

**Responsibilities:**
- Owns the incident from detection to resolution
- Coordinates all response activities
- Makes final decisions on mitigation strategies
- Manages communication (internal and external)
- Ensures post-incident review is completed

**Authority:**
- Can override normal processes to restore service
- Can pull in additional resources
- Can make rollback/hotfix decisions

**During Incident:**
```
✅ DO:
- Stay calm and focused
- Delegate tasks clearly
- Keep team updated every 30-60 minutes
- Make decisions quickly with available information
- Document timeline as you go

❌ DON'T:
- Get hands-on with debugging (delegate)
- Disappear without handing off IC role
- Skip communication updates
- Make decisions without informing team
```

---

### Ops Engineer

**Responsibilities:**
- Infrastructure investigation and changes
- Vercel deployment management (rollbacks, new deploys)
- Supabase database operations
- Environment variable management
- Scaling and performance tuning

**Tools:**
- Vercel Dashboard (deployments, logs, analytics)
- Supabase Dashboard (database, auth, logs)
- Better Stack (logs and monitoring)

---

### Dev Engineer

**Responsibilities:**
- Code debugging and analysis
- Hotfix development and testing
- Database query analysis
- Code review for emergency changes
- Root cause investigation

**Tools:**
- Local development environment
- Better Stack logs
- Supabase SQL Editor
- GitHub for code review

---

### Comms Lead

**Responsibilities:**
- Internal team updates
- Customer communication (when needed)
- Status page updates (when available)
- Post-incident summary distribution

**Templates:** See [Communication Templates](#communication-templates)

---

## Detection & Alert Response

### Alert Sources

1. **Better Stack Alerts** - Automated alerts for errors, performance
2. **User Reports** - Support tickets, social media, email
3. **Team Discovery** - Engineers notice issues during work
4. **Monitoring Dashboards** - Proactive monitoring

### First Response Checklist

When you receive an alert:

```
⏱️ FIRST 5 MINUTES:

[ ] Acknowledge alert in incident channel
    "🚨 Investigating [brief description]"

[ ] Check Better Stack dashboard
    - Error spike?
    - Which endpoints affected?
    - Error messages and stack traces?

[ ] Check Vercel
    - Recent deployment?
    - Build errors?
    - Analytics showing traffic drop?

[ ] Check Supabase
    - Database health?
    - Auth service status?
    - Recent migrations?

[ ] Assess severity
    - How many users affected?
    - What functionality is broken?
    - Is service completely down or degraded?

[ ] Determine if incident should be declared
    - SEV-1/SEV-2: Yes, declare immediately
    - SEV-3: Create issue, may not need incident process
```

---

## Incident Triage Process

### Step 1: Confirm and Scope

**Goal:** Verify the issue is real and understand the impact.

```bash
# Check Better Stack for errors
# Query: level:error AND created_at:>now-30m
# Look for spikes, patterns, common errors

# Check Vercel analytics
# Recent traffic drop? Status codes?

# Check Supabase dashboard
# Database CPU/memory? Auth errors? Connection pool?

# Test affected functionality yourself
# Can you reproduce? Which steps fail?
```

**Questions to Answer:**
- Is the issue confirmed or a false alarm?
- How many users are affected? (all, many, few)
- What functionality is broken? (auth, payments, bookings, etc.)
- Since when? (check deployment times)
- Is it getting worse or staying stable?

---

### Step 2: Identify Recent Changes

**Check deployments:**

```bash
# Vercel dashboard → Deployments
# Look for recent deploys in last 1-2 hours

# Compare timestamps:
# - When did errors start?
# - When was last deployment?
# - Are they correlated?
```

**Check database migrations:**

```bash
# Supabase dashboard → Database → Migrations
# Recent migrations applied?
# Any failing migrations?

# Check migration logs
supabase db remote changes
```

**Check environment variables:**

```bash
# Vercel dashboard → Settings → Environment Variables
# Recent changes?
# Missing required variables?
```

---

### Step 3: Determine Root Cause (Quick Assessment)

**Common Root Causes:**

1. **Recent Deployment**
   - New bugs introduced
   - Breaking changes
   - → Consider rollback

2. **Database Issues**
   - Migration failed/incomplete
   - Connection pool exhausted
   - Query performance degradation
   - → Check Supabase health, recent migrations

3. **Third-Party Service**
   - Stripe API down
   - Supabase outage
   - → Check status pages

4. **Environment Configuration**
   - Missing/wrong environment variables
   - Secrets rotated
   - → Check Vercel environment settings

5. **Traffic Spike**
   - Rate limiting triggered
   - Database connections maxed
   - → Check analytics, scale resources

6. **Security Incident**
   - DDoS attack
   - Unauthorized access
   - → Check access logs, IP patterns

---

## Mitigation Strategies

### Strategy 1: Rollback Deployment

**When to use:**
- Recent deployment correlates with errors
- No data migration involved
- Quick mitigation needed

**How to rollback:**

```bash
# Option A: Vercel Dashboard (Fastest)
1. Go to Vercel Dashboard → Deployments
2. Find last known good deployment (green check, before errors)
3. Click "..." → "Promote to Production"
4. Confirm rollback
5. Wait 1-2 minutes for deployment
6. Verify errors stopped in Better Stack

# Option B: Git revert + redeploy
git revert <bad-commit-hash>
git push origin main
# Vercel auto-deploys
```

**Verification:**
- Check Better Stack for error rate drop
- Test affected functionality manually
- Monitor for 10-15 minutes

---

### Strategy 2: Feature Flag Disable

**When to use:**
- Specific feature causing issues
- Need to keep rest of service running
- Buying time for proper fix

**How to disable feature:**

```bash
# Vercel Dashboard → Settings → Environment Variables
# Set the feature flag to false:
NEXT_PUBLIC_FEATURE_[FEATURE_NAME]=false

# Trigger redeploy:
git commit --allow-empty -m "Redeploy to apply feature flag"
git push origin main
```

**Example:**

```bash
# Disable Amara AI if causing issues
NEXT_PUBLIC_FEATURE_AMARA_ENABLED=false

# Disable recurring bookings if buggy
NEXT_PUBLIC_FEATURE_RECURRING_PLANS=false
```

---

### Strategy 3: Database Migration Rollback

**When to use:**
- Recent migration causing errors
- Data integrity issues
- Schema changes breaking app

**⚠️ CAUTION:** Database rollbacks can cause data loss. Assess carefully.

**How to rollback migration:**

```sql
-- Create rollback migration
-- supabase/migrations/[TIMESTAMP]_rollback_[original_name].sql

-- Example: Rollback adding column
ALTER TABLE bookings DROP COLUMN IF EXISTS new_column;

-- Example: Rollback table creation
DROP TABLE IF EXISTS new_table CASCADE;

-- Apply migration
-- Supabase dashboard → Database → Run SQL
-- Or: supabase db push (if local)
```

**Verification:**
- Check app errors stopped
- Verify data integrity
- Test affected features

---

### Strategy 4: Hotfix Deployment

**When to use:**
- Bug identified and fix is simple
- Rollback not feasible (data migration involved)
- Fix can be deployed in < 30 minutes

**Hotfix Process:**

```bash
# 1. Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug-fix

# 2. Make minimal fix (ONE THING ONLY)
# Edit files...

# 3. Test locally
bun run build
bun test

# 4. Commit with clear message
git add .
git commit -m "fix(critical): resolve payment processing error

Fixes #123. Payment intents were failing due to missing
stripe customer ID validation.
"

# 5. Push and create PR
git push origin hotfix/critical-bug-fix

# 6. Quick review (if possible) or merge if emergency
gh pr create --title "HOTFIX: Critical payment bug" --body "Emergency fix"
gh pr merge --squash

# 7. Monitor deployment
# Vercel auto-deploys from main
# Watch Better Stack for error rate
```

---

### Strategy 5: Scale Resources

**When to use:**
- Traffic spike causing issues
- Database connections exhausted
- Rate limiting triggered

**How to scale:**

```bash
# Supabase: Upgrade plan temporarily
# Supabase Dashboard → Settings → Billing
# Upgrade to Pro for more connections/resources

# Vercel: Already auto-scales (check limits)
# Vercel Dashboard → Settings → Usage
# Upgrade if hitting limits

# Upstash Redis: Increase rate limits
# Upstash Dashboard → Database → Configuration
```

---

## Communication Templates

### Internal: Incident Declaration

```
🚨 INCIDENT DECLARED: SEV-[1/2/3]

**Issue:** [Brief description]
**Impact:** [# of users, which features]
**Started:** [Time in UTC]
**Status:** Investigating / Mitigating / Resolved

**Roles:**
- IC: @[name]
- Ops: @[name]
- Dev: @[name]
- Comms: @[name]

**Next Update:** [Time]

Thread for all updates 👇
```

---

### Internal: Status Update (Every 30-60 minutes for SEV-1/2)

```
⏱️ UPDATE [Time]

**Current Status:** [Investigating / Identified / Mitigating / Monitoring]

**What we know:**
- [Finding 1]
- [Finding 2]

**Actions taken:**
- [Action 1]
- [Action 2]

**Next steps:**
- [Next action]

**ETA to resolution:** [Estimate or "Unknown"]

**Next update:** [Time]
```

---

### Internal: Incident Resolved

```
✅ INCIDENT RESOLVED

**Resolution Time:** [Duration]
**Root Cause:** [Brief explanation]
**Fix Applied:** [What we did]

**Verification:**
- [Check 1: passed]
- [Check 2: passed]

**Follow-up:**
- Post-incident review: [Date/Time]
- Action items: [Link to issues]

Thanks to @[team members] for quick response!
```

---

### External: Customer Communication (SEV-1/2 only, if > 1 hour)

**Email/Status Page:**

```
Subject: Service Disruption Update - [Feature/Service]

Dear MaidConnect Users,

We are currently experiencing issues with [feature name].

**Impact:** [What users are experiencing]
**Affected Users:** [Who is affected]
**Status:** We have identified the issue and are working on a fix.
**ETA:** We expect service to be restored by [time].

We apologize for the inconvenience and appreciate your patience.

Updates: [Status page URL or check email]

- The MaidConnect Team
```

---

### External: Resolution Notice

```
Subject: Service Restored - [Feature/Service]

Dear MaidConnect Users,

The issue affecting [feature name] has been resolved.

**What happened:** [Brief non-technical explanation]
**Resolution time:** [Duration]
**Current status:** Fully operational

If you continue experiencing issues, please contact support.

We apologize for the disruption and thank you for your patience.

- The MaidConnect Team
```

---

## Post-Incident Review

### Timeline Documentation

**Within 24 hours of resolution**, the Incident Commander must document:

**Incident Timeline Template:**

```markdown
# Incident Review: [Brief Title]

**Incident ID:** INC-[YYYY-MM-DD]-[sequence]
**Date:** [Date]
**Duration:** [Start time] - [End time] ([total duration])
**Severity:** SEV-[1/2/3]
**Incident Commander:** [Name]

## Impact
- **Users Affected:** [Number or percentage]
- **Features Affected:** [List]
- **Revenue Impact:** [If applicable]
- **Downtime:** [Duration]

## Timeline (UTC)

| Time | Event |
|------|-------|
| HH:MM | Issue first detected [how - alert, user report, etc.] |
| HH:MM | Incident declared, IC assigned |
| HH:MM | Root cause identified |
| HH:MM | Mitigation started [what action] |
| HH:MM | Service partially restored |
| HH:MM | Full resolution confirmed |
| HH:MM | Incident closed |

## Root Cause

[Detailed explanation of what caused the incident]

**Contributing Factors:**
- [Factor 1]
- [Factor 2]

## Resolution

[What was done to resolve the incident]

**Verification:**
- [How we confirmed it was resolved]

## What Went Well

- [Thing 1]
- [Thing 2]

## What Could Be Improved

- [Improvement 1]
- [Improvement 2]

## Action Items

| Action | Owner | Due Date | Priority | Status |
|--------|-------|----------|----------|--------|
| [Action 1] | @name | [Date] | P0 | Open |
| [Action 2] | @name | [Date] | P1 | Open |

## Prevention

**Short-term (< 1 week):**
- [Action to prevent immediate recurrence]

**Long-term (< 1 month):**
- [Systematic improvements]

**Monitoring:**
- [New alerts or monitoring to add]

## Lessons Learned

[Key takeaways for the team]

---

**Review Meeting:** [Date/Time]
**Attendees:** [Names]
**Follow-up:** [Link to issues]
```

---

### Action Items Follow-up

**Priority Levels:**

- **P0 (Critical):** Prevent recurrence of SEV-1 - Due within 48 hours
- **P1 (High):** Prevent recurrence of SEV-2 - Due within 1 week
- **P2 (Medium):** Improve response process - Due within 2 weeks
- **P3 (Low):** Nice-to-have improvements - Due within 1 month

**Tracking:**
- Create GitHub issues for each action item
- Assign owners and due dates
- Review in weekly team meeting
- IC follows up until all P0/P1 items completed

---

## Common Incident Scenarios

### Scenario 1: Complete Site Outage

**Symptoms:**
- Better Stack: Massive 500 error spike
- Vercel: Build failed or deployment error
- Users: Cannot access site at all

**Diagnosis:**
```bash
# Check Vercel deployment status
# Recent deployment failed?
# Build errors?

# Check Supabase status
# Database unreachable?

# Check DNS
dig maidconnect.com
```

**Resolution:**
1. If recent deployment: Rollback immediately
2. If build failure: Check build logs, fix critical error
3. If database: Check Supabase status page, wait or contact support
4. If DNS: Check domain registrar, DNS provider

---

### Scenario 2: Authentication Broken

**Symptoms:**
- Users cannot sign in/up
- Session refresh failures
- Better Stack: Auth errors spiking

**Diagnosis:**
```bash
# Check Supabase auth status
# Dashboard → Authentication → Policies

# Check environment variables
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY

# Check callback URLs
# Supabase → Authentication → URL Configuration
```

**Resolution:**
1. Verify Supabase auth service is up
2. Check environment variables are correct
3. Verify callback URLs match current domain
4. Check for recent auth policy changes
5. Review recent code changes to auth flow

---

### Scenario 3: Payment Processing Failures

**Symptoms:**
- Users cannot complete bookings
- Stripe webhook failures
- Payment intents failing

**Diagnosis:**
```bash
# Check Stripe Dashboard
# Recent API changes?
# Webhook delivery failures?

# Check Stripe keys
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET

# Check Better Stack
# Stripe API errors?
# Webhook signature verification failures?
```

**Resolution:**
1. Check Stripe status page (status.stripe.com)
2. Verify Stripe API keys are correct and not expired
3. Check webhook secret matches Stripe dashboard
4. Review recent changes to payment code
5. Test payment flow in Stripe test mode

---

### Scenario 4: Database Performance Degradation

**Symptoms:**
- Slow page loads
- Timeouts on queries
- Better Stack: Database query duration > 5s

**Diagnosis:**
```bash
# Supabase Dashboard → Database → Query Performance
# Slow queries?
# Missing indexes?

# Check connection pool
# Max connections reached?

# Check database size
# Approaching limits?
```

**Resolution:**
1. Identify slow queries in Supabase dashboard
2. Add missing indexes
3. Optimize N+1 queries (use joins or select with relations)
4. Scale Supabase plan if hitting limits
5. Review recent schema changes

---

### Scenario 5: Third-Party Service Outage

**Symptoms:**
- Specific features failing
- External API errors
- Timeouts on third-party requests

**Diagnosis:**
```bash
# Check status pages:
# - Stripe: status.stripe.com
# - Supabase: status.supabase.com
# - Vercel: www.vercel-status.com

# Check Better Stack for external API errors
```

**Resolution:**
1. Confirm third-party outage on status page
2. Enable graceful degradation if possible
3. Display user-friendly error message
4. Queue failed requests for retry if applicable
5. Monitor status page for resolution
6. Resume service once third-party recovers

---

## Tools & Access

### Required Access

**All Engineers:**
- [ ] Better Stack (logs.betterstack.com) - Read access minimum
- [ ] Vercel Dashboard - Developer access
- [ ] Supabase Dashboard - Developer access
- [ ] GitHub - Write access to repository
- [ ] Team communication channel (Slack/Discord)

**On-Call Engineers:**
- [ ] Better Stack - Admin access (configure alerts)
- [ ] Vercel - Owner access (rollback deployments)
- [ ] Supabase - Admin access (run migrations)
- [ ] PagerDuty or equivalent (if configured)

---

### Quick Links

**Monitoring & Logs:**
- Better Stack Dashboard: [logs.betterstack.com](https://logs.betterstack.com)
- Vercel Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- Supabase Dashboard: [supabase.com/dashboard](https://supabase.com/dashboard)

**Status Pages:**
- Stripe Status: [status.stripe.com](https://status.stripe.com)
- Supabase Status: [status.supabase.com](https://status.supabase.com)
- Vercel Status: [www.vercel-status.com](https://www.vercel-status.com)

**Documentation:**
- [On-Call Runbook](./on-call-runbook.md) - Quick debugging reference
- [Monitoring Guide](./monitoring.md) - Logging and alerts
- [Deployment Playbook](../05-deployment/release-playbook.md) - Release process

---

## Best Practices

### During Incident

**DO:**
- ✅ Stay calm and focused
- ✅ Communicate clearly and frequently
- ✅ Document timeline as you go
- ✅ Ask for help when needed
- ✅ Make decisions with available data
- ✅ Prioritize service restoration over perfection

**DON'T:**
- ❌ Panic or rush without thinking
- ❌ Go silent (communicate every 30-60 min)
- ❌ Try to be a hero (delegate and collaborate)
- ❌ Make risky changes without backups
- ❌ Skip documentation "to save time"
- ❌ Blame team members

---

### After Incident

**DO:**
- ✅ Complete post-incident review within 24 hours
- ✅ Create action items with owners and dates
- ✅ Share learnings with whole team
- ✅ Update runbooks with new knowledge
- ✅ Thank team members for their response
- ✅ Take time to decompress and rest

**DON'T:**
- ❌ Skip post-incident review
- ❌ Blame individuals
- ❌ Create action items without owners
- ❌ Forget to communicate resolution to users
- ❌ Let action items sit incomplete

---

## Training & Drills

### New Team Member Onboarding

- [ ] Review this incident response guide
- [ ] Get access to all required tools
- [ ] Shadow during actual incident or drill
- [ ] Practice using rollback procedures in staging
- [ ] Review past incident reports

### Quarterly Incident Response Drills

**Simulate realistic scenarios:**
- Database connection failures
- Payment processing outage
- Authentication broken
- Recent deployment causing errors

**Practice:**
- Detection and triage
- Role assignments
- Communication
- Mitigation strategies
- Post-incident documentation

---

## Version History

**Version:** 2.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team

**Changelog:**
- 2.0.0 (2025-01-06): Comprehensive expansion with detailed procedures, templates, and scenarios
- 1.0.0: Initial concise version
