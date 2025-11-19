# Amara V2 PostHog Dashboard Setup Guide

This guide explains how to set up a comprehensive PostHog dashboard to monitor Amara V2 (Generative UI) performance and user engagement.

## Overview

The Amara V2 dashboard tracks:
- Feature adoption (V2 vs V1 usage)
- Conversation engagement metrics
- Component interaction analytics
- Booking funnel conversion rates
- User experience quality indicators

## Prerequisites

- PostHog account with access to the Casaora project
- Feature flag `enable-amara-v2` enabled for target users
- Analytics events implemented (see [src/lib/analytics/amara-events.ts](../src/lib/analytics/amara-events.ts))

## Analytics Events Reference

### Adoption Metrics

#### `amara_v2_enabled`
**Description:** Tracks when a user loads Amara with V2 enabled
**Properties:**
- `user_id` - User who enabled V2
- `timestamp` - When V2 was loaded

**Dashboard Use:**
- Total V2 users
- V2 adoption rate over time
- Active V2 users (DAU/WAU/MAU)

---

### Conversation Metrics

#### `amara_conversation_started`
**Description:** Tracks when a new conversation begins
**Properties:**
- `conversation_id` - Unique conversation identifier
- `version` - "v1" or "v2"
- `trigger` - How conversation started (e.g., "welcome", "user_message")

**Dashboard Use:**
- Total conversations by version
- Conversation start rate by version
- Most common triggers

---

#### `amara_message_sent`
**Description:** Tracks when a user sends a message
**Properties:**
- `conversation_id` - Conversation identifier
- `message_count` - Number of messages in conversation so far
- `version` - "v1" or "v2"

**Dashboard Use:**
- Messages per conversation (avg, median, p95)
- Message volume by version
- User engagement depth

---

### Component Rendering Metrics

#### `amara_component_rendered`
**Description:** Tracks when a Generative UI component is rendered in chat
**Properties:**
- `component_type` - Type of component ("professional_list", "availability_selector", "booking_summary")
- `conversation_id` - Conversation identifier
- Additional component-specific properties

**Component Types:**

**professional_list:**
- `search_params` - Search criteria used
- `professionals_count` - Number of professionals displayed
- `total_found` - Total professionals matching criteria

**availability_selector:**
- `professional_id` - Professional whose availability is shown
- `date_range` - Date range displayed
- `available_slots` - Number of available time slots

**booking_summary:**
- `professional_id` - Professional being booked
- `service_name` - Service type
- `scheduled_start` - Booking start time
- `duration_hours` - Service duration
- `estimated_cost` - Estimated price (in COP)

**Dashboard Use:**
- Component render frequency
- Funnel progression (search → availability → booking)
- Component performance by type

---

### Component Interaction Metrics

#### `amara_component_clicked`
**Description:** Tracks user interactions with Generative UI components
**Properties:**
- `component_type` - Component being interacted with
- `action` - Specific action taken
- `conversation_id` - Conversation identifier
- Additional action-specific properties

**Component Actions:**

**professional_list:**
- `book_now` - User clicked "Book Now" button
  - `professional_id`
  - `professional_name`

**availability_selector:**
- `select_date` - User selected a date
  - `professional_id`
  - `selected_date`
- `select_time` - User selected a time slot
  - `professional_id`
  - `selected_date`
  - `selected_time`
- `confirm_booking` - User clicked booking confirmation
  - `professional_id`
  - `professional_name`
  - `selected_date`
  - `selected_time`
  - `instant_booking` - Boolean

**booking_summary:**
- `confirm_booking` - Final booking confirmation
  - `professional_id`
  - `professional_name`
  - `service_type`
  - `selected_date`
  - `selected_time`
  - `estimated_price`
  - `instant_booking`
- `cancel_booking` - User cancelled booking
  - `professional_id`

**Dashboard Use:**
- Click-through rates by component
- User engagement with specific actions
- Booking funnel conversion rates
- Drop-off points in booking flow

---

## Dashboard Setup Instructions

### 1. Create New Dashboard

1. Navigate to **PostHog → Dashboards**
2. Click **"New Dashboard"**
3. Name: **"Amara V2 - Generative UI Analytics"**
4. Description: **"Comprehensive analytics for Amara V2 Generative UI performance and user engagement"**

### 2. Add Insights (Charts)

#### Section 1: Adoption & Usage

**Chart 1: V2 Adoption Rate**
- **Type:** Trend
- **Event:** `amara_v2_enabled`
- **Aggregation:** Unique users
- **Time range:** Last 30 days
- **Visualization:** Line chart
- **Goal:** Track V2 user growth

**Chart 2: V1 vs V2 Conversations**
- **Type:** Trend
- **Event:** `amara_conversation_started`
- **Aggregation:** Total count
- **Breakdown:** By `version` property
- **Visualization:** Stacked bar chart
- **Goal:** Compare V1 and V2 usage

**Chart 3: Active V2 Users (DAU)**
- **Type:** Trend
- **Event:** `amara_message_sent`
- **Filters:** Where `version = v2`
- **Aggregation:** Unique users per day
- **Visualization:** Line chart
- **Goal:** Track daily active V2 users

---

#### Section 2: Conversation Engagement

**Chart 4: Messages per Conversation**
- **Type:** Insight
- **Event:** `amara_message_sent`
- **Aggregation:** Average `message_count`
- **Breakdown:** By `version`
- **Visualization:** Bar chart
- **Goal:** Compare conversation depth V1 vs V2

**Chart 5: Conversation Start Triggers**
- **Type:** Funnel
- **Events:**
  1. `amara_v2_enabled`
  2. `amara_conversation_started`
- **Breakdown:** By `trigger` property
- **Goal:** Understand how users start conversations

---

#### Section 3: Component Rendering (Funnel)

**Chart 6: Booking Funnel - Component Renders**
- **Type:** Funnel
- **Events:**
  1. `amara_component_rendered` (where `component_type = professional_list`)
  2. `amara_component_rendered` (where `component_type = availability_selector`)
  3. `amara_component_rendered` (where `component_type = booking_summary`)
- **Aggregation:** Unique users
- **Time window:** 30 minutes
- **Goal:** Visualize drop-off in booking flow

**Chart 7: Component Render Frequency**
- **Type:** Trend
- **Event:** `amara_component_rendered`
- **Aggregation:** Total count
- **Breakdown:** By `component_type`
- **Visualization:** Stacked area chart
- **Goal:** Track component usage over time

---

#### Section 4: User Interactions

**Chart 8: Booking Funnel - User Actions**
- **Type:** Funnel
- **Events:**
  1. `amara_component_clicked` (where `component_type = professional_list AND action = book_now`)
  2. `amara_component_clicked` (where `component_type = availability_selector AND action = select_date`)
  3. `amara_component_clicked` (where `component_type = availability_selector AND action = select_time`)
  4. `amara_component_clicked` (where `component_type = availability_selector AND action = confirm_booking`)
  5. `amara_component_clicked` (where `component_type = booking_summary AND action = confirm_booking`)
- **Time window:** 1 hour
- **Goal:** Measure conversion through interactive booking flow

**Chart 9: Click-Through Rates by Component**
- **Type:** Insight
- **Formula:**
  - `(amara_component_clicked count) / (amara_component_rendered count) * 100`
- **Breakdown:** By `component_type`
- **Visualization:** Bar chart
- **Goal:** Measure engagement rate per component

**Chart 10: Booking Cancellation Rate**
- **Type:** Insight
- **Events:**
  - Numerator: `amara_component_clicked` (where `action = cancel_booking`)
  - Denominator: `amara_component_rendered` (where `component_type = booking_summary`)
- **Formula:** `(cancellations / booking_summaries) * 100`
- **Goal:** Track booking abandonment

---

#### Section 5: Search & Discovery

**Chart 11: Top Search Parameters**
- **Type:** Insight
- **Event:** `amara_component_rendered`
- **Filters:** Where `component_type = professional_list`
- **Breakdown:** By `search_params.city` or `search_params.serviceType`
- **Aggregation:** Total count
- **Visualization:** Horizontal bar chart
- **Goal:** Understand what users are searching for

**Chart 12: Professionals Found per Search**
- **Type:** Insight
- **Event:** `amara_component_rendered`
- **Filters:** Where `component_type = professional_list`
- **Aggregation:** Average `professionals_count`
- **Visualization:** Number (single value)
- **Goal:** Track search result quality

---

#### Section 6: Availability & Booking

**Chart 13: Instant Booking Rate**
- **Type:** Insight
- **Event:** `amara_component_clicked`
- **Filters:** Where `action = confirm_booking`
- **Breakdown:** By `instant_booking` property
- **Visualization:** Pie chart
- **Goal:** Track instant booking adoption

**Chart 14: Average Time Slots Available**
- **Type:** Insight
- **Event:** `amara_component_rendered`
- **Filters:** Where `component_type = availability_selector`
- **Aggregation:** Average `available_slots`
- **Visualization:** Number (single value)
- **Goal:** Monitor professional availability

---

#### Section 7: Revenue Indicators

**Chart 15: Estimated Booking Value**
- **Type:** Trend
- **Event:** `amara_component_rendered`
- **Filters:** Where `component_type = booking_summary`
- **Aggregation:** Sum of `estimated_cost`
- **Visualization:** Line chart
- **Goal:** Track potential revenue from V2 bookings

**Chart 16: Average Booking Value**
- **Type:** Insight
- **Event:** `amara_component_rendered`
- **Filters:** Where `component_type = booking_summary`
- **Aggregation:** Average `estimated_cost`
- **Visualization:** Number (single value)
- **Goal:** Monitor average booking size

---

### 3. Dashboard Organization

Organize charts into sections using **Text Cards**:

```
┌─────────────────────────────────────────┐
│ 📊 Amara V2 - Generative UI Analytics   │
├─────────────────────────────────────────┤
│ 🚀 Adoption & Usage                     │
│ - V2 Adoption Rate                      │
│ - V1 vs V2 Conversations                │
│ - Active V2 Users (DAU)                 │
├─────────────────────────────────────────┤
│ 💬 Conversation Engagement              │
│ - Messages per Conversation             │
│ - Conversation Start Triggers           │
├─────────────────────────────────────────┤
│ 🎨 Component Rendering (Funnel)         │
│ - Booking Funnel - Component Renders    │
│ - Component Render Frequency            │
├─────────────────────────────────────────┤
│ 🖱️ User Interactions                   │
│ - Booking Funnel - User Actions         │
│ - Click-Through Rates by Component      │
│ - Booking Cancellation Rate             │
├─────────────────────────────────────────┤
│ 🔍 Search & Discovery                   │
│ - Top Search Parameters                 │
│ - Professionals Found per Search        │
├─────────────────────────────────────────┤
│ 📅 Availability & Booking               │
│ - Instant Booking Rate                  │
│ - Average Time Slots Available          │
├─────────────────────────────────────────┤
│ 💰 Revenue Indicators                   │
│ - Estimated Booking Value               │
│ - Average Booking Value                 │
└─────────────────────────────────────────┘
```

### 4. Dashboard Filters

Add global filters to enable flexible analysis:

1. **Date Range:** Last 7/30/90 days (default: Last 30 days)
2. **Version:** V1, V2, or All (default: V2 only)
3. **User Properties:**
   - `$initial_locale` - Filter by user locale
   - `$initial_city` - Filter by user location

### 5. Set Up Alerts

Create alerts for critical metrics:

**Alert 1: V2 Adoption Declining**
- **Metric:** Daily `amara_v2_enabled` unique users
- **Condition:** Decreases by > 20% week-over-week
- **Notification:** Slack #amara-alerts channel

**Alert 2: High Booking Abandonment**
- **Metric:** Booking Cancellation Rate (Chart 10)
- **Condition:** > 30% for 3 consecutive days
- **Notification:** Email product team

**Alert 3: Low Component CTR**
- **Metric:** Click-Through Rate (Chart 9)
- **Condition:** < 10% for any component type
- **Notification:** Slack #amara-alerts channel

---

## Key Performance Indicators (KPIs)

### Success Metrics

1. **V2 Adoption Rate:** % of Amara users on V2 vs V1
   - **Target:** > 80% within 3 months
   - **Chart:** #1

2. **Booking Funnel Conversion Rate:** % of searches that result in booking confirmation
   - **Target:** > 15% conversion from search to booking
   - **Chart:** #8

3. **Messages per Conversation:** Avg number of messages per V2 conversation
   - **Target:** 5-10 messages (indicates engaged conversation)
   - **Chart:** #4

4. **Component CTR:** % of component renders that result in user interaction
   - **Target:** > 25% CTR across all components
   - **Chart:** #9

### Health Metrics

1. **Booking Cancellation Rate:** % of booking summaries that get cancelled
   - **Healthy Range:** < 20%
   - **Chart:** #10

2. **Average Booking Value:** Mean estimated cost per booking
   - **Trend:** Should remain stable or increase
   - **Chart:** #16

3. **Availability Slots:** Average time slots available per professional
   - **Healthy Range:** > 10 slots per week
   - **Chart:** #14

---

## Dashboard Usage Guide

### Daily Monitoring

Check these charts every day:
- **Chart 3:** Active V2 Users (DAU) - Track daily engagement
- **Chart 8:** Booking Funnel - User Actions - Monitor conversion
- **Chart 10:** Booking Cancellation Rate - Watch for spikes

### Weekly Reviews

Analyze these metrics weekly:
- **Chart 1:** V2 Adoption Rate - Track feature rollout
- **Chart 4:** Messages per Conversation - Measure engagement quality
- **Chart 11:** Top Search Parameters - Understand user needs
- **Chart 15:** Estimated Booking Value - Monitor revenue potential

### Monthly Deep Dives

Comprehensive monthly analysis:
- All charts reviewed
- Trends identified
- Anomalies investigated
- A/B test results analyzed
- Product improvements prioritized

---

## Troubleshooting

### No Data Showing

**Problem:** Dashboard charts are empty
**Solutions:**
1. Verify PostHog feature flag `enable-amara-v2` is enabled for test users
2. Check that analytics events are being captured (PostHog → Live Events)
3. Ensure date range covers period when V2 was active
4. Verify event filters are correct (e.g., `component_type` spelling)

### Inconsistent Event Counts

**Problem:** Event counts don't match expectations
**Solutions:**
1. Check for duplicate events (deduplicate by `conversation_id` or `timestamp`)
2. Verify event properties are being sent correctly
3. Check for client-side errors blocking event capture
4. Review code in [src/lib/analytics/amara-events.ts](../src/lib/analytics/amara-events.ts)

### Low Conversion Rates

**Problem:** Booking funnel conversion is below target
**Investigation:**
1. Check Chart 6 for specific drop-off points
2. Review Chart 10 for high cancellation rates
3. Analyze Chart 11 for search quality issues
4. Check Chart 14 for low availability
5. Review user recordings in PostHog to identify UX issues

---

## Next Steps

After dashboard setup:

1. **Baseline Metrics:** Collect 2 weeks of data before making changes
2. **Set Goals:** Establish targets for each KPI
3. **A/B Testing:** Use PostHog experiments to test improvements
4. **Continuous Improvement:** Review metrics weekly and iterate
5. **User Feedback:** Combine quantitative dashboard data with qualitative user interviews

---

## Related Documentation

- [Amara Analytics Events](../src/lib/analytics/amara-events.ts) - Event tracking implementation
- [Amara V2 Implementation Plan](./amara-v2-implementation.md) - Feature development roadmap
- [PostHog Documentation](https://posthog.com/docs) - PostHog product documentation

---

**Last Updated:** 2025-01-19
**Dashboard Version:** 1.0.0
**Owner:** Product Analytics Team
