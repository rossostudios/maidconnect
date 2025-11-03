import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { AppRole } from "@/lib/auth";
import { AUTH_ROUTES, getDashboardRouteForRole } from "@/lib/auth";

type RouteRule = {
  pattern: RegExp;
  allowedRoles: AppRole[];
};

const LOCALES = ["en", "es"];
const DEFAULT_LOCALE = "en";

// Patterns that match both localized and non-localized routes
const PROTECTED_ROUTES: RouteRule[] = [
  { pattern: /^\/(?:en|es)?\/dashboard\/pro(?:\/|$)/, allowedRoles: ["professional"] },
  { pattern: /^\/(?:en|es)?\/dashboard\/customer(?:\/|$)/, allowedRoles: ["customer"] },
  { pattern: /^\/(?:en|es)?\/admin(?:\/|$)/, allowedRoles: ["admin"] },
];

// Routes that should skip CSRF validation (e.g., webhooks with signature verification)
const CSRF_EXEMPT_ROUTES = [
  /^\/api\/webhooks\/stripe$/,
  /^\/api\/webhooks\//,
];

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function ensureEnv() {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`${key} is required for Supabase proxy.`);
    }
  }
}

function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && LOCALES.includes(firstSegment)) {
    return firstSegment;
  }
  return null;
}

function addLocaleToPath(pathname: string, locale: string = DEFAULT_LOCALE): string {
  // If path already has a locale, return as is
  if (getLocaleFromPathname(pathname)) {
    return pathname;
  }
  // Add locale prefix
  return `/${locale}${pathname}`;
}

/**
 * CSRF Protection: Validate origin/referer for state-changing operations
 * Prevents cross-site request forgery attacks
 */
function validateCSRF(request: NextRequest): boolean {
  const { method } = request;

  // Only validate state-changing methods
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    return true;
  }

  // Check if route is exempt from CSRF validation
  const pathname = request.nextUrl.pathname;
  if (CSRF_EXEMPT_ROUTES.some((pattern) => pattern.test(pathname))) {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // If we have an origin header, validate it
  if (origin) {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      console.warn("[CSRF] Blocked request with mismatched origin", {
        origin: originUrl.host,
        host,
        method,
        pathname,
      });
      return false;
    }
    return true;
  }

  // Fallback to referer validation
  if (referer) {
    const refererUrl = new URL(referer);
    if (refererUrl.host !== host) {
      console.warn("[CSRF] Blocked request with mismatched referer", {
        referer: refererUrl.host,
        host,
        method,
        pathname,
      });
      return false;
    }
    return true;
  }

  // No origin or referer - likely a direct API call or old browser
  // Block it to be safe
  console.warn("[CSRF] Blocked request with no origin/referer", {
    method,
    pathname,
  });
  return false;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking attacks
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable browser XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer policy for privacy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (basic - adjust as needed)
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'none';"
  );

  // Permissions policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export async function proxy(request: NextRequest) {
  ensureEnv();

  // CSRF Protection: Validate origin/referer for state-changing operations
  if (!validateCSRF(request)) {
    return new NextResponse("Forbidden: CSRF validation failed", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add security headers to all responses
  response = addSecurityHeaders(response);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // CRITICAL: Must use getUser() instead of getSession() to refresh session properly
  // See: https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const locale = getLocaleFromPathname(pathname) || DEFAULT_LOCALE;

  // Redirect root path to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en", request.url));
  }

  // If path doesn't have a locale prefix, redirect to add it
  if (
    !getLocaleFromPathname(pathname) &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth"))
  ) {
    const localizedPath = addLocaleToPath(pathname, DEFAULT_LOCALE);
    const url = new URL(localizedPath, request.url);
    // Preserve query params
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  const matchedRule = PROTECTED_ROUTES.find((rule) => rule.pattern.test(pathname));

  if (!matchedRule) {
    if (pathname.match(/^\/(?:en|es)?\/auth/)) {
      if (!user) {
        return response;
      }

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (userProfile?.role) {
        const dashboardRoute = getDashboardRouteForRole(userProfile.role as AppRole);
        const localizedRoute = addLocaleToPath(dashboardRoute, locale);
        const redirectUrl = new URL(localizedRoute, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return response;
  }

  // Protected route handling
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = addLocaleToPath(AUTH_ROUTES.signIn, locale);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.role) {
    const logoutUrl = new URL(addLocaleToPath(AUTH_ROUTES.signOut, locale), request.url);
    return NextResponse.redirect(logoutUrl);
  }

  const role = profile.role as AppRole;

  if (!matchedRule.allowedRoles.includes(role)) {
    const dashboardRoute = getDashboardRouteForRole(role);
    const localizedRoute = addLocaleToPath(dashboardRoute, locale);
    const redirectUrl = new URL(localizedRoute, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (role === "professional" && profile.onboarding_status === "suspended") {
    const redirectUrl = new URL(addLocaleToPath("/support/account-suspended", locale), request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match both localized and non-localized protected routes
    "/:locale(en|es)?/dashboard/:path*",
    "/:locale(en|es)?/admin/:path*",
    "/:locale(en|es)?/auth/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
    // API routes for CSRF protection
    "/api/:path*",
  ],
};
