# Match Wizard Funnel - PostHog Setup Guide

**Epic G-3: Gate Match Wizard Rollout with Feature Flags**
**Status:** ✅ Code Complete - PostHog Configuration Pending
**Date:** 2025-01-14

## Overview

The Match Wizard is a guided experience that helps users find the perfect household professional by answering a series of questions. This document outlines how to set up the PostHog funnel to track adoption, completion rates, and conversions.

## Feature Flag Setup

### Step 1: Create Feature Flag in PostHog

1. Go to PostHog → Feature Flags → New Feature Flag
2. Configuration:
   ```
   Key: match_wizard_enabled
   Type: Boolean
   Description: Enable guided wizard for finding professionals
   Rollout: Start at 0%, gradually increase to 100%
   ```

### Rollout Strategy

**Phase 1: Internal Testing (0-5%)**
- Target: Internal team members only
- Duration: 1 week
- Goal: Identify bugs and UX issues

**Phase 2: Beta Users (5-25%)**
- Target: Power users and early adopters
- Duration: 2 weeks
- Goal: Validate user experience and gather feedback

**Phase 3: Gradual Rollout (25-50-75-100%)**
- Increase by 25% every week
- Duration: 4 weeks
- Goal: Monitor performance and conversion metrics

## Funnel Configuration

### Match Wizard Conversion Funnel

**Funnel Name:** Match Wizard - Completion & Conversion

**Steps:**

1. **Match Wizard Started**
   - Event: `Match Wizard Started`
   - Filter: None (tracks all starts)
   - Purpose: Entry point into the wizard

2. **Location Step Completed**
   - Event: `Match Wizard Step Completed`
   - Filter: `step = "location"`
   - Purpose: User provided city/neighborhood

3. **Service Step Completed**
   - Event: `Match Wizard Step Completed`
   - Filter: `step = "service"`
   - Purpose: User selected service type

4. **Match Results Viewed**
   - Event: `Match Results Viewed`
   - Filter: None
   - Purpose: User completed wizard and saw recommendations

5. **Match Selected (Conversion)**
   - Event: `Match Selected`
   - Filter: None
   - Purpose: User clicked on a recommended professional

### Breakdown Dimensions

Configure the funnel with these breakdowns:

- **Source:** Track where users entered the wizard (homepage, professionals page, direct)
- **Service Type:** Compare completion rates by service category
- **Steps Skipped:** Identify which optional steps users skip most
- **Time Spent:** Monitor wizard completion time

## Events Tracked

### 1. Match Wizard Started
```typescript
matchWizardTracking.started({
  source: "homepage" | "professionals" | "direct"
});
```

**Properties:**
- `source`: Entry point to the wizard

**PostHog Event:**
```json
{
  "event": "Match Wizard Started",
  "properties": {
    "source": "homepage"
  }
}
```

### 2. Match Wizard Step Completed
```typescript
matchWizardTracking.stepCompleted({
  step: "location" | "service" | "home-details" | "timing-budget" | "preferences" | "results",
  stepNumber: 1-6,
  data: wizardData
});
```

**Properties:**
- `step`: Current step name
- `stepNumber`: 1-indexed step position
- `data`: Wizard form data (sanitized for privacy)

**PostHog Event:**
```json
{
  "event": "Match Wizard Step Completed",
  "properties": {
    "step": "location",
    "stepNumber": 1,
    "data": {
      "city": "Bogotá"
    }
  }
}
```

### 3. Match Wizard Step Skipped
```typescript
matchWizardTracking.stepSkipped({
  step: "home-details" | "timing-budget" | "preferences",
  stepNumber: 3-5
});
```

**Properties:**
- `step`: Skipped step name
- `stepNumber`: Step position

**PostHog Event:**
```json
{
  "event": "Match Wizard Step Skipped",
  "properties": {
    "step": "home-details",
    "stepNumber": 3
  }
}
```

### 4. Match Wizard Step Back
```typescript
matchWizardTracking.stepBack({
  fromStep: "service",
  toStep: "location",
  currentStepNumber: 2
});
```

**Properties:**
- `fromStep`: Step user navigated from
- `toStep`: Step user navigated to
- `currentStepNumber`: Current step number

**PostHog Event:**
```json
{
  "event": "Match Wizard Step Back",
  "properties": {
    "fromStep": "service",
    "toStep": "location",
    "currentStepNumber": 2
  }
}
```

### 5. Match Wizard Completed
```typescript
matchWizardTracking.completed({
  totalStepsCompleted: 5,
  stepsSkipped: 2,
  timeSpent: 45, // seconds
  finalData: {
    city: "Bogotá",
    serviceType: "cleaning",
    budgetRange: "30000-50000",
    languagePreference: "bilingual"
  }
});
```

**Properties:**
- `totalStepsCompleted`: Number of steps completed
- `stepsSkipped`: Number of steps skipped
- `timeSpent`: Total time in wizard (seconds)
- `finalData`: Summary of wizard selections
- `value`: Set to `totalStepsCompleted` for goal tracking

**PostHog Event:**
```json
{
  "event": "Match Wizard Completed",
  "properties": {
    "totalStepsCompleted": 5,
    "stepsSkipped": 2,
    "timeSpent": 45,
    "finalData": {
      "city": "Bogotá",
      "serviceType": "cleaning",
      "budgetRange": "30000-50000",
      "languagePreference": "bilingual"
    },
    "value": 5
  }
}
```

### 6. Match Wizard Exited
```typescript
matchWizardTracking.exited({
  lastStep: "service",
  stepNumber: 2,
  progress: 33, // percentage
  timeSpent: 15 // seconds
});
```

**Properties:**
- `lastStep`: Last step before exit
- `stepNumber`: Step number where user exited
- `progress`: Completion percentage (0-100)
- `timeSpent`: Time spent before exit (seconds)

**PostHog Event:**
```json
{
  "event": "Match Wizard Exited",
  "properties": {
    "lastStep": "service",
    "stepNumber": 2,
    "progress": 33,
    "timeSpent": 15
  }
}
```

### 7. Match Results Viewed
```typescript
matchWizardTracking.resultsViewed({
  matchCount: 3,
  filters: {
    city: "Bogotá",
    serviceType: "cleaning",
    budgetRange: "30000-50000",
    languagePreference: "bilingual"
  }
});
```

**Properties:**
- `matchCount`: Number of matches shown
- `filters`: Applied search filters

**PostHog Event:**
```json
{
  "event": "Match Results Viewed",
  "properties": {
    "matchCount": 3,
    "filters": {
      "city": "Bogotá",
      "serviceType": "cleaning",
      "budgetRange": "30000-50000",
      "languagePreference": "bilingual"
    }
  }
}
```

### 8. Match Selected (Conversion)
```typescript
matchWizardTracking.matchSelected({
  professionalId: "prof_123",
  position: 1, // 1-indexed position in results
  matchScore: 98,
  serviceType: "cleaning"
});
```

**Properties:**
- `professionalId`: ID of selected professional
- `position`: Position in results list (1-3)
- `matchScore`: Match quality score (0-100)
- `serviceType`: Service category
- `value`: Set to 1 (conversion event)

**PostHog Event:**
```json
{
  "event": "Match Selected",
  "properties": {
    "professionalId": "prof_123",
    "position": 1,
    "matchScore": 98,
    "serviceType": "cleaning",
    "value": 1
  }
}
```

### 9. Match Wizard Restarted
```typescript
matchWizardTracking.restarted({
  fromStep: "results",
  reason: "unsatisfied" | "error"
});
```

**Properties:**
- `fromStep`: Step where restart was triggered
- `reason`: Why user restarted (optional)

**PostHog Event:**
```json
{
  "event": "Match Wizard Restarted",
  "properties": {
    "fromStep": "results",
    "reason": "unsatisfied"
  }
}
```

## Creating the Funnel in PostHog

### Step 1: Create Main Conversion Funnel

1. Go to PostHog → Insights → New Insight → Funnel
2. Configure funnel steps:

   ```
   Step 1: Match Wizard Started
   Step 2: Match Wizard Step Completed (step = "location")
   Step 3: Match Wizard Step Completed (step = "service")
   Step 4: Match Results Viewed
   Step 5: Match Selected
   ```

3. Configure settings:
   - **Conversion Window:** 30 minutes
   - **Breakdown:** `serviceType`
   - **Exclude internal users:** Yes

4. Save as: "Match Wizard - Completion & Conversion"

### Step 2: Create Drop-off Analysis Funnel

1. Create a new funnel with the same steps as above
2. Enable "Show time to convert between steps"
3. Enable "Show drop-off percentages"
4. Save as: "Match Wizard - Drop-off Analysis"

### Step 3: Create Skip Behavior Analysis

1. Go to PostHog → Insights → New Insight → Trend
2. Configure events:
   - Event: `Match Wizard Step Skipped`
   - Breakdown: `step`
3. Save as: "Match Wizard - Skipped Steps"

## Success Metrics

### Primary Metrics

**1. Wizard Completion Rate**
- Formula: (Users reaching results / Users starting wizard) × 100
- Target: ≥60%
- Current Baseline: TBD (measure control group)

**2. Match Selection Rate (Conversion)**
- Formula: (Users selecting match / Users viewing results) × 100
- Target: ≥40%
- Current Baseline: TBD (compare to regular browse)

**3. Time to Completion**
- Formula: Median time from start to results viewed
- Target: <2 minutes
- Acceptable Range: 1-3 minutes

### Secondary Metrics

**4. Step Drop-off Rates**
- Monitor each step for abnormally high drop-off
- Alert if drop-off >30% at any single step

**5. Skip Behavior**
- Track which optional steps users skip most
- Identify if skipped steps correlate with lower conversion

**6. Back Navigation Rate**
- Monitor how often users go back to previous steps
- High back rate may indicate confusing UX

**7. Restart Rate**
- Track users who restart from results page
- High restart rate may indicate poor match quality

## Monitoring & Alerts

### Alert Thresholds

Set up alerts in PostHog for:

1. **Completion Rate < 50%**
   - Action: Investigate UX issues or bugs

2. **Conversion Rate < 30%**
   - Action: Review match algorithm quality

3. **Exit Rate > 40% at Step 2 (Service Selection)**
   - Action: Simplify service selection or add guidance

4. **Median Time > 3 minutes**
   - Action: Reduce friction or number of questions

## Testing the Implementation

### Local Development

```javascript
// Test wizard start tracking
posthog.capture('Match Wizard Started', { source: 'direct' });

// Test step completion
posthog.capture('Match Wizard Step Completed', {
  step: 'location',
  stepNumber: 1,
  data: { city: 'Bogotá' }
});

// Test match selection
posthog.capture('Match Selected', {
  professionalId: 'test_123',
  position: 1,
  matchScore: 95,
  serviceType: 'cleaning',
  value: 1
});
```

### Verification Checklist

Before launching to production:

- [ ] Feature flag `match_wizard_enabled` is created
- [ ] All events are tracked in PostHog (check Activity tab)
- [ ] Funnel shows correct conversion percentages
- [ ] Drop-off analysis identifies problem steps
- [ ] Skip behavior tracking works
- [ ] Restart tracking works
- [ ] Properties are captured correctly
- [ ] No PII (personally identifiable information) is logged

## Rollout Plan

### Week 1: Internal Testing (0-5%)
- Enable for team members only
- Goal: Identify critical bugs
- Success Criteria: No crashes, all events tracked

### Week 2-3: Beta Users (5-25%)
- Enable for power users
- Goal: Validate UX and gather feedback
- Success Criteria: Completion rate ≥50%, conversion rate ≥30%

### Week 4-7: Gradual Rollout (25-100%)
- Increase by 25% each week
- Goal: Monitor metrics at scale
- Success Criteria: Maintain success metrics as traffic increases

### Final Decision Criteria

**Ship to 100% if:**
- ✅ Completion rate ≥60%
- ✅ Conversion rate ≥40%
- ✅ No increase in support tickets
- ✅ Positive user feedback

**Roll back if:**
- ❌ Completion rate <40%
- ❌ Conversion rate <20%
- ❌ High crash/error rates
- ❌ Negative user feedback

## Related Documentation

- [Match Wizard Tracking Implementation](../../src/lib/integrations/posthog/match-wizard-tracking.ts)
- [Feature Flag Configuration](../../src/lib/shared/config/feature-flags.ts)
- [PostHog Integration Guide](../../src/lib/integrations/posthog/README.md)

---

**Last Updated:** 2025-01-14
**Status:** Ready for PostHog Configuration
**Owner:** Product & Engineering Team
