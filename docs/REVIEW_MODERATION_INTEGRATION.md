# Review Moderation Integration - Admin Dashboard

## Overview

The admin review moderation system uses Claude AI to automatically analyze customer reviews for sentiment, safety concerns, and content quality. It provides admins with intelligent recommendations while maintaining human oversight for final decisions.

## How It Works

### 1. **Moderation Flow**

```
Review submitted
    ↓
Queued for admin review
    ↓
Admin clicks "Analyze" → Claude AI analyzes review
    ↓
Results show: sentiment, categories, flags, severity, recommendation
    ↓
Admin makes decision: Approve / Reject / Request Clarification
    ↓
Review published OR rejected OR customer notified for clarification
```

### 2. **AI Analysis Logic**

**File:** `src/lib/services/reviews/review-analysis-service.ts`

```typescript
// Analyze review using Claude
const analysis = await analyzeReview(
  reviewText,
  rating,
  locale
);

// Returns:
{
  sentiment: "positive" | "negative" | "neutral" | "mixed",
  categories: ["service_quality", "professionalism", "communication"],
  flags: ["Contains profanity", "Personal info disclosed"],
  severity: "low" | "medium" | "high" | "critical",
  actionRequired: true,
  recommendedAction: "Approve with minor edits recommended"
}
```

### 3. **Moderation Queue UI**

**File:** `src/components/admin/reviews/review-moderation-queue.tsx`

The UI displays:

- ✅ **Review Cards** - Professional name, customer, rating, comment
- 🎯 **Sentiment Badge** - Color-coded (green/red/neutral)
- 🏷️ **Category Tags** - Detected review topics
- ⚠️ **Safety Flags** - Content warnings (profanity, personal info)
- 📊 **Severity Level** - Critical/high/medium/low
- 💡 **AI Recommendation** - Suggested action
- 🔘 **Action Buttons** - Approve, Reject, Request Clarification

### 4. **Auto-Publish Logic**

Some reviews can be automatically published without admin review:

```typescript
function shouldAutoPublish(analysis: ReviewAnalysis): {
  autoPublish: boolean;
  reason: string;
} {
  // Criteria for auto-publish:
  // 1. No safety flags
  // 2. Positive or neutral sentiment
  // 3. Low severity
  // 4. No action required

  const hasFlags = analysis.flags && analysis.flags.length > 0;
  const isNegative = analysis.sentiment === "negative";
  const isHighSeverity = ["high", "critical"].includes(analysis.severity);

  if (hasFlags) {
    return { autoPublish: false, reason: "Contains safety flags" };
  }

  if (isHighSeverity) {
    return { autoPublish: false, reason: "High severity" };
  }

  if (analysis.actionRequired) {
    return { autoPublish: false, reason: "Action required" };
  }

  return { autoPublish: true, reason: "Meets auto-publish criteria" };
}
```

### 5. **Example Review Flows**

#### Example 1: Positive Review (Auto-Publish)

**Review:** "Maria was fantastic! Very professional and my house is spotless. Highly recommend!"

**Rating:** 5 stars

**AI Analysis:**
```json
{
  "sentiment": "positive",
  "categories": ["service_quality", "professionalism"],
  "flags": [],
  "severity": "low",
  "actionRequired": false,
  "recommendedAction": "Approve - meets auto-publish criteria"
}
```

**Result:** Automatically published ✅

#### Example 2: Negative Review (Manual Review)

**Review:** "Showed up 2 hours late and did a terrible job. Very disappointed."

**Rating:** 1 star

**AI Analysis:**
```json
{
  "sentiment": "negative",
  "categories": ["punctuality", "service_quality"],
  "flags": [],
  "severity": "medium",
  "actionRequired": true,
  "recommendedAction": "Approve - legitimate complaint with professional tone"
}
```

**Result:** Admin manually reviews → Approved with follow-up to professional ✅

#### Example 3: Flagged Review (Requires Action)

**Review:** "This cleaner was terrible and I found out they live at 123 Main St. Call me at 555-1234 to discuss."

**Rating:** 2 stars

**AI Analysis:**
```json
{
  "sentiment": "negative",
  "categories": ["service_quality"],
  "flags": [
    "Contains personal information (address)",
    "Contains personal information (phone number)"
  ],
  "severity": "high",
  "actionRequired": true,
  "recommendedAction": "Request clarification - remove personal info before publishing"
}
```

**Result:** Admin requests customer remove personal info → Re-submitted → Approved ✅

### 6. **API Endpoints**

#### Fetch Pending Reviews

**Endpoint:** `GET /api/admin/reviews/pending`

**Auth:** Admin only

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_123",
      "bookingId": "booking_456",
      "professionalId": "prof_789",
      "professionalName": "Maria Rodriguez",
      "customerName": "john.doe",
      "rating": 5,
      "comment": "Excellent service!",
      "createdAt": "2025-01-15T10:00:00Z",
      "status": "pending"
    }
  ],
  "count": 12
}
```

#### Analyze Review

**Endpoint:** `POST /api/admin/reviews/analyze`

**Auth:** Admin only

**Request:**
```json
{
  "reviewText": "Great service, very professional!",
  "rating": 5,
  "locale": "en"
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "categories": ["service_quality", "professionalism"],
  "flags": [],
  "severity": "low",
  "actionRequired": false,
  "recommendedAction": "Approve - meets auto-publish criteria",
  "confidence": 95
}
```

#### Moderate Review

**Endpoint:** `POST /api/admin/reviews/moderate`

**Auth:** Admin only

**Request:**
```json
{
  "reviewId": "review_123",
  "action": "approve",
  "reason": "Legitimate positive feedback"
}
```

**Response:**
```json
{
  "success": true,
  "review": {
    "id": "review_123",
    "status": "approved",
    "moderatedBy": "admin_456",
    "moderatedAt": "2025-01-15T14:30:00Z"
  }
}
```

### 7. **Database Schema**

```sql
-- Reviews table updates
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderation_reason TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_pending ON reviews(status, created_at) WHERE status = 'pending';
```

### 8. **Design Features**

#### Visual Design (Lia Design System)

- **Sentiment Colors:**
  - Positive: Green (`green-700`, `green-50`)
  - Negative: Red (`red-700`, `red-50`)
  - Neutral: Gray (`neutral-700`, `neutral-50`)
  - Mixed: Yellow (`yellow-700`, `yellow-50`)

- **Severity Colors:**
  - Critical: Red (`red-700`, `red-50`)
  - High: Orange (`orange-700`, `orange-50`)
  - Medium: Yellow (`yellow-700`, `yellow-50`)
  - Low: Gray (`neutral-700`, `neutral-50`)

- **Typography:** Geist Sans for consistency
- **Icons:** HugeIcons with 1.5 stroke width
- **Animations:** Smooth transitions and hover effects

#### Accessibility

- **Keyboard Navigation:** Tab through review cards and actions
- **Screen Readers:** ARIA labels for all actions
- **Color Contrast:** WCAG AA compliant
- **Focus States:** Clear orange focus rings

#### Responsive Design

- **Mobile:** Single column layout
- **Tablet:** 1-2 columns
- **Desktop:** 2 columns for efficient review

### 9. **PostHog Tracking**

All review moderation is tracked for analytics:

```typescript
trackReviewAnalysis({
  success: true,
  sentiment: "positive",
  categoryCount: 2,
  flagCount: 0,
  actionRequired: false,
  severity: "low",
  autoPublish: true,
  processingTimeMs: 234,
  locale: "en",
});

trackEvent("Review Moderated", {
  reviewId: "review_123",
  action: "approve",
  sentiment: "positive",
  hadFlags: false,
  processingTime: 234,
});
```

### 10. **Error Handling**

Analysis failures don't disrupt moderation flow:

```typescript
try {
  const analysis = await analyzeReview(reviewText, rating, locale);
  setAnalysis(analysis);
} catch (error) {
  console.error("Analysis failed:", error);
  setAnalysisError(error.message);
  // Admin can still manually moderate without AI assistance
}
```

### 11. **Future Enhancements**

Potential improvements:

1. **Batch Analysis:** Analyze multiple reviews at once for efficiency
2. **Sentiment Trends:** Dashboard showing sentiment trends over time
3. **Auto-Response Templates:** Suggested responses for common review types
4. **Professional Notifications:** Alert professionals of approved reviews
5. **Customer Follow-Up:** Auto-request more details on low-rated reviews
6. **ML Training:** Use moderation decisions to improve AI accuracy
7. **A/B Testing:** Test different moderation thresholds with PostHog

### 12. **Testing**

#### Manual Testing

Test with these sample reviews:

```
// Should auto-publish
"Excellent service! Maria was very professional and thorough."

// Should require manual review (negative)
"Disappointing experience. Not what I expected for the price."

// Should flag for action (personal info)
"Great cleaner but she left her phone number 555-1234 here."

// Should flag for action (profanity)
"This was absolutely terrible service. I'm so pissed off."
```

#### Automated Testing

Add E2E tests for:
- Review analysis API response
- Auto-publish logic correctness
- Moderation action effects
- Professional rating recalculation
- Error handling

### 13. **Performance**

- **Parallel Analysis:** Use "Analyze All" to batch process queue
- **Caching:** Consider caching analysis results for similar reviews
- **Pagination:** Limit to 50 reviews per page
- **Debouncing:** Prevent accidental double-moderation

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0
**Author:** Claude Code
