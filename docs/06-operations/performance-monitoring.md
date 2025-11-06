# Web Vitals Monitoring Guide

## Overview

Casaora monitors Core Web Vitals to ensure optimal user experience and track performance regressions. All metrics are automatically sent to Better Stack for analysis and alerting.

## Core Web Vitals

### What We Measure

| Metric | Description | Good | Needs Improvement | Poor |
|--------|-------------|------|-------------------|------|
| **LCP** | Largest Contentful Paint - Main content load time | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | First Input Delay - Interactivity responsiveness | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** | Cumulative Layout Shift - Visual stability | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** | First Contentful Paint - First render time | < 1.8s | 1.8s - 3.0s | > 3.0s |
| **TTFB** | Time to First Byte - Server response time | < 800ms | 800ms - 1800ms | > 1800ms |
| **INP** | Interaction to Next Paint - Overall responsiveness | < 200ms | 200ms - 500ms | > 500ms |

### Why They Matter

- **LCP**: Users perceive pages as slow if main content takes > 2.5s to load
- **FID**: Poor interactivity (> 100ms) frustrates users trying to click/tap
- **CLS**: Unexpected layout shifts cause accidental clicks and poor UX
- **FCP**: First impression of page speed
- **TTFB**: Server and network performance baseline
- **INP**: Overall interaction responsiveness throughout page lifecycle

## Setup

### 1. Enable Web Vitals Reporting

Add to `.env.local`:
```bash
NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS=true
```

### 2. Verify Integration

The Web Vitals reporter is automatically included in the root layout:

```tsx
// src/app/[locale]/layout.tsx
import { WebVitalsReporter } from "@/components/web-vitals";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
```

### 3. Check Better Stack

Metrics appear in Better Stack under:
- **Message**: `Web Vitals: LCP`, `Web Vitals: CLS`, etc.
- **Level**: `info` (good/needs-improvement) or `warn` (poor)
- **Context**: Full metric details including page, device, connection

## Viewing Metrics

### In Better Stack Dashboard

1. Go to your Better Stack dashboard
2. Filter by message: `Web Vitals:`
3. Group by `context.metric` to see all metrics
4. Group by `context.page` to see metrics per route
5. Filter by `level:warn` to see poor-performing pages

### Example Query
```
message:"Web Vitals:" AND context.rating:poor
```

### In Development Console

Metrics are automatically logged to console during development:

```javascript
[Web Vitals] LCP: { value: '1234ms', rating: 'good', page: '/en/dashboard/customer' }
[Web Vitals] CLS: { value: '0.05', rating: 'good', page: '/en/dashboard/customer' }
[Web Vitals] FID: { value: '12ms', rating: 'good', page: '/en/dashboard/customer' }
```

## Understanding Results

### Good Scores ✅
- **LCP < 2.5s**: Images optimized, server responds quickly
- **CLS < 0.1**: Layouts stable, no unexpected shifts
- **FID < 100ms**: Page interactive, responds immediately

### Common Issues & Fixes

#### High LCP (> 2.5s)
**Causes:**
- Large, unoptimized images
- Slow server response (high TTFB)
- Render-blocking JavaScript/CSS

**Fixes:**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/new-hero.jpg"
  width={1200}
  height={600}
  priority // For above-the-fold images
  alt="Hero"
/>

// Preload critical resources
<link rel="preload" href="/fonts/font.woff2" as="font" crossOrigin="anonymous" />
```

#### High CLS (> 0.1)
**Causes:**
- Images without dimensions
- Ads/embeds that shift content
- Web fonts causing layout shift

**Fixes:**
```typescript
// Always specify image dimensions
<Image width={400} height={300} ... />

// Reserve space for dynamic content
<div className="min-h-[200px]">
  {loading ? <Skeleton /> : <Content />}
</div>

// Use font-display: swap
@font-face {
  font-family: 'MyFont';
  font-display: swap;
}
```

#### High FID (> 100ms)
**Causes:**
- Heavy JavaScript execution
- Long tasks blocking main thread
- Too many third-party scripts

**Fixes:**
```typescript
// Code split large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
});

// Defer non-critical scripts
<Script src="analytics.js" strategy="lazyOnload" />

// Use Web Workers for heavy computation
const worker = new Worker('/worker.js');
```

## Performance Budgets

### Target Performance (P75)
- LCP: < 2.0s
- FID: < 50ms
- CLS: < 0.05
- TTFB: < 600ms

### Critical Thresholds (Alert If Exceeded)
- LCP: > 3.0s (60% of users)
- FID: > 150ms (60% of users)
- CLS: > 0.15 (60% of users)
- TTFB: > 1.0s (60% of users)

## Monitoring & Alerts

### Set Up Better Stack Alerts

1. Go to Better Stack → Alerts
2. Create alert: "Poor Web Vitals"
3. Condition: `message:"Web Vitals:" AND level:warn AND context.rating:poor`
4. Threshold: > 10 events in 5 minutes
5. Action: Send to Slack/Email

### Weekly Performance Review

Every week, review:
1. **Regression detection**: Compare to previous week
2. **Page-specific issues**: Which routes are slowest?
3. **Device patterns**: Mobile vs desktop performance
4. **Connection impact**: How does 3G/4G affect metrics?

## Testing

### Local Testing

```bash
# Run production build locally
npm run build
npm start

# Navigate to your site
# Open DevTools → Performance → Record
# Check Core Web Vitals in Lighthouse
```

### Lighthouse CI

Add to CI/CD pipeline:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/professionals
          uploadArtifacts: true
```

## Best Practices

### 1. Optimize Images
```typescript
// Good
<Image
  src="/image.jpg"
  width={800}
  height={600}
  quality={85}
  placeholder="blur"
  alt="Description"
/>

// Bad
<img src="/large-image.jpg" />
```

### 2. Lazy Load Off-Screen Content
```typescript
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => null,
});
```

### 3. Minimize Third-Party Scripts
```typescript
// Load non-critical scripts after page interactive
<Script
  src="https://analytics.com/script.js"
  strategy="lazyOnload"
/>
```

### 4. Use Server Components
```typescript
// app/page.tsx (Server Component by default)
async function HomePage() {
  const data = await fetch('...');
  return <div>{data}</div>;
}
```

### 5. Implement Skeleton Screens
```typescript
function BookingCard({ booking }: { booking: Booking | null }) {
  if (!booking) {
    return <BookingCardSkeleton />;
  }
  return <BookingCardContent booking={booking} />;
}
```

## Debugging

### Get Web Vitals Summary
```typescript
import { getWebVitalsSummary } from '@/lib/web-vitals';

// In browser console or component
const summary = getWebVitalsSummary();
console.log(summary);
```

### Chrome DevTools
1. Open DevTools → Performance
2. Click Record
3. Interact with page
4. Stop recording
5. Check metrics in timeline

### Real User Monitoring (RUM)
Better Stack automatically collects real user metrics, showing:
- Actual user experience (not synthetic)
- Geographic distribution
- Device/browser breakdown
- Connection types

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Better Stack Dashboard](https://logs.betterstack.com)
- [Chrome UX Report](https://developers.google.com/web/tools/chrome-user-experience-report)

## Integration with Feature Flags

Web Vitals respects the feature flag system:

```bash
# Enable in development (automatic)
NODE_ENV=development npm run dev

# Enable in production
NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS=true

# Disable (default in production)
NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS=false
```

## Next Steps

1. ✅ Set up Better Stack alerts for poor Web Vitals
2. ✅ Review metrics weekly in Better Stack dashboard
3. ✅ Add Lighthouse CI to pull request workflow
4. ✅ Optimize pages with poor LCP/CLS/FID scores
5. ✅ Document performance budgets in team wiki
