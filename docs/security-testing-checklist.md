# Security Testing Checklist

**Last Updated:** 2025-11-19
**Owner:** Engineering Team
**Purpose:** P0 security hardening verification and ongoing security testing

---

## P0 Security Hardening Status

### ✅ Completed P0 Tasks (2025-11-19)

#### 1. Environment Variable Validation
- **Status:** ✅ COMPLETE
- **Implementation:** `src/env.ts` imported in root layout
- **Verification:**
  - Zod schemas validate 69 required environment variables
  - Fail-fast behavior on boot if env misconfigured
  - Server and client env schemas separated
- **Test:** Start dev server with missing env var → should crash with clear error

#### 2. Content Security Policy (CSP) with Nonce
- **Status:** ✅ COMPLETE
- **Implementation:** `proxy.ts` (Next.js 16 edge middleware)
- **Features:**
  - Nonce-based script protection (`strict-dynamic`)
  - XSS prevention via CSP header
  - Trusted domains: PostHog, Stripe, Vercel Analytics, Supabase
  - x-nonce header passed to layout
- **Test:** Inspect network response headers → verify CSP header present

#### 3. Row-Level Security (RLS) Audit
- **Status:** ✅ COMPLETE
- **Coverage:** 69/69 tables (100%)
- **Implementation:**
  - Role-based policies (admin, professional, customer)
  - Private schema helper functions for complex policies
  - Multi-tenancy enforcement at database level
- **Test:** Attempt unauthorized data access via API → should fail with 403

#### 4. API Route Authentication
- **Status:** ✅ COMPLETE
- **Coverage:** 145 API routes audited
  - 74 routes use centralized middleware (`withAuth`, `withAdmin`, etc.)
  - 71 routes use manual auth checks (still secure)
  - 4 webhook routes use HMAC signature validation
- **Recommendation:** P1 task to standardize on middleware pattern
- **Test:** Call protected API route without auth token → should return 401

#### 5. Error Boundaries
- **Status:** ✅ COMPLETE
- **Implementation:**
  - `src/app/[locale]/admin/error.tsx`
  - `src/app/[locale]/dashboard/pro/error.tsx`
  - `src/app/[locale]/dashboard/customer/error.tsx`
- **Features:**
  - Error logging to console (PostHog integration ready)
  - User-friendly fallback UI
  - Retry functionality
  - Dev-mode error details
- **Test:** Trigger error in dashboard → should show error boundary UI

#### 6. Server-Side Role Checks
- **Status:** ✅ COMPLETE
- **Architecture:** Defense-in-depth with layout-level protection
  - Admin layout: `requireUser({ allowedRoles: ["admin"] })`
  - Pro layout: `requireUser({ allowedRoles: ["professional"] })`
  - Customer layout: `requireUser({ allowedRoles: ["customer"] })`
- **Coverage:** 100% of protected routes (enforced at layout level)
- **Test:** Access admin page as customer → should redirect to unauthorized

---

## Security Testing Matrix

### Authentication & Authorization

#### User Authentication
- [ ] Sign up flow completes successfully
- [ ] Email verification required before access
- [ ] Password reset flow works end-to-end
- [ ] Session expires after configured timeout
- [ ] Logout invalidates session on server

#### Role-Based Access Control (RBAC)
- [ ] Admin cannot access professional dashboard
- [ ] Professional cannot access customer dashboard
- [ ] Customer cannot access admin panel
- [ ] Unauthenticated users redirected to sign-in
- [ ] Role changes reflected immediately in UI

#### API Route Protection
- [ ] All `/api/admin/*` routes require admin role
- [ ] All `/api/bookings/*` routes require authentication
- [ ] Webhook endpoints verify HMAC signatures
- [ ] Rate limiting enforced (booking: 20/min, payment: 15/min)
- [ ] CSRF validation on state-changing operations

---

### Input Validation & XSS Prevention

#### User-Generated Content
- [ ] Review text sanitized before rendering (sanitizeHTML)
- [ ] Professional bio sanitized before rendering
- [ ] Booking special instructions sanitized
- [ ] Chat messages sanitized
- [ ] Search queries sanitized

#### Rich Content (Admin-Created)
- [ ] Changelog entries use sanitizeRichContent
- [ ] Help articles use sanitizeRichContent
- [ ] Roadmap items use sanitizeRichContent
- [ ] Email templates sanitized

#### URL Validation
- [ ] External links validated with sanitizeURL
- [ ] Professional website URLs validated
- [ ] Avatar URLs from Supabase storage only
- [ ] OAuth redirect URLs whitelisted

---

### Database Security

#### RLS Policy Verification
- [ ] Customers can only see their own bookings
- [ ] Professionals can only see assigned bookings
- [ ] Admins can see all data
- [ ] Deleted users cannot access any data
- [ ] Suspended professionals cannot modify data

#### SQL Injection Prevention
- [ ] All queries use parameterized statements
- [ ] No raw SQL concatenation in codebase
- [ ] Supabase client methods used (not raw SQL)
- [ ] Search queries use Supabase text search operators

#### Data Leakage Prevention
- [ ] Profile queries exclude sensitive fields (password_hash, etc.)
- [ ] Payment info masked in UI (last 4 digits only)
- [ ] Admin logs exclude PII
- [ ] Error messages don't expose internal state

---

### Payment Security

#### Stripe Integration
- [ ] Webhook signature validation enforced
- [ ] Payment intents created server-side only
- [ ] Prices fetched from server, not client
- [ ] Refunds require admin approval
- [ ] Payout calculations verified server-side

#### PayPal Integration (PY/UY/AR)
- [ ] Webhook signature validation enforced
- [ ] Order creation server-side only
- [ ] Currency enforcement per market
- [ ] Dispute handling workflow secure

#### Sensitive Data Handling
- [ ] Credit card data never stored locally
- [ ] Stripe tokens used for payment methods
- [ ] PCI DSS scope minimized
- [ ] Payment logs exclude full card numbers

---

### Content Security Policy (CSP)

#### Script Sources
- [ ] Inline scripts blocked (nonce required)
- [ ] Only trusted domains allowed (PostHog, Stripe, Vercel)
- [ ] `strict-dynamic` enabled for modern browsers
- [ ] No `unsafe-eval` in CSP

#### Resource Loading
- [ ] Images only from self + Supabase storage
- [ ] Fonts only from Google Fonts
- [ ] Styles allow `unsafe-inline` (Tailwind requirement)
- [ ] Connect sources limited to API domains

#### Frame Protection
- [ ] Frames only allowed from Stripe (payment elements)
- [ ] `X-Frame-Options: DENY` header set
- [ ] `frame-ancestors 'none'` in CSP

---

### Session & Cookie Security

#### Cookie Configuration
- [ ] HttpOnly flag set on auth cookies
- [ ] Secure flag set (HTTPS only)
- [ ] SameSite=Lax or Strict
- [ ] Appropriate expiration times
- [ ] Domain scope restricted

#### Session Management
- [ ] Sessions invalidated on password change
- [ ] Concurrent session limits (if applicable)
- [ ] Session tokens rotated regularly
- [ ] No sensitive data in localStorage
- [ ] JWT tokens validated server-side

---

### Infrastructure Security

#### HTTPS Enforcement
- [ ] HSTS header enabled (2 years, includeSubDomains, preload)
- [ ] HTTP requests redirect to HTTPS
- [ ] Mixed content warnings resolved
- [ ] SSL certificate valid and not expiring soon

#### Security Headers
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` restricts camera/microphone
- [ ] CSP header present and comprehensive

#### Rate Limiting
- [ ] API endpoints rate limited (Upstash Redis)
- [ ] Booking creation limited (20 requests/min)
- [ ] Payment operations limited (15 requests/min)
- [ ] Signup rate limited to prevent abuse
- [ ] Password reset rate limited

---

### File Upload Security

#### Avatar & Document Uploads
- [ ] File type validation (MIME type + extension)
- [ ] File size limits enforced (5MB for avatars)
- [ ] Filenames sanitized (no path traversal)
- [ ] Uploads scanned for malware (if applicable)
- [ ] Storage ACLs restrict access

#### Supabase Storage
- [ ] Public bucket for avatars (read-only)
- [ ] Private bucket for documents
- [ ] RLS policies on storage objects
- [ ] Presigned URLs for temporary access
- [ ] Image optimization applied

---

### Third-Party Dependencies

#### Dependency Scanning
- [ ] `snyk test` passes (no critical vulnerabilities)
- [ ] `snyk code test` passes (SAST clean)
- [ ] Dependencies updated regularly
- [ ] No known vulnerable packages
- [ ] Lockfile committed to git

#### Supply Chain Security
- [ ] Package integrity verified (npm/bun checksums)
- [ ] No dependencies from untrusted sources
- [ ] No postinstall scripts in dependencies
- [ ] Audit logs reviewed for suspicious changes

---

### Error Handling & Logging

#### Error Boundaries
- [ ] Admin dashboard has error boundary
- [ ] Pro dashboard has error boundary
- [ ] Customer dashboard has error boundary
- [ ] Errors logged to monitoring (PostHog/Sentry)

#### Logging Security
- [ ] No passwords logged
- [ ] No credit card numbers logged
- [ ] PII redacted from logs
- [ ] Error stack traces not exposed to users (prod)
- [ ] Audit logs for admin actions

---

## Ongoing Security Tasks

### Weekly
- [ ] Review Supabase audit logs for anomalies
- [ ] Check failed authentication attempts
- [ ] Review rate limiting violations
- [ ] Verify webhook delivery success rates

### Monthly
- [ ] Run `snyk test` and address vulnerabilities
- [ ] Review RLS policies for new tables
- [ ] Audit admin access logs
- [ ] Test backup/restore procedures
- [ ] Review CSP violation reports (if configured)

### Quarterly
- [ ] Penetration testing by external auditor
- [ ] Security training for engineering team
- [ ] Review and update security policies
- [ ] Disaster recovery drill
- [ ] Third-party security audit (if applicable)

---

## Incident Response

### Security Incident Checklist
1. **Detect**: Monitor logs, alerts, user reports
2. **Contain**: Disable affected accounts, revoke tokens
3. **Investigate**: Determine scope, root cause
4. **Remediate**: Apply fixes, patch vulnerabilities
5. **Communicate**: Notify affected users (if required)
6. **Document**: Post-mortem, lessons learned
7. **Prevent**: Update tests, add monitoring

### Emergency Contacts
- **Security Lead:** [TBD]
- **CTO:** [TBD]
- **Supabase Support:** support@supabase.io
- **Vercel Support:** support@vercel.com

---

## Security Testing Tools

### Automated Scanning
```bash
# Dependency vulnerabilities
snyk test

# Code security (SAST)
snyk code test

# Type safety
bun run build

# Linting
bun run check
```

### Manual Testing
- **Burp Suite:** Proxy for testing API security
- **OWASP ZAP:** Automated vulnerability scanning
- **Browser DevTools:** Inspect headers, CSP violations
- **Postman:** API authentication testing

---

## Security Review Checklist (Pre-Deployment)

### Before Merging to Main
- [ ] All tests pass (unit + E2E)
- [ ] `snyk test` passes
- [ ] No new TypeScript errors
- [ ] Biome linter passes
- [ ] Security-sensitive changes reviewed by 2+ engineers

### Before Production Deployment
- [ ] Environment variables verified in Vercel
- [ ] Database migrations applied and tested
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Security headers verified in staging

---

## Notes

**P0 Security Hardening Completed:** 2025-11-19
**Next P1 Tasks:**
- Standardize API route auth on middleware pattern
- Add CSP violation reporting endpoint
- Implement E2E security testing suite
- Add security headers to Next.js config as backup

**Known Limitations:**
- CSP allows `unsafe-inline` for styles (Tailwind requirement)
- Some pages use manual auth instead of `requireUser()` helper (still secure via layout)
- Webhook idempotency tracked in database (not Redis)

**References:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security Guide](https://supabase.com/docs/guides/database/securing-your-database)
