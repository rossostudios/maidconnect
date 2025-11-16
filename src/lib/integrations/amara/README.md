# Amara AI - Structured Outputs Integration

## Quick Start

### Installation

The required dependencies are already installed:
- `@anthropic-ai/sdk` - Claude API client
- `zod` - Schema validation
- `zod-to-json-schema` - Schema conversion

### Basic Usage

```typescript
import { getStructuredOutput } from './structured-outputs';
import { bookingIntentSchema } from './schemas';

// Parse booking intent
const intent = await getStructuredOutput({
  schema: bookingIntentSchema,
  systemPrompt: "You are a booking intent parser...",
  userMessage: "I need a cleaner tomorrow in Bogotá",
});

console.log(intent.serviceType); // 'cleaning'
console.log(intent.location?.city); // 'Bogotá'
```

## Available Schemas

All schemas are in [schemas.ts](./schemas.ts):

1. **`bookingIntentSchema`** - Parse booking requests
2. **`documentExtractionSchema`** - Extract document data
3. **`reviewAnalysisSchema`** - Analyze review sentiment
4. **`matchingCriteriaSchema`** - Parse matching requirements
5. **`adminAnalyticsSchema`** - Generate analytics reports

## Service Functions

### Booking Intent
```typescript
import { parseBookingIntent, intentToSearchFilters } from '@/lib/services/amara/booking-intent-service';

const intent = await parseBookingIntent(userMessage, 'en');
const filters = intentToSearchFilters(intent);
```

### Document Extraction
```typescript
import { extractDocumentData } from '@/lib/services/professionals/document-extraction-service';

const extraction = await extractDocumentData(
  base64Image,
  'base64',
  'national_id'
);
```

### Review Analysis
```typescript
import { analyzeReview, shouldAutoPublish } from '@/lib/services/reviews/review-analysis-service';

const analysis = await analyzeReview(reviewText, rating, 'en');
const { autoPublish } = shouldAutoPublish(analysis);
```

### Professional Matching
```typescript
import { parseMatchingCriteria, calculateMatchScore } from '@/lib/services/matching/smart-matching-service';

const criteria = await parseMatchingCriteria(userQuery, 'en');
const score = calculateMatchScore(criteria, professional);
```

### Analytics Reports
```typescript
import { generateAnalyticsReport, exportReport } from '@/lib/services/admin/analytics-service';

const report = await generateAnalyticsReport('2025-01-08', '2025-01-15');
const markdown = exportReport(report, 'markdown');
```

## API Endpoints

- `POST /api/admin/documents/extract` - Document extraction
- `POST /api/admin/reviews/analyze` - Review analysis
- `POST /api/professionals/match` - Smart matching
- `POST /api/admin/analytics/report` - Analytics reports

## Configuration

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Model Selection

Default: `claude-sonnet-4-5` (best balance of speed/quality)

Available models:
- `claude-sonnet-4-5` - Fast, accurate (recommended)
- `claude-opus-4-1` - Highest quality, slower
- `claude-haiku-4-5` - Fastest, good for simple tasks

### Temperature Settings

- **Parsing/Extraction:** 0.1-0.3 (consistency)
- **Insights/Analytics:** 0.4-0.6 (creativity)
- **General chat:** 0.7 (balanced)

## Best Practices

1. **Use batch processing** when analyzing multiple items
2. **Check confidence scores** before auto-processing
3. **Validate extracted data** against business rules
4. **Handle edge cases** gracefully
5. **Monitor usage** with PostHog events

## Examples

Structured output usage is embedded directly in this README and the accompanying service files so you don't need external docs.

## Testing

```bash
# Run tests
bun test src/lib/services/**/*.test.ts

# Type check
bun run build
```

## Performance

- Booking intent: ~1-2 seconds
- Document extraction: ~2-3 seconds
- Review analysis: ~1-2 seconds
- Professional matching: ~1-2 seconds
- Analytics reports: ~3-5 seconds

## Cost

Using Claude Sonnet 4.5:
- Input: $3/M tokens
- Output: $15/M tokens

Typical operation costs:
- Booking intent: ~$0.002
- Document extraction: ~$0.005
- Review analysis: ~$0.002
- Professional matching: ~$0.003
- Analytics report: ~$0.010

## Support

For questions or issues:
1. Review existing schemas in [schemas.ts](./schemas.ts)
2. Contact engineering team

## Changelog

**v1.0.0** (2025-01-15)
- Initial implementation
- 5 core use cases
- Full TypeScript support
- Comprehensive documentation
