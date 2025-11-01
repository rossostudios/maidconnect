# Error Monitoring Setup Guide

**Service:** Better Stack (Logtail)
**Status:** ✅ Configured and Ready
**Last Updated:** 2025-10-31

## Overview

MaidConnect uses **Better Stack (Logtail)** for comprehensive error monitoring and logging across:
- ✅ Server-side API routes (Node.js runtime)
- ✅ Client-side React errors (Error Boundary)
- ✅ Edge Runtime (graceful fallback to console)
- ✅ Automatic request/response logging

---

## Setup Instructions

### 1. Get Better Stack Credentials

1. Sign up at [Better Stack](https://logs.betterstack.com/)
2. Create a new **Source** for your Next.js app
3. Copy the **Source Token**

### 2. Add to Environment Variables

Add to `.env.local` (development) and Vercel (production):

```bash
# Server-side logging (API routes, server components)
LOGTAIL_SOURCE_TOKEN=your_logtail_source_token_here

# Client-side logging (browser errors)
NEXT_PUBLIC_LOGTAIL_TOKEN=your_logtail_source_token_here
```

**Note:** You can use the **same token** for both server and client, or create separate sources for better organization.

### 3. Verify Setup

Run the test script:

```bash
# Test server-side logging
curl http://localhost:3000/api/test-logging

# Check console output - should see:
# ✓ Logtail enabled: true
# ✓ Runtime: nodejs
```

---

## Architecture

### Server-Side Logging (API Routes)

**File:** [src/lib/logger.ts](src/lib/logger.ts)

**Features:**
- Edge Runtime compatible (auto-detects runtime)
- Graceful degradation (falls back to console if no token)
- Structured logging with context
- Automatic flushing

**Usage:**

```typescript
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    await logger.info('Processing payment', {
      userId: user.id,
      amount: 10000
    });

    // Your code here

    await logger.info('Payment successful');
    await logger.flush(); // Important: flush before returning

    return NextResponse.json({ success: true });
  } catch (error) {
    await logger.error('Payment failed', error as Error, {
      userId: user.id,
      context: 'payment_processing'
    });
    await logger.flush();

    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
```

### Client-Side Logging (Error Boundary)

**File:** [src/components/error-boundary.tsx](src/components/error-boundary.tsx)

**Features:**
- Catches React errors
- Logs to Better Stack with context (URL, user agent, stack trace)
- Shows user-friendly error UI
- Displays error details in development mode

**Usage:**

Wrap your app with ErrorBoundary (already set up in layout):

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### API Route Logging Wrapper

**Usage:**

```typescript
import { withLogging } from '@/lib/logger';

async function handlePOST(request: Request) {
  // Your handler code
  return NextResponse.json({ success: true });
}

// Automatically logs requests, responses, and errors
export const POST = withLogging(handlePOST, 'api/bookings');
```

**Automatically logs:**
- Request method, URL, headers
- Response status, duration
- Errors with full context

---

## Log Levels

### Available Levels

| Level | Usage | Example |
|-------|-------|---------|
| `debug` | Development only | `logger.debug('Cache hit', { key: 'user:123' })` |
| `info` | General information | `logger.info('User logged in', { userId })` |
| `warn` | Warning conditions | `logger.warn('High rate limit usage', { remaining: 2 })` |
| `error` | Error events | `logger.error('Payment failed', error, { userId })` |

### When to Use Each Level

**debug:**
- Cache hits/misses
- Performance measurements
- Development debugging
- **Not sent to Logtail in production**

**info:**
- User actions (login, logout, booking created)
- Successful API calls
- System events (cron jobs completed)

**warn:**
- Rate limit near threshold
- Deprecated API usage
- Non-critical failures
- Retry attempts

**error:**
- Payment failures
- Database errors
- Authentication failures
- Unhandled exceptions

---

## Structured Logging

### Best Practices

Always include context with logs:

```typescript
// ❌ Bad - No context
await logger.error('Payment failed');

// ✅ Good - Rich context
await logger.error('Payment failed', error, {
  userId: user.id,
  bookingId: booking.id,
  amount: 50000,
  currency: 'COP',
  stripeError: stripeError.code,
  timestamp: new Date().toISOString()
});
```

### Searchable Fields

Better Stack allows searching by context fields:

```typescript
// Log with searchable fields
await logger.info('Booking created', {
  bookingId: booking.id,
  customerId: customer.id,
  professionalId: professional.id,
  amount: 50000,
  status: 'pending'
});

// Then search in Better Stack:
// bookingId:abc-123
// status:pending
// amount:>40000
```

---

## Common Use Cases

### 1. API Route Error Tracking

```typescript
import { logger, withLogging } from '@/lib/logger';

async function handleDELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    await logger.warn('Unauthorized deletion attempt', {
      ip: request.headers.get('x-forwarded-for'),
      url: request.url
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete logic
    await logger.info('Account deleted', { userId: user.id });
    await logger.flush();
    return NextResponse.json({ success: true });
  } catch (error) {
    await logger.error('Account deletion failed', error as Error, {
      userId: user.id
    });
    await logger.flush();
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}

export const DELETE = withLogging(handleDELETE, 'api/account/delete');
```

### 2. Payment Processing Errors

```typescript
try {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'cop',
    customer: customerId
  });

  await logger.info('Payment intent created', {
    paymentIntentId: paymentIntent.id,
    amount,
    customerId
  });

} catch (stripeError) {
  await logger.error('Stripe payment intent creation failed', stripeError as Error, {
    amount,
    customerId,
    stripeErrorCode: (stripeError as any).code,
    stripeErrorType: (stripeError as any).type
  });
  throw stripeError;
}
```

### 3. Database Query Errors

```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert({ customer_id: userId, ... })
  .select()
  .single();

if (error) {
  await logger.error('Database insert failed', new Error(error.message), {
    table: 'bookings',
    operation: 'insert',
    userId,
    postgresCode: error.code,
    details: error.details
  });
  return NextResponse.json({ error: 'Database error' }, { status: 500 });
}
```

### 4. Cron Job Monitoring

```typescript
export async function GET(request: Request) {
  const startTime = Date.now();

  await logger.info('Cron job started', {
    job: 'auto-decline-bookings',
    scheduledTime: new Date().toISOString()
  });

  try {
    // Process bookings
    const processedCount = await autoDeclineExpiredBookings();

    const duration = Date.now() - startTime;
    await logger.info('Cron job completed', {
      job: 'auto-decline-bookings',
      processedCount,
      duration,
      success: true
    });

    return NextResponse.json({ success: true, processedCount });
  } catch (error) {
    const duration = Date.now() - startTime;
    await logger.error('Cron job failed', error as Error, {
      job: 'auto-decline-bookings',
      duration
    });
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
```

---

## Better Stack Dashboard

### Viewing Logs

1. Go to [Better Stack Logs](https://logs.betterstack.com/)
2. Select your source (e.g., "MaidConnect Production")
3. Use the query builder to filter logs:
   - `level:error` - Show only errors
   - `userId:abc-123` - Show logs for specific user
   - `bookingId:*` - Show all booking-related logs
   - `duration:>5000` - Show slow requests (>5s)

### Setting Up Alerts

**Recommended Alerts:**

1. **High Error Rate**
   - Trigger: More than 10 errors in 5 minutes
   - Action: Send Slack notification + email

2. **Payment Failures**
   - Trigger: Any log with `level:error` and `Stripe` in message
   - Action: Immediate Slack alert

3. **Database Errors**
   - Trigger: Logs containing `Database error`
   - Action: Email to DevOps team

4. **Slow API Responses**
   - Trigger: `duration:>10000` (>10 seconds)
   - Action: Weekly summary email

### Creating Dashboards

Create custom dashboards for:
- Error rates by route
- Average response times
- User activity patterns
- Payment success/failure rates

---

## Performance Considerations

### Automatic Flushing

Logtail uses **batching** for performance. Always flush before returning:

```typescript
await logger.info('Processing complete');
await logger.flush(); // Critical: ensures logs are sent before response
return NextResponse.json({ success: true });
```

### Edge Runtime

Edge Runtime **cannot** use Node.js Logtail. Logs will:
- Still appear in console (for debugging)
- Not be sent to Better Stack
- Automatically fallback without errors

**Solution:** Use Node.js runtime for routes that need logging:

```typescript
// Force Node.js runtime for this route
export const runtime = 'nodejs';
```

---

## Security Best Practices

### Never Log Sensitive Data

❌ **DO NOT LOG:**
- Passwords
- API keys
- Stripe secret keys
- Full credit card numbers
- Social security numbers
- Personal health information

✅ **SAFE TO LOG:**
- User IDs (hashed if needed)
- Payment intent IDs
- Booking IDs
- Error messages
- Request URLs (without sensitive params)

### Example - Sanitizing Logs

```typescript
// ❌ Bad - Logs sensitive data
await logger.info('User login', {
  email: user.email,
  password: password // NEVER LOG THIS
});

// ✅ Good - Sanitized
await logger.info('User login', {
  userId: user.id,
  email: maskEmail(user.email), // e.g., "j***@example.com"
  loginMethod: 'password',
  ipAddress: request.headers.get('x-forwarded-for')
});
```

---

## Troubleshooting

### Logs Not Appearing in Better Stack

**Check:**
1. Environment variable is set: `echo $LOGTAIL_SOURCE_TOKEN`
2. Token is correct (check Better Stack dashboard)
3. Runtime is Node.js (not Edge): Add `export const runtime = 'nodejs';`
4. Logs are being flushed: Call `await logger.flush()`

**Test:**
```typescript
import { logger, getRuntimeInfo } from '@/lib/logger';

export async function GET() {
  const info = getRuntimeInfo();
  await logger.info('Test log', info);
  await logger.flush();
  return NextResponse.json(info);
}
```

### High Logging Costs

Better Stack charges based on **log volume**. To reduce costs:

1. **Use appropriate log levels:**
   - Don't use `info` for every request (use `withLogging` wrapper instead)
   - Use `debug` sparingly (disabled in production)

2. **Sample high-volume logs:**
   ```typescript
   // Only log 10% of successful requests
   if (Math.random() < 0.1) {
     await logger.info('Request successful', { ... });
   }
   ```

3. **Set retention policies:**
   - Configure in Better Stack dashboard
   - Keep errors for 90 days
   - Keep info logs for 30 days

---

## Next Steps

1. ✅ Environment variables configured
2. ✅ Logtail re-enabled in logger.ts
3. ⚠️ **TODO:** Add `withLogging()` to critical API routes
4. ⚠️ **TODO:** Set up Better Stack alerts
5. ⚠️ **TODO:** Create monitoring dashboards

---

## Resources

- [Better Stack Documentation](https://betterstack.com/docs/logs/)
- [Logtail Node.js SDK](https://github.com/logtail/logtail-js/tree/master/packages/node)
- [Logtail Next.js Integration](https://github.com/logtail/logtail-js/tree/master/packages/next)
- [MaidConnect Logger Source Code](src/lib/logger.ts)

---

**Prepared by:** Development Team
**Last Review:** 2025-10-31
