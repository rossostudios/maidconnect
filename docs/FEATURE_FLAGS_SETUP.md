# PostHog Feature Flags Setup - Structured Outputs

## Overview

Feature flags enable safe, gradual rollout of new AI-powered features with ability to:
- Roll out to specific user segments (admins first, then beta users, then all)
- A/B test different implementations
- Instantly disable features if issues arise
- Gather analytics on feature adoption and performance

## Setup Instructions

### 1. Create Feature Flags in PostHog Dashboard

Navigate to: [PostHog Dashboard](https://us.posthog.com) → Feature Flags

#### Flag 1: Booking Intent Detection

**Key:** `booking-intent-detection`  
**Description:** AI-powered booking intent detection in Amara chat  
**Type:** Boolean

**Rollout Strategy:**
```
Phase 1 (Week 1): Internal testing
- Enable for: Users with email ending in @casaora.com
- Percentage: 100%

Phase 2 (Week 2): Beta users
- Enable for: Users with property "beta_tester" = true
- Percentage: 100%

Phase 3 (Week 3): Gradual rollout
- Enable for: All users
- Percentage: 25% → 50% → 75% → 100% (over 7 days)
```

#### Flag 2: Document Extraction

**Key:** `document-extraction`  
**Description:** AI document extraction for professional vetting  
**Type:** Boolean

**Rollout Strategy:**
```
Phase 1: Admin only
- Enable for: role = "admin"
- Percentage: 100%

Phase 2: All admins + select professionals
- Enable for: role = "admin" OR professional_id IN [list]
- Percentage: 100%
```

#### Flag 3: Review Moderation AI

**Key:** `review-moderation-ai`  
**Description:** AI-powered review analysis and moderation  
**Type:** Boolean

**Rollout Strategy:**
```
Phase 1: Testing with manual review
- Enable for: role = "admin"
- Percentage: 100%
- Manual verification required

Phase 2: Full rollout
- Enable for: All admins
- Percentage: 100%
```

#### Flag 4: Smart Matching

**Key:** `smart-matching`  
**Description:** Natural language professional search  
**Type:** Boolean

**Rollout Strategy:**
```
Phase 1: A/B test
- Variant A (Control): Traditional search
- Variant B (Test): AI-powered matching
- Split: 50/50 for all users

Phase 2: Winner rollout
- Enable winning variant for 100%
```

#### Flag 5: AI Analytics

**Key:** `ai-analytics`  
**Description:** AI-generated business intelligence reports  
**Type:** Boolean

**Rollout Strategy:**
```
Phase 1: Admin only
- Enable for: role = "admin"
- Percentage: 100%
```

---

## 2. Code Implementation

### Update PostHog Integration

```typescript
// src/lib/integrations/posthog/feature-flags.ts

import { isFeatureEnabled } from "@/lib/integrations/posthog";

/**
 * Feature flag keys for structured outputs
 */
export const FEATURE_FLAGS = {
  BOOKING_INTENT: "booking-intent-detection",
  DOCUMENT_EXTRACTION: "document-extraction",
  REVIEW_MODERATION: "review-moderation-ai",
  SMART_MATCHING: "smart-matching",
  AI_ANALYTICS: "ai-analytics",
} as const;

/**
 * Check if booking intent detection is enabled for user
 */
export async function isBookingIntentEnabled(userId?: string): Promise<boolean> {
  return await isFeatureEnabled(FEATURE_FLAGS.BOOKING_INTENT, userId);
}

/**
 * Check if document extraction is enabled for user
 */
export async function isDocumentExtractionEnabled(userId?: string): Promise<boolean> {
  return await isFeatureEnabled(FEATURE_FLAGS.DOCUMENT_EXTRACTION, userId);
}

/**
 * Check if AI review moderation is enabled
 */
export async function isReviewModerationEnabled(userId?: string): Promise<boolean> {
  return await isFeatureEnabled(FEATURE_FLAGS.REVIEW_MODERATION, userId);
}

/**
 * Check if smart matching is enabled
 */
export async function isSmartMatchingEnabled(userId?: string): Promise<boolean> {
  return await isFeatureEnabled(FEATURE_FLAGS.SMART_MATCHING, userId);
}

/**
 * Check if AI analytics is enabled
 */
export async function isAIAnalyticsEnabled(userId?: string): Promise<boolean> {
  return await isFeatureEnabled(FEATURE_FLAGS.AI_ANALYTICS, userId);
}
```

### Conditional Feature Rendering

#### Amara Chat (Booking Intent)

```typescript
// src/components/amara/amara-chat-interface.tsx

import { isBookingIntentEnabled } from "@/lib/integrations/posthog/feature-flags";
import { useEffect, useState } from "react";

export function AmaraChatInterface({ userId }: Props) {
  const [intentDetectionEnabled, setIntentDetectionEnabled] = useState(false);

  useEffect(() => {
    // Check feature flag on mount
    isBookingIntentEnabled(userId).then(setIntentDetectionEnabled);
  }, [userId]);

  const detectBookingIntent = async (message: string) => {
    // Only run if feature flag is enabled
    if (!intentDetectionEnabled) {
      return;
    }

    try {
      const response = await fetch("/api/amara/booking-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message, locale: "en" }),
      });

      const data = await response.json();
      if (data.confidence >= 70) {
        setDetectedIntent(data);
      }
    } catch (error) {
      console.error("Intent detection failed:", error);
    }
  };

  return (
    <>
      {/* Regular chat interface */}
      {intentDetectionEnabled && detectedIntent && (
        <BookingIntentCard intent={detectedIntent} />
      )}
    </>
  );
}
```

#### Admin Dashboard (Document Extraction)

```typescript
// src/components/admin/professionals/professional-vetting.tsx

import { isDocumentExtractionEnabled } from "@/lib/integrations/posthog/feature-flags";

export function ProfessionalVetting({ userId }: Props) {
  const [showDocExtraction, setShowDocExtraction] = useState(false);

  useEffect(() => {
    isDocumentExtractionEnabled(userId).then(setShowDocExtraction);
  }, [userId]);

  return (
    <div>
      {showDocExtraction ? (
        <DocumentExtractionCard />
      ) : (
        <ManualDocumentReview />
      )}
    </div>
  );
}
```

#### Review Moderation Queue

```typescript
// src/components/admin/reviews/review-moderation-queue.tsx

import { isReviewModerationEnabled } from "@/lib/integrations/posthog/feature-flags";

export function ReviewModerationQueue({ userId }: Props) {
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    isReviewModerationEnabled(userId).then(setAiEnabled);
  }, [userId]);

  const analyzeReview = async (reviewId: string) => {
    if (!aiEnabled) {
      // Fall back to manual moderation
      return;
    }

    // Use AI analysis
    const analysis = await fetch("/api/admin/reviews/analyze", {
      method: "POST",
      body: JSON.stringify({ reviewText, rating }),
    });
  };

  return (
    <>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showAIAnalysis={aiEnabled}
        />
      ))}
    </>
  );
}
```

---

## 3. API-Level Feature Gating

Protect API endpoints with feature flags:

```typescript
// src/app/api/amara/booking-intent/route.ts

import { isBookingIntentEnabled } from "@/lib/integrations/posthog/feature-flags";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);

  // Check feature flag
  const enabled = await isBookingIntentEnabled(userId);
  if (!enabled) {
    return NextResponse.json(
      { error: "Feature not available" },
      { status: 403 }
    );
  }

  // Process request
  const { userMessage, locale } = await request.json();
  const intent = await parseBookingIntent(userMessage, locale);

  return NextResponse.json(intent);
}
```

---

## 4. A/B Testing Example

### Test: AI Matching vs Traditional Search

```typescript
// src/lib/integrations/posthog/feature-flags.ts

/**
 * Get smart matching variant for user
 */
export async function getSmartMatchingVariant(userId: string): Promise<"control" | "test"> {
  const posthog = await getPostHogClient();

  const variant = await posthog.getFeatureFlagVariant(
    FEATURE_FLAGS.SMART_MATCHING,
    userId
  );

  return variant === "test" ? "test" : "control";
}
```

```typescript
// src/components/professionals/search-bar.tsx

export function SearchBar({ userId }: Props) {
  const [variant, setVariant] = useState<"control" | "test">("control");

  useEffect(() => {
    getSmartMatchingVariant(userId).then(setVariant);
  }, [userId]);

  const handleSearch = async (query: string) => {
    if (variant === "test") {
      // Use AI-powered matching
      const criteria = await parseMatchingCriteria(query);
      const results = await smartSearch(criteria);

      // Track experiment
      trackEvent("Smart Search Used", {
        variant: "test",
        query,
        resultsCount: results.length,
      });

      return results;
    } else {
      // Use traditional search
      const results = await traditionalSearch(query);

      // Track experiment
      trackEvent("Traditional Search Used", {
        variant: "control",
        query,
        resultsCount: results.length,
      });

      return results;
    }
  };
}
```

---

## 5. Monitoring & Rollback

### Track Feature Usage

```typescript
// Track when feature is used
trackEvent("Feature Used", {
  feature: "booking-intent-detection",
  userId,
  success: true,
  confidence: 85,
});

// Track when feature is unavailable
trackEvent("Feature Gated", {
  feature: "booking-intent-detection",
  userId,
  reason: "flag_disabled",
});
```

### Monitor Error Rates

Create PostHog insight:
```
Event: "Feature Error"
Filter: feature = "booking-intent-detection"
Breakdown: error_type
Time: Last 7 days
```

If error rate > 5%, disable flag immediately.

### Instant Rollback

In PostHog Dashboard:
1. Go to Feature Flags
2. Select problematic flag
3. Set percentage to 0% or disable entirely
4. Changes apply instantly (no deployment needed)

---

## 6. Gradual Rollout Schedule

### Week 1: Internal Testing
- Enable for `@casaora.com` emails only
- Test all features manually
- Fix critical bugs

### Week 2: Beta Users
- Enable for beta testers (10% of users)
- Monitor PostHog for errors and usage patterns
- Gather qualitative feedback

### Week 3: Gradual Public Rollout
- Day 1: 25% of users
- Day 3: 50% of users
- Day 5: 75% of users
- Day 7: 100% of users

### Rollback Triggers
- Error rate > 5%
- User complaints > 10 in 24 hours
- Performance degradation > 30%
- Critical bug discovered

---

## 7. PostHog Dashboard Setup

### Create Custom Insights

**1. Feature Adoption Dashboard**
- Chart: Feature flag evaluation count (by flag key)
- Breakdown: Enabled vs disabled
- Time: Last 30 days

**2. A/B Test Results**
- Chart: Conversion rate by variant
- Filter: Feature = "smart-matching"
- Goal: Booking completion

**3. Error Monitoring**
- Chart: Error count by feature
- Alert: > 100 errors in 1 hour

### Create Alerts

```
Alert 1: High Error Rate
Condition: feature_error_count > 100 in 1 hour
Action: Slack notification to #eng-alerts

Alert 2: Low Adoption
Condition: feature_usage_count < 50 in 24 hours
Action: Email to product team

Alert 3: Performance Degradation
Condition: avg(processing_time_ms) > 3000
Action: PagerDuty alert
```

---

## 8. Best Practices

### DO:
✅ Test feature flags locally with override
✅ Use descriptive flag names (`booking-intent-detection`, not `flag1`)
✅ Set up monitoring before rollout
✅ Document rollout plan
✅ Communicate changes to team
✅ Track both enabled and disabled states

### DON'T:
❌ Roll out to 100% immediately
❌ Skip internal testing phase
❌ Forget to remove flags after full rollout
❌ Use flags for permanent configuration
❌ Ignore error rates during rollout

---

## 9. Flag Cleanup

After successful 100% rollout (30 days stable):

1. Remove flag checks from code
2. Archive flag in PostHog
3. Update documentation
4. Deploy cleanup PR

**Example:**
```typescript
// Before (with flag)
if (await isBookingIntentEnabled(userId)) {
  await detectIntent(message);
}

// After (flag removed)
await detectIntent(message);
```

---

## 10. Testing Feature Flags Locally

### Override Flags for Development

```typescript
// src/lib/integrations/posthog/index.ts

export async function isFeatureEnabled(
  flag: string,
  userId?: string
): Promise<boolean> {
  // Local development overrides
  if (process.env.NODE_ENV === "development") {
    const override = process.env[`FEATURE_${flag.toUpperCase().replace(/-/g, "_")}`];
    if (override !== undefined) {
      return override === "true";
    }
  }

  // Production: Check PostHog
  const posthog = await getPostHogClient();
  return await posthog.isFeatureEnabled(flag, userId);
}
```

```.env.local
# Override feature flags locally
FEATURE_BOOKING_INTENT_DETECTION=true
FEATURE_DOCUMENT_EXTRACTION=true
FEATURE_REVIEW_MODERATION_AI=false
FEATURE_SMART_MATCHING=true
FEATURE_AI_ANALYTICS=true
```

---

**Last Updated:** 2025-01-15  
**Version:** 1.0.0  
**Author:** Claude Code
