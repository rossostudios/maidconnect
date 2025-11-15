# Nonce-Based CSP Implementation for Next.js 16 - Research Summary

**Epic H-1.1: Research nonce-based CSP implementation**
**Date:** 2025-01-14
**Status:** ✅ Complete

## Overview

This document summarizes research on implementing nonce-based Content Security Policy (CSP) in Next.js 16 (App Router) to replace `'unsafe-inline'` directives and strengthen security.

## What is Nonce-Based CSP?

A **nonce** (number used once) is a random cryptographic token generated per-request that allows specific inline scripts and styles to execute while blocking all others. This approach provides strong XSS protection without relying on `'unsafe-inline'`.

### Benefits over 'unsafe-inline':
- ✅ Blocks unauthorized inline scripts (XSS attacks)
- ✅ Allows legitimate inline scripts with nonce attribute
- ✅ Works with dynamic content (via `'strict-dynamic'`)
- ✅ Better security posture for compliance (SOC 2, GDPR)

## Next.js 16 (App Router) Implementation Pattern

### 1. Middleware: Generate Nonce & Set CSP Headers

**File:** `middleware.ts` (project root)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate cryptographically secure random nonce
  const nonce = crypto.randomUUID(); // or crypto.randomBytes(16).toString('base64')

  // Build CSP policy with nonce
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https://www.google-analytics.com https://*.posthog.com;
    img-src 'self' data: https://www.google-analytics.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Clone request headers and add nonce + CSP
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce); // Custom header for Server Components
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // Create response with modified headers
  const response = NextResponse.next({
    request: { headers: requestHeaders }
  });

  // Set CSP header in response (browser enforcement)
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

// Middleware matcher - exclude static files and Next.js internals
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
```

### 2. Server Components: Access Nonce

**Server Components** can access the nonce from headers:

```typescript
import { headers } from 'next/headers';
import Script from 'next/script';

export default async function Page() {
  const nonce = (await headers()).get('x-nonce') as string;

  return (
    <>
      <h1>My Page</h1>

      {/* Next.js Script component with nonce */}
      <Script
        src="https://www.googletagmanager.com/gtag/js"
        strategy="afterInteractive"
        nonce={nonce}
      />

      {/* Inline script with nonce */}
      <script nonce={nonce} dangerouslySetInnerHTML={{
        __html: `
          console.log('Inline script with nonce');
        `
      }} />
    </>
  );
}
```

### 3. Root Layout: Pass Nonce to Client Components

**File:** `app/layout.tsx`

```typescript
import { headers } from 'next/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce');

  return (
    <html lang="en">
      <head>
        {/* Example: Inline style with nonce */}
        <style nonce={nonce} dangerouslySetInnerHTML={{
          __html: `
            body { margin: 0; padding: 0; }
          `
        }} />
      </head>
      <body data-nonce={nonce}>
        {children}
      </body>
    </html>
  );
}
```

### 4. Client Components: Access Nonce from DOM

For client components that need the nonce:

```typescript
"use client";

import { useEffect, useState } from 'react';

export function MyClientComponent() {
  const [nonce, setNonce] = useState<string | null>(null);

  useEffect(() => {
    // Get nonce from body data attribute
    const nonceValue = document.body.getAttribute('data-nonce');
    setNonce(nonceValue);
  }, []);

  // Use nonce for dynamic script injection if needed
  useEffect(() => {
    if (nonce) {
      const script = document.createElement('script');
      script.nonce = nonce;
      script.textContent = 'console.log("Dynamic script with nonce");';
      document.head.appendChild(script);
    }
  }, [nonce]);

  return <div>Client Component</div>;
}
```

## PostHog Integration with Nonce-Based CSP

PostHog provides callbacks to set nonce on scripts it creates dynamically:

```typescript
import posthog from 'posthog-js';

// Client-side initialization
if (typeof window !== 'undefined') {
  const nonce = document.body.getAttribute('data-nonce');

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,

    // Set nonce on PostHog's external scripts
    prepare_external_dependency_script: (script) => {
      if (nonce) script.nonce = nonce;
      return script;
    },

    // Set nonce on PostHog's stylesheets
    prepare_external_dependency_stylesheet: (stylesheet) => {
      if (nonce) stylesheet.nonce = nonce;
      return stylesheet;
    },
  });
}
```

**CSP Configuration for PostHog:**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}' 'strict-dynamic' https://*.posthog.com;
  connect-src 'self' https://*.posthog.com https://us.i.posthog.com;
  img-src 'self' data: https://*.posthog.com;
  style-src 'self' 'unsafe-inline'; /* PostHog uses inline styles */
  frame-ancestors 'self' https://*.posthog.com; /* For PostHog iframes */
```

**PostHog CSP Reporting:**

PostHog can track CSP violations:

```typescript
// In middleware.ts
const cspHeader = `
  ...
  report-uri https://us.i.posthog.com/report/?token=${POSTHOG_API_KEY};
`;

// Or use Reporting-Endpoints (newer spec)
response.headers.set(
  'Reporting-Endpoints',
  `posthog="https://us.i.posthog.com/report/?token=${POSTHOG_API_KEY}"`
);
```

## CSP Policy Directives Explained

| Directive | Purpose | Recommended Value |
|-----------|---------|-------------------|
| `default-src` | Fallback for all resource types | `'self'` |
| `script-src` | JavaScript sources | `'self' 'nonce-{random}' 'strict-dynamic'` |
| `style-src` | CSS sources | `'self' 'unsafe-inline'` (required for many frameworks) |
| `connect-src` | Fetch/XHR/WebSocket endpoints | `'self' https://*.posthog.com https://www.google-analytics.com` |
| `img-src` | Image sources | `'self' data: https://*.posthog.com https://www.google-analytics.com` |
| `font-src` | Font sources | `'self' data:` |
| `object-src` | Plugins (Flash, Java) | `'none'` |
| `base-uri` | `<base>` tag URIs | `'self'` |
| `form-action` | Form submission targets | `'self'` |
| `frame-ancestors` | Embedding in iframes | `'none'` or specific domains |
| `upgrade-insecure-requests` | Upgrade HTTP → HTTPS | No value needed |

### `'strict-dynamic'` Explained

When using `'strict-dynamic'`:
- Scripts loaded by nonce-verified scripts are automatically trusted
- Host-based allowlists (like `https://example.com`) are ignored
- Reduces need to maintain CSP allowlists
- **Example:** If `<script nonce="abc123" src="/app.js">` loads more scripts via `import()` or `createElement()`, they're automatically trusted

## Migration Path: From 'unsafe-inline' to Nonces

### Phase 1: Add Nonces (Keep 'unsafe-inline')
```
script-src 'self' 'nonce-{random}' 'unsafe-inline' 'strict-dynamic';
```
- Add nonce generation in middleware
- Start adding nonce attributes to scripts
- Existing scripts continue working

### Phase 2: Update All Scripts
- Audit all inline `<script>` tags
- Add `nonce={nonce}` to each one
- Update third-party integrations (PostHog, GTM, Stripe)
- Test thoroughly

### Phase 3: Remove 'unsafe-inline' (Production)
```
script-src 'self' 'nonce-{random}' 'strict-dynamic';
```
- Remove `'unsafe-inline'` from `script-src`
- Monitor CSP violation reports
- Fix any remaining non-nonce scripts

### Phase 4: Cleanup (Optional)
```
script-src 'nonce-{random}' 'strict-dynamic';
```
- Remove `'self'` if using `'strict-dynamic'` (automatic trust of same-origin)
- Keep `'self'` for clarity if preferred

## Common Patterns

### Pattern 1: Next.js Script Component
```typescript
<Script
  src="https://www.googletagmanager.com/gtag/js"
  strategy="afterInteractive"
  nonce={nonce}
/>
```

### Pattern 2: Inline Script with Nonce
```typescript
<script nonce={nonce} dangerouslySetInnerHTML={{
  __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `
}} />
```

### Pattern 3: Dynamic Script Injection
```typescript
const script = document.createElement('script');
script.src = '/analytics.js';
script.nonce = nonce; // Get from data-nonce attribute
document.head.appendChild(script);
```

### Pattern 4: Third-Party Provider with Nonce
```typescript
// Example: Clerk authentication
<ClerkProvider nonce={nonce} dynamic>
  <html lang="en">
    <body>{children}</body>
  </html>
</ClerkProvider>
```

## Security Best Practices

### 1. Generate Secure Nonces
```typescript
// ✅ Good - Cryptographically secure
const nonce = crypto.randomUUID(); // or crypto.randomBytes(16).toString('base64')

// ❌ Bad - Predictable
const nonce = Math.random().toString();
```

### 2. Generate Per-Request
- **Never reuse nonces** across requests
- Generate new nonce in middleware for every page load
- Store in request headers (`x-nonce`)

### 3. Use Report-Only Mode for Testing
```typescript
// In middleware.ts - use report-only during testing
response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
```

### 4. Monitor CSP Violations
- Set up CSP reporting endpoint
- Track violations in PostHog or logging service
- Fix violations before enforcing policy

### 5. Keep Policies Tight
- Start with `default-src 'none'`
- Add only required directives
- Avoid `'unsafe-inline'` and `'unsafe-eval'` in production

## Testing Strategy

### 1. Local Development
```bash
# Check CSP headers
curl -I http://localhost:3000 | grep -i content-security-policy

# Inspect nonce in browser
# Open DevTools → Network → Select page → Headers → Look for x-nonce
```

### 2. Browser Console
```javascript
// Check for CSP violations
window.addEventListener('securitypolicyviolation', (e) => {
  console.error('CSP Violation:', e);
});
```

### 3. Report-Only Mode
Use `Content-Security-Policy-Report-Only` during testing to log violations without blocking:

```typescript
response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
```

### 4. E2E Tests (Playwright)
```typescript
test('CSP headers are set correctly', async ({ page }) => {
  const response = await page.goto('http://localhost:3000');
  const csp = response?.headers()['content-security-policy'];

  expect(csp).toContain("script-src 'self' 'nonce-");
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).not.toContain("'unsafe-inline'"); // In production
});
```

## Casaora-Specific Implementation Plan

### Current State
- CSP likely using `'unsafe-inline'` for scripts
- PostHog integration active
- Stripe integration for payments
- Sanity CMS integration

### Required Changes

**1. Middleware (`middleware.ts`)**
- Generate nonce per-request
- Build CSP header with nonce
- Set `x-nonce` request header
- Set `Content-Security-Policy` response header

**2. Root Layout (`app/[locale]/layout.tsx`)**
- Get nonce from headers
- Pass nonce to PostHog provider
- Add `data-nonce` to body for client components

**3. PostHog Client (`src/lib/integrations/posthog/client.ts`)**
- Update initialization with nonce callbacks
- Set nonce on external scripts/styles

**4. Inline Scripts**
- Hero section (any inline tracking)
- Analytics initialization
- Feature flag initialization
- Third-party widgets (Stripe, etc.)

**5. CSP Policy Directives**
```
default-src 'self';
script-src 'self' 'nonce-{random}' 'strict-dynamic'
  https://*.posthog.com
  https://js.stripe.com
  https://cdn.sanity.io;
style-src 'self' 'unsafe-inline';
connect-src 'self'
  https://*.posthog.com
  https://api.stripe.com
  https://cdn.sanity.io
  https://*.supabase.co;
img-src 'self' data:
  https://*.posthog.com
  https://cdn.sanity.io;
font-src 'self' data:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

## References

### Official Documentation
- [Next.js Content Security Policy Guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [PostHog CSP Documentation](https://posthog.com/docs/advanced/content-security-policy)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

### Example Implementations
- [Next.js with-strict-csp Example](https://github.com/vercel/next.js/tree/main/examples/with-strict-csp)
- [CSP Toolkit for Next.js](https://csp-toolkit.tsotne.co.uk/guides/nextjs-app)
- [Next-Safe Middleware](https://next-safe-middleware.vercel.app/)

### Tools
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Google's CSP validator
- [Report URI](https://report-uri.com/) - CSP reporting service
- [Mozilla Observatory](https://observatory.mozilla.org/) - Security header scanner

---

**Next Steps:**
1. ✅ Research complete (H-1.1)
2. ⏳ Configure `middleware.ts` to emit nonces (H-1.2)
3. ⏳ Update inline scripts to use nonces (H-1.3)
4. ⏳ Remove `'unsafe-inline'` from production CSP (H-1.4)

**Last Updated:** 2025-01-14
**Version:** 1.0
**Owner:** Security & Engineering Team
