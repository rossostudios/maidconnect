# Operational Runbooks

> **Version:** 1.0.0
> **Last Updated:** 2025-01-14
> **Maintainer:** Engineering Team

This document provides concrete debugging procedures for common operational issues in Casaora's production environment.

## Table of Contents

1. [Cron Job Failures](#cron-job-failures)
2. [Payout Mismatches](#payout-mismatches)
3. [Booking Stuck in Authorized](#booking-stuck-in-authorized)
4. [Booking Stuck in In Progress](#booking-stuck-in-in_progress)

---

## Cron Job Failures

### Overview

Casaora runs two critical cron jobs:
- **Auto-Decline Cron** - Declines expired authorized bookings (runs hourly)
- **Payout Cron** - Processes professional payouts (runs Tue/Fri at 10 AM Colombia time)

### Symptoms

- **Better Stack Alerts** - Error logs from cron endpoints
- **PostHog Dashboards** - Missing success events or elevated error rates
- **User Reports** - Professionals not receiving payouts on schedule
- **Database** - Bookings not auto-declining after 24 hours

### Debugging Steps

#### 1. Check Better Stack Logs

```bash
# Open Better Stack dashboard
open "https://logs.betterstack.com"

# Filter logs by cron job
Source: casaora-production
Search: "cron" AND "failed"
Time Range: Last 24 hours

# Look for these error patterns:
- "Cron authentication failed" → Check CRON_SECRET env var
- "Payout batch processing failed" → See Payout Mismatches section
- "Auto-decline processing failed" → Check database connection
- "Stripe API error" → See Stripe Integration Issues
```

#### 2. Verify Cron Job Configuration

**Check Vercel Cron Settings:**

```bash
# View deployment logs
vercel logs --prod

# Check cron configuration in vercel.json
cat vercel.json | grep -A 10 "crons"

# Expected output:
{
  "crons": [
    {
      "path": "/api/cron/auto-decline-expired",
      "schedule": "0 * * * *"  # Every hour
    },
    {
      "path": "/api/cron/process-payouts",
      "schedule": "0 15 * * 2,5"  # 10 AM Colombia (15:00 UTC) Tue/Fri
    }
  ]
}
```

**Verify Environment Variables:**

```bash
# Check production environment
vercel env ls --prod

# Required variables:
- CRON_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- LOGTAIL_SOURCE_TOKEN

# If missing, add:
vercel env add CRON_SECRET production
```

#### 3. Test Cron Endpoints Manually

**Auto-Decline Cron:**

```bash
# Get CRON_SECRET from Vercel
CRON_SECRET=$(vercel env pull --prod 2>&1 | grep CRON_SECRET)

# Test endpoint
curl -X POST https://casaora.com/api/cron/auto-decline-expired \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "declinedCount": 3,
  "errors": []
}
```

**Payout Cron:**

```bash
# Test payout endpoint
curl -X POST https://casaora.com/api/cron/process-payouts \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "batch": {
    "id": "payout-2025-01-14-tue",
    "status": "completed",
    "totalAmountCop": 15000000,
    "totalTransfers": 12,
    "successfulTransfers": 12,
    "failedTransfers": 0
  }
}
```

#### 4. Check Database State

**Query Recent Cron Executions:**

```sql
-- Check payout_batches for recent runs
SELECT
  batch_id,
  status,
  total_amount_cop,
  total_transfers,
  successful_transfers,
  failed_transfers,
  started_at,
  completed_at,
  error_message
FROM payout_batches
ORDER BY started_at DESC
LIMIT 10;

-- Check for failed transfers
SELECT
  pt.id,
  pt.booking_id,
  pt.professional_id,
  pt.amount_cop,
  pt.status,
  pt.error_message,
  pt.created_at
FROM payout_transfers pt
WHERE pt.status = 'failed'
ORDER BY pt.created_at DESC
LIMIT 20;

-- Check auto-decline candidates (bookings authorized > 24 hours)
SELECT
  id,
  professional_id,
  status,
  amount_authorized,
  authorized_at,
  EXTRACT(EPOCH FROM (NOW() - authorized_at))/3600 as hours_since_auth
FROM bookings
WHERE status = 'authorized'
  AND authorized_at < NOW() - INTERVAL '24 hours'
ORDER BY authorized_at;
```

#### 5. Common Fixes

**Issue: Cron authentication failed**

```bash
# Regenerate CRON_SECRET
openssl rand -base64 32

# Update in Vercel
vercel env rm CRON_SECRET production
vercel env add CRON_SECRET production
# Paste new secret when prompted

# Redeploy
vercel --prod
```

**Issue: Cron timezone mismatch**

```bash
# Payout cron should run at 10 AM Colombia time (UTC-5)
# Verify schedule: 10 AM Colombia = 15:00 UTC = 3 PM UTC

# Check current cron schedule
grep "process-payouts" vercel.json

# Should be: "schedule": "0 15 * * 2,5"
# Not: "schedule": "0 10 * * 2,5" (this would be 5 AM Colombia!)
```

**Issue: Database connection timeout**

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity
WHERE datname = 'postgres';

-- Kill long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND state = 'active'
  AND query_start < NOW() - INTERVAL '5 minutes';
```

#### 6. Escalation Path

If debugging doesn't resolve the issue:

1. **Immediate:** Disable cron in Vercel to prevent cascading failures
2. **Within 1 hour:** Create incident in Better Stack with error logs
3. **Within 2 hours:** Notify engineering lead via Slack #engineering-alerts
4. **Within 4 hours:** Manual intervention for critical operations (payouts, auto-declines)

---

## Payout Mismatches

### Overview

Payout mismatches occur when expected payout amounts don't match actual Stripe transfers or database records.

### Symptoms

- Professional reports incorrect payout amount
- Stripe transfer amount ≠ database `payout_transfers.amount_cop`
- Missing bookings in payout batch
- Duplicate payouts to same booking

### Debugging Steps

#### 1. Verify Payout Batch Record

```sql
-- Get batch details for specific date
SELECT
  batch_id,
  run_date,
  status,
  total_amount_cop,
  total_transfers,
  successful_transfers,
  failed_transfers,
  started_at,
  completed_at,
  error_message
FROM payout_batches
WHERE run_date = '2025-01-14'  -- Replace with target date
ORDER BY started_at DESC;

-- Expected batch_id format: payout-2025-01-14-tue
```

#### 2. Check Individual Transfers

```sql
-- Get all transfers for a batch
SELECT
  pt.id,
  pt.booking_id,
  pt.professional_id,
  pt.amount_cop,
  pt.stripe_transfer_id,
  pt.status,
  pt.error_message,
  b.amount_captured,
  b.service_name,
  b.completed_at
FROM payout_transfers pt
JOIN payout_batches pb ON pt.batch_id = pb.id
JOIN bookings b ON pt.booking_id = b.id
WHERE pb.batch_id = 'payout-2025-01-14-tue'  -- Replace with batch ID
ORDER BY pt.professional_id, pt.created_at;
```

#### 3. Calculate Expected Payout

```typescript
// Payout calculation formula (see /src/lib/payout-calculator.ts)

interface BookingForPayout {
  id: string;
  final_amount_captured: number;  // Amount after Stripe fees
  currency: "COP";
  completed_at: string;
  checked_out_at: string | null;
}

function calculatePayoutFromBookings(bookings: BookingForPayout[]) {
  const totalGross = bookings.reduce((sum, b) => sum + b.final_amount_captured, 0);

  // Platform fee: 15% of gross
  const platformFee = Math.round(totalGross * 0.15);

  // Net to professional: 85% of gross
  const netAmount = totalGross - platformFee;

  return {
    totalGross,
    platformFee,
    netAmount,
    bookingCount: bookings.length,
  };
}
```

#### 4. Verify Stripe Transfer

```bash
# Install Stripe CLI if not already installed
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Get transfer details by ID
stripe transfers retrieve tr_1234567890abcdef

# Expected output:
{
  "id": "tr_1234567890abcdef",
  "amount": 12750000,  # Amount in COP minor units (cents)
  "currency": "cop",
  "destination": "acct_professional123",
  "description": "Payout batch payout-2025-01-14-tue - 5 booking(s)",
  "metadata": {
    "batch_id": "payout-2025-01-14-tue",
    "professional_id": "uuid-123",
    "transfer_count": "5"
  }
}

# List transfers for date range
stripe transfers list \
  --created gte=1705190400 \
  --created lte=1705276800 \
  --limit 100
```

#### 5. Check for Duplicate Payouts

```sql
-- Find bookings with multiple payout transfers (should not happen!)
SELECT
  booking_id,
  COUNT(*) as transfer_count,
  SUM(amount_cop) as total_paid,
  ARRAY_AGG(stripe_transfer_id) as stripe_transfers
FROM payout_transfers
GROUP BY booking_id
HAVING COUNT(*) > 1;

-- If duplicates found, check batch IDs
SELECT
  pt.booking_id,
  pb.batch_id,
  pb.run_date,
  pt.amount_cop,
  pt.stripe_transfer_id,
  pt.created_at
FROM payout_transfers pt
JOIN payout_batches pb ON pt.batch_id = pb.id
WHERE pt.booking_id IN (
  SELECT booking_id
  FROM payout_transfers
  GROUP BY booking_id
  HAVING COUNT(*) > 1
)
ORDER BY pt.booking_id, pt.created_at;
```

#### 6. Verify Eligible Bookings Query

```sql
-- Replicate the eligibility query used by payout service
-- (see /src/lib/services/payouts/payout-batch-service.ts:291)

WITH payout_period AS (
  -- Calculate current payout period (previous Monday-Sunday)
  SELECT
    DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')::date as period_start,
    (DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '6 days')::date as period_end
),
eligible_bookings AS (
  SELECT
    b.id,
    b.professional_id,
    b.amount_captured,
    b.completed_at
  FROM bookings b
  CROSS JOIN payout_period pp
  WHERE b.status = 'completed'
    AND b.amount_captured IS NOT NULL
    AND b.completed_at >= pp.period_start
    AND b.completed_at < pp.period_end + INTERVAL '1 day'
),
already_paid AS (
  SELECT DISTINCT booking_id
  FROM payout_transfers
)
SELECT
  eb.*,
  CASE
    WHEN ap.booking_id IS NOT NULL THEN 'ALREADY_PAID'
    ELSE 'ELIGIBLE'
  END as payout_status
FROM eligible_bookings eb
LEFT JOIN already_paid ap ON eb.id = ap.booking_id
ORDER BY eb.completed_at DESC;
```

#### 7. Common Causes

**Missing Bookings:**

```sql
-- Check if booking was completed in correct time period
SELECT
  id,
  status,
  completed_at,
  DATE_TRUNC('week', completed_at - INTERVAL '1 week')::date as payout_week
FROM bookings
WHERE id = 'booking-uuid-here';

-- If completed_at is after payout run, booking will be in next batch
-- If status is not 'completed', booking is ineligible
-- If amount_captured is NULL, booking is ineligible
```

**Amount Mismatch:**

```sql
-- Compare database vs Stripe
SELECT
  pt.booking_id,
  pt.amount_cop as db_amount,
  b.amount_captured as booking_amount,
  pt.stripe_transfer_id
FROM payout_transfers pt
JOIN bookings b ON pt.booking_id = b.id
WHERE pt.stripe_transfer_id = 'tr_1234567890abcdef';

-- Then check Stripe transfer amount:
-- stripe transfers retrieve tr_1234567890abcdef
-- Compare "amount" field with db_amount
```

**Platform Fee Calculation Error:**

```typescript
// Verify calculation matches payout-calculator.ts
const grossAmount = 15000000;  // Example: 15M COP

const platformFee = Math.round(grossAmount * 0.15);
// Expected: 2,250,000 COP

const netToProfessional = grossAmount - platformFee;
// Expected: 12,750,000 COP

// Check if this matches database:
SELECT
  SUM(amount_cop) as total_transferred
FROM payout_transfers
WHERE professional_id = 'uuid-here'
  AND batch_id IN (
    SELECT id FROM payout_batches
    WHERE batch_id = 'payout-2025-01-14-tue'
  );
```

#### 8. Resolution Steps

**For Missing Payout:**

```sql
-- 1. Verify booking is eligible
SELECT * FROM bookings WHERE id = 'missing-booking-id';

-- 2. Check if already paid
SELECT * FROM payout_transfers WHERE booking_id = 'missing-booking-id';

-- 3. If eligible but missing, trigger manual payout via admin API:
```

```bash
# Manual payout trigger (requires admin auth)
curl -X POST https://casaora.com/api/admin/payouts/process \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true, "batchDate": "2025-01-14"}'

# Review dry run results, then run for real:
curl -X POST https://casaora.com/api/admin/payouts/process \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "batchDate": "2025-01-14"}'
```

**For Duplicate Payout:**

```sql
-- 1. Identify duplicate transfers
SELECT * FROM payout_transfers
WHERE booking_id = 'duplicate-booking-id'
ORDER BY created_at;

-- 2. Create Stripe refund for duplicate
```

```bash
# Refund duplicate transfer
stripe refunds create \
  --charge tr_DUPLICATE_ID \
  --amount 12750000 \
  --reason duplicate

# Update database to mark as refunded
```

```sql
UPDATE payout_transfers
SET status = 'refunded',
    error_message = 'Duplicate payout - refunded on 2025-01-14'
WHERE id = 'duplicate-transfer-uuid';
```

**For Amount Mismatch:**

```bash
# If Stripe amount is WRONG:
# 1. Create reversal transfer
stripe transfers create-reversal tr_INCORRECT_ID

# 2. Create correct transfer manually
stripe transfers create \
  --amount 12750000 \
  --currency cop \
  --destination acct_professional123 \
  --description "Manual correction for payout-2025-01-14-tue"

# 3. Update database with correct transfer ID
```

```sql
UPDATE payout_transfers
SET stripe_transfer_id = 'tr_CORRECTED_ID',
    amount_cop = 12750000,
    status = 'completed'
WHERE booking_id = 'affected-booking-id';
```

#### 9. Prevention

- **Pre-flight checks:** Always run `dryRun: true` before actual payout
- **Automated alerts:** Set up Better Stack alerts for `failedTransfers > 0`
- **Reconciliation:** Weekly audit comparing Stripe transfers vs database
- **Idempotency:** Payout system is idempotent - safe to re-run same batch

---

## Booking Stuck in Authorized

### Overview

Bookings can get stuck in `authorized` status when payment is captured but booking workflow fails to progress.

### Symptoms

- Booking status = `authorized` for > 24 hours
- User/professional reports payment taken but no service scheduled
- Auto-decline cron should have declined but didn't
- Amount authorized but not captured in Stripe

### Debugging Steps

#### 1. Identify Stuck Bookings

```sql
-- Find bookings authorized for > 24 hours
SELECT
  id,
  professional_id,
  user_id,
  status,
  amount_authorized,
  payment_intent_id,
  authorized_at,
  EXTRACT(EPOCH FROM (NOW() - authorized_at))/3600 as hours_stuck,
  created_at
FROM bookings
WHERE status = 'authorized'
  AND authorized_at < NOW() - INTERVAL '24 hours'
ORDER BY authorized_at;
```

#### 2. Check Payment Intent in Stripe

```bash
# Get payment intent details
stripe payment_intents retrieve pi_1234567890abcdef

# Check status - should be one of:
# - requires_payment_method
# - requires_confirmation
# - requires_action
# - processing
# - requires_capture
# - canceled
# - succeeded

# Expected for authorized booking: "requires_capture"
```

#### 3. Check Auto-Decline Logs

```bash
# Search Better Stack for auto-decline attempts
Search: "auto-decline" AND booking_id:"stuck-booking-id"
Time Range: Last 7 days

# Look for error patterns:
# - "Failed to decline booking" → Database update failed
# - "Payment intent not found" → Stripe sync issue
# - "Booking already in_progress" → Race condition with professional accept
```

#### 4. Verify Booking Timeline

```sql
-- Get full booking history
SELECT
  b.id,
  b.status,
  b.authorized_at,
  b.accepted_at,
  b.in_progress_at,
  b.completed_at,
  b.cancelled_at,
  b.declined_at,
  b.created_at,
  b.updated_at,
  -- Professional response
  pp.user_id as professional_user_id,
  pp.verification_status,
  -- User details
  u.email as user_email
FROM bookings b
LEFT JOIN professional_profiles pp ON b.professional_id = pp.profile_id
LEFT JOIN auth.users u ON b.user_id = u.id
WHERE b.id = 'stuck-booking-id';
```

#### 5. Check for Related Errors

```sql
-- Check admin_audit_logs for booking actions
SELECT
  action,
  actor_id,
  resource_type,
  resource_id,
  metadata,
  created_at
FROM admin_audit_logs
WHERE resource_type = 'booking'
  AND resource_id = 'stuck-booking-id'
ORDER BY created_at DESC;

-- Check if professional tried to accept
SELECT
  id,
  booking_id,
  professional_id,
  status,
  created_at
FROM booking_professional_responses
WHERE booking_id = 'stuck-booking-id';
```

#### 6. Common Causes

**Cause 1: Auto-decline cron disabled or failing**

```bash
# Check if cron is running
curl -X POST https://casaora.com/api/cron/auto-decline-expired \
  -H "Authorization: Bearer $CRON_SECRET"

# If 401/403: Check CRON_SECRET env var
# If 500: Check Better Stack logs for specific error
# If timeout: Check database connection pool
```

**Cause 2: Payment intent not in capturable state**

```bash
# Check Stripe status
stripe payment_intents retrieve pi_1234567890abcdef | jq '.status'

# If NOT "requires_capture":
# - "succeeded" → Payment already captured, update booking to in_progress
# - "canceled" → Payment canceled, update booking to declined
# - "requires_action" → User needs to complete 3DS, can't auto-decline yet
```

**Cause 3: Race condition - professional accepted during auto-decline**

```sql
-- Check timing
SELECT
  b.authorized_at,
  b.accepted_at,
  EXTRACT(EPOCH FROM (b.accepted_at - b.authorized_at)) as seconds_to_accept
FROM bookings b
WHERE b.id = 'stuck-booking-id';

-- If accepted_at is within 24 hours of authorized_at:
-- Professional accepted legitimately, booking should be in_progress
-- Check why status wasn't updated to in_progress
```

#### 7. Resolution Steps

**Manual Decline (if truly expired):**

```typescript
// Use admin API to decline booking
const response = await fetch('/api/admin/bookings/stuck-booking-id/decline', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'Expired authorization - manual intervention',
    refund: true  // Cancel payment intent in Stripe
  })
});
```

**Manual Capture (if professional accepted):**

```bash
# If professional accepted but status not updated:

# 1. Capture payment in Stripe
stripe payment_intents capture pi_1234567890abcdef

# 2. Update booking status
```

```sql
UPDATE bookings
SET status = 'in_progress',
    in_progress_at = NOW(),
    amount_captured = amount_authorized
WHERE id = 'stuck-booking-id'
  AND status = 'authorized';
```

**Fix Auto-Decline Cron:**

```bash
# If cron is failing:

# 1. Check cron configuration
grep "auto-decline" vercel.json

# 2. Test endpoint manually
curl -X POST https://casaora.com/api/cron/auto-decline-expired \
  -H "Authorization: Bearer $CRON_SECRET" \
  -v

# 3. Check Better Stack for specific error
# 4. Fix underlying issue (DB connection, Stripe API, etc.)
# 5. Redeploy if needed
vercel --prod

# 6. Verify cron runs successfully
# Wait for next hourly run or trigger manually
```

#### 8. Prevention

- **Monitoring:** Set up Better Stack alert for `status=authorized AND hours>24`
- **Cron health:** Use D-1 dashboard to monitor auto-decline success rate
- **Database indexes:** Ensure `authorized_at` has index for fast queries
- **Idempotency:** Auto-decline is idempotent - safe to run multiple times

```sql
-- Add index if missing
CREATE INDEX IF NOT EXISTS idx_bookings_authorized_at
ON bookings(authorized_at)
WHERE status = 'authorized';
```

---

## Booking Stuck in In Progress

### Overview

Bookings can get stuck in `in_progress` status when service is completed but workflow fails to mark as complete.

### Symptoms

- Booking status = `in_progress` for > 48 hours after scheduled end time
- Professional reports service completed but can't mark as complete
- User reports service done but no completion confirmation
- Payment captured but booking never completed

### Debugging Steps

#### 1. Identify Stuck Bookings

```sql
-- Find bookings in_progress beyond expected duration
SELECT
  b.id,
  b.professional_id,
  b.user_id,
  b.status,
  b.service_name,
  b.scheduled_start,
  b.scheduled_end,
  b.in_progress_at,
  b.amount_captured,
  EXTRACT(EPOCH FROM (NOW() - b.in_progress_at))/3600 as hours_in_progress,
  CASE
    WHEN b.scheduled_end IS NOT NULL
    THEN EXTRACT(EPOCH FROM (NOW() - b.scheduled_end))/3600
    ELSE NULL
  END as hours_past_scheduled_end
FROM bookings b
WHERE b.status = 'in_progress'
  AND (
    b.in_progress_at < NOW() - INTERVAL '48 hours'
    OR (b.scheduled_end IS NOT NULL AND b.scheduled_end < NOW() - INTERVAL '6 hours')
  )
ORDER BY b.in_progress_at;
```

#### 2. Check Completion Attempts

```sql
-- Check audit logs for completion attempts
SELECT
  aal.action,
  aal.actor_id,
  aal.metadata,
  aal.created_at,
  aal.ip_address,
  au.email as actor_email
FROM admin_audit_logs aal
LEFT JOIN auth.users au ON aal.actor_id = au.id
WHERE aal.resource_type = 'booking'
  AND aal.resource_id = 'stuck-booking-id'
  AND aal.action LIKE '%complete%'
ORDER BY aal.created_at DESC;

-- Check if check-out was attempted
SELECT
  b.checked_out_at,
  b.checkout_notes,
  b.in_progress_at,
  b.scheduled_end
FROM bookings b
WHERE b.id = 'stuck-booking-id';
```

#### 3. Verify Professional Access

```sql
-- Check if professional can access booking
SELECT
  b.id,
  b.professional_id,
  pp.user_id as professional_user_id,
  pp.verification_status,
  pp.status as profile_status,
  au.email as professional_email,
  au.email_confirmed_at
FROM bookings b
JOIN professional_profiles pp ON b.professional_id = pp.profile_id
LEFT JOIN auth.users au ON pp.user_id = au.id
WHERE b.id = 'stuck-booking-id';

-- If verification_status != 'approved' or status != 'active':
-- Professional may not have access to complete booking
```

#### 4. Check Payment Capture

```bash
# Verify payment was captured in Stripe
stripe payment_intents retrieve pi_1234567890abcdef | jq '.status, .amount_received'

# Should return:
# "status": "succeeded"
# "amount_received": 15000000 (matches amount_captured in DB)
```

#### 5. Check for Application Errors

```bash
# Search Better Stack for completion errors
Search: ("booking" OR "complete") AND "error" AND booking_id:"stuck-booking-id"
Time Range: Last 7 days

# Common error patterns:
# - "Payment not captured" → Stripe sync issue
# - "Professional not found" → Database relationship issue
# - "Validation error" → Missing required fields for completion
# - "Transaction deadlock" → Database concurrency issue
```

#### 6. Check Real-time Updates

```sql
-- Check if real-time updates are working
SELECT
  channel,
  payload,
  created_at
FROM realtime_messages
WHERE payload::jsonb->>'booking_id' = 'stuck-booking-id'
ORDER BY created_at DESC
LIMIT 10;

-- If no recent messages:
-- Real-time may be down, preventing UI updates
```

#### 7. Common Causes

**Cause 1: Missing checkout data**

```sql
-- Check required fields for completion
SELECT
  id,
  checked_out_at,  -- Required
  checkout_notes,   -- Optional but expected
  amount_captured   -- Required
FROM bookings
WHERE id = 'stuck-booking-id';

-- If checked_out_at is NULL:
-- Professional hasn't checked out yet
-- May be stuck in checkout flow or UI bug
```

**Cause 2: Database transaction timeout**

```sql
-- Check for long-running transactions
SELECT
  pid,
  usename,
  state,
  query,
  query_start,
  NOW() - query_start as duration
FROM pg_stat_activity
WHERE state = 'active'
  AND query LIKE '%bookings%'
  AND NOW() - query_start > INTERVAL '5 minutes'
ORDER BY query_start;

-- If found, terminate:
SELECT pg_terminate_backend(pid);
```

**Cause 3: Stripe webhook delay**

```bash
# Check Stripe webhook events
stripe events list --type payment_intent.succeeded --limit 100 | \
  jq '.data[] | select(.data.object.id == "pi_1234567890abcdef")'

# If webhook delivery failed:
# - Check webhook endpoint health
# - Verify webhook signing secret
# - Manually sync payment status
```

**Cause 4: UI state bug - professional thinks it's completed**

```bash
# Check professional's view in PostHog
# Search for session recordings with booking_id
# Look for completion button clicks without API call
```

#### 8. Resolution Steps

**Manual Completion (if service actually done):**

```typescript
// Use admin API to complete booking
const response = await fetch('/api/admin/bookings/stuck-booking-id/complete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    completedAt: '2025-01-14T15:30:00Z',  // Actual completion time
    checkoutNotes: 'Manual completion - service confirmed done',
    reason: 'Stuck in in_progress - manual intervention'
  })
});
```

```sql
-- Verify completion
SELECT
  id,
  status,
  completed_at,
  checked_out_at,
  amount_captured
FROM bookings
WHERE id = 'stuck-booking-id';

-- Should now show:
-- status = 'completed'
-- completed_at = timestamp
-- checked_out_at = timestamp (if was NULL)
```

**Rollback to In Progress (if completion was premature):**

```sql
-- ONLY if professional confirms service not done
UPDATE bookings
SET status = 'in_progress',
    completed_at = NULL,
    checked_out_at = NULL
WHERE id = 'stuck-booking-id'
  AND status = 'completed';

-- Notify professional to properly complete when done
```

**Fix Payment Capture Issue:**

```bash
# If payment shows captured in Stripe but not in DB:

# 1. Get payment intent details
stripe payment_intents retrieve pi_1234567890abcdef > /tmp/pi.json

# 2. Update database with captured amount
```

```sql
UPDATE bookings
SET amount_captured = 15000000,  -- From Stripe amount_received
    updated_at = NOW()
WHERE id = 'stuck-booking-id'
  AND payment_intent_id = 'pi_1234567890abcdef';
```

**Trigger Webhook Replay (if webhook lost):**

```bash
# Find webhook event in Stripe
stripe events list --type payment_intent.succeeded --limit 100

# Resend specific event
stripe events resend evt_1234567890abcdef

# Verify webhook received in Better Stack logs
# Search: "webhook" AND "payment_intent.succeeded" AND "pi_1234567890abcdef"
```

#### 9. Prevention

- **Monitoring:** Alert on `status=in_progress AND hours>48`
- **UI improvements:** Add prominent "Complete Service" button
- **Automatic completion:** Consider auto-completing 24h after scheduled_end
- **Webhook reliability:** Set up webhook monitoring and automatic retries
- **Database performance:** Regular VACUUM and index maintenance

```sql
-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_in_progress_scheduled_end
ON bookings(scheduled_end)
WHERE status = 'in_progress';

-- Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%bookings%'
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Appendix

### Useful SQL Queries

```sql
-- Health check: Recent booking flow stats
SELECT
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM bookings
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status
ORDER BY count DESC;

-- Payout reconciliation: Compare DB vs Stripe
SELECT
  pb.batch_id,
  pb.total_amount_cop as db_total,
  COUNT(DISTINCT pt.stripe_transfer_id) as stripe_transfer_count,
  pb.successful_transfers as expected_count
FROM payout_batches pb
LEFT JOIN payout_transfers pt ON pb.id = pt.batch_id
WHERE pb.run_date > CURRENT_DATE - INTERVAL '30 days'
GROUP BY pb.id, pb.batch_id, pb.total_amount_cop, pb.successful_transfers
HAVING COUNT(DISTINCT pt.stripe_transfer_id) != pb.successful_transfers;

-- Find orphaned payment intents
SELECT
  b.id,
  b.payment_intent_id,
  b.status,
  b.created_at
FROM bookings b
WHERE b.payment_intent_id IS NOT NULL
  AND b.status IN ('pending', 'authorized')
  AND b.created_at < NOW() - INTERVAL '7 days';
```

### Environment Variable Reference

**Required for Crons:**
- `CRON_SECRET` - Bearer token for cron authentication
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `STRIPE_SECRET_KEY` - Stripe secret key for API calls
- `LOGTAIL_SOURCE_TOKEN` - Better Stack logging token

**Optional but Recommended:**
- `VERCEL_URL` - Auto-generated base URL for API calls
- `DATABASE_URL` - Direct Postgres connection (for debugging)

### Stripe CLI Cheat Sheet

```bash
# Authentication
stripe login

# List recent payment intents
stripe payment_intents list --limit 10

# Get specific payment intent
stripe payment_intents retrieve pi_1234567890abcdef

# Capture authorized payment
stripe payment_intents capture pi_1234567890abcdef

# Cancel payment intent
stripe payment_intents cancel pi_1234567890abcdef

# List transfers
stripe transfers list --limit 20

# Get transfer details
stripe transfers retrieve tr_1234567890abcdef

# Create reversal
stripe transfers create-reversal tr_1234567890abcdef

# Listen to webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

### Better Stack Query Examples

```
# Payout errors in last 24 hours
level:error AND "payout" dt:[now-24h TO now]

# Cron failures
level:error AND ("cron" OR "schedule") dt:[now-7d TO now]

# Specific booking issues
booking_id:"abc-123" dt:[now-7d TO now]

# Stripe API errors
"Stripe" AND "error" AND level:error dt:[now-24h TO now]

# Database timeouts
"timeout" AND "database" dt:[now-24h TO now]
```

### Contact & Escalation

**Immediate Issues (P0):**
- Slack: #engineering-alerts
- On-call: Check PagerDuty rotation

**Non-Urgent Issues (P1-P2):**
- Slack: #engineering-support
- Create Linear ticket with "ops" label

**External Services:**
- Stripe Support: https://support.stripe.com
- Supabase Support: https://supabase.com/dashboard/support
- Vercel Support: https://vercel.com/support

---

**Document History:**

- **2025-01-14:** Initial version (v1.0.0) - Documented cron failures, payout mismatches, and stuck bookings
