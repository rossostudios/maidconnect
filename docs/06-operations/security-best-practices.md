# Security Best Practices

Comprehensive security guide for MaidConnect covering rate limiting, content security policy, and operational security.

## Table of Contents
1. [Rate Limiting](#rate-limiting)
2. [Content Security Policy (CSP)](#content-security-policy-csp)
3. [Environment Variables & Secrets](#environment-variables--secrets)
4. [Authentication Security](#authentication-security)
5. [Database Security](#database-security)
6. [API Security](#api-security)
7. [Dependency Management](#dependency-management)

---

## Rate Limiting

Protect against abuse and ensure fair usage by limiting request rates.

### What is Rate Limiting?

Rate limiting prevents abuse by limiting the number of requests a user can make within a time window. This protects against:
- Brute force attacks (password guessing)
- API abuse and scraping
- Denial of Service (DoS) attacks
- Spam (bookings, messages)

### How It Works

MaidConnect's rate limiting adapts to your environment:
- **Development**: In-memory rate limiting (no setup required)
- **Production**: Upstash Redis (distributed, scales across servers)

### Development Setup (Zero Configuration)

```bash
npm run dev
```

That's it! In-memory rate limits work out of the box.

**Note**: In-memory limits reset on server restart and don't work across multiple instances.

### Production Setup (Upstash Redis)

#### 1. Create Upstash Redis Database

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Sign up for free account (generous free tier: 10,000 commands/day)
3. Click **Create Database**
4. Select region close to your users
5. Copy **REST URL** and **REST Token**

#### 2. Add Environment Variables

```bash
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

#### 3. Deploy

The rate limiter automatically detects Upstash and uses it. You'll see:
```
✓ Upstash Redis rate limiting initialized
```

### Usage

#### Method 1: Middleware Wrapper (Recommended)

```typescript
import { withRateLimit } from "@/lib/rate-limit";

// Apply rate limiting to an API route
export const POST = withRateLimit(async (request: Request) => {
  // Your handler code
  return Response.json({ success: true });
}, "auth"); // Specify type: 'api', 'auth', 'booking', or 'messaging'
```

**Rate Limit Types:**
- `"api"` - General API endpoints (100 req/min) - **Default**
- `"auth"` - Authentication endpoints (10 req/min)
- `"booking"` - Booking creation (20 req/min)
- `"messaging"` - Messaging endpoints (30 req/min)

#### Method 2: Manual Rate Limiting

```typescript
import { rateLimit, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const result = await rateLimit(request, "auth");

  if (!result.success) {
    return createRateLimitResponse(result);
  }

  // Your handler code
  return Response.json({ success: true });
}
```

#### Method 3: Custom Rate Limits

```typescript
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);

  const result = checkRateLimit(identifier, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    message: "Password reset limit exceeded",
  });

  if (!result.allowed) {
    return Response.json({ error: result.message }, { status: 429 });
  }

  // Your handler code
}
```

### Rate Limit Configuration

| Endpoint Type | Limit | Window | Use Case |
|--------------|-------|--------|----------|
| Auth | 10 req | 1 minute | Login, signup, password reset |
| Booking | 20 req | 1 minute | Creating/modifying bookings |
| Messaging | 30 req | 1 minute | Sending messages |
| API (General) | 100 req | 1 minute | Browsing, viewing data |

### Examples

**Protect Authentication:**
```typescript
// src/app/api/auth/login/route.ts
export const POST = withRateLimit(async (request: Request) => {
  const { email, password } = await request.json();
  // Login logic...
  return Response.json({ success: true });
}, "auth");
```

**Protect Booking Creation:**
```typescript
// src/app/api/bookings/route.ts
export const POST = withRateLimit(async (request: Request) => {
  const booking = await request.json();
  // Create booking...
  return Response.json({ bookingId: "123" });
}, "booking");
```

### Rate Limit Response Format

When exceeded, clients receive `429 Too Many Requests`:

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

### Best Practices

**1. Use Appropriate Limits**
```typescript
// ✅ Good: Strict limits for sensitive endpoints
export const POST = withRateLimit(handler, "auth");

// ❌ Bad: Lenient limits for auth
export const POST = withRateLimit(handler, "api");
```

**2. Provide Clear Error Messages**
```typescript
const result = checkRateLimit(identifier, {
  maxRequests: 3,
  windowMs: 3600000, // 1 hour
  message: "You can only request password reset 3 times per hour.",
});
```

**3. Whitelist Internal Services**
```typescript
const isInternal = request.headers.get("x-internal-api-key") === process.env.INTERNAL_API_KEY;
if (!isInternal) {
  const result = await rateLimit(request);
  if (!result.success) return createRateLimitResponse(result);
}
```

**4. Log Rate Limit Violations**
```typescript
if (!result.success) {
  await logger.warn("Rate limit exceeded", {
    identifier: getClientIdentifier(request),
    endpoint: request.url,
  });
  return createRateLimitResponse(result);
}
```

---

## Content Security Policy (CSP)

Prevent XSS attacks and unauthorized script execution with Content Security Policy.

### Current CSP Status

- ✅ Removed `unsafe-eval` from production
- ✅ CSP includes all necessary domains (Stripe, Supabase, Google Maps, Better Stack, Upstash)
- ⚠️ Still using `unsafe-inline` for script-src (compatibility requirement)

### Configured Domains

The CSP allows scripts from:
- `https://js.stripe.com` - Stripe payment processing
- `https://*.supabase.co` - Supabase backend
- `https://maps.googleapis.com` - Google Maps
- `https://in.logs.betterstack.com` - Better Stack logging
- `https://*.upstash.io` - Upstash Redis

### Future Enhancement: Nonce-Based CSP

To remove `unsafe-inline` and improve security:

#### Approach 1: Nonce-Based CSP (Recommended)

**Requirements:**
1. Generate unique nonce per request in middleware
2. Pass nonce through headers/context
3. Use `next/script` with nonce prop for all inline scripts
4. Update CSP to use nonce instead of 'unsafe-inline'

**Implementation:**

```typescript
// 1. Middleware to generate nonce
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export function middleware(request: Request) {
  const nonce = crypto.randomBytes(16).toString('base64');
  const response = NextResponse.next();
  response.headers.set('x-nonce', nonce);
  return response;
}

// 2. Update CSP headers
script-src 'self' 'nonce-${nonce}' https://js.stripe.com ...;

// 3. Use Script component with nonce
<Script
  id="json-ld"
  type="application/ld+json"
  nonce={nonce}
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

#### Approach 2: Hash-Based CSP (Simpler for Static Content)

For JSON-LD scripts that don't change per request:

```bash
# Generate hash
echo -n '<script>YOUR_SCRIPT_HERE</script>' | openssl dgst -sha256 -binary | openssl base64

# Add to CSP
script-src 'self' 'sha256-HASH_HERE' ...;
```

### Inline Scripts Requiring Attention

**JSON-LD structured data** in 6 product pages (SEO metadata):
- `/product/payment-processing/page.tsx`
- `/product/booking-platform/page.tsx`
- `/product/secure-messaging/page.tsx`
- `/product/admin-dashboard/page.tsx`
- `/product/professional-profiles/page.tsx`
- `/product/reviews-ratings/page.tsx`

### Implementation Priority

**Priority**: Medium (Week 3-4 of roadmap)

**Rationale**:
- Already removed highest-risk directive (`unsafe-eval`)
- All CSP domains properly configured
- Nonce implementation is complex and could break integrations
- Focus on higher-ROI features first

---

## Environment Variables & Secrets

Proper handling of sensitive configuration and secrets.

### Secrets Management

**Never commit secrets to Git:**
- API keys
- Database credentials
- JWT secrets
- Stripe keys
- OAuth client secrets

**Use `.env` files locally:**
```bash
# .env (never commit!)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Use environment variables in production:**
- Vercel: Project Settings → Environment Variables
- AWS: Systems Manager Parameter Store
- Docker: Kubernetes Secrets or docker-compose env files

### Required Environment Variables

See [deployment-guide.md](../05-deployment/deployment-guide.md) for complete list.

**Critical Variables:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public client key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access key (server-only!)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature
- `NEXTAUTH_SECRET` - NextAuth session encryption key

### Best Practices

**1. Separate Dev/Staging/Prod:**
```bash
# Development
STRIPE_SECRET_KEY=sk_test_...

# Production
STRIPE_SECRET_KEY=sk_live_...
```

**2. Use Different Keys Per Environment:**
- Development: Test Stripe keys, sandbox Supabase
- Staging: Test keys, separate Supabase project
- Production: Live keys, production Supabase

**3. Rotate Secrets Regularly:**
- Rotate API keys every 90 days
- Rotate database passwords every 180 days
- Rotate after team member departure

**4. Validate Environment Variables at Startup:**
```typescript
// src/lib/config.ts
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

---

## Authentication Security

Secure user authentication and session management.

### Supabase Auth Best Practices

**1. Use Row Level Security (RLS):**
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

**2. Validate Auth on Server:**
```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Proceed with authenticated request
}
```

**3. Never Trust Client-Side Auth:**
```typescript
// ❌ Bad: Trusting client session
const session = await supabase.auth.getSession();
const user = session.data.session?.user; // Could be tampered!

// ✅ Good: Verify with server
const { data: { user } } = await supabase.auth.getUser(); // Verified by server
```

**4. Implement Email Verification:**
```typescript
// Require email verification before account activation
const { data: user } = await supabase.auth.getUser();
if (!user.email_confirmed_at) {
  return Response.json({ error: "Email not verified" }, { status: 403 });
}
```

**5. Use Multi-Factor Authentication (MFA):**
```typescript
// Enable MFA for professionals and admins
await supabase.auth.mfa.enroll({ factorType: 'totp' });
```

### Password Security

**1. Enforce Strong Passwords:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

**2. Implement Password Reset Flow:**
- Send reset link via email
- Expire reset tokens after 1 hour
- Rate limit reset requests (3 per hour max)

**3. Detect Compromised Passwords:**
- Check against Have I Been Pwned API
- Reject common passwords (password123, etc.)

---

## Database Security

Protect sensitive user data in Supabase.

### Row Level Security (RLS)

**Always enable RLS on all tables:**

```sql
-- Profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users see only their own profile
CREATE POLICY "Users view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users update only their own profile
CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins see all profiles
CREATE POLICY "Admins view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Service Role Key Protection

**Never expose service role key to client:**

```typescript
// ❌ Bad: Service key in client component
"use client";
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ✅ Good: Service key only in server components/API routes
// src/app/api/admin/route.ts
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
```

### Data Encryption

**1. Encrypt Sensitive Fields:**
- Credit card tokens (use Stripe, never store raw cards)
- Government IDs (Cédula numbers)
- Personal addresses

**2. Use Supabase Vault (Encrypted Secrets):**
```sql
-- Store encrypted API keys
INSERT INTO vault.secrets (name, secret)
VALUES ('stripe_secret_key', 'sk_live_...');

-- Retrieve in functions
SELECT decrypted_secret FROM vault.decrypted_secrets
WHERE name = 'stripe_secret_key';
```

---

## API Security

Secure API endpoints and prevent unauthorized access.

### Authentication & Authorization

**1. Verify Auth on Every Request:**
```typescript
export async function GET(request: Request) {
  const { user, error } = await getAuthUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Proceed...
}
```

**2. Implement Role-Based Access Control (RBAC):**
```typescript
export async function DELETE(request: Request) {
  const { user } = await getAuthUser(request);

  // Only admins can delete
  if (user.role !== 'admin') {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with deletion...
}
```

### Input Validation

**1. Validate All Input:**
```typescript
import { z } from "zod";

const bookingSchema = z.object({
  service_id: z.string().uuid(),
  scheduled_start: z.string().datetime(),
  amount: z.number().positive().max(10000000), // 10M COP max
});

export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  const result = bookingSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  // Proceed with validated data
}
```

**2. Sanitize HTML Output:**
```typescript
import DOMPurify from "isomorphic-dompurify";

const sanitizedHTML = DOMPurify.sanitize(userInput);
```

### API Rate Limiting

Apply appropriate rate limits to all endpoints (see [Rate Limiting](#rate-limiting) section).

---

## Dependency Management

Keep dependencies secure and up-to-date.

### Audit Dependencies Regularly

```bash
# Check for known vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# View dependency tree
npm ls
```

### Automated Dependency Updates

**1. Enable Dependabot (GitHub):**
- Go to Repository Settings → Security → Dependabot
- Enable "Dependabot security updates"
- Enable "Dependabot version updates"

**2. Review Updates Weekly:**
- Check Dependabot PRs
- Test updates in staging
- Merge after verification

### Pinning Critical Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "2.39.0", // Exact version
    "stripe": "^14.0.0" // Allow patch updates
  }
}
```

### Monitor for CVEs

- Subscribe to security advisories for critical packages
- Monitor [GitHub Security Advisories](https://github.com/advisories)
- Use [Snyk](https://snyk.io/) or [Socket Security](https://socket.dev/)

---

## Security Checklist

### Pre-Launch Security Checklist

- [ ] **Rate limiting** enabled on all API routes
- [ ] **RLS policies** created for all database tables
- [ ] **Environment variables** properly configured (no secrets in code)
- [ ] **HTTPS** enforced in production
- [ ] **CSP headers** configured (no `unsafe-eval`)
- [ ] **Authentication** verified on server for all protected routes
- [ ] **Input validation** implemented on all API endpoints
- [ ] **Error messages** don't leak sensitive information
- [ ] **Dependencies** audited (no known vulnerabilities)
- [ ] **Logging** configured (errors tracked, no sensitive data logged)
- [ ] **Stripe webhooks** verified with signatures
- [ ] **Password reset** flow tested and rate-limited
- [ ] **Email verification** required for new accounts
- [ ] **Admin panel** restricted to admin role only
- [ ] **Service role key** never exposed to client
- [ ] **Backup strategy** in place for database

### Ongoing Security Maintenance

- [ ] **Weekly**: Review Dependabot PRs
- [ ] **Monthly**: Run npm audit and fix vulnerabilities
- [ ] **Quarterly**: Rotate API keys and secrets
- [ ] **Quarterly**: Review and update RLS policies
- [ ] **Annually**: Security audit by external firm (when funded)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers#security-headers)
- [Stripe Security](https://stripe.com/docs/security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)

---

✅ **Security best practices implemented and ready for production!**
