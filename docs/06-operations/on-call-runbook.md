# On-Call Engineer Runbook

**Purpose:** Quick reference guide for on-call engineers responding to alerts and incidents. This runbook provides fast diagnostic procedures and common fixes to restore service quickly.

---

## Table of Contents

- [On-Call Responsibilities](#on-call-responsibilities)
- [First Response (First 5 Minutes)](#first-response-first-5-minutes)
- [Quick Diagnostic Procedures](#quick-diagnostic-procedures)
- [Common Issues & Fixes](#common-issues--fixes)
- [Service Health Checks](#service-health-checks)
- [Debugging Toolkit](#debugging-toolkit)
- [Escalation Procedures](#escalation-procedures)
- [Handoff Process](#handoff-process)
- [Resources & Contacts](#resources--contacts)

---

## On-Call Responsibilities

### What You're Responsible For

**Primary Duties:**
- [ ] Monitor alerts from Better Stack (email, Slack, PagerDuty)
- [ ] Respond to incidents within SLA (SEV-1: 5 min, SEV-2: 15 min, SEV-3: 1 hour)
- [ ] Triage and assess severity of incidents
- [ ] Mitigate issues (rollbacks, hotfixes, disabling features)
- [ ] Escalate when needed
- [ ] Document incidents and handoffs
- [ ] Communicate status updates

**Secondary Duties:**
- [ ] Review monitoring dashboards proactively
- [ ] Update runbooks with new learnings
- [ ] Participate in post-incident reviews

---

### Rotation Schedule

**Standard Rotation:**
- **Duration:** 1 week (Monday 9am to next Monday 9am)
- **Timezone:** UTC (adjust for your local time)
- **Handoff:** Monday morning standup

**Coverage:**
- **Business Hours:** 9am - 5pm UTC (primary on-call)
- **After Hours:** 5pm - 9am UTC (escalation only for SEV-1)
- **Weekends:** Escalation only for SEV-1/2

---

### Response Time SLAs

| Severity | Initial Response | Update Frequency | Resolution Target |
|----------|-----------------|------------------|-------------------|
| SEV-1 | < 5 minutes | Every 30 minutes | 1 hour |
| SEV-2 | < 15 minutes | Every 2 hours | 4 hours |
| SEV-3 | < 1 hour | Daily | 24 hours |

---

## First Response (First 5 Minutes)

### Alert Received - What to Do NOW

```
⏱️ IMMEDIATE ACTIONS:

1. [ ] Acknowledge alert
   - Click acknowledgment in PagerDuty/Better Stack
   - Or post in incident channel: "🚨 Investigating [alert name]"

2. [ ] Open monitoring dashboard
   - Better Stack: https://logs.betterstack.com
   - Vercel: https://vercel.com/dashboard
   - Supabase: https://supabase.com/dashboard

3. [ ] Quick health check (60 seconds)
   - Visit production site - Does it load?
   - Check Better Stack - Error spike? Which errors?
   - Check Vercel - Recent deployment?
   - Check Supabase - Database healthy?

4. [ ] Assess severity (30 seconds)
   - SEV-1: Site down or payments failing? → Declare incident immediately
   - SEV-2: Major feature degraded? → Create incident thread
   - SEV-3: Minor issue? → Create ticket, investigate normally

5. [ ] If SEV-1/2: Declare incident
   - Post in team channel (see templates below)
   - Assign roles (IC, Ops, Dev, Comms)
   - Start incident timeline doc

Total time: < 5 minutes
```

---

## Quick Diagnostic Procedures

### 1. Site Completely Down (SEV-1)

**Symptoms:** Users getting 500 errors, site unreachable

**Quick Checks (2 minutes):**

```bash
# 1. Test from your browser
# Visit: https://maidconnect.com
# Does it load? What error?

# 2. Check Vercel Status
# https://www.vercel-status.com
# Vercel outage? (rare but happens)

# 3. Check Supabase Status
# https://status.supabase.com
# Database outage?

# 4. Check Recent Deployments
# Vercel dashboard → Deployments
# Any failed builds? Recent deployment?

# 5. Check Better Stack
# Massive error spike? What errors?
```

**Immediate Fix:**
- If recent deployment: **Rollback immediately** (see [Rollback Procedure](#rollback-procedure))
- If Vercel outage: Wait and monitor (nothing we can do)
- If Supabase outage: Enable maintenance mode if possible
- If unknown: Check logs for clues, escalate if needed

---

### 2. Authentication Issues (SEV-1 or SEV-2)

**Symptoms:** Users cannot sign in, session errors, 401s

**Quick Checks (2 minutes):**

```bash
# 1. Test authentication yourself
# Try signing in at /en/auth/sign-in
# Does it work? What error?

# 2. Check Supabase Dashboard
# Supabase → Authentication → Users
# Can you see users? Service healthy?

# 3. Check environment variables
# Vercel → Settings → Environment Variables
# Are Supabase keys present?
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# 4. Check Better Stack for auth errors
# Search: "auth" OR "session" OR "unauthorized"
# What's the error message?

# 5. Check callback URLs
# Supabase → Authentication → URL Configuration
# Do they match current domain?
```

**Common Fixes:**
- **Wrong environment variables:** Update in Vercel, redeploy
- **Callback URL mismatch:** Update in Supabase dashboard
- **Recent auth code change:** Rollback deployment
- **Supabase auth down:** Check status page, wait

---

### 3. Payment Processing Failures (SEV-1)

**Symptoms:** Bookings failing, Stripe errors, payment timeouts

**Quick Checks (2 minutes):**

```bash
# 1. Check Stripe Status
# https://status.stripe.com
# Stripe outage?

# 2. Check Stripe Dashboard
# Stripe → Developers → Events
# Recent payment intent failures?
# What's the error?

# 3. Check Stripe Webhooks
# Stripe → Developers → Webhooks
# Webhook delivery failures?
# Signature verification failures?

# 4. Check Stripe Keys
# Vercel → Environment Variables
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Are they correct? Not expired?

# 5. Check Better Stack
# Search: "stripe" OR "payment"
# What errors are being logged?
```

**Common Fixes:**
- **Stripe outage:** Wait and communicate to users
- **Wrong Stripe keys:** Update environment variables
- **Webhook secret mismatch:** Get new secret from Stripe dashboard
- **Recent payment code change:** Rollback deployment
- **Rate limiting:** Contact Stripe support to increase limits

---

### 4. Database Errors (SEV-2 or SEV-3)

**Symptoms:** Slow queries, timeouts, connection errors

**Quick Checks (2 minutes):**

```bash
# 1. Check Supabase Dashboard
# Supabase → Database → Database Health
# CPU/Memory usage?
# Connection pool status?

# 2. Check for slow queries
# Supabase → Database → Query Performance
# Any queries > 5 seconds?
# Missing indexes?

# 3. Check recent migrations
# Supabase → Database → Migrations
# Recent migration applied?
# Did it succeed?

# 4. Check Better Stack
# Search: "database" OR "postgres" OR "timeout"
# What's the error?

# 5. Test database connection
# Supabase → SQL Editor
# Run: SELECT 1;
# Does it work?
```

**Common Fixes:**
- **Connection pool exhausted:** Restart Supabase (or scale up)
- **Slow query:** Add missing index
- **Failed migration:** Rollback migration
- **Database size limit:** Upgrade Supabase plan
- **Recent schema change:** Check if breaking change, rollback if needed

---

### 5. API Endpoint Errors (SEV-2 or SEV-3)

**Symptoms:** Specific API routes failing, 500 errors on endpoints

**Quick Checks (2 minutes):**

```bash
# 1. Identify failing endpoint
# Better Stack → Filter by endpoint path
# Which route(s) failing?

# 2. Check error messages
# Better Stack → View error details
# What's the error message? Stack trace?

# 3. Check recent code changes
# GitHub → Recent commits
# Vercel → Latest deployment
# Recent change to this endpoint?

# 4. Test endpoint manually
# Use curl or Postman
# curl https://maidconnect.com/api/bookings
# What response?

# 5. Check environment variables
# Does endpoint use env vars?
# Are they present in Vercel?
```

**Common Fixes:**
- **Recent code change:** Rollback deployment
- **Missing environment variable:** Add to Vercel
- **Database query issue:** Check logs for SQL errors
- **Rate limiting:** Check Upstash Redis status
- **Third-party API down:** Check status pages

---

## Common Issues & Fixes

### Issue 1: "Too Many Connections" Error

**Symptoms:**
```
Error: remaining connection slots are reserved for non-replication superuser connections
```

**Diagnosis:**
- Supabase connection pool exhausted
- Too many concurrent requests
- Connection leaks in code

**Fix:**
```bash
# Quick fix: Restart Supabase connections
# Supabase Dashboard → Settings → Database → Connection Pooler
# Click "Restart Pooler"

# Long-term fix:
# 1. Upgrade Supabase plan (more connections)
# 2. Review code for connection leaks
# 3. Implement connection pooling in app
```

---

### Issue 2: "CSRF Validation Failed"

**Symptoms:**
```
Error: Forbidden: CSRF validation failed
```

**Diagnosis:**
- `proxy.ts` CSRF protection triggered
- Origin/Referer header mismatch
- Recent domain change

**Fix:**
```bash
# Check if legitimate request being blocked
# Better Stack → Check request headers
# Origin matches host?

# If false positive:
# 1. Check proxy.ts CSRF_EXEMPT_ROUTES
# 2. Add route to exemption list if needed (e.g., webhooks)

# If attack:
# 1. Block IP in Vercel firewall
# 2. Review access logs
# 3. Notify security team
```

---

### Issue 3: "Rate Limit Exceeded"

**Symptoms:**
```
Error: Rate limit exceeded. Please try again later.
```

**Diagnosis:**
- User hitting rate limits (expected behavior)
- Attack/abuse (unexpected volume)
- Upstash Redis down

**Fix:**
```bash
# Check if legitimate spike or attack
# Better Stack → Group by IP address
# Same IP making many requests?

# If legitimate spike:
# 1. Temporarily increase rate limits (Upstash dashboard)
# 2. Or: Disable rate limiting in emergency (not recommended)

# If attack:
# 1. Block IP in Vercel
# 2. Enable aggressive rate limiting
# 3. Monitor for distributed attack

# If Upstash down:
# 1. Check Upstash status
# 2. Falls back to in-memory (no rate limiting)
```

---

### Issue 4: "Webhook Signature Verification Failed"

**Symptoms:**
```
Error: Invalid signature
```

**Diagnosis:**
- Stripe/Checkr webhook secret mismatch
- Secret rotated in Stripe but not updated in app
- Malicious webhook attempt

**Fix:**
```bash
# Get current webhook secret
# Stripe Dashboard → Developers → Webhooks → [your endpoint]
# Click "Reveal" on signing secret

# Update in Vercel
# Vercel → Settings → Environment Variables
# Update: STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redeploy to apply
git commit --allow-empty -m "Update webhook secret"
git push origin main
```

---

### Issue 5: "Migration Failed" / Schema Drift

**Symptoms:**
```
Error: column "xyz" does not exist
Error: relation "table_name" does not exist
```

**Diagnosis:**
- Migration not applied
- Schema drift between code and database
- Partial migration failure

**Fix:**
```bash
# Check applied migrations
# Supabase Dashboard → Database → Migrations
# All green checkmarks?

# Check for pending migrations
supabase db remote changes

# If migration failed midway:
# 1. Rollback broken migration (Supabase dashboard → SQL Editor)
# 2. Fix migration SQL
# 3. Reapply migration

# If schema drift:
# 1. Identify missing migrations
# 2. Apply manually in Supabase SQL Editor
# 3. Update migration tracking
```

---

## Service Health Checks

### Manual Health Check Script

Run this when you start your on-call shift or during investigation:

```bash
# 1. Production site loads
curl -I https://maidconnect.com
# Expected: HTTP 200

# 2. API health check
curl https://maidconnect.com/api/health
# Expected: {"status":"ok"}

# 3. Authentication works
# Visit: https://maidconnect.com/en/auth/sign-in
# Try signing in with test account

# 4. Database accessible
# Supabase Dashboard → SQL Editor
# Run: SELECT COUNT(*) FROM bookings;
# Should return count

# 5. Stripe webhooks healthy
# Stripe Dashboard → Developers → Webhooks
# Check delivery success rate > 95%
```

---

### Automated Monitoring Checks

**Better Stack Alerts configured for:**
- [ ] Error rate > 10 errors/minute
- [ ] API response time > 5 seconds (P95)
- [ ] Database query time > 10 seconds
- [ ] 5xx status codes > 5% of requests
- [ ] Authentication failures > 20/minute
- [ ] Payment failures > 3/minute
- [ ] Webhook delivery failures > 10/hour

**Vercel Analytics:**
- [ ] Function execution errors
- [ ] Build failures
- [ ] Deployment failures

**Supabase Monitoring:**
- [ ] Database CPU > 80%
- [ ] Connection pool > 90% capacity
- [ ] Disk usage > 85%
- [ ] Replication lag > 30 seconds

---

## Debugging Toolkit

### Quick Commands Reference

```bash
# Check latest production deployment
gh repo view --web
# Navigate to Actions tab

# Get production logs (last 100 lines)
# Better Stack dashboard → Live Tail

# Check recent errors
# Better Stack: level:error AND created_at:>now-1h

# Check specific endpoint errors
# Better Stack: path:"/api/bookings" AND level:error

# Check user-specific issues
# Better Stack: context.userId:"uuid-here"

# Test API endpoint locally
curl -X POST https://maidconnect.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'

# Check database connection
# Supabase → SQL Editor
SELECT current_database(), current_user, inet_server_addr();

# Check active database connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

### Browser DevTools Debugging

When investigating frontend issues:

1. **Open Browser DevTools** (F12 or Cmd+Option+I)

2. **Network Tab:**
   - Check for failed requests (red status codes)
   - Check request/response headers
   - Check payload data
   - Check timing (slow requests?)

3. **Console Tab:**
   - Check for JavaScript errors
   - Check for React errors
   - Check for network errors

4. **Application Tab:**
   - Check cookies (auth session cookie present?)
   - Check local storage
   - Check session storage

---

## Escalation Procedures

### When to Escalate

**Escalate Immediately (SEV-1):**
- Site completely down > 15 minutes
- Payment processing completely failed
- Data loss or corruption suspected
- Security breach suspected
- You don't know how to fix it

**Escalate After 2 Hours (SEV-2):**
- Major feature still degraded after 2 hours
- Can't identify root cause after 2 hours
- Fix requires expertise you don't have

**Escalate After 24 Hours (SEV-3):**
- Can't resolve minor issue after 24 hours
- Need code changes beyond hotfix

---

### Who to Escalate To

**Incident Commander (SEV-1/2):**
- **Name:** [Primary IC Name]
- **Contact:** [Phone/Slack/Email]
- **Backup IC:** [Backup IC Name]
- **Contact:** [Phone/Slack/Email]

**Engineering Lead:**
- **Name:** [Lead Engineer Name]
- **Contact:** [Phone/Slack/Email]
- **Availability:** Business hours (9am-5pm UTC)

**Database Expert:**
- **Name:** [DB Expert Name]
- **Contact:** [Phone/Slack/Email]
- **Availability:** On-call for SEV-1

**Security Lead:**
- **Name:** [Security Lead Name]
- **Contact:** [Phone/Slack/Email]
- **Availability:** On-call for security incidents

**Product/Support (Customer Comms):**
- **Name:** [Product Manager Name]
- **Contact:** [Phone/Slack/Email]
- **Availability:** Business hours

---

### Escalation Template

```
🚨 ESCALATION NEEDED

**Issue:** [Brief description]
**Severity:** SEV-[1/2/3]
**Duration:** [How long has issue been ongoing]
**Impact:** [# of users, which features]

**What I've tried:**
1. [Action 1 - result]
2. [Action 2 - result]
3. [Action 3 - result]

**Current status:** [Still investigating / Partially mitigated / Unknown]

**Why escalating:** [Can't identify root cause / Need expertise / Issue not resolving]

**Assistance needed:** [What specific help you need]

@[person-to-escalate-to] - Can you help?
```

---

## Handoff Process

### Starting On-Call Shift

**Monday Morning Handoff (30 minutes):**

```markdown
📋 ON-CALL HANDOFF - [Your Name] taking over

**Previous Week Summary:**
- Incidents: [Number and severity]
- Notable issues: [Brief list]
- Open items: [Any unresolved issues]

**Current Health:**
- Site status: ✅ Healthy / ⚠️ Degraded / 🔴 Down
- Recent deployments: [Last deploy time]
- Scheduled maintenance: [Any planned work]

**Action items for me:**
- [ ] [Item 1]
- [ ] [Item 2]

**Questions for previous on-call:**
- [Any questions about handoff]

Thanks @[previous-on-call]!
```

---

### Ending On-Call Shift

**Monday Morning Handoff (30 minutes):**

```markdown
📋 ON-CALL HANDOFF - Handing off to @[next-on-call]

**This Week Summary:**
- Total incidents: [Number]
  - SEV-1: [Number]
  - SEV-2: [Number]
  - SEV-3: [Number]
- Total alert volume: [High / Medium / Low]

**Notable Incidents:**
1. [Date/Time] - [Brief description] - [Resolution]
2. [Date/Time] - [Brief description] - [Resolution]

**Open Items:**
- [ ] [Unresolved issue 1 - who's following up]
- [ ] [Unresolved issue 2 - who's following up]

**System Health:**
- Site status: ✅ Healthy
- Last deployment: [Time]
- No scheduled maintenance

**Recommendations:**
- [Any specific things to watch]
- [Any patterns noticed]

**Runbook Updates:**
- [New procedures added / Issues to document]

Good luck @[next-on-call]! Feel free to ping me with questions.
```

---

## Resources & Contacts

### Quick Reference Links

**Monitoring & Dashboards:**
- Better Stack: https://logs.betterstack.com
- Vercel: https://vercel.com/dashboard
- Supabase: https://supabase.com/dashboard
- Stripe: https://dashboard.stripe.com

**Status Pages:**
- Stripe: https://status.stripe.com
- Supabase: https://status.supabase.com
- Vercel: https://www.vercel-status.com

**Documentation:**
- [Incident Response Guide](./incident-response.md)
- [Monitoring Guide](./monitoring.md)
- [Deployment Playbook](../05-deployment/release-playbook.md)
- [API Reference](../03-technical/api-reference.md)
- [Database Schema](../03-technical/database-schema.md)

**Team Communication:**
- Incident Channel: [#incidents Slack channel]
- Engineering Channel: [#engineering Slack channel]
- On-Call Schedule: [PagerDuty schedule link]

---

### Emergency Procedures

#### Rollback Procedure

```bash
# Option 1: Vercel Dashboard (FASTEST)
1. Open: https://vercel.com/dashboard
2. Click "Deployments"
3. Find last known good deployment (before errors started)
4. Click "..." → "Promote to Production"
5. Confirm
6. Wait 1-2 minutes
7. Verify errors stopped in Better Stack

# Option 2: Git Revert
git checkout main
git pull
git log --oneline -10  # Find bad commit
git revert <bad-commit-hash>
git push origin main
# Vercel auto-deploys
```

**Verification:**
```bash
# Check Better Stack for error rate drop
# Test affected functionality manually
# Monitor for 10-15 minutes
```

---

#### Feature Flag Disable

```bash
# Disable problematic feature
# Vercel → Settings → Environment Variables
NEXT_PUBLIC_FEATURE_[NAME]=false

# Trigger redeploy
git commit --allow-empty -m "Disable [feature name]"
git push origin main

# Verify feature disabled
# Test in production after deployment
```

---

#### Emergency Database Rollback

**⚠️ CAUTION: Can cause data loss. Only use in emergency.**

```sql
-- Identify problematic migration
-- Supabase → Database → Migrations

-- Create rollback migration
-- Example: Drop recently added column
ALTER TABLE table_name DROP COLUMN IF EXISTS new_column;

-- Example: Drop recently added table
DROP TABLE IF EXISTS new_table CASCADE;

-- Apply in Supabase SQL Editor
-- Verify application errors stopped
```

---

## Best Practices

### DO:
- ✅ Acknowledge alerts immediately
- ✅ Communicate status every 30-60 minutes during incidents
- ✅ Document actions taken in incident thread
- ✅ Ask for help early if needed
- ✅ Test fixes in staging/preview if possible
- ✅ Update runbooks with new learnings

### DON'T:
- ❌ Ignore alerts (acknowledge even if false positive)
- ❌ Make risky changes without backup plan
- ❌ Skip communication updates
- ❌ Try to be a hero (escalate when needed)
- ❌ Deploy unreviewed code in panic
- ❌ Forget to document incidents

---

## On-Call Survival Tips

**Before Your Shift:**
- [ ] Review this runbook
- [ ] Test access to all tools (Better Stack, Vercel, Supabase)
- [ ] Have laptop charged and ready
- [ ] Know how to reach Incident Commander
- [ ] Review recent incidents and patterns

**During Your Shift:**
- [ ] Check dashboards once in morning, once at midday
- [ ] Keep laptop and phone nearby
- [ ] Don't drink too much coffee (stay calm)
- [ ] Take breaks when things are quiet
- [ ] Update runbooks when you learn something new

**After Your Shift:**
- [ ] Complete handoff doc
- [ ] Create tickets for any unresolved issues
- [ ] Update post-incident reviews if applicable
- [ ] Decompress and rest!

---

**Remember:** You're not expected to know everything. Escalate early, communicate clearly, and focus on restoring service. The team has your back!

---

**Version:** 2.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team

**Changelog:**
- 2.0.0 (2025-01-06): Comprehensive expansion with detailed procedures, diagnostics, and escalation guides
- 1.0.0: Initial concise version
