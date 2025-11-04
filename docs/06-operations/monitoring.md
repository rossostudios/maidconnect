# Monitoring & Logging Guide

Comprehensive monitoring and logging setup for Casaora using free/low-cost solutions.

## Overview

This guide covers two monitoring solutions:
1. **Better Stack (Recommended)** - Professional monitoring with alerts
2. **DIY Supabase Logger** - Free alternative for budget-conscious launch

## Solution 1: Better Stack (Logtail) - Recommended

Better Stack offers professional monitoring with a generous free tier (1GB/month, 7-day retention).

### Why Better Stack?
- Real-time error tracking and log management
- API performance monitoring
- Customizable alerts (email, Slack, PagerDuty)
- Advanced search and filtering
- Minimal performance impact

### Setup Instructions

#### 1. Create Account & Get Token

1. Go to [betterstack.com](https://betterstack.com/)
2. Sign up for free account
3. Navigate to **Logs** → **Sources** → **+ New Source**
4. Select **Next.js** as source type
5. Copy your **Source Token** (format: `BT_ABC123...`)

#### 2. Add Environment Variables

Add to your `.env` file:

```bash
# Server-side logging (API routes, server components)
LOGTAIL_SOURCE_TOKEN=your-logtail-source-token

# Client-side logging (browser errors)
NEXT_PUBLIC_LOGTAIL_TOKEN=your-logtail-source-token
```

**Note**: You can use the same token for both, or create separate sources for organization.

#### 3. Install Packages

```bash
npm install @logtail/node @logtail/winston @logtail/next
```

#### 4. Create Logger Utility

Create `src/lib/logger.ts`:

```typescript
import { Logtail } from "@logtail/node";
import { createLogger, format, transports } from "winston";
import { LogtailTransport } from "@logtail/winston";

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN || "");

export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new LogtailTransport(logtail),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// API route wrapper with automatic logging
export function withLogging(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request) => {
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;

    try {
      await logger.info(`${method} ${url} - Request received`);
      const response = await handler(request);
      const duration = Date.now() - startTime;

      await logger.info(`${method} ${url} - ${response.status}`, {
        duration,
        status: response.status
      });

      await logger.flush();
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      await logger.error(`${method} ${url} - Error`, error, { duration });
      await logger.flush();
      throw error;
    }
  };
}
```

#### 5. Server-Side Usage

```typescript
import { logger } from "@/lib/logger";

// Log errors with context
try {
  await createBooking();
} catch (error) {
  await logger.error("Booking creation failed", error, {
    userId: user.id,
    serviceId: service.id,
    amount: booking.amount
  });
  await logger.flush(); // Important in API routes!
}

// Log important events
await logger.info("User signed up", {
  userId: user.id,
  role: user.role,
  timestamp: new Date().toISOString()
});

// Log warnings
await logger.warn("Rate limit approaching", {
  ip: clientIp,
  remaining: rateLimit.remaining
});
```

#### 6. API Route Wrapper (Recommended)

```typescript
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async (request: Request) => {
  // Your handler code - automatic logging included!
  return Response.json({ success: true });
});

export const POST = withLogging(async (request: Request) => {
  const data = await request.json();
  // Process request...
  return Response.json({ data });
});
```

#### 7. Client-Side Usage

```typescript
"use client";

import { useLogger } from "@logtail/next";

export function MyComponent() {
  const logger = useLogger();

  const handleAction = async () => {
    try {
      await performAction();
    } catch (error) {
      logger?.error("Action failed", { error, userId: user.id });
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

#### 8. Global Error Boundary

Automatically catches all React errors (configure in `layout.tsx`):

```typescript
import { LogtailProvider } from "@logtail/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LogtailProvider token={process.env.NEXT_PUBLIC_LOGTAIL_TOKEN}>
          {children}
        </LogtailProvider>
      </body>
    </html>
  );
}
```

### Viewing Logs

1. Go to [logs.betterstack.com](https://logs.betterstack.com)
2. Navigate to **Logs** → **Live Tail**
3. View real-time log streaming

**Useful Features:**
- **Search**: Search by message, level, custom fields
- **Alerts**: Email/Slack alerts for critical errors
- **Dashboards**: Custom dashboards for key metrics
- **Integrations**: Connect Slack, PagerDuty, webhooks

### Log Levels

- `debug` - Development debugging (not sent in production)
- `info` - Informational messages (user actions, API calls)
- `warn` - Warning messages (rate limits, deprecations)
- `error` - Error messages (exceptions, failures)

---

## Solution 2: DIY Supabase Logger (Free Forever)

Completely free solution using Supabase itself for logging.

### Setup Steps

#### 1. Create Logs Table

```sql
CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  level TEXT NOT NULL, -- 'info', 'warn', 'error'
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes for faster queries
CREATE INDEX idx_logs_created_at ON public.application_logs(created_at DESC);
CREATE INDEX idx_logs_level ON public.application_logs(level);
CREATE INDEX idx_logs_user_id ON public.application_logs(user_id);

-- RLS policies (logs readable only by admins)
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs" ON public.application_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Service role can insert logs" ON public.application_logs
FOR INSERT
WITH CHECK (true);
```

#### 2. Create Logger Utility

Create `src/lib/supabase-logger.ts`:

```typescript
import { createSupabaseServerClient } from "./supabase/server-client";

type LogLevel = "info" | "warn" | "error";

export async function logToSupabase(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) {
  try {
    const supabase = await createSupabaseServerClient();

    await supabase.from("application_logs").insert({
      level,
      message,
      context: context || {},
      created_at: new Date().toISOString()
    });
  } catch (error) {
    // Fallback to console if Supabase logging fails
    console.error("Failed to log to Supabase:", error);
    console.log({ level, message, context });
  }
}
```

#### 3. Usage

```typescript
import { logToSupabase } from "@/lib/supabase-logger";

// Log errors
await logToSupabase("error", "Payment failed", {
  userId: user.id,
  bookingId: booking.id,
  amount: payment.amount,
  error: error.message
});

// Log important events
await logToSupabase("info", "User signed up", {
  userId: user.id,
  role: user.role
});
```

#### 4. Viewing Logs

Query via Supabase dashboard or create custom admin page:

```typescript
const { data: logs } = await supabase
  .from("application_logs")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(100);
```

---

## What to Monitor

### Critical Errors (Always Log)
- Authentication failures
- Payment processing errors
- Database connection failures
- API endpoint errors (5xx status codes)
- Booking creation/update failures
- Webhook processing failures

### Important Events (Log for Analytics)
- User signups (role, verification status)
- Booking completions
- Payout processing
- Account deletions
- Rate limit hits
- Professional verification status changes

### Performance Metrics (Optional)
- API response times
- Database query performance
- Third-party API latencies (Stripe, Supabase)
- Cache hit rates

---

## Best Practices

### 1. Include Rich Context

Always include relevant context for debugging:

```typescript
// ❌ Bad
await logger.error("Payment failed");

// ✅ Good
await logger.error("Payment failed", error, {
  userId: user.id,
  bookingId: booking.id,
  amount: 100,
  currency: "COP",
  stripePaymentIntentId: paymentIntent.id,
  timestamp: new Date().toISOString()
});
```

### 2. Never Log Sensitive Data

Never log:
- Credit card numbers
- Passwords or password hashes
- API keys or tokens
- Personal identification numbers (SSN, Cédula)
- Full address details (log IDs instead)

### 3. Use Structured Logging

Pass objects instead of strings for better searchability:

```typescript
// ❌ Bad
await logger.info(`User ${userId} booked service ${serviceId}`);

// ✅ Good
await logger.info("User booked service", {
  userId,
  serviceId,
  amount: booking.amount,
  scheduledDate: booking.scheduled_start
});
```

### 4. Always Flush in API Routes

In API routes and server actions, always call `flush()` before returning:

```typescript
export async function POST(request: Request) {
  try {
    await logger.info("Processing booking request");
    const booking = await createBooking(data);
    await logger.flush(); // Important!
    return Response.json({ booking });
  } catch (error) {
    await logger.error("Booking creation failed", error);
    await logger.flush(); // Important!
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
```

---

## Production Setup

### Better Stack Alerts

Configure alerts for critical errors:

1. Go to Better Stack → **Alerts** → **New Alert**
2. Set conditions:
   - **Trigger**: Error level = "error"
   - **Threshold**: Count > 10 in 5 minutes
3. Set notification channel (Email, Slack, PagerDuty)

### Recommended Alerts

- **Payment Failures**: error logs containing "payment failed"
- **Authentication Errors**: error logs containing "auth failed" or "unauthorized"
- **API Errors**: logs with status >= 500
- **Rate Limiting**: warn logs with "rate limit"

---

## Cost Comparison

| Solution | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Better Stack** | 1GB/month, 7-day retention | $10-20/mo | Production with alerts |
| **Supabase Logger** | ♾️ Unlimited | $0 forever | Budget-conscious startups |
| **Both Solutions** | Best of both worlds | $10/mo | Redundancy + alerts |

---

## Recommendation for Launch

**Use BOTH solutions strategically:**

- **Better Stack**: Log errors/warnings only (stays under 1GB free tier)
- **Supabase**: Log info messages and analytics
- **Cost**: $0/month initially
- **Upgrade**: Better Stack paid plan when you need advanced alerting

This gives you:
- ✅ Professional error tracking with alerts
- ✅ Unlimited analytics logging
- ✅ Redundancy if one service fails
- ✅ Zero cost until you scale

---

## Troubleshooting

### Logs Not Appearing in Better Stack

1. **Check Environment Variables**: Verify `LOGTAIL_SOURCE_TOKEN` is set
2. **Verify Token**: Check token is valid in Better Stack dashboard
3. **Check Network**: Ensure app can reach `https://in.logs.betterstack.com`
4. **Flush Logs**: Make sure you're calling `logger.flush()` in API routes
5. **Restart Server**: Restart dev server after adding environment variables

### Supabase Logs Not Inserting

1. **Check RLS Policies**: Verify service role can insert
2. **Check Table Schema**: Ensure table exists with correct columns
3. **Check Supabase Connection**: Test Supabase client connection
4. **Check Console**: Look for fallback console logs

---

## Next Steps

1. ✅ Choose monitoring solution (Both recommended for launch)
2. ✅ Create accounts and get credentials
3. ✅ Install packages (if using Better Stack)
4. ✅ Create logger utilities
5. ✅ Add logging to critical paths:
   - Authentication flows
   - Payment processing
   - Booking creation/updates
   - Webhook handlers
6. ✅ Test logging in development
7. ✅ Configure production alerts
8. ✅ Set up admin log viewer (for Supabase logs)
9. ✅ Deploy to production with environment variables

---

## Resources

- [Better Stack Documentation](https://betterstack.com/docs)
- [Better Stack Next.js Guide](https://betterstack.com/docs/logs/javascript/nextjs/)
- [Better Stack Dashboard](https://logs.betterstack.com/)
- [Supabase Logging Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#logging-and-monitoring)
- [Winston Logger Docs](https://github.com/winstonjs/winston)

---

✅ **Monitoring is now configured and ready for production!**
