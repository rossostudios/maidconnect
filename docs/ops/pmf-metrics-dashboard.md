# PMF Core Metrics Dashboard Setup

> **Epic D-2:** Build "PMF Core Metrics" dashboard
> **Platform:** PostHog
> **Purpose:** Track product-market fit signals and user engagement

## Overview

This dashboard monitors key indicators of product-market fit (PMF) for Casaora, focusing on user engagement, booking completion, and retention metrics.

## Prerequisites

Before creating the dashboard, ensure these PostHog events are being tracked in the codebase:

### Required Event Tracking

Add to [src/lib/integrations/posthog/index.ts](../../src/lib/integrations/posthog/index.ts):

```typescript
/**
 * PMF Core Metrics Tracking Events
 */

// Brief submitted (user fills out service request form)
export function trackBriefSubmitted(properties: {
  serviceType: string;
  location: string;
  estimatedBudget?: number;
  urgency?: 'immediate' | 'flexible' | 'scheduled';
}) {
  trackEvent('Brief Submitted', properties);
}

// Concierge request (user requests human assistance)
export function trackConciergeRequest(properties: {
  requestType: 'help_with_booking' | 'custom_service' | 'pricing_question' | 'other';
  fromPage: string;
  userMessage?: string;
}) {
  trackEvent('Concierge Request', properties);
}

// Booking completed (service finished and paid)
export function trackBookingCompleted(properties: {
  bookingId: string;
  professionalId: string;
  serviceType: string;
  amount: number;
  currency: string;
  isRepeatBooking: boolean;
  daysSinceLastBooking?: number;
}) {
  trackEvent('Booking Completed', properties);
}

// User identity for cohort tracking
export function identifyUserForPMF(
  userId: string,
  properties: {
    email: string;
    householdId?: string;
    firstBookingDate?: string;
    totalBookings: number;
    lifetimeValue: number;
  }
) {
  posthog?.identify(userId, properties);
}
```

### Implementation Checklist

- [ ] Add `trackBriefSubmitted()` to service request form submission
- [ ] Add `trackConciergeRequest()` to Amara chat widget and help requests
- [ ] Add `trackBookingCompleted()` to booking completion workflow
- [ ] Add `identifyUserForPMF()` to user authentication and booking events
- [ ] Verify events appear in PostHog Live Events stream

**Implementation Example:**

```typescript
// In booking completion handler (src/app/api/bookings/[id]/complete/route.ts)
import { trackBookingCompleted } from '@/lib/integrations/posthog';

export async function POST(request: Request) {
  // ... complete booking logic ...

  // Track PMF metric
  await trackBookingCompleted({
    bookingId: booking.id,
    professionalId: booking.professional_id,
    serviceType: booking.service_name,
    amount: booking.amount_captured,
    currency: booking.currency,
    isRepeatBooking: userBookingCount > 1,
    daysSinceLastBooking: calculateDaysSinceLastBooking(userId),
  });

  // ... rest of handler ...
}
```

---

## Dashboard Configuration

### Step 1: Create Dashboard in PostHog

1. Navigate to [PostHog Dashboards](https://us.posthog.com/project/YOUR_PROJECT_ID/dashboard)
2. Click **"New dashboard"**
3. **Name:** `PMF Core Metrics`
4. **Description:** `Product-market fit indicators: briefs, concierge, bookings, retention`
5. **Tags:** `pmf`, `metrics`, `kpi`
6. **Sharing:** Internal only (requires login)

### Step 2: Add Insights

PostHog dashboards use "Insights" (charts/metrics). Add the following:

---

## Insight 1: Briefs Submitted (Trend)

**Type:** Trends
**Position:** Top Left (Row 1, Col 1-3)

**Configuration:**
- **Event:** `Brief Submitted`
- **Chart Type:** Line graph
- **Interval:** Daily
- **Date Range:** Last 90 days
- **Formula:** Count of events
- **Breakdowns:** None (show total only)

**Display Options:**
- **Title:** "Briefs Submitted (Daily)"
- **Y-Axis Label:** "Count"
- **Show Values:** Yes
- **Show Legend:** No
- **Goal Line:** 50 briefs/day (aspirational target)

**SQL Query (Advanced Mode):**
```sql
SELECT
  toDate(timestamp) AS date,
  count() AS brief_count
FROM events
WHERE event = 'Brief Submitted'
  AND timestamp >= now() - INTERVAL 90 DAY
GROUP BY date
ORDER BY date
```

---

## Insight 2: Concierge Requests (Trend)

**Type:** Trends
**Position:** Top Center (Row 1, Col 4-6)

**Configuration:**
- **Event:** `Concierge Request`
- **Chart Type:** Line graph
- **Interval:** Daily
- **Date Range:** Last 90 days
- **Breakdowns:** By `requestType` (show as stacked area)

**Breakdown Colors:**
- `help_with_booking`: Blue
- `custom_service`: Purple
- `pricing_question`: Orange
- `other`: Gray

**Display Options:**
- **Title:** "Concierge Requests by Type (Daily)"
- **Y-Axis Label:** "Count"
- **Show Legend:** Yes
- **Show Values:** No (too cluttered)

---

## Insight 3: Bookings Completed (Trend)

**Type:** Trends
**Position:** Top Right (Row 1, Col 7-9)

**Configuration:**
- **Event:** `Booking Completed`
- **Chart Type:** Bar graph (vertical)
- **Interval:** Weekly
- **Date Range:** Last 12 weeks
- **Formula:** Count of events
- **Breakdowns:** None

**Display Options:**
- **Title:** "Bookings Completed (Weekly)"
- **Y-Axis Label:** "Bookings"
- **Show Values:** Yes (on bars)
- **Color:** Green (#10B981)
- **Goal Line:** 100 bookings/week

---

## Insight 4: Households with ≥2 Bookings (Funnel)

**Type:** Funnels
**Position:** Middle Left (Row 2, Col 1-4)

**Configuration:**
- **Step 1:** User signed up (`Sign Up Completed`)
- **Step 2:** First booking completed (`Booking Completed` where `totalBookings = 1`)
- **Step 3:** Second booking completed (`Booking Completed` where `totalBookings >= 2`)

**Display Options:**
- **Title:** "Household Activation Funnel"
- **Layout:** Vertical steps
- **Show Percentages:** Yes
- **Show Absolute Numbers:** Yes
- **Time Window:** 60 days between steps

**Conversion Targets:**
- Step 1→2: 40% (signup to first booking)
- Step 2→3: 30% (first to second booking)

**Alternative: Cohort Query**

If funnel approach doesn't work, use SQL query:

```sql
SELECT
  COUNT(DISTINCT user_id) AS total_households,
  COUNT(DISTINCT CASE WHEN booking_count >= 2 THEN user_id END) AS repeat_households,
  (COUNT(DISTINCT CASE WHEN booking_count >= 2 THEN user_id END) * 100.0 / COUNT(DISTINCT user_id)) AS repeat_rate
FROM (
  SELECT
    properties->>'$user_id' AS user_id,
    COUNT(*) AS booking_count
  FROM events
  WHERE event = 'Booking Completed'
    AND timestamp >= now() - INTERVAL 90 DAY
  GROUP BY user_id
) subquery
```

---

## Insight 5: 60-Day Rebooking Rate (Cohort)

**Type:** Retention
**Position:** Middle Right (Row 2, Col 5-9)

**Configuration:**
- **Cohort Event:** `Booking Completed` (first occurrence)
- **Return Event:** `Booking Completed` (subsequent occurrence)
- **Cohort Size:** Daily cohorts
- **Time Period:** 60 days
- **Display:** Table with heatmap

**Retention Calculation:**
```sql
WITH first_bookings AS (
  SELECT
    properties->>'$user_id' AS user_id,
    MIN(toDate(timestamp)) AS first_booking_date
  FROM events
  WHERE event = 'Booking Completed'
  GROUP BY user_id
),
subsequent_bookings AS (
  SELECT
    e.properties->>'$user_id' AS user_id,
    toDate(e.timestamp) AS booking_date,
    dateDiff('day', fb.first_booking_date, toDate(e.timestamp)) AS days_since_first
  FROM events e
  JOIN first_bookings fb ON e.properties->>'$user_id' = fb.user_id
  WHERE e.event = 'Booking Completed'
    AND toDate(e.timestamp) > fb.first_booking_date
)
SELECT
  COUNT(DISTINCT fb.user_id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN sb.days_since_first <= 60 THEN sb.user_id END) AS rebooked_within_60_days,
  (COUNT(DISTINCT CASE WHEN sb.days_since_first <= 60 THEN sb.user_id END) * 100.0 / COUNT(DISTINCT fb.user_id)) AS rebooking_rate
FROM first_bookings fb
LEFT JOIN subsequent_bookings sb ON fb.user_id = sb.user_id
WHERE fb.first_booking_date >= today() - INTERVAL 120 DAY
```

**Display Options:**
- **Title:** "60-Day Rebooking Rate by Cohort"
- **Heatmap Colors:** 0% = Red, 15% = Yellow, 30% = Green
- **Show Percentages:** Yes
- **Show Absolute Numbers:** Yes

**Target:** ≥ 25% of users rebook within 60 days

---

## Insight 6: PMF Scorecard (Summary Metrics)

**Type:** Numbers (Multiple Big Numbers)
**Position:** Bottom Left (Row 3, Col 1-3)

**Metrics:**

**Metric 1: Total Briefs (30d)**
```sql
SELECT count()
FROM events
WHERE event = 'Brief Submitted'
  AND timestamp >= now() - INTERVAL 30 DAY
```

**Metric 2: Total Concierge Requests (30d)**
```sql
SELECT count()
FROM events
WHERE event = 'Concierge Request'
  AND timestamp >= now() - INTERVAL 30 DAY
```

**Metric 3: Total Bookings (30d)**
```sql
SELECT count()
FROM events
WHERE event = 'Booking Completed'
  AND timestamp >= now() - INTERVAL 30 DAY
```

**Metric 4: Repeat Household Rate**
```sql
SELECT
  (COUNT(DISTINCT CASE WHEN booking_count >= 2 THEN user_id END) * 100.0 / COUNT(DISTINCT user_id))
FROM (
  SELECT
    properties->>'$user_id' AS user_id,
    COUNT(*) AS booking_count
  FROM events
  WHERE event = 'Booking Completed'
  GROUP BY user_id
) subquery
```

**Display:**
- **Layout:** 2x2 grid
- **Font Size:** Large (48px)
- **Comparison:** vs previous period (show +/- change)
- **Color:** Green for positive growth, red for decline

---

## Insight 7: Brief-to-Booking Conversion

**Type:** Funnel
**Position:** Bottom Center (Row 3, Col 4-6)

**Configuration:**
- **Step 1:** `Brief Submitted`
- **Step 2:** `Booking Created`
- **Step 3:** `Booking Completed`

**Time Window:** 14 days between steps

**Display Options:**
- **Title:** "Brief → Booking Conversion"
- **Layout:** Horizontal funnel
- **Show Drop-off:** Yes
- **Target Conversion:** 50% (Brief → Completed Booking)

---

## Insight 8: Revenue from Repeat Bookings

**Type:** Trends
**Position:** Bottom Right (Row 3, Col 7-9)

**Configuration:**
- **Event:** `Booking Completed`
- **Chart Type:** Stacked area graph
- **Interval:** Weekly
- **Date Range:** Last 12 weeks
- **Series 1:** First-time bookings (`isRepeatBooking = false`)
- **Series 2:** Repeat bookings (`isRepeatBooking = true`)
- **Formula:** Sum of `amount` property

**Display Options:**
- **Title:** "Revenue: New vs Repeat Households"
- **Y-Axis Label:** "Revenue (COP)"
- **Currency Format:** Yes
- **Show Legend:** Yes
- **Colors:**
  - First-time: Blue
  - Repeat: Green

---

## Dashboard Layout Preview

```
┌───────────────────────────────────────────────────────────────────────┐
│  PMF Core Metrics                                                     │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │
│  │ Briefs          │  │ Concierge       │  │ Bookings Completed   │  │
│  │ Submitted       │  │ Requests        │  │ (Weekly)             │  │
│  │ ────────        │  │ ▂▃▅▇█ (types)   │  │ ▃▅▇██▇▅             │  │
│  │ ↗ Growing       │  │ by Type         │  │ Goal: 100/week       │  │
│  └─────────────────┘  └─────────────────┘  └──────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────┐  ┌────────────────────────────────┐    │
│  │ Household Activation     │  │ 60-Day Rebooking Rate          │    │
│  │ Funnel                   │  │                                │    │
│  │ ┌─────┐ 100% Sign Up     │  │ Cohort  Day0  Day30  Day60    │    │
│  │ └──┬──┘                  │  │ Jan 1   100%   45%    28%  🟢  │    │
│  │    ↓ 40%                 │  │ Feb 1   100%   42%    25%  🟡  │    │
│  │ ┌──┴──┐ First Booking    │  │ Mar 1   100%   38%    22%  🔴  │    │
│  │ └──┬──┘                  │  │                                │    │
│  │    ↓ 30%                 │  │ Target: ≥25% rebook in 60 days │    │
│  │ ┌──┴──┐ Second Booking   │  │                                │    │
│  │ └─────┘                  │  │                                │    │
│  └──────────────────────────┘  └────────────────────────────────┘    │
│                                                                       │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────────┐  │
│  │ Scorecard    │  │ Brief→Booking     │  │ Revenue by Type      │  │
│  │              │  │ Conversion        │  │                      │  │
│  │ 350 Briefs   │  │ ┌─────┐ 100%      │  │ ████ Repeat (60%)    │  │
│  │  45 Concierge│  │ └──┬──┘           │  │ ▓▓▓▓ New (40%)       │  │
│  │ 180 Bookings │  │    ↓ 65%          │  │                      │  │
│  │  32% Repeat  │  │ ┌──┴──┐ 65%       │  │ Growing repeat $!    │  │
│  │              │  │ └──┬──┘           │  │                      │  │
│  │ ↗ All growing│  │    ↓ 50%          │  │                      │  │
│  │              │  │ ┌──┴──┐ 33% ⚠️     │  │                      │  │
│  │              │  │ └─────┘           │  │                      │  │
│  └──────────────┘  └───────────────────┘  └──────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Alert Configuration

Unlike Better Stack (for operational crons), PostHog alerts focus on **product health signals**.

### Alert 1: PMF Regression - Briefs Declining

**Trigger:**
```
Event: Brief Submitted
Condition: Count drops below 30% of 30-day average
Time Window: 7 days
```

**Actions:**
- **Slack:** #product-alerts
- **Email:** product-team@casaora.com

**Message:**
```
📉 PMF REGRESSION: Brief Submissions Declining

Current (7d avg): {{current_rate}} briefs/day
Expected (30d avg): {{expected_rate}} briefs/day
Drop: {{percentage_drop}}%

Possible Causes:
- Marketing campaign ended
- Seasonal demand shift
- Website traffic drop
- User experience issue

Action:
1. Check Google Analytics traffic
2. Review recent product changes
3. Check user feedback for UX issues

Dashboard: https://us.posthog.com/dashboard/pmf-core-metrics
```

---

### Alert 2: Repeat Booking Rate Below Target

**Trigger:**
```
Custom SQL Query:
SELECT
  (COUNT(DISTINCT CASE WHEN booking_count >= 2 THEN user_id END) * 100.0 / COUNT(DISTINCT user_id))
FROM (
  SELECT user_id, COUNT(*) AS booking_count
  FROM events
  WHERE event = 'Booking Completed'
    AND timestamp >= now() - INTERVAL 30 DAY
  GROUP BY user_id
) subquery

Condition: Result < 20% (below threshold)
Check Frequency: Weekly (Monday 9 AM)
```

**Actions:**
- **Slack:** #product-alerts
- **Email:** retention-team@casaora.com

**Message:**
```
⚠️ RETENTION ALERT: Repeat Booking Rate Below Target

Current: {{repeat_rate}}%
Target: 25%
Gap: {{target - repeat_rate}}%

This indicates:
- Users not returning after first booking
- Possible service quality issues
- Insufficient post-booking engagement

Action:
1. Review NPS scores from first-time users
2. Analyze churn survey responses
3. Launch re-engagement campaign
4. Improve follow-up email sequence

Dashboard: https://us.posthog.com/dashboard/pmf-core-metrics
```

---

### Alert 3: Concierge Requests Spike

**Trigger:**
```
Event: Concierge Request
Condition: Count exceeds 200% of 7-day average
Time Window: 1 day
```

**Rationale:** Spike in concierge requests may indicate UX confusion or product gap.

**Actions:**
- **Slack:** #product-alerts, #support
- **Email:** product-team@casaora.com

**Message:**
```
📈 CONCIERGE SPIKE DETECTED

Current (24h): {{current_count}} requests
Expected (7d avg): {{expected_count}} requests
Increase: {{percentage_increase}}%

Top Request Types:
{{top_request_types}}

This may indicate:
- Confusing UX preventing self-service
- Missing feature users need
- Technical issue blocking workflow
- Successful marketing campaign (good!)

Action:
1. Review recent concierge conversation themes
2. Check for common questions/issues
3. Identify self-service improvement opportunities
4. Consider feature development

Dashboard: https://us.posthog.com/dashboard/pmf-core-metrics
```

---

## Integration with Existing Code

### Step 1: Install Event Tracking

Add PMF tracking to these files:

**1. Brief Submission** ([src/app/api/briefs/submit/route.ts](../../src/app/api/briefs/submit/route.ts)):

```typescript
import { trackBriefSubmitted } from '@/lib/integrations/posthog';

export async function POST(request: Request) {
  const brief = await request.json();

  // ... validate and save brief ...

  // Track PMF metric
  trackBriefSubmitted({
    serviceType: brief.serviceType,
    location: brief.location,
    estimatedBudget: brief.budget,
    urgency: brief.urgency,
  });

  return NextResponse.json({ success: true });
}
```

**2. Concierge Requests** ([src/components/chat/amara-widget.tsx](../../src/components/chat/amara-widget.tsx)):

```typescript
import { trackConciergeRequest } from '@/lib/integrations/posthog';

export function AmaraWidget() {
  const handleConciergeRequest = (message: string) => {
    // Track PMF metric
    trackConciergeRequest({
      requestType: detectRequestType(message),
      fromPage: window.location.pathname,
      userMessage: message.substring(0, 100), // First 100 chars
    });

    // ... send to Amara API ...
  };

  return <ChatWidget onMessage={handleConciergeRequest} />;
}
```

**3. Booking Completion** ([src/app/api/bookings/[id]/complete/route.ts](../../src/app/api/bookings/[id]/complete/route.ts)):

```typescript
import { trackBookingCompleted } from '@/lib/integrations/posthog';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const bookingId = params.id;

  // ... complete booking in database ...

  // Get user's booking history for repeat detection
  const { data: userBookings } = await supabaseAdmin
    .from('bookings')
    .select('id, completed_at')
    .eq('user_id', booking.user_id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  const isRepeatBooking = userBookings && userBookings.length > 1;
  const daysSinceLastBooking = isRepeatBooking
    ? calculateDaysBetween(userBookings[1].completed_at, new Date())
    : undefined;

  // Track PMF metric
  trackBookingCompleted({
    bookingId: booking.id,
    professionalId: booking.professional_id,
    serviceType: booking.service_name,
    amount: booking.amount_captured,
    currency: booking.currency,
    isRepeatBooking,
    daysSinceLastBooking,
  });

  // ... rest of completion logic ...
}
```

**4. User Identification** ([src/app/api/auth/callback/route.ts](../../src/app/api/auth/callback/route.ts)):

```typescript
import { identifyUserForPMF } from '@/lib/integrations/posthog';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

export async function GET(request: Request) {
  // ... handle auth callback ...

  // Get user's booking stats
  const { data: bookingStats } = await supabaseAdmin
    .from('bookings')
    .select('id, amount_captured, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed');

  const totalBookings = bookingStats?.length || 0;
  const lifetimeValue = bookingStats?.reduce((sum, b) => sum + (b.amount_captured || 0), 0) || 0;
  const firstBookingDate = bookingStats?.[0]?.completed_at;

  // Identify user for PMF tracking
  identifyUserForPMF(user.id, {
    email: user.email,
    totalBookings,
    lifetimeValue,
    firstBookingDate,
  });

  // ... continue auth flow ...
}
```

---

### Step 2: Verify Event Tracking

**Test in Development:**

```bash
# 1. Start dev server
bun dev

# 2. Open PostHog Live Events in browser
open "https://us.posthog.com/project/YOUR_PROJECT_ID/events"

# 3. Trigger events:
# - Submit a brief on /services
# - Click "Chat with Amara" and send message
# - Complete a test booking

# 4. Verify events appear in Live Events stream within 30 seconds
```

**Production Verification:**

```sql
-- Check PostHog events via API
curl "https://us.posthog.com/api/projects/YOUR_PROJECT_ID/events/" \
  -H "Authorization: Bearer YOUR_PERSONAL_API_KEY" \
  | jq '.results[] | select(.event | contains("Brief Submitted") or contains("Concierge Request") or contains("Booking Completed"))'
```

---

## Dashboard Maintenance

### Weekly Review (Every Monday)

1. **Review Metric Trends:**
   - Check if briefs, concierge, bookings are growing
   - Identify any week-over-week declines
   - Compare to previous months

2. **Cohort Analysis:**
   - Review 60-day rebooking rate by cohort
   - Identify highest-performing cohorts (acquisition source, service type, etc.)
   - Apply learnings to marketing/product

3. **Alert Tuning:**
   - Check if any false positives fired
   - Adjust thresholds if needed
   - Add new alerts for emerging patterns

### Monthly Deep Dive (First Monday of Month)

1. **Segmentation Analysis:**
   ```sql
   -- Repeat rate by service type
   SELECT
     properties->>'serviceType' AS service_type,
     COUNT(DISTINCT user_id) AS total_users,
     COUNT(DISTINCT CASE WHEN booking_count >= 2 THEN user_id END) AS repeat_users,
     (COUNT(DISTINCT CASE WHEN booking_count >= 2 THEN user_id END) * 100.0 / COUNT(DISTINCT user_id)) AS repeat_rate
   FROM (
     SELECT
       properties->>'$user_id' AS user_id,
       properties->>'serviceType' AS service_type,
       COUNT(*) AS booking_count
     FROM events
     WHERE event = 'Booking Completed'
     GROUP BY user_id, service_type
   ) subquery
   GROUP BY service_type
   ORDER BY repeat_rate DESC
   ```

2. **Cohort Retention Curves:**
   - Plot retention curves for each monthly cohort
   - Identify inflection points (when drop-off stabilizes)
   - Compare to industry benchmarks (typical: 20-40% 60-day retention for marketplaces)

3. **PMF Score Calculation:**
   ```
   PMF Score = (Repeat Booking Rate × 100) + (60-Day Rebooking Rate × 100) + (Brief→Booking Conversion × 50)

   Example:
   - Repeat Rate: 32% → 32 points
   - 60-Day Rebook: 25% → 25 points
   - Brief→Booking: 50% → 25 points
   Total PMF Score: 82/150 (55%)

   Target: ≥ 90/150 (60%) indicates strong PMF
   ```

---

## Related Documentation

- [Operational Runbooks](./runbooks.md) - Debugging procedures
- [Cron Health Dashboard](./cron-health-dashboard.md) - Operational metrics (D-1)
- [PostHog Integration](../lib/integrations/posthog/README.md) - Event tracking setup
- [PostHog Implementation Guide](../lib/integrations/posthog/IMPLEMENTATION_GUIDE.md) - Detailed tracking examples

---

**Document History:**

- **2025-01-14:** Initial version - PMF Core Metrics dashboard configuration for Epic D-2
