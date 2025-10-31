# CSP Nonce Implementation Plan

## Current Status
- ✅ Removed `unsafe-eval` from production
- ✅ CSP includes all necessary domains (Stripe, Supabase, Google Maps, Better Stack, Upstash)
- ⚠️ Still using `unsafe-inline` for script-src (needed for compatibility)

## Inline Scripts Found
- **JSON-LD structured data** in 6 product pages (SEO metadata)
  - `/product/payment-processing/page.tsx`
  - `/product/booking-platform/page.tsx`
  - `/product/secure-messaging/page.tsx`
  - `/product/admin-dashboard/page.tsx`
  - `/product/professional-profiles/page.tsx`
  - `/product/reviews-ratings/page.tsx`

## Implementation Plan (Future Enhancement)

### Approach 1: Nonce-Based CSP (Recommended for Next.js App Router)

**Requirements:**
1. Generate unique nonce per request in middleware
2. Pass nonce through headers/context
3. Use `next/script` with nonce prop for all inline scripts
4. Update CSP to use nonce instead of 'unsafe-inline'

**Steps:**
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

// 2. Update CSP headers to use nonce
script-src 'self' 'nonce-${nonce}' https://js.stripe.com ...;

// 3. Use Script component with nonce
<Script
  id="json-ld"
  type="application/ld+json"
  nonce={nonce}
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### Approach 2: Hash-Based CSP (Simpler for Static Content)

For JSON-LD scripts that don't change per request:
1. Generate SHA-256 hash of each inline script
2. Add hashes to CSP policy
3. Scripts will be allowed if hash matches

**Example:**
```bash
# Generate hash
echo -n '<script>YOUR_SCRIPT_HERE</script>' | openssl dgst -sha256 -binary | openssl base64

# Add to CSP
script-src 'self' 'sha256-HASH_HERE' ...;
```

## Compatibility Considerations

**Third-Party Scripts:**
- Stripe.js requires 'unsafe-inline' or specific integration changes
- Google Maps may have inline event handlers
- Better Stack logging script

**Recommendation:**
- Keep `unsafe-inline` for now
- Focus on removing it from `script-src` only (keep for `style-src`)
- Implement after testing thoroughly in staging environment

## Priority

**Current Priority:** Medium (Week 3-4)

**Rationale:**
- Already removed highest-risk directive (`unsafe-eval`)
- All CSP domains properly configured
- Nonce implementation is complex and could break integrations
- Focus on higher-ROI features first (feature flags, Web Vitals, Match Wizard)

## Testing Checklist (When Implementing)

- [ ] Stripe payment flow works
- [ ] Google Maps loads correctly
- [ ] Better Stack logging continues
- [ ] All JSON-LD structured data validates
- [ ] No CSP violations in production
- [ ] Third-party scripts function correctly
