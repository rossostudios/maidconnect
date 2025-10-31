# Rate Limiting Setup Guide

This guide explains how to use the rate limiting system in MaidConnect to protect against abuse and ensure fair usage.

## What is Rate Limiting?

Rate limiting prevents abuse by limiting the number of requests a user can make within a time window. This helps protect against:
- Brute force attacks (password guessing)
- API abuse and scraping
- Denial of Service (DoS) attacks
- Spam (bookings, messages)

## How It Works

MaidConnect's rate limiting system automatically adapts to your environment:

- **Development**: Uses in-memory rate limiting (works out of the box, no setup)
- **Production**: Uses Upstash Redis (distributed, scales across servers)

## Development Setup (No Configuration Required)

In development, rate limiting works immediately with in-memory storage:

```bash
npm run dev
```

That's it! Rate limits are enforced using an in-memory store.

**Note**: In-memory limits reset when the server restarts and don't work across multiple server instances.

## Production Setup (Upstash Redis)

For production with multiple servers or Edge functions, use Upstash Redis:

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up for a free account (generous free tier)
3. Click **Create Database**
4. Select a region close to your users
5. Copy the **REST URL** and **REST Token**

### 2. Add Environment Variables

Add these to your `.env` file (or hosting platform):

```bash
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 3. Deploy

That's it! The rate limiter automatically detects Upstash and uses it.

You'll see this in the logs:
```
✓ Upstash Redis rate limiting initialized
```

## Usage

### Method 1: Middleware Wrapper (Recommended)

The easiest way to add rate limiting is using the `withRateLimit()` wrapper:

```typescript
import { withRateLimit } from "@/lib/rate-limit";

// Apply rate limiting to an API route
export const GET = withRateLimit(async (request: Request) => {
  // Your handler code
  return Response.json({ message: "Success" });
}, "api"); // Specify rate limit type: 'api', 'auth', 'booking', or 'messaging'
```

**Rate Limit Types:**
- `"api"` - General API endpoints (100 req/min) - **Default**
- `"auth"` - Authentication endpoints (10 req/min)
- `"booking"` - Booking creation (20 req/min)
- `"messaging"` - Messaging endpoints (30 req/min)

### Method 2: Manual Rate Limiting

For more control, use `rateLimit()` directly:

```typescript
import { rateLimit, createRateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Check rate limit
  const result = await rateLimit(request, "api");

  if (!result.success) {
    return createRateLimitResponse(result);
  }

  // Your handler code
  return Response.json({ message: "Success" });
}
```

### Method 3: Custom Rate Limits

For specific use cases, use the lower-level `checkRateLimit()`:

```typescript
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);

  const result = checkRateLimit(identifier, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    message: "Custom rate limit exceeded",
  });

  if (!result.allowed) {
    return Response.json(
      { error: result.message },
      { status: 429 }
    );
  }

  // Your handler code
}
```

## Rate Limit Configuration

### Default Limits

| Endpoint Type | Limit | Window | Use Case |
|--------------|-------|--------|----------|
| Auth | 10 req | 1 minute | Login, signup, password reset |
| Booking | 20 req | 1 minute | Creating/modifying bookings |
| Messaging | 30 req | 1 minute | Sending messages |
| API (General) | 100 req | 1 minute | Browsing, viewing data |

### Pre-configured Limiters

The `RateLimiters` object provides ready-to-use configurations:

```typescript
import { RateLimiters, checkRateLimit } from "@/lib/rate-limit";

// Strict auth limits (5 requests per 15 minutes)
checkRateLimit(identifier, RateLimiters.auth);

// Password reset (3 requests per hour)
checkRateLimit(identifier, RateLimiters.passwordReset);

// General API (100 requests per minute)
checkRateLimit(identifier, RateLimiters.api);

// Sensitive operations (2 requests per hour)
checkRateLimit(identifier, RateLimiters.sensitive);
```

## Examples

### Example 1: Protect Authentication Endpoint

```typescript
// src/app/api/auth/login/route.ts
import { withRateLimit } from "@/lib/rate-limit";

export const POST = withRateLimit(async (request: Request) => {
  const { email, password } = await request.json();

  // Login logic
  // ...

  return Response.json({ success: true });
}, "auth"); // 10 requests per minute
```

### Example 2: Protect Booking Creation

```typescript
// src/app/api/bookings/route.ts
import { withRateLimit } from "@/lib/rate-limit";

export const POST = withRateLimit(async (request: Request) => {
  const booking = await request.json();

  // Create booking
  // ...

  return Response.json({ bookingId: "123" });
}, "booking"); // 20 requests per minute
```

### Example 3: Protect Messaging

```typescript
// src/app/api/messages/route.ts
import { withRateLimit } from "@/lib/rate-limit";

export const POST = withRateLimit(async (request: Request) => {
  const { conversationId, text } = await request.json();

  // Send message
  // ...

  return Response.json({ messageId: "456" });
}, "messaging"); // 30 requests per minute
```

### Example 4: General API Endpoint

```typescript
// src/app/api/professionals/route.ts
import { withRateLimit } from "@/lib/rate-limit";

// Uses 'api' by default (100 req/min)
export const GET = withRateLimit(async (request: Request) => {
  // Fetch professionals
  const professionals = await fetchProfessionals();

  return Response.json({ professionals });
});
```

## Response Format

When rate limit is exceeded, clients receive a `429 Too Many Requests` response:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

**Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: ISO timestamp when limit resets
- `Retry-After`: Seconds until retry allowed

## Client Identification

Rate limits are applied per client, identified by:

1. **IP Address** (preferred):
   - `x-forwarded-for` header (Vercel, Cloudflare, etc.)
   - `x-real-ip` header (Nginx, etc.)

2. **Fallback**: User agent (less reliable)

**Note**: All requests from the same IP share the same rate limit.

## Testing Rate Limits

### Test in Development

```bash
# Make multiple requests quickly
for i in {1..15}; do
  curl http://localhost:3000/api/test
done
```

After 10 requests (for auth endpoints), you'll get:
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

### Monitor in Production

1. **Upstash Dashboard**: View rate limit analytics
   - Go to [Upstash Console](https://console.upstash.com/)
   - Select your database
   - View analytics for rate limit patterns

2. **Better Stack Logs**: Track rate limit violations
   - Search for "Rate limit exceeded"
   - Set up alerts for excessive violations

## Best Practices

### 1. Use Appropriate Limits

Choose rate limit types based on endpoint sensitivity:

```typescript
// ✅ Good: Strict limits for auth
export const POST = withRateLimit(handler, "auth");

// ❌ Bad: Lenient limits for auth
export const POST = withRateLimit(handler, "api");
```

### 2. Provide Clear Error Messages

Customize messages for better UX:

```typescript
const result = checkRateLimit(identifier, {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,
  message: "You can only request password reset 3 times per hour. Please check your email.",
});
```

### 3. Whitelist Internal Services

Don't rate limit internal API calls:

```typescript
export async function GET(request: Request) {
  // Skip rate limiting for internal services
  const isInternal = request.headers.get("x-internal-api-key") === process.env.INTERNAL_API_KEY;

  if (!isInternal) {
    const result = await rateLimit(request);
    if (!result.success) {
      return createRateLimitResponse(result);
    }
  }

  // Handler code
}
```

### 4. Log Rate Limit Violations

Track potential abuse:

```typescript
const result = await rateLimit(request, "auth");

if (!result.success) {
  await logger.warn("Rate limit exceeded", {
    identifier: getClientIdentifier(request),
    endpoint: request.url,
    remaining: result.remaining,
  });

  return createRateLimitResponse(result);
}
```

## Troubleshooting

### Rate Limits Not Working

1. **Check Environment Variables**: Ensure Upstash variables are set (production only)
2. **Check Logs**: Look for initialization messages
3. **Verify Endpoint**: Make sure you're using `withRateLimit()` or `rateLimit()`

### Too Strict / Too Lenient

Adjust limits in `src/lib/rate-limit.ts`:

```typescript
// Increase API limit from 100 to 200
api: new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "1 m"), // 200 requests per minute
  // ...
}),
```

### Rate Limits Resetting

**In Development**: This is expected - in-memory limits reset on server restart.

**In Production**: If using Upstash, limits persist across restarts.

### False Positives (Shared IPs)

If many users share an IP (e.g., corporate network):

1. Use authenticated user ID instead of IP
2. Increase limits for affected routes
3. Add IP whitelist for known corporate IPs

```typescript
const identifier = user?.id || getClientIdentifier(request);
```

## Cost

### Development
Free - uses in-memory storage

### Production (Upstash Redis)
- **Free Tier**: 10,000 commands/day
- **Paid**: $0.20 per 100,000 commands
- **Typical Usage**: ~1,000-5,000 commands/day for small app

## Migration Guide

### From No Rate Limiting

Add `withRateLimit()` to existing routes:

```typescript
// Before
export async function POST(request: Request) {
  // Handler
}

// After
export const POST = withRateLimit(async (request: Request) => {
  // Handler same
}, "api");
```

### From Custom Rate Limiting

Replace custom logic with `rateLimit()`:

```typescript
// Before (custom)
const count = await redis.incr(`ratelimit:${ip}`);
if (count > 100) {
  return Response.json({ error: "Too many requests" }, { status: 429 });
}

// After (built-in)
const result = await rateLimit(request);
if (!result.success) {
  return createRateLimitResponse(result);
}
```

## Resources

- [Upstash Rate Limiting Docs](https://upstash.com/docs/redis/features/ratelimiting)
- [Upstash Console](https://console.upstash.com/)
- [MDN: 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)

---

✅ Rate limiting is now configured and ready to protect your API!
