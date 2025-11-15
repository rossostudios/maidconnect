# Casaora Structured Outputs Implementation

## Overview

Casaora now uses **Anthropic's Structured Outputs** feature with Claude Sonnet 4.5 to guarantee consistent, type-safe AI responses across all critical workflows. This eliminates parsing errors, simplifies code, and enables production-ready AI features.

## What are Structured Outputs?

Structured outputs guarantee that Claude's responses conform to predefined JSON schemas. Instead of parsing fragile text responses, you get validated TypeScript objects every time.

### Benefits

- ✅ **Zero parsing errors** - Responses always match your schema
- ✅ **Type safety** - Full TypeScript support with Zod schemas
- ✅ **No retry logic** - Eliminate complex error handling
- ✅ **Production-ready** - Reliable enough for payment/booking flows
- ✅ **Faster development** - No more brittle regex/parsing code

## Implemented Use Cases

### 1. 🤖 Booking Intent Parsing (Amara AI)

Convert natural language booking requests into structured search parameters.

**Location:** `src/lib/services/amara/booking-intent-service.ts`

**Example:**
```typescript
import { parseBookingIntent } from '@/lib/services/amara/booking-intent-service';

const intent = await parseBookingIntent(
  "I need someone experienced with kids, speaks English, available weekends",
  "en"
);

// Guaranteed structure:
console.log(intent);
// {
//   serviceType: 'childcare',
//   requirements: {
//     languages: ['english'],
//     specialSkills: ['childcare'],
//   },
//   schedule: {
//     weekends: true,
//   }
// }
```

**Use in your code:**
```typescript
// In Amara chat endpoint
const intent = await parseBookingIntent(userMessage, locale);
const filters = intentToSearchFilters(intent);
const professionals = await searchProfessionals(filters);
```

---

### 2. 📄 Document Extraction (Background Checks)

Extract structured data from ID scans, certifications, and background check reports.

**Location:** `src/lib/services/professionals/document-extraction-service.ts`

**API:** `POST /api/admin/documents/extract`

**Example:**
```typescript
import { extractDocumentData } from '@/lib/services/professionals/document-extraction-service';

// From uploaded file
const extraction = await extractDocumentData(
  base64Image,
  "base64",
  "national_id"
);

// Auto-populate professional profile
if (extraction.personalInfo) {
  await updateProfessional({
    fullName: extraction.personalInfo.fullName,
    idNumber: extraction.personalInfo.idNumber,
    dateOfBirth: extraction.personalInfo.dateOfBirth,
  });
}

// Check certifications
if (extraction.certifications) {
  for (const cert of extraction.certifications) {
    await addCertification(professionalId, cert);
  }
}
```

**Admin UI Integration:**
```typescript
// In document upload handler
async function handleDocumentUpload(file: File) {
  const base64 = await fileToBase64(file);

  const response = await fetch('/api/admin/documents/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageData: base64,
      imageType: 'base64',
      documentType: 'national_id'
    })
  });

  const { extraction } = await response.json();

  // Pre-fill form with extracted data
  setFormData({
    fullName: extraction.personalInfo?.fullName,
    idNumber: extraction.personalInfo?.idNumber,
    // ... other fields
  });
}
```

---

### 3. ⭐ Review Sentiment Analysis

Classify reviews, detect safety flags, and auto-route to moderation queue.

**Location:** `src/lib/services/reviews/review-analysis-service.ts`

**API:** `POST /api/admin/reviews/analyze`

**Example:**
```typescript
import { analyzeReview, shouldAutoPublish } from '@/lib/services/reviews/review-analysis-service';

const analysis = await analyzeReview(
  "Maria was fantastic! Always on time and very professional.",
  5,
  "en"
);

// Check if safe to auto-publish
const { autoPublish, reason } = shouldAutoPublish(analysis);

if (autoPublish) {
  await publishReview(reviewId);
} else {
  await routeToModerationQueue(reviewId, analysis.severity);
}

// Critical safety flags?
if (analysis.flags.includes('potential_safety_issue')) {
  await notifyAdmins(analysis);
}
```

**Batch Analysis:**
```typescript
// Analyze multiple reviews at once
const reviews = await fetchPendingReviews();
const analyses = await analyzeBatchReviews(reviews);

// Auto-publish positive reviews
const safe = analyses.filter(a => shouldAutoPublish(a).autoPublish);
await publishBatch(safe.map(a => a.reviewId));

// Route flagged reviews
const flagged = analyses.filter(a => a.actionRequired);
await routeToModeration(flagged);
```

---

### 4. 🔍 Smart Professional Matching

Parse natural language into precise matching criteria and rank professionals.

**Location:** `src/lib/services/matching/smart-matching-service.ts`

**API:** `POST /api/professionals/match`

**Example:**
```typescript
import { parseMatchingCriteria, calculateMatchScore } from '@/lib/services/matching/smart-matching-service';

// Parse user requirements
const criteria = await parseMatchingCriteria(
  "Need someone with 5+ years experience, speaks English, under $40k/hour",
  "en"
);

// Fetch candidates
const candidates = await fetchProfessionals(criteriaToFilters(criteria));

// Rank by match score
const ranked = candidates.map(prof => ({
  ...prof,
  matchScore: calculateMatchScore(criteria, prof).score
})).sort((a, b) => b.matchScore - a.matchScore);

// Return top 5 matches
return ranked.slice(0, 5);
```

**Frontend Integration:**
```typescript
// Smart search component
async function handleSmartSearch(query: string) {
  const response = await fetch('/api/professionals/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, locale: 'en', limit: 10 })
  });

  const { matches, criteria } = await response.json();

  // Display matches with scores
  setResults(matches);

  // Show what criteria were detected
  showDetectedCriteria(criteria);
}
```

---

### 5. 📊 Admin Analytics Reports

Generate comprehensive reports with AI-powered insights and recommendations.

**Location:** `src/lib/services/admin/analytics-service.ts`

**API:** `POST /api/admin/analytics/report`

**Example:**
```typescript
import { generateAnalyticsReport, exportReport } from '@/lib/services/admin/analytics-service';

// Weekly report
const report = await generateAnalyticsReport('2025-01-08', '2025-01-15');

// Access metrics
console.log(`Total revenue: ${report.metrics.revenue.totalCop} COP`);
console.log(`Growth: ${report.metrics.revenue.growthPercentage}%`);

// Review insights
for (const insight of report.insights) {
  if (insight.priority === 'critical') {
    await notifyManager(insight);
  }
}

// Check alerts
if (report.alerts) {
  const critical = report.alerts.filter(a => a.severity === 'critical');
  await sendAlerts(critical);
}

// Export to Markdown
const markdown = exportReport(report, 'markdown');
await saveToFile(markdown);
```

**Admin Dashboard Integration:**
```typescript
// Weekly report generator
async function generateWeeklyReport() {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const response = await fetch('/api/admin/analytics/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, format: 'json' })
  });

  const { report } = await response.json();

  // Display on dashboard
  setMetrics(report.metrics);
  setInsights(report.insights);
  setAlerts(report.alerts);
}
```

---

## Architecture

### Schema Definitions

All schemas are defined in [src/lib/integrations/amara/schemas.ts](../src/lib/integrations/amara/schemas.ts):

- `bookingIntentSchema` - Booking intent parsing
- `documentExtractionSchema` - Document data extraction
- `reviewAnalysisSchema` - Review sentiment analysis
- `matchingCriteriaSchema` - Professional matching criteria
- `adminAnalyticsSchema` - Analytics reports

### Core Utility

The core structured output utility is in [src/lib/integrations/amara/structured-outputs.ts](../src/lib/integrations/amara/structured-outputs.ts):

```typescript
import { getStructuredOutput } from '@/lib/integrations/amara/structured-outputs';

const result = await getStructuredOutput({
  schema: myZodSchema,
  systemPrompt: "You are a...",
  userMessage: "Parse this...",
  model: "claude-sonnet-4-5",
  temperature: 0.3,
});

// result is guaranteed to match schema
```

### Service Layer

Each use case has a dedicated service:

- `booking-intent-service.ts` - Booking intent parsing
- `document-extraction-service.ts` - Document extraction
- `review-analysis-service.ts` - Review analysis
- `smart-matching-service.ts` - Professional matching
- `analytics-service.ts` - Analytics reports

### API Routes

RESTful API endpoints for each feature:

- `POST /api/admin/documents/extract` - Extract document data
- `POST /api/admin/reviews/analyze` - Analyze reviews
- `POST /api/professionals/match` - Smart professional matching
- `POST /api/admin/analytics/report` - Generate analytics reports

---

## Best Practices

### 1. Use Low Temperature for Consistency

For parsing and extraction tasks, use low temperature (0.1-0.3):

```typescript
await getStructuredOutput({
  schema: documentExtractionSchema,
  temperature: 0.1, // Very consistent results
  // ...
});
```

### 2. Provide Clear System Prompts

Guide Claude with specific instructions:

```typescript
systemPrompt: `You are a document extraction specialist.
Extract information accurately and completely.
Use YYYY-MM-DD format for dates.
If text is unclear, note it in warnings.`,
```

### 3. Validate Extraction Quality

Check confidence scores and warnings:

```typescript
const extraction = await extractDocumentData(...);

if (extraction.confidence < 70) {
  // Request manual review
  await flagForReview(extraction);
}
```

### 4. Batch Process When Possible

For multiple items, use batch processing:

```typescript
const analyses = await analyzeBatchReviews(reviews);
// More efficient than individual calls
```

### 5. Handle Errors Gracefully

Structured outputs eliminate most errors, but handle edge cases:

```typescript
try {
  const result = await getStructuredOutput(...);
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    // API error (rate limit, auth, etc.)
    await retryWithBackoff();
  } else {
    // Unexpected error
    logError(error);
  }
}
```

---

## Performance

### Response Times

- Booking Intent Parsing: ~1-2 seconds
- Document Extraction: ~2-3 seconds (with images)
- Review Analysis: ~1-2 seconds
- Professional Matching: ~1-2 seconds
- Analytics Reports: ~3-5 seconds (larger responses)

### Cost Efficiency

Using Claude Sonnet 4.5:
- Input: $3/M tokens
- Output: $15/M tokens

Typical costs per operation:
- Booking intent: ~$0.002 per parse
- Document extraction: ~$0.005 per document
- Review analysis: ~$0.002 per review
- Professional matching: ~$0.003 per query
- Analytics report: ~$0.010 per report

---

## Testing

### Unit Tests

Test schemas and utilities:

```typescript
import { bookingIntentSchema } from '@/lib/integrations/amara/schemas';

test('booking intent schema validates correctly', () => {
  const valid = {
    serviceType: 'cleaning',
    location: { city: 'Bogotá' },
    requirements: { languages: ['english'] }
  };

  expect(() => bookingIntentSchema.parse(valid)).not.toThrow();
});
```

### Integration Tests

Test full workflows:

```typescript
test('document extraction extracts ID data', async () => {
  const extraction = await extractDocumentData(
    mockIDImage,
    'base64',
    'national_id'
  );

  expect(extraction.personalInfo?.fullName).toBeDefined();
  expect(extraction.confidence).toBeGreaterThan(70);
});
```

---

## Monitoring

### PostHog Events

Track structured output usage:

```typescript
import { trackEvent } from '@/lib/integrations/posthog';

trackEvent('structured_output_used', {
  type: 'document_extraction',
  confidence: extraction.confidence,
  documentType: extraction.documentType,
});
```

### Better Stack Logging

Log important events:

```typescript
import { logger } from '@/lib/shared/logger';

logger.info('Document extracted successfully', {
  documentType: extraction.documentType,
  confidence: extraction.confidence,
  extractedFields: Object.keys(extraction.personalInfo || {}),
});
```

---

## Migration Guide

### Before (Manual Parsing)

```typescript
// Old approach - brittle and error-prone
const response = await amara.ask("Find me a cleaner");
const match = response.match(/service[:\s]+(\w+)/i);
const serviceType = match ? match[1] : 'unknown';

// Hope it works!
await searchProfessionals({ serviceType });
```

### After (Structured Outputs)

```typescript
// New approach - guaranteed structure
const intent = await parseBookingIntent("Find me a cleaner", "en");
const filters = intentToSearchFilters(intent);
await searchProfessionals(filters);

// Always works, always type-safe
```

---

## Roadmap

### Planned Features

1. **Streaming Support** - Real-time structured output streaming (when Anthropic adds support)
2. **Multi-Language Expansion** - Add French, Portuguese support
3. **Advanced Matching** - Distance-based, schedule-aware matching
4. **Predictive Analytics** - Revenue forecasting, churn prediction
5. **A/B Testing** - Compare structured vs. traditional approaches

### Future Use Cases

- **Chat Sentiment** - Real-time customer support sentiment
- **Fraud Detection** - Identify suspicious patterns in bookings
- **Price Optimization** - Dynamic pricing recommendations
- **Professional Onboarding** - Auto-fill from resume/CV
- **Booking Optimization** - Suggest best time slots

---

## Support

### Resources

- [Anthropic Structured Outputs Docs](https://docs.anthropic.com/claude/docs/structured-outputs)
- [Zod Documentation](https://zod.dev/)
- [Claude Sonnet 4.5 Release](https://www.anthropic.com/news/claude-sonnet-4-5)

### Internal Contacts

- **AI/ML Questions:** Engineering team
- **Schema Design:** Product team
- **Production Issues:** DevOps team

---

## Appendix: Complete API Reference

### Document Extraction API

```
POST /api/admin/documents/extract
Authorization: Bearer {admin_token}

Request:
{
  "imageData": "base64..." | "https://...",
  "imageType": "base64" | "url",
  "documentType": "national_id" | "passport" | "background_check_report" | ...
}

Response:
{
  "success": true,
  "extraction": {
    "documentType": "national_id",
    "personalInfo": {
      "fullName": "Juan Pérez",
      "idNumber": "1234567890",
      "dateOfBirth": "1990-05-15"
    },
    "confidence": 95,
    "warnings": []
  }
}
```

### Review Analysis API

```
POST /api/admin/reviews/analyze
Authorization: Bearer {admin_token}

Request (Single):
{
  "reviewText": "Great service!",
  "rating": 5,
  "locale": "en"
}

Request (Batch):
{
  "reviews": [
    { "text": "Great!", "rating": 5 },
    { "text": "Terrible", "rating": 1 }
  ]
}

Response:
{
  "success": true,
  "analysis": {
    "sentiment": "positive",
    "categories": ["quality", "professionalism"],
    "actionRequired": false,
    "flags": ["none"],
    "suggestedResponse": "Thank you for..."
  },
  "autoPublish": { "autoPublish": true, "reason": "..." },
  "recommendedAction": { "action": "Publish", "priority": "low", "steps": [...] }
}
```

### Professional Matching API

```
POST /api/professionals/match

Request:
{
  "query": "Need someone with 5+ years experience, speaks English",
  "locale": "en",
  "limit": 10
}

Response:
{
  "success": true,
  "criteria": {
    "experienceYears": 5,
    "languages": ["english"]
  },
  "totalFound": 25,
  "matches": [
    {
      "id": "prof_123",
      "full_name": "Maria Garcia",
      "matchScore": 92,
      "matchBreakdown": {
        "skills": 28,
        "languages": 20,
        "experience": 15,
        ...
      }
    }
  ]
}
```

### Analytics Report API

```
POST /api/admin/analytics/report
Authorization: Bearer {admin_token}

Request:
{
  "startDate": "2025-01-08",
  "endDate": "2025-01-15",
  "format": "json" | "markdown" | "csv"
}

Response:
{
  "success": true,
  "report": {
    "reportPeriod": { "startDate": "...", "endDate": "..." },
    "metrics": { ... },
    "insights": [ ... ],
    "trends": { ... },
    "alerts": [ ... ]
  }
}
```

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0
**Maintainer:** Casaora Engineering Team
