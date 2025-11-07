# ADR-008: Why Better Stack (Logtail) for Logging and Monitoring

**Date:** 2025-01-06
**Status:** Accepted
**Deciders:** Technical Leadership Team
**Tags:** `monitoring`, `logging`, `observability`, `debugging`

---

## Context

Production applications require:
- **Error tracking** (catch and fix bugs)
- **Log aggregation** (centralize server/client logs)
- **Performance monitoring** (identify slow endpoints)
- **Alerting** (notify team of critical issues)

We evaluated four solutions:
1. **Better Stack (Logtail)** - Unified logs, uptime, and incidents
2. **Datadog** - Enterprise APM and monitoring
3. **Sentry** - Error tracking specialist
4. **CloudWatch** - AWS native logging

---

## Decision

**We use Better Stack (Logtail) for all logging, monitoring, and error tracking in Casaora.**

Implementation:
- ✅ `@logtail/next` for Next.js integration
- ✅ Server-side and client-side logging
- ✅ Structured logs with context
- ✅ Real-time log streaming

---

## Consequences

### Positive

#### 1. **Unified Platform (Logs + Uptime + Incidents)**

Better Stack combines three tools in one:

```typescript
// 1. Structured logging
import { logger } from '@/lib/logger';

logger.info('Booking created', {
  booking_id: '123',
  customer_id: 'user_abc',
  amount: 100000,
});

// 2. Error tracking
try {
  await createBooking(data);
} catch (error) {
  logger.error('Booking creation failed', { error, data });
}

// 3. Performance monitoring
logger.time('database-query');
await supabase.from('bookings').select('*');
logger.timeEnd('database-query');  // Logs query duration
```

**vs. Traditional approach:**
- **Sentry** (errors)
- **Datadog** (logs + APM)
- **PagerDuty** (incidents)
= **3 tools, 3 dashboards, 3 bills**

#### 2. **Next.js Native Integration**

```typescript
// lib/logger.ts
import { createLogger } from '@logtail/next';

export const logger = createLogger({
  sourceToken: process.env.LOGTAIL_SOURCE_TOKEN!,
});

// Automatic context (request ID, user ID, etc.)
logger.info('User logged in', {
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});
```

**Benefits:**
- **Automatic request tracking** (every log includes request ID)
- **Edge Runtime compatible** (works with Vercel Edge)
- **Structured logs** (searchable JSON)

#### 3. **Affordable for Startups**

**Pricing comparison (for 10GB logs/month):**
- **Better Stack:** $25/month
- **Datadog:** $150/month
- **New Relic:** $99/month
- **Sentry:** $79/month

**Better Stack is 6x cheaper than Datadog.**

#### 4. **Live Tail = Instant Debugging**

```bash
# Watch logs in real-time
https://logs.betterstack.com/team/TEAM_ID/tail

# See new logs appear as they happen (no refresh needed)
```

**Use case:**
- Deploy new feature → open Live Tail → test feature → see logs instantly

#### 5. **SQL-Like Log Search**

```sql
-- Find all Stripe webhook errors in last 24 hours
SELECT * FROM logs
WHERE message LIKE '%stripe%webhook%'
AND level = 'error'
AND timestamp > NOW() - INTERVAL 24 HOURS
ORDER BY timestamp DESC
```

**vs. CloudWatch:**
- Complex filter syntax
- Slow search (minutes for large logs)

---

### Negative

#### 1. **Smaller Ecosystem Than Datadog**

- **Datadog:** 600+ integrations
- **Better Stack:** 100+ integrations

**Mitigation:** We only need Next.js + Stripe + Supabase integrations (all supported).

#### 2. **No Built-in APM (Application Performance Monitoring)**

Better Stack focuses on logs, not detailed performance traces.

**Mitigation:** We use Vercel Analytics for performance monitoring. Better Stack handles errors/logs.

---

## Alternatives Considered

### Datadog
**Why we didn't choose it:** Too expensive ($150/month vs $25/month). Over-engineered for our scale.

### Sentry
**Why we didn't choose it:** Error tracking only. No log aggregation. Requires separate tool for logs.

### CloudWatch
**Why we didn't choose it:** AWS-only. Not compatible with Vercel deployment. Poor developer experience.

---

## Technical Implementation

### Setup

```typescript
// lib/logger.ts
import { createLogger } from '@logtail/next';

export const logger = createLogger({
  sourceToken: process.env.LOGTAIL_SOURCE_TOKEN!,
});

// Add custom context to all logs
logger.use((log) => ({
  ...log,
  environment: process.env.NODE_ENV,
  app: 'casaora',
}));
```

### Usage

```typescript
// Server Component
export async function BookingsPage() {
  logger.info('Fetching bookings');

  try {
    const bookings = await getBookings();
    logger.info('Bookings fetched', { count: bookings.length });
    return <BookingsList bookings={bookings} />;
  } catch (error) {
    logger.error('Failed to fetch bookings', { error });
    throw error;
  }
}

// API Route
export async function POST(request: Request) {
  const body = await request.json();

  logger.info('Webhook received', {
    endpoint: '/api/webhooks/stripe',
    payload: body,
  });

  // Process webhook...
}
```

---

## Success Metrics

1. **Observability**
   - 100% error capture rate
   - < 5 second log search time
   - Real-time log streaming

2. **Cost Efficiency**
   - < $50/month for 10GB logs
   - No usage surprises
   - Predictable billing

3. **Developer Experience**
   - < 30 second MTTR (mean time to resolution) for debugging
   - 100% team uses logs for debugging
   - Zero "can't find logs" complaints

---

## References

1. **Better Stack Documentation**
   https://betterstack.com/docs/logs/

2. **Logtail Next.js Integration**
   https://betterstack.com/docs/logs/next-js/

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-06 | 1.0.0 | Initial ADR created | Technical Leadership Team |

---

**Related ADRs:**
- [ADR-001: Why Next.js 16](./adr-001-why-nextjs-16.md)
