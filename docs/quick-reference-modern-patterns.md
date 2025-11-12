# Quick Reference: Modern Node.js & Next.js Patterns

**For:** Casaora Development Team
**Last Updated:** 2025-11-11

---

## 🎯 TL;DR - What Changed

Your API routes now have **automatic request tracking** and **better observability** without any code changes needed!

```typescript
// ✅ Before: Manual context passing
async function myFunction(userId: string, requestId: string) {
  logger.info('Processing', { userId, requestId });
}

// ✅ After: Automatic context
async function myFunction() {
  logger.info('Processing'); // Automatically includes userId, requestId, duration!
}
```

---

## 🚀 Quick Start Examples

### 1. Creating a New API Route

```typescript
// src/app/api/my-endpoint/route.ts
import { withAuth, ok } from '@/lib/shared/api';
import { logger } from '@/lib/shared/logger';
import { trackApiPerformance } from '@/lib/shared/api-performance';

export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // ✨ Request context automatically initialized!
  // All logs include: requestId, userId, userEmail, userRole, duration, path, method

  const body = await request.json();

  // Log with automatic context
  await logger.info('Processing request', { action: 'create_booking' });
  // Logs: { message: 'Processing request', requestId: 'uuid', userId: 'user_1', action: 'create_booking', ... }

  // Your business logic
  const result = await createBooking(body);

  // Track performance (optional but recommended)
  await trackApiPerformance('POST /api/my-endpoint', {
    itemsCreated: 1
  });

  return ok(result);
});
```

### 2. Making External API Calls with Timeout

```typescript
import { fetchJSON } from '@/lib/shared/fetch-with-timeout';

// Simple GET
const data = await fetchJSON('https://api.example.com/data', {
  timeout: 5000 // 5 seconds
});

// POST with retries
const result = await fetchJSON('https://api.example.com/create', {
  method: 'POST',
  timeout: 10000,
  retries: 3,
  body: { name: 'Test' },
  headers: { 'Authorization': 'Bearer token' }
});
```

### 3. Tracking Performance

```typescript
// Option 1: Track entire request
await trackApiPerformance('POST /api/bookings', { bookingId: '123' });

// Option 2: Track database queries
const startTime = Date.now();
const { data } = await supabase.from('bookings').select('*');
await trackDatabaseQuery('SELECT', 'bookings', Date.now() - startTime);

// Option 3: Track external API calls
const startTime = Date.now();
const intent = await stripe.paymentIntents.create({...});
await trackExternalApiCall('Stripe', 'createPaymentIntent', Date.now() - startTime);

// Option 4: Use performance tracker
const tracker = createPerformanceTracker('complexOperation');
tracker.start();
await doComplexWork();
await tracker.stop({ itemsProcessed: 100 });
```

---

## 📖 Common Patterns

### Pattern 1: Authentication Required

```typescript
export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // user is guaranteed to exist
  // Context automatically includes userId, userEmail, userRole
  return ok({ userId: user.id });
});
```

### Pattern 2: Admin Only

```typescript
export const DELETE = withAdmin(async ({ user, supabase }, request: Request) => {
  // Only admins can reach here
  return ok({ deleted: true });
});
```

### Pattern 3: No Authentication

```typescript
import { NextResponse } from 'next/server';
import { createContextFromRequest, runWithContext } from '@/lib/shared/async-context';

export async function GET(request: Request) {
  // Manually initialize context for public routes
  const context = createContextFromRequest(request);

  return runWithContext(context, async () => {
    // Now all logs include requestId, path, method, etc.
    await logger.info('Public route accessed');
    return NextResponse.json({ success: true });
  });
}
```

### Pattern 4: Error Handling

```typescript
export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  try {
    const result = await riskyOperation();
    return ok(result);
  } catch (error) {
    // Error automatically logged with full context
    // Next.js will generate error digest
    throw error; // Don't swallow errors!
  }
});
```

---

## 🔍 Debugging Tips

### Finding Logs by Request ID

```bash
# In Better Stack
query: requestId = "123e4567-e89b-12d3-a456-426614174000"

# Find all logs for a specific user
query: userId = "user_abc123"

# Find slow requests
query: duration > 1000 AND event = "slow_request"
```

### Correlating Client and Server Errors

```bash
# User reports error on client
# Error page shows: Error ID: abc123

# Query Better Stack
query: digest = "abc123"

# Results show:
# 1. Server error that caused it
# 2. Client error report
# 3. All related logs with same requestId
```

### Performance Analysis

```bash
# Find slowest endpoints
group_by: path
aggregate: avg(duration)
sort: desc

# Find slow database queries
query: event = "slow_db_query"
group_by: table

# Find slow external APIs
query: event = "slow_external_api"
group_by: service
```

---

## ⚠️ Common Mistakes

### ❌ DON'T: Manually pass requestId

```typescript
// ❌ OLD WAY - Don't do this anymore
async function processBooking(bookingId: string, userId: string, requestId: string) {
  logger.info('Processing', { bookingId, userId, requestId });
}
```

### ✅ DO: Use automatic context

```typescript
// ✅ NEW WAY - Context automatic!
async function processBooking(bookingId: string) {
  logger.info('Processing', { bookingId }); // userId, requestId auto-included!
}
```

---

### ❌ DON'T: Use raw fetch without timeout

```typescript
// ❌ Can hang forever
const response = await fetch('https://slow-api.com/data');
```

### ✅ DO: Use fetchWithTimeout

```typescript
// ✅ Timeout + retries
const response = await fetchWithTimeout('https://slow-api.com/data', {
  timeout: 5000,
  retries: 2
});
```

---

### ❌ DON'T: Swallow errors

```typescript
// ❌ Error digest lost
try {
  await riskyOperation();
} catch (error) {
  console.error(error);
  return ok({ success: false }); // DON'T DO THIS
}
```

### ✅ DO: Let errors propagate

```typescript
// ✅ Error digest preserved
try {
  await riskyOperation();
} catch (error) {
  // Log if you want, but then throw
  await logger.error('Operation failed', error);
  throw error; // Important!
}
```

---

## 📊 Performance Budgets

### Recommended Thresholds

| Operation | Good | Warning | Critical |
|-----------|------|---------|----------|
| **API Route** | < 500ms | 500-1000ms | > 1000ms |
| **Database Query** | < 100ms | 100-500ms | > 500ms |
| **External API** | < 1s | 1-2s | > 2s |

### When You Hit a Warning

1. **Check logs** - Look for slow queries or external API calls
2. **Add tracking** - Use `trackDatabaseQuery()` and `trackExternalApiCall()`
3. **Optimize** - Add indexes, cache results, parallelize
4. **Monitor** - Set up alerts for repeated slow requests

---

## 🛠️ Utilities Available

### Context Utilities

```typescript
import {
  getRequestContext,
  getRequestId,
  getUserId,
  getRequestDuration,
  getContextMetadata,
  updateContext
} from '@/lib/shared/async-context';

// Get full context
const context = getRequestContext();

// Get specific values
const requestId = getRequestId();
const userId = getUserId();
const duration = getRequestDuration();

// Get all metadata for logging
const metadata = getContextMetadata();

// Update context (e.g., after authentication)
updateContext({ userId: user.id, userRole: 'admin' });
```

### Fetch Utilities

```typescript
import {
  fetchWithTimeout,
  fetchJSON,
  createTimeoutSignal,
  TimeoutError,
  RetryError
} from '@/lib/shared/fetch-with-timeout';

// Basic fetch with timeout
const response = await fetchWithTimeout(url, { timeout: 5000 });

// JSON fetch (typed)
type User = { id: string; name: string };
const user = await fetchJSON<User>(url);

// Create signal for other APIs
const signal = createTimeoutSignal(5000);
await someAPI.call({ signal });

// Handle timeout errors
try {
  await fetchWithTimeout(url, { timeout: 1000 });
} catch (error) {
  if (error instanceof TimeoutError) {
    // Handle timeout
  }
}
```

### Performance Utilities

```typescript
import {
  trackApiPerformance,
  trackDatabaseQuery,
  trackExternalApiCall,
  measurePerformance,
  createPerformanceTracker
} from '@/lib/shared/api-performance';

// Track API performance
await trackApiPerformance('POST /api/bookings');

// Track DB query
await trackDatabaseQuery('SELECT', 'bookings', duration);

// Track external API
await trackExternalApiCall('Stripe', 'createPaymentIntent', duration);

// Measure function performance
const result = await measurePerformance(
  () => expensiveOperation(),
  'expensiveOperation'
);

// Fine-grained tracking
const tracker = createPerformanceTracker('operation');
tracker.start();
// ... do work ...
await tracker.stop();
```

---

## 🎓 Best Practices

### 1. Always Use Middleware

```typescript
// ✅ DO: Use withAuth for authenticated routes
export const POST = withAuth(async ({ user, supabase }, request) => {
  // Context automatic, user guaranteed
});

// ❌ DON'T: Manually check auth
export async function POST(request: Request) {
  const user = await checkAuth(request); // Manual, no context
  if (!user) return unauthorized();
}
```

### 2. Log at Appropriate Levels

```typescript
// Debug - development only
await logger.debug('Cache hit', { key });

// Info - normal operations
await logger.info('Booking created', { bookingId });

// Warn - problems that don't break functionality
await logger.warn('Slow query detected', { duration: 1234 });

// Error - actual errors
await logger.error('Payment failed', error);
```

### 3. Track Performance Proactively

```typescript
// Track before issues arise
await trackApiPerformance('POST /api/bookings');

// Track specific operations
await trackDatabaseQuery('SELECT', 'bookings', duration);
await trackExternalApiCall('Stripe', 'createPaymentIntent', duration);
```

### 4. Use Timeouts for All External Calls

```typescript
// ✅ DO: Set reasonable timeouts
const response = await fetchWithTimeout(url, {
  timeout: 5000,    // 5 seconds
  retries: 2        // Retry twice
});

// ❌ DON'T: Use raw fetch for external APIs
const response = await fetch(url); // No timeout!
```

---

## 📝 Checklist for New API Routes

- [ ] Use `withAuth` or appropriate middleware
- [ ] Add performance tracking with `trackApiPerformance()`
- [ ] Use `fetchWithTimeout` for external APIs
- [ ] Add meaningful log messages
- [ ] Don't swallow errors (let them propagate)
- [ ] Test timeout handling
- [ ] Document expected performance (if critical)

---

## 🆘 Getting Help

### Questions?

1. Read full documentation: `docs/node24-nextjs16-modernization.md`
2. Check examples in existing API routes
3. Ask in #engineering Slack channel

### Found a Bug?

1. Check Better Stack logs using requestId
2. Look for error digest in logs
3. Report in GitHub Issues with requestId and digest

---

**Last Updated:** 2025-11-11
**Questions?** Ask the engineering team!