# Better Stack (Logtail) Setup Guide

This guide explains how to set up and use Better Stack (formerly Logtail) for error tracking and monitoring in MaidConnect.

## What is Better Stack?

Better Stack is a modern error tracking and log management service that helps you:
- Track errors and exceptions in real-time
- Monitor API performance and response times
- Get alerts when critical errors occur
- Debug production issues faster

## Setup Instructions

### 1. Create a Better Stack Account

1. Go to [Better Stack](https://betterstack.com/)
2. Sign up for a free account
3. Create a new "Logs" source for your Next.js application

### 2. Get Your Source Token

1. In Better Stack dashboard, navigate to **Logs** → **Sources**
2. Click **+ New Source**
3. Select **Next.js** as the source type
4. Copy the **Source Token** (it looks like: `BT_ABC123...`)

### 3. Add Environment Variables

Add the following to your `.env` file:

```bash
# Server-side logging (API routes, server components)
LOGTAIL_SOURCE_TOKEN=your-logtail-source-token

# Client-side logging (browser errors)
NEXT_PUBLIC_LOGTAIL_TOKEN=your-logtail-source-token
```

**Note**: You can use the same token for both server and client, or create separate sources for better organization.

### 4. Restart Your Development Server

```bash
npm run dev
```

That's it! Better Stack is now configured and will automatically:
- Catch and log all React errors via the Error Boundary
- Log API route requests and responses (when using `withLogging()`)
- Track client-side errors

## Usage

### Server-Side Logging (API Routes, Server Components)

```typescript
import { logger } from "@/lib/logger";

// In an API route or server component
await logger.info("User logged in", { userId: "123" });
await logger.warn("Rate limit approaching", { remaining: 5 });
await logger.error("Payment failed", new Error("Stripe error"), { orderId: "abc" });

// IMPORTANT: Flush logs before returning
await logger.flush();
```

### API Route Wrapper (Recommended)

Use the `withLogging()` wrapper to automatically log all requests, responses, and errors:

```typescript
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async (request: Request) => {
  // Your handler code
  return Response.json({ success: true });
});
```

This automatically logs:
- Request method, URL, headers
- Response status, duration
- Any errors thrown

### Client-Side Logging (Browser)

```typescript
"use client";

import { useLogger } from "@logtail/next";

export function MyComponent() {
  const logger = useLogger();

  const handleClick = async () => {
    try {
      // Your code
    } catch (error) {
      logger?.error("Button click failed", { error });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Error Boundary

The global Error Boundary (`<ErrorBoundary>`) automatically catches all React errors and logs them to Better Stack. No additional setup needed!

## Viewing Logs

1. Go to Better Stack dashboard
2. Navigate to **Logs** → **Live Tail**
3. You'll see logs streaming in real-time

### Useful Features

- **Search**: Search logs by message, level, or custom fields
- **Alerts**: Set up alerts for critical errors (e.g., email when payment fails)
- **Dashboards**: Create custom dashboards to monitor key metrics
- **Integrations**: Connect to Slack, PagerDuty, etc.

## Log Levels

Better Stack supports 4 log levels:

- `debug` - Development debugging (not sent in production)
- `info` - Informational messages (user actions, API calls)
- `warn` - Warning messages (rate limits, deprecations)
- `error` - Error messages (exceptions, failures)

## Best Practices

### 1. Include Context

Always include relevant context with your logs:

```typescript
// ❌ Bad
await logger.error("Payment failed");

// ✅ Good
await logger.error("Payment failed", error, {
  userId: user.id,
  amount: 100,
  currency: "USD",
  bookingId: booking.id,
});
```

### 2. Don't Log Sensitive Data

Never log:
- Credit card numbers
- Passwords
- API keys
- Personal identification numbers (SSN, etc.)

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
});
```

### 4. Always Flush

In API routes and server components, always call `flush()` before returning:

```typescript
export async function GET(request: Request) {
  try {
    await logger.info("Processing request");
    const data = await fetchData();
    await logger.flush(); // Important!
    return Response.json(data);
  } catch (error) {
    await logger.error("Request failed", error);
    await logger.flush(); // Important!
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
```

## Troubleshooting

### Logs Not Appearing

1. **Check Environment Variables**: Ensure `LOGTAIL_SOURCE_TOKEN` is set correctly
2. **Verify Token**: Check that the token is valid in Better Stack dashboard
3. **Check Network**: Ensure your app can reach `https://in.logs.betterstack.com`
4. **Flush Logs**: Make sure you're calling `logger.flush()` in API routes

### Error Boundary Not Working

1. **Check Provider**: Ensure `<LogtailProvider>` is wrapping your app in `layout.tsx`
2. **Client Token**: Verify `NEXT_PUBLIC_LOGTAIL_TOKEN` is set
3. **Restart Server**: Restart the dev server after adding environment variables

### Performance Impact

Better Stack is designed for production use with minimal performance impact:
- Logs are sent asynchronously
- Batching reduces network requests
- Automatic rate limiting prevents overload

## Production Deployment

When deploying to production:

1. **Add Environment Variables**: Add `LOGTAIL_SOURCE_TOKEN` and `NEXT_PUBLIC_LOGTAIL_TOKEN` to your hosting provider (Vercel, AWS, etc.)

2. **Set Up Alerts**: Configure alerts for critical errors
   - Payment failures
   - Authentication errors
   - API errors (5xx status codes)

3. **Monitor Performance**: Track API response times and slow queries

4. **Review Logs Regularly**: Check logs daily for warnings and errors

## Cost

Better Stack offers a generous free tier:
- 1 GB log storage per month
- 7 days retention
- Unlimited team members

Paid plans start at $10/month for more storage and retention.

## Resources

- [Better Stack Documentation](https://betterstack.com/docs)
- [Next.js Integration Guide](https://betterstack.com/docs/logs/javascript/nextjs/)
- [Better Stack Dashboard](https://logs.betterstack.com/)

## Support

If you encounter issues:
1. Check the [Better Stack documentation](https://betterstack.com/docs)
2. Contact Better Stack support via their dashboard
3. Ask in the MaidConnect team Slack

---

✅ Better Stack is now configured and ready to use!
