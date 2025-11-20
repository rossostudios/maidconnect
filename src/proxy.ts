import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n";

/**
 * Next.js 16 Proxy - Internationalization + Route-specific headers
 *
 * Combines:
 * 1. next-intl middleware for locale routing
 * 2. Permissions-Policy headers for professional camera/mic access
 */

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Prefix all locales including default for consistent routing
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  // Apply internationalization first
  const response = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;

  // Allow camera and microphone access on professional dashboard routes
  // Required for intro video recording feature (Phase 1.2)
  if (
    pathname.includes("/professional/profile") ||
    pathname.includes("/professional/settings")
  ) {
    response.headers.set(
      "Permissions-Policy",
      [
        "camera=(self)", // Allow camera access on same origin
        "microphone=(self)", // Allow microphone access on same origin
        "geolocation=(self)", // Keep geolocation for service area
        "interest-cohort=()", // Block FLoC for privacy
      ].join(", "),
    );
  }

  // Default: Block camera/mic on all other routes for security
  // This is handled by next.config.ts global headers

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(es|en)/:path*",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
