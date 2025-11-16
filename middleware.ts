import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware for Content Security Policy (CSP) with nonce-based script protection.
 *
 * Epic H-1: CSP Hardening - ✅ Complete
 * - Generates cryptographically secure nonce per-request
 * - Sets CSP headers with nonce support
 * - Production: Enforces strict nonce-based policy (no 'unsafe-inline')
 * - Development: Allows 'unsafe-inline' and 'unsafe-eval' for hot reload
 *
 * Implementation:
 * - ✅ H-1.1: Researched nonce-based CSP implementation
 * - ✅ H-1.2: Configured middleware to emit nonces
 * - ✅ H-1.3: Updated all inline scripts (extracted to external files)
 * - ✅ H-1.4: Removed 'unsafe-inline' from production CSP
 */
export function middleware(request: NextRequest) {
  // Generate cryptographically secure random nonce (number used once)
  const nonce = crypto.randomUUID();

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === "production";

  // Build Content Security Policy header
  // Epic H-1.4: Production CSP now enforces strict nonce-based policy
  // Development keeps 'unsafe-inline' and 'unsafe-eval' for hot reload compatibility
  const cspDirectives = [
    "default-src 'self'",

    // Script sources - Production: strict nonce-based CSP (no 'unsafe-inline')
    // Development: includes 'unsafe-inline' and 'unsafe-eval' for hot reload
    // 'strict-dynamic' automatically trusts scripts loaded by nonce-verified scripts
    isProduction
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.posthog.com https://js.stripe.com https://cdn.sanity.io`
      : `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https://*.posthog.com https://js.stripe.com https://cdn.sanity.io`,

    // Style sources - Many frameworks require 'unsafe-inline' for styles
    "style-src 'self' 'unsafe-inline'",

    // API/fetch endpoints
    "connect-src 'self' https://*.posthog.com https://us.i.posthog.com https://api.stripe.com https://cdn.sanity.io https://*.supabase.co wss://*.supabase.co",

    // Image sources
    "img-src 'self' data: blob: https://*.posthog.com https://cdn.sanity.io https://*.supabase.co https://images.unsplash.com",

    // Font sources
    "font-src 'self' data:",

    // Disable plugins (Flash, Java, etc.)
    "object-src 'none'",

    // Restrict <base> tag URIs
    "base-uri 'self'",

    // Restrict form submission targets
    "form-action 'self'",

    // Prevent embedding in iframes (clickjacking protection)
    "frame-ancestors 'none'",

    // Upgrade HTTP requests to HTTPS
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ];

  // Join directives and normalize whitespace
  const cspHeader = cspDirectives
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Clone request headers and add nonce for Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Create response with modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header in response (browser enforcement)
  // Use Report-Only in development for debugging, enforce in production
  const cspHeaderName = isProduction
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";

  response.headers.set(cspHeaderName, cspHeader);

  // Additional security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - Restrict powerful browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );

  return response;
}

// Middleware matcher configuration
// Excludes static files, Next.js internals, and API routes
export const config = {
  matcher: [
    {
      // Match all paths except:
      // - api (API routes handle their own CSP)
      // - _next/static (static assets)
      // - _next/image (image optimization)
      // - favicon.ico (favicon)
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        // Exclude prefetch requests
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
