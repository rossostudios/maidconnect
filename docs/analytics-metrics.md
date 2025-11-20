# Analytics Metrics & Funnels

Comprehensive guide to Casaora's product analytics, key metrics, and PostHog dashboard configuration.

**Last Updated:** 2025-11-20 (Phase 1 Implementation)

---

## Overview

Casaora tracks user behavior across a multi-country LatAm marketplace (CO, PY, UY, AR) using PostHog for product analytics. All events **MUST** include `country_code` and `role` properties for market-specific analysis.

**Core Purpose:**
- Measure conversion rates by market (CO vs PY vs UY vs AR)
- Track professional trust features (intro videos, concierge)
- Optimize booking funnel drop-off points
- Identify which markets need product improvements

---

## Required Event Properties (CRITICAL)

**Every PostHog event MUST include:**

```typescript
{
  country_code: 'CO' | 'PY' | 'UY' | 'AR',  // REQUIRED
  role: 'customer' | 'professional' | 'admin',  // REQUIRED
  currency?: 'COP' | 'PYG' | 'UYU' | 'ARS',  // For transactions
  city_id?: string,  // Optional granular location
  locale?: 'es' | 'en',  // Optional language preference
}
```

**Why This Matters:**
- **Market Segmentation** - Compare CO (Stripe) vs PY/UY/AR (PayPal) conversion rates
- **Currency Attribution** - Track revenue by local currency for P&L accuracy
- **Role-Based Funnels** - Separate customer vs professional behavior patterns
- **Feature Flags** - Enable/disable features by country (e.g., direct hire in CO only)

---

## Core Funnels

### 1. Customer Acquisition Funnel

**Goal:** Measure how effectively we convert landing page visitors into registered customers.

**Steps:**
1. **Viewed Landing Page** - Initial page load
2. **Clicked CTA** - Primary or secondary CTA interaction
3. **Started Signup** - Email/password form displayed
4. **Completed Signup** - Email verification sent

**Key Metrics:**
- Landing → Signup conversion rate (target: 15%)
- CTA click rate (target: 25%)
- Signup completion rate (target: 60%)

**PostHog Query:**
```
Funnel:
  Viewed Landing Page (funnelEvents.viewedLanding)
  → Clicked CTA (funnelEvents.clickedCTA)
  → Started Signup (funnelEvents.startedSignup)
  → Completed Signup (funnelEvents.completedSignup)

Breakdown: country_code, role
```

**Market Analysis:**
- CO (Stripe): Higher conversion expected (established market)
- PY/UY/AR (PayPal): Lower conversion initially (new markets)

---

### 2. Booking Conversion Funnel

**Goal:** Measure how effectively we convert registered customers into paying customers.

**Steps:**
1. **Search Performed** - Customer searches for professionals
2. **Professional Viewed** - Customer views profile
3. **Booking Started** - Customer begins booking flow
4. **Booking Completed** - Payment processed, booking confirmed

**Key Metrics:**
- Search → Booking started conversion (target: 20%)
- Booking started → Completed conversion (target: 70%)
- Overall search → Booking conversion (target: 14%)
- Average booking value by market

**PostHog Query:**
```
Funnel:
  Search Performed (searchEvents.performed)
  → Professional Viewed (professionalEvents.viewed)
  → Booking Started (bookingEvents.started)
  → Booking Completed (bookingEvents.completed)

Breakdown: country_code, service_type
```

**Drop-off Analysis:**
- Search → Profile: Low match quality or poor search results
- Profile → Booking: Trust issues (opportunity for intro videos!)
- Booking → Payment: Price concerns or payment friction

---

### 3. Professional Trust Funnel (Phase 1.2)

**Goal:** Measure how intro videos improve customer trust and booking conversion.

**Steps:**
1. **Video Uploaded** - Professional records 60-second intro
2. **Video Approved** - Admin reviews and approves
3. **Video Viewed** - Customer watches video on profile
4. **Booking Started** - Customer initiates booking after watching

**Key Metrics:**
- Video approval rate (target: 85%)
- Average review time (target: <24 hours)
- Video view → Booking conversion uplift (hypothesis: +30%)
- % of professionals with approved videos (target: 60% by Q2)

**PostHog Query:**
```
Funnel:
  Video Uploaded (videoEvents.uploaded)
  → Video Approved (videoEvents.approved)
  → Video Viewed (videoEvents.viewed)
  → Booking Started (bookingEvents.started)

Breakdown: country_code, service_type
```

**A/B Test Hypothesis:**
- Professionals WITH video → 25% conversion rate
- Professionals WITHOUT video → 15% conversion rate
- **Expected Lift:** +67% (10 percentage points)

---

### 4. Concierge Direct Hire Funnel (Phase 1.4)

**Goal:** Measure high-touch direct hire placement service (higher revenue, human-powered).

**Steps:**
1. **Chat Started** - Customer contacts concierge team
2. **Direct Hire Requested** - Customer requests placement service
3. **Placement Completed** - Concierge matches professional

**Key Metrics:**
- Chat → Request conversion (target: 40%)
- Request → Placement conversion (target: 70%)
- Average time to placement (target: <7 days)
- Concierge fee revenue per placement (CO only: $200-500 USD)

**PostHog Query:**
```
Funnel:
  Concierge Chat Started (conciergeEvents.chatStarted)
  → Concierge Direct Hire Requested (conciergeEvents.directHireRequested)
  → Concierge Placement Completed (conciergeEvents.placementCompleted)

Breakdown: country_code, urgency
```

**Market Availability:**
- **CO (Colombia):** Full concierge service enabled (Stripe + higher fees)
- **PY/UY/AR:** Chat only, direct hire coming Q2 2025

---

## Key Business Metrics

### Revenue Metrics (by Market)

**1. Gross Merchandise Value (GMV)**
- Definition: Total booking value processed (sum of `Booking Completed.amount`)
- Breakdown: By country_code and currency
- Target Growth: 15% MoM (CO), 30% MoM (PY/UY/AR - new markets)

**2. Average Booking Value (ABV)**
- Definition: Mean booking amount per completed booking
- Breakdown: By country_code, service_type
- Benchmarks:
  - CO: ~$80,000 COP (~$20 USD) per session
  - PY: ~150,000 PYG (~$20 USD) per session
  - UY: ~800 UYU (~$20 USD) per session
  - AR: ~20,000 ARS (~$20 USD) per session

**3. Revenue per Paying Customer (RPPC)**
- Definition: Total GMV / Unique paying customers
- Breakdown: By country_code
- Target: 2.5 bookings per customer in first 90 days

**4. Concierge Fee Revenue (CO only)**
- Definition: Sum of `conciergeFeeCents` from `Concierge Placement Completed`
- Target: 5-10% of total GMV (high-margin service)
- Benchmark: $200-500 USD per direct hire placement

---

### Customer Acquisition Metrics

**1. Customer Acquisition Cost (CAC)**
- Definition: Total marketing spend / New signups (by country_code)
- Breakdown: By country_code, signup_method
- Target: <$15 USD per customer (all markets)

**2. Time to First Booking**
- Definition: Time between `Completed Signup` and first `Booking Completed`
- Breakdown: By country_code
- Target: <48 hours (immediate need product)

**3. Signup Conversion Rate**
- Definition: `Completed Signup` / `Viewed Landing Page`
- Breakdown: By country_code, source (organic, paid, referral)
- Target: 15% overall, 20% for paid traffic

---

### Product Engagement Metrics

**1. Search Effectiveness**
- Definition: `Search Result Clicked` / `Search Performed`
- Breakdown: By country_code, service_type
- Target: 70% (strong matching algorithm)

**2. Professional Profile Views**
- Definition: Count of `Professional Viewed` events
- Breakdown: By country_code, has_intro_video
- Hypothesis: Profiles with video get 2x more views

**3. Video View Rate**
- Definition: `Video Viewed` / `Professional Viewed` (where video exists)
- Breakdown: By country_code, video_status
- Target: 60% (customers watch intro videos)

**4. Booking Completion Rate**
- Definition: `Booking Completed` / `Booking Started`
- Breakdown: By country_code, payment_processor
- Target: 70% (low payment friction)

---

### Trust & Quality Metrics

**1. Video Approval Rate**
- Definition: `Video Approved` / (`Video Approved` + `Video Rejected`)
- Breakdown: By country_code
- Target: 85% (clear guidelines, quality coaching)

**2. Video Review Time**
- Definition: Median `reviewTimeMinutes` from `Video Approved`/`Video Rejected`
- Target: <24 hours (fast feedback loop for professionals)

**3. Professional Reassignment Rate**
- Definition: `Concierge Professional Reassigned` / `Booking Completed`
- Breakdown: By country_code
- Target: <5% (quality matching + vetting)

**4. Booking Cancellation Rate**
- Definition: `Booking Cancelled` / `Booking Completed`
- Breakdown: By country_code, cancelled_by (customer vs professional)
- Target: <10% (reliable service)

---

## PostHog Dashboard Setup

### Dashboard 1: Market Overview (Executive KPIs)

**Widgets:**
1. GMV by Country (Trend) - Last 30 days
2. New Signups by Country (Trend) - Last 30 days
3. Booking Completion Rate by Country (Number)
4. Average Booking Value by Country (Table)
5. CAC by Country (Table)

**Filters:**
- Date Range: Last 30 days vs Previous 30 days
- Breakdown: country_code

**Purpose:** High-level market health, compare CO vs PY/UY/AR performance.

---

### Dashboard 2: Booking Funnel Analysis

**Widgets:**
1. Customer Acquisition Funnel (Funnel Chart)
   - Viewed Landing → CTA → Signup → Completed
2. Booking Conversion Funnel (Funnel Chart)
   - Search → Profile → Booking → Completed
3. Funnel Drop-off Points (Bar Chart)
   - Show % drop at each step
4. Time Between Steps (Trend)
   - Median time from Search → Booking
5. Booking Value Distribution (Histogram)
   - By country_code

**Filters:**
- Date Range: Last 7 days
- Breakdown: country_code, service_type
- Compare: Previous period

**Purpose:** Identify conversion bottlenecks, optimize for highest-impact improvements.

---

### Dashboard 3: Professional Trust Features (Phase 1.2)

**Widgets:**
1. Video Funnel (Funnel Chart)
   - Uploaded → Approved → Viewed → Booking
2. Video Approval Rate (Number + Trend)
   - % approved over time
3. Video Review Time (Number)
   - Median hours to review
4. Conversion Uplift: Video vs No Video (Comparison)
   - Booking rate for profiles with/without video
5. % Professionals with Approved Videos (Trend)
   - Track adoption over time

**Filters:**
- Date Range: Last 30 days
- Breakdown: country_code, service_type

**Purpose:** Measure trust feature impact, optimize video review SLA.

---

### Dashboard 4: Concierge Performance (Phase 1.4)

**Widgets:**
1. Concierge Funnel (Funnel Chart)
   - Chat → Request → Placement
2. Time to Placement (Number)
   - Median days from request to completion
3. Concierge Fee Revenue (Trend)
   - Total and by urgency level
4. Professional Reassignment Rate (Number)
   - % of bookings requiring intervention
5. Chat Topics Distribution (Pie Chart)
   - Most common customer questions

**Filters:**
- Date Range: Last 30 days
- Breakdown: country_code (CO only initially), urgency

**Purpose:** Measure human-powered service quality, optimize concierge team size.

---

## Implementation Checklist

**Phase 1.1 - Documentation (DONE)**
- [x] Update CLAUDE.md with multi-country context
- [x] Expand architecture.md with market definitions
- [x] Add country_code requirements to PostHog IMPLEMENTATION_GUIDE.md

**Phase 1.2 - Database & Permissions (DONE)**
- [x] Create intro_video_* fields migration
- [x] Create intro-videos storage bucket with RLS
- [x] Add middleware for camera/mic permissions

**Phase 1.4 - Analytics (DONE)**
- [x] Add RequiredEventProperties interface to posthog/utils.ts
- [x] Update existing events (booking, search, professional, funnel)
- [x] Add videoEvents category
- [x] Add conciergeEvents category
- [x] Export new event modules from posthog/index.ts
- [x] Create analytics-metrics.md documentation

**Phase 1.5 - Testing & Deployment (NEXT)**
- [ ] Test migrations locally: `supabase db reset`
- [ ] Run build check: `bun run build`
- [ ] Verify TypeScript types with `bun run check`
- [ ] Create PostHog dashboards for each funnel
- [ ] Document example queries for each metric

---

## Usage Examples

### Basic Event Tracking

```typescript
import { bookingEvents, videoEvents, conciergeEvents } from '@/lib/integrations/posthog';
import { useUser } from '@/hooks/useUser';

// Get user context (client-side)
const { user } = useUser();
const eventContext = {
  country_code: user?.country_code || 'CO',
  role: user?.role || 'customer',
  city_id: user?.city_id,
};

// Track booking started
bookingEvents.started({
  ...eventContext,
  service: 'nanny',
  city: 'bogota',
});

// Track video uploaded
videoEvents.uploaded({
  ...eventContext,
  professionalId: user.id,
  durationSeconds: 58,
  fileSizeMb: 45,
});

// Track concierge chat
conciergeEvents.chatStarted({
  ...eventContext,
  source: 'booking_flow',
  topic: 'direct_hire_inquiry',
});
```

### Server-Side Event Tracking

```typescript
import { getServerUser } from '@/lib/shared/auth/session';
import { trackServerEvent } from '@/lib/integrations/posthog/server';

// Get user context (server-side)
const user = await getServerUser();
const eventContext = {
  country_code: user.country_code || 'CO',
  role: user.role || 'customer',
  currency: getCurrencyByCountry(user.country_code),
};

// Track booking completed (with revenue)
await trackServerEvent(user.id, 'Booking Completed', {
  ...eventContext,
  bookingId: booking.id,
  amount: booking.amount,
  service: booking.service_type,
});
```

---

## Analytics Best Practices

### 1. Always Include Required Properties
```typescript
// ❌ BAD - Missing required properties
bookingEvents.started({ service: 'nanny' });

// ✅ GOOD - Includes country_code and role
bookingEvents.started({
  country_code: 'CO',
  role: 'customer',
  service: 'nanny',
});
```

### 2. Use Currency for Transaction Events
```typescript
// ✅ GOOD - Include currency for revenue events
bookingEvents.completed({
  country_code: 'CO',
  role: 'customer',
  currency: 'COP',  // CRITICAL for P&L accuracy
  bookingId: booking.id,
  amount: 80000,  // Amount in cents
  service: 'nanny',
});
```

### 3. Track Drop-off Points
```typescript
// Track each step of the funnel
searchEvents.performed({ ...eventContext, query, resultCount });
professionalEvents.viewed({ ...eventContext, professionalId, source: 'search' });
bookingEvents.started({ ...eventContext, service, city });

// Missing step = Drop-off point to investigate!
```

### 4. Use Consistent Service Types
```typescript
// ✅ GOOD - Standardized service types
const SERVICE_TYPES = ['nanny', 'housekeeper', 'cook', 'driver', 'caregiver'];
bookingEvents.started({
  ...eventContext,
  service: 'nanny',  // From SERVICE_TYPES constant
});

// ❌ BAD - Inconsistent naming
bookingEvents.started({
  ...eventContext,
  service: 'Nanny (Part-Time)',  // Won't aggregate properly
});
```

---

## Next Steps

**Phase 2 (Days 31-60):**
- Add A/B test tracking for video vs no-video conversion
- Create automated alerts for funnel drop-offs >15%
- Build cohort retention dashboards by signup month
- Add LTV prediction model based on first 30-day behavior

**Phase 3 (Days 61-90):**
- Implement revenue attribution by marketing channel
- Create professional-side analytics (earnings, bookings)
- Build concierge team performance dashboards
- Add predictive models for churn risk

---

**See Also:**
- [PostHog Implementation Guide](../src/lib/integrations/posthog/IMPLEMENTATION_GUIDE.md) - Detailed tracking instructions
- [Architecture Guide](./architecture.md) - Multi-country technical architecture
- [CLAUDE.md](../CLAUDE.md) - AI development guide with PostHog patterns
