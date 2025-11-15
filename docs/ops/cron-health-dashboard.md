# Cron Health Dashboard Setup

> **Epic D-1:** Build "Cron Health" dashboard
> **Platform:** Better Stack (Logs)
> **Purpose:** Monitor success/error counts and durations for auto-decline and payout crons

## Overview

This dashboard provides real-time monitoring of Casaora's critical cron jobs to ensure financial operations (payouts) and booking workflows (auto-decline) are running smoothly.

## Dashboard Configuration

### Step 1: Create Dashboard in Better Stack

1. Navigate to [Better Stack Dashboards](https://logs.betterstack.com)
2. Click **"Create Dashboard"**
3. **Name:** `Cron Health Monitoring`
4. **Description:** `Monitors auto-decline and payout cron job health`
5. **Team:** `Casaora Production`

### Step 2: Add Widgets

Better Stack uses a grid-based layout. Add the following widgets:

---

## Widget 1: Cron Success Rate (24h)

**Type:** Metric Widget (Single Value)
**Position:** Top Left (Row 1, Col 1)
**Size:** 1x1

**Query:**
```
source:casaora-production AND (
  "Payout batch completed successfully" OR
  "Auto-decline processing completed"
)
```

**Calculation:**
```javascript
// Success count
const successCount = logs.filter(log =>
  log.message.includes("completed successfully") ||
  log.message.includes("processing completed")
).length;

// Total count (success + failures)
const totalCount = logs.filter(log =>
  log.message.includes("Payout batch") ||
  log.message.includes("Auto-decline")
).length;

// Success rate
const successRate = (successCount / totalCount) * 100;
return successRate.toFixed(1) + "%";
```

**Display:**
- **Label:** "Success Rate (24h)"
- **Color:** Green if ≥ 95%, Yellow if ≥ 90%, Red if < 90%
- **Icon:** ✓ (checkmark)

---

## Widget 2: Payout Cron Status

**Type:** Time Series Chart
**Position:** Top Center (Row 1, Col 2-4)
**Size:** 1x3

**Query 1 - Successful Payouts:**
```
source:casaora-production AND "Payout batch completed successfully"
```

**Query 2 - Failed Payouts:**
```
source:casaora-production AND "Payout batch processing failed"
```

**Visualization:**
- **Type:** Column Chart (Stacked)
- **X-Axis:** Time (1 hour buckets)
- **Y-Axis:** Count of events
- **Series 1 (Success):** Green bars
- **Series 2 (Failure):** Red bars
- **Time Range:** Last 7 days
- **Refresh:** Every 5 minutes

---

## Widget 3: Auto-Decline Cron Status

**Type:** Time Series Chart
**Position:** Top Right (Row 1, Col 5-7)
**Size:** 1x3

**Query 1 - Successful Auto-Declines:**
```
source:casaora-production AND "Auto-decline processing completed"
```

**Query 2 - Failed Auto-Declines:**
```
source:casaora-production AND "Auto-decline processing failed"
```

**Visualization:**
- **Type:** Column Chart (Stacked)
- **X-Axis:** Time (1 hour buckets)
- **Y-Axis:** Count of events
- **Series 1 (Success):** Green bars
- **Series 2 (Failure):** Red bars
- **Time Range:** Last 7 days
- **Refresh:** Every 5 minutes

---

## Widget 4: Payout Processing Duration

**Type:** Time Series Chart
**Position:** Middle Left (Row 2, Col 1-3)
**Size:** 1x3

**Query:**
```
source:casaora-production AND "Payout batch completed successfully"
```

**Metric:**
```javascript
// Extract duration from log metadata
const durations = logs
  .filter(log => log.metadata?.duration)
  .map(log => log.metadata.duration);

// Calculate statistics
return {
  avg: durations.reduce((a, b) => a + b, 0) / durations.length,
  p50: percentile(durations, 50),
  p95: percentile(durations, 95),
  p99: percentile(durations, 99)
};
```

**Visualization:**
- **Type:** Line Chart (Multi-series)
- **X-Axis:** Time (1 hour buckets)
- **Y-Axis:** Duration (milliseconds)
- **Series 1:** Average (Blue)
- **Series 2:** P95 (Orange)
- **Series 3:** P99 (Red)
- **Alert Threshold:** Red line at 60000ms (1 minute)
- **Time Range:** Last 7 days

---

## Widget 5: Auto-Decline Processing Duration

**Type:** Time Series Chart
**Position:** Middle Right (Row 2, Col 4-6)
**Size:** 1x3

**Query:**
```
source:casaora-production AND "Auto-decline processing completed"
```

**Metric:**
```javascript
// Extract duration from log metadata
const durations = logs
  .filter(log => log.metadata?.duration)
  .map(log => log.metadata.duration);

// Calculate statistics
return {
  avg: durations.reduce((a, b) => a + b, 0) / durations.length,
  p50: percentile(durations, 50),
  p95: percentile(durations, 95)
};
```

**Visualization:**
- **Type:** Line Chart (Multi-series)
- **X-Axis:** Time (1 hour buckets)
- **Y-Axis:** Duration (milliseconds)
- **Series 1:** Average (Blue)
- **Series 2:** P95 (Orange)
- **Alert Threshold:** Red line at 30000ms (30 seconds)
- **Time Range:** Last 7 days

---

## Widget 6: Payout Batch Metrics

**Type:** Table Widget
**Position:** Bottom Left (Row 3, Col 1-4)
**Size:** 1x4

**Query:**
```
source:casaora-production AND "Payout batch completed successfully"
```

**Columns:**
1. **Batch ID** - Extract from `metadata.batchId`
2. **Total Amount (COP)** - Extract from `metadata.totalAmountCop`, format as currency
3. **Transfers** - Extract from `metadata.totalTransfers`
4. **Success Rate** - Calculate: `successfulTransfers / totalTransfers * 100%`
5. **Duration** - Extract from `metadata.duration`, format as seconds
6. **Timestamp** - Event timestamp

**Sorting:** By timestamp (descending)
**Limit:** Last 20 batches
**Refresh:** Every 5 minutes

---

## Widget 7: Error Log Stream

**Type:** Log Stream Widget
**Position:** Bottom Right (Row 3, Col 5-7)
**Size:** 1x3

**Query:**
```
source:casaora-production AND level:error AND (
  "cron" OR "payout" OR "auto-decline"
)
```

**Display:**
- **Show:** Last 50 error logs
- **Columns:** Timestamp, Level, Message, Error Details
- **Highlight:** Red background for errors
- **Auto-scroll:** Disabled (allow manual scrolling)
- **Refresh:** Real-time (live tail)

---

## Widget 8: Cron Execution Timeline

**Type:** Event Timeline
**Position:** Row 4, Full Width (Col 1-7)
**Size:** 1x7

**Query:**
```
source:casaora-production AND (
  "Payout processing API called" OR
  "Auto-decline processing started"
)
```

**Visualization:**
- **Type:** Horizontal timeline with markers
- **Events:**
  - **Payout Cron:** Blue diamond markers
  - **Auto-Decline Cron:** Green circle markers
- **Tooltip:** Show batch ID, triggered by (cron/admin), duration
- **Time Range:** Last 7 days
- **Expected Pattern:**
  - Auto-Decline: Every hour (24 markers per day)
  - Payout: Tuesday and Friday at 10 AM Colombia time

---

## Dashboard Layout Preview

```
┌─────────────────────────────────────────────────────────────────┐
│  Cron Health Monitoring                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Success  │  │  Payout Cron Status  │  │ Auto-Decline     │  │
│  │  Rate    │  │  ▂▃▅▇█▇▅▃▂           │  │  Cron Status     │  │
│  │  98.5%   │  │  Success  Failure     │  │  ▂▃▅▇█▇▅▃▂      │  │
│  └──────────┘  └──────────────────────┘  └──────────────────┘  │
│                                                                 │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐ │
│  │ Payout Duration         │  │ Auto-Decline Duration        │ │
│  │ ─────── Avg             │  │ ─────── Avg                  │ │
│  │ ─ ─ ─ ─ P95             │  │ ─ ─ ─ ─ P95                  │ │
│  │ · · · · · P99           │  │                              │ │
│  └─────────────────────────┘  └──────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────┐  ┌──────────────────────┐   │
│  │ Recent Payout Batches         │  │ Error Logs           │   │
│  │ Batch ID   | Amount | Success │  │ [ERROR] Payout...    │   │
│  │ payout-... | 15M    | 100%    │  │ [ERROR] Stripe...    │   │
│  │ payout-... | 12M    | 100%    │  │ [ERROR] Database...  │   │
│  └───────────────────────────────┘  └──────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Cron Execution Timeline                                 │   │
│  │ ◆────────◆────────◆────────◆ Payout (Tue/Fri 10 AM)    │   │
│  │ ○○○○○○○○○○○○○○○○○○○○○○○○○○○○ Auto-Decline (Hourly)    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alert Configuration

### Alert 1: Payout Cron Failure

**Trigger:**
```
source:casaora-production AND "Payout batch processing failed"
```

**Conditions:**
- **Threshold:** Any occurrence
- **Time Window:** 1 minute
- **Frequency:** Immediately (no grouping)

**Actions:**
- **Slack:** #engineering-alerts channel
- **PagerDuty:** P0 incident (only on Tue/Fri between 9-11 AM Colombia)
- **Email:** engineering-lead@casaora.com

**Message Template:**
```
🚨 PAYOUT CRON FAILURE

Batch ID: {{metadata.batchId}}
Error: {{error.message}}
Timestamp: {{timestamp}}

Action Required:
1. Check Better Stack logs: https://logs.betterstack.com/...
2. Run manual payout: /api/admin/payouts/process
3. Follow runbook: docs/ops/runbooks.md#payout-mismatches

Dashboard: https://logs.betterstack.com/dashboard/cron-health
```

---

### Alert 2: Auto-Decline Cron Missing

**Trigger:**
```
source:casaora-production AND "Auto-decline processing"
```

**Conditions:**
- **Threshold:** 0 events in last 90 minutes
- **Time Window:** 90 minutes
- **Frequency:** Every 30 minutes

**Rationale:** Cron should run hourly. If no events in 90 minutes, cron is down.

**Actions:**
- **Slack:** #engineering-alerts channel
- **Email:** engineering-oncall@casaora.com

**Message Template:**
```
⚠️ AUTO-DECLINE CRON MISSING

Expected: Runs every hour
Last Execution: {{last_timestamp}} ({{hours_ago}} hours ago)

Action Required:
1. Check Vercel cron configuration
2. Verify CRON_SECRET environment variable
3. Test endpoint: /api/cron/auto-decline-expired
4. Follow runbook: docs/ops/runbooks.md#cron-job-failures

Dashboard: https://logs.betterstack.com/dashboard/cron-health
```

---

### Alert 3: Slow Payout Processing

**Trigger:**
```
source:casaora-production AND "Payout batch completed successfully"
```

**Conditions:**
- **Threshold:** `metadata.duration > 60000` (1 minute)
- **Time Window:** 5 minutes
- **Frequency:** At most once per hour

**Actions:**
- **Slack:** #engineering-notifications channel

**Message Template:**
```
⏱️ SLOW PAYOUT PROCESSING

Batch ID: {{metadata.batchId}}
Duration: {{metadata.duration}}ms (threshold: 60000ms)
Transfers: {{metadata.totalTransfers}}

This may indicate:
- High booking volume (good problem!)
- Database performance degradation
- Stripe API slowness

Monitor and investigate if duration consistently exceeds 2 minutes.

Dashboard: https://logs.betterstack.com/dashboard/cron-health
```

---

### Alert 4: Failed Transfers in Payout Batch

**Trigger:**
```
source:casaora-production AND "Payout batch completed" AND metadata.failedTransfers > 0
```

**Conditions:**
- **Threshold:** `metadata.failedTransfers > 0`
- **Time Window:** 1 minute
- **Frequency:** Immediately

**Actions:**
- **Slack:** #engineering-alerts channel
- **Email:** finance@casaora.com

**Message Template:**
```
⚠️ PAYOUT BATCH WITH FAILURES

Batch ID: {{metadata.batchId}}
Total Transfers: {{metadata.totalTransfers}}
Failed: {{metadata.failedTransfers}}
Success Rate: {{(metadata.successfulTransfers / metadata.totalTransfers * 100)}}%

Action Required:
1. Review error logs in Better Stack
2. Check failed transfers in database:
   SELECT * FROM payout_transfers WHERE status = 'failed' AND batch_id = '{{metadata.batchId}}'
3. Follow runbook: docs/ops/runbooks.md#payout-mismatches
4. Retry failed transfers manually

Dashboard: https://logs.betterstack.com/dashboard/cron-health
```

---

## Query Reference

### All Payout Events

```
source:casaora-production AND (
  "Payout batch processing started" OR
  "Payout batch completed successfully" OR
  "Payout batch processing failed" OR
  "Payout processing API called" OR
  "Stripe transfer created" OR
  "Stripe transfer failed"
)
```

### All Auto-Decline Events

```
source:casaora-production AND (
  "Auto-decline processing started" OR
  "Auto-decline processing completed" OR
  "Auto-decline processing failed" OR
  "Booking auto-declined" OR
  "Auto-decline cron triggered"
)
```

### Critical Errors Only

```
source:casaora-production AND level:error AND (
  message:("cron" OR "payout" OR "auto-decline") OR
  metadata.batchId:* OR
  metadata.cronType:*
)
```

### Performance Metrics

```
source:casaora-production AND metadata.duration:* AND (
  "completed successfully" OR "processing completed"
)
```

---

## Maintenance

### Weekly Review (Every Monday)

1. **Review Dashboard Trends:**
   - Check success rate over last week
   - Identify any degradation in performance
   - Review failed transfer patterns

2. **Verify Alert Sensitivity:**
   - Ensure no false positives
   - Adjust thresholds if needed
   - Update oncall rotation

3. **Update Documentation:**
   - Add new failure patterns to runbooks
   - Document any manual interventions
   - Update dashboard queries if log format changes

### Monthly Audit (First Monday of Month)

1. **Database Cleanup:**
   ```sql
   -- Archive old payout batches (keep 90 days)
   DELETE FROM payout_batches
   WHERE run_date < CURRENT_DATE - INTERVAL '90 days';

   -- Archive old payout transfers (keep 90 days)
   DELETE FROM payout_transfers
   WHERE created_at < NOW() - INTERVAL '90 days';
   ```

2. **Performance Review:**
   - Review P95/P99 duration trends
   - Optimize slow queries if duration increasing
   - Scale infrastructure if needed

3. **Compliance:**
   - Export payout logs for accounting
   - Verify all payouts reconcile with Stripe
   - Archive financial records

---

## Troubleshooting Dashboard Issues

### Issue: Widget Shows No Data

**Cause:** Query filter too restrictive or log source misconfigured

**Fix:**
1. Verify log source name: `casaora-production`
2. Check that logs are being sent to Better Stack:
   ```bash
   # Test logging locally
   curl -X POST https://in.logs.betterstack.com/ \
     -H "Authorization: Bearer $LOGTAIL_SOURCE_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"Test log","source":"casaora-production"}'
   ```
3. Broaden time range to "Last 30 days"
4. Simplify query to just `source:casaora-production`

### Issue: Alert Not Firing

**Cause:** Threshold incorrect or notification channel misconfigured

**Fix:**
1. Test alert manually in Better Stack UI
2. Verify Slack webhook is configured
3. Check spam folder for email alerts
4. Lower threshold temporarily to confirm alert works

### Issue: Dashboard Loading Slowly

**Cause:** Too many widgets or complex queries

**Fix:**
1. Reduce time range (e.g., 7 days → 3 days)
2. Increase refresh interval (5 min → 15 min)
3. Split into multiple dashboards:
   - "Cron Health - Overview" (summary widgets)
   - "Cron Health - Details" (detailed tables/logs)

---

## Related Documentation

- [Operational Runbooks](./runbooks.md) - Debugging procedures
- [PMF Core Metrics Dashboard](./pmf-metrics-dashboard.md) - Product metrics (D-2)
- [Better Stack Integration](../lib/integrations/better-stack/README.md) - Logging setup
- [Payout Batch Service](../lib/services/payouts/payout-batch-service.ts) - Source code

---

**Document History:**

- **2025-01-14:** Initial version - Cron Health dashboard configuration for Epic D-1
