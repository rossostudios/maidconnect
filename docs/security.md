# Casaora - Security Best Practices

## Security-First Development

**Casaora prioritizes security at every layer:**
- Input sanitization to prevent XSS attacks
- URL validation to prevent open redirects and SSRF
- Continuous security scanning with Snyk
- Row-Level Security (RLS) in PostgreSQL
- CSRF protection via Next.js middleware
- Rate limiting on all API endpoints

---

## Input Sanitization (XSS Prevention)

**ALWAYS sanitize user input before rendering to prevent Cross-Site Scripting (XSS) attacks.**

### Sanitization Utilities

Location: [`src/lib/utils/sanitize.ts`](../src/lib/utils/sanitize.ts)

```typescript
import { sanitizeHTML, sanitizeRichContent, sanitizeURL } from '@/lib/utils/sanitize';

// 1. User-generated content (reviews, comments, feedback)
const safeContent = sanitizeHTML(userInput);
<div dangerouslySetInnerHTML={{ __html: safeContent }} />

// 2. Admin-created rich content (articles, changelog, help docs)
const safeRichContent = sanitizeRichContent(adminContent);
<div dangerouslySetInnerHTML={{ __html: safeRichContent }} />

// 3. URLs from external sources
const safeUrl = sanitizeURL(externalUrl);
<a href={safeUrl}>Link</a>
```

### When to Use Each Function

| Function | Use Case | Allowed HTML | Example |
|----------|----------|--------------|---------|
| `sanitizeHTML()` | User-generated content (reviews, comments) | Basic formatting only (`<p>`, `<b>`, `<i>`, `<ul>`, `<ol>`, `<li>`) | Customer review text |
| `sanitizeRichContent()` | Admin-created rich content | Full formatting (headings, images, links, lists, tables) | Help articles, changelog entries |
| `sanitizeURL()` | External URLs | N/A (validates URL scheme) | User-provided links, redirect URLs |

### DOMPurify Configuration

```typescript
// src/lib/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeRichContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'table',
      'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  });
}
```

### Common XSS Attack Vectors

**❌ NEVER do this:**
```tsx
// WRONG - Vulnerable to XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// WRONG - Unsanitized URL
<a href={userProvidedUrl}>Click here</a>

// WRONG - Unescaped user data
<script>const userName = "{userInput}";</script>
```

**✅ ALWAYS do this:**
```tsx
// CORRECT - Sanitized HTML
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userInput) }} />

// CORRECT - Sanitized URL
<a href={sanitizeURL(userProvidedUrl)}>Click here</a>

// CORRECT - Use JSON.stringify for JS variables
<script>const userName = {JSON.stringify(userInput)};</script>
```

---

## URL Validation (Open Redirect & SSRF Prevention)

**ALWAYS validate URLs before navigation or server-side fetching.**

### URL Validation Patterns

#### Client-Side URL Sanitization

```typescript
import { sanitizeURL } from '@/lib/utils/sanitize';

// Validate and sanitize external URLs
const safeUrl = sanitizeURL(userProvidedUrl);

// Only allows http(s):// protocols
// Blocks javascript:, data:, file:// etc.
<a href={safeUrl}>Safe Link</a>
```

#### Server-Side Redirect Validation

```typescript
// src/app/api/redirect/route.ts

const ALLOWED_HOSTS = ['connect.stripe.com', 'dashboard.stripe.com', 'casaora.com'];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = url.searchParams.get('url');

  if (!redirectUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  try {
    const parsedUrl = new URL(redirectUrl);

    // Validate hostname against allowlist
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      return new Response('Invalid redirect URL', { status: 400 });
    }

    return Response.redirect(redirectUrl, 302);
  } catch {
    return new Response('Invalid URL format', { status: 400 });
  }
}
```

#### SSRF Prevention (Server-Side Request Forgery)

**❌ NEVER use untrusted URLs in server-side fetch calls:**
```typescript
// WRONG - Vulnerable to SSRF
const url = new URL(path, request.url);
await fetch(url);  // Attacker can access internal services!
```

**✅ ALWAYS use trusted environment variables:**
```typescript
// CORRECT - Use trusted base URLs
const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

await fetch(`${baseUrl}/api/endpoint`);
```

---

## Security Scanning with Snyk

**Snyk provides continuous security monitoring for:**
- Dependency vulnerabilities (Software Composition Analysis)
- Code security issues (Static Application Security Testing)
- Container vulnerabilities
- Infrastructure as Code misconfigurations

### Snyk Commands

```bash
# Scan dependencies for vulnerabilities
snyk test

# Scan code for security issues (SAST)
snyk code test

# Scan container images
snyk container test <image>

# Scan infrastructure as code (Terraform, CloudFormation, etc.)
snyk iac test

# Monitor project (send results to Snyk dashboard)
snyk monitor
```

### GitHub Integration

Snyk is integrated via GitHub Actions (`.github/workflows/security.yml`):
- Automatically scans on every push to `main` or `develop`
- Creates pull requests for dependency updates
- Blocks PRs with critical vulnerabilities

### Fixing Vulnerabilities

```bash
# View detailed vulnerability information
snyk test --severity-threshold=high

# Generate automated fix PR
snyk fix

# Update specific dependency
bun add <package>@latest

# Test after fix
snyk test
```

---

## Secure File Operations

### File Download Sanitization

**ALWAYS sanitize filenames to prevent path traversal attacks:**

```typescript
// src/lib/utils/sanitize.ts

export function sanitizeFilename(filename: string): string {
  // Remove path separators
  const baseName = filename.split('/').pop()?.split('\\').pop() || filename;

  // Allow only safe characters
  const SAFE_REGEX = /^[a-zA-Z0-9_\-. ]+$/;

  if (!SAFE_REGEX.test(baseName)) {
    return `default_${Date.now()}.ext`;
  }

  return baseName;
}
```

**Usage:**
```typescript
// API route for file download
export async function GET(request: Request) {
  const url = new URL(request.url);
  const filename = url.searchParams.get('filename');

  if (!filename) {
    return new Response('Missing filename', { status: 400 });
  }

  // Sanitize filename
  const safeFilename = sanitizeFilename(filename);

  // Set secure headers
  return new Response(fileContent, {
    headers: {
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Content-Type': 'application/octet-stream',
    },
  });
}
```

---

## Secure HTML Rendering

### Escaping User Input

**ALWAYS escape user input before highlighting or rendering:**

```typescript
// src/lib/utils/sanitize.ts

export function escapeHTML(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => map[char] || char);
}
```

**Usage:**
```tsx
// Highlight search terms safely
function highlightSearchTerm(text: string, term: string) {
  const escapedText = escapeHTML(text);
  const escapedTerm = escapeHTML(term);

  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  return escapedText.replace(regex, '<mark>$1</mark>');
}
```

---

## Authentication & Authorization

### Supabase Auth Setup

**Row-Level Security (RLS) Policies:**

```sql
-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own bookings
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Professionals can view bookings assigned to them
CREATE POLICY "Professionals can view assigned bookings"
ON bookings FOR SELECT
USING (auth.uid() = professional_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

### Protected API Routes

```typescript
// src/lib/shared/api/middleware.ts

import { createServerClient } from '@/lib/integrations/supabase/server-client';

export async function withAuth(
  handler: (request: Request, context: any) => Promise<Response>
) {
  return async (request: Request, context: any) => {
    const supabase = createServerClient();

    // Verify authentication
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Add user to context
    context.user = user;

    return handler(request, context);
  };
}
```

**Usage:**
```typescript
// src/app/api/bookings/route.ts

import { withAuth } from '@/lib/shared/api/middleware';

export const POST = withAuth(async (request, context) => {
  // context.user is guaranteed to exist
  const userId = context.user.id;

  // Handle booking creation
  const body = await request.json();
  // ...
});
```

---

## CSRF Protection

**Next.js 16 provides built-in CSRF protection via middleware.**

### Configuration

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // CSRF protection for mutating requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Ensure request originates from our domain
    if (origin && !origin.includes(host || '')) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## Rate Limiting

**Protect API endpoints from abuse with rate limiting.**

### Implementation

```typescript
// src/lib/shared/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter: 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

**Usage:**
```typescript
// src/app/api/search/route.ts

import { ratelimit } from '@/lib/shared/rate-limit';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // Check rate limit
  const { success, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'Retry-After': '10',
      },
    });
  }

  // Handle request
  // ...
}
```

---

## Secure Environment Variables

### Environment Variable Handling

**NEVER commit secrets to version control:**

```bash
# .env.local (gitignored)
SUPABASE_SERVICE_ROLE_KEY=secret_key_here
STRIPE_SECRET_KEY=sk_live_xxx
DATABASE_URL=postgresql://user:password@host/db
```

**Use Next.js environment variable prefixes:**
- `NEXT_PUBLIC_*` - Exposed to client (use for non-sensitive data only)
- No prefix - Server-side only (use for secrets)

```typescript
// Client-side (safe)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Server-side only (secret)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

### Vercel Environment Variables

**Production secrets should be set in Vercel dashboard:**
1. Go to Project Settings → Environment Variables
2. Add secret with appropriate scope (Production, Preview, Development)
3. Never expose secrets in build logs or error messages

---

## Security Headers

**Configure security headers in Next.js:**

```typescript
// next.config.js

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

---

## Security Checklist

**Before deploying code, ensure:**

- [ ] All user input is sanitized before rendering (`sanitizeHTML()`, `sanitizeRichContent()`)
- [ ] URLs are validated before navigation/fetch (`sanitizeURL()`)
- [ ] No hardcoded secrets in code (use environment variables)
- [ ] API endpoints have rate limiting
- [ ] Database queries use parameterized statements (Drizzle ORM handles this)
- [ ] File uploads are validated and scanned
- [ ] CSRF protection is enabled (Next.js middleware)
- [ ] Security headers are configured (`next.config.js`)
- [ ] RLS policies are enabled on all Supabase tables
- [ ] Authentication checks on all protected routes
- [ ] Snyk scan passes without critical vulnerabilities

---

## Incident Response

### Security Incident Protocol

**If you discover a security vulnerability:**

1. **DO NOT** create a public GitHub issue
2. **DO NOT** commit fixes directly to `main` or `develop`
3. **DO** email security@casaora.com with details
4. **DO** create a private security advisory on GitHub

**For critical production vulnerabilities:**

1. Create `hotfix/security-*` branch
2. Implement fix and test thoroughly
3. Merge to `main` via expedited review process
4. Deploy immediately
5. Notify affected users if data exposure occurred

### Security Contacts

- **Security Team:** security@casaora.com
- **Incident Response:** Christopher (CTO)
- **GitHub Security Advisories:** [Repository Security Tab](https://github.com/casaora/maidconnect/security)

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Snyk Security Docs](https://docs.snyk.io/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

---

**Last Updated:** 2025-01-17
**Version:** 1.3.0
