import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { AppRole } from "@/lib/auth";
import { AUTH_ROUTES, getDashboardRouteForRole } from "@/lib/auth";

type RouteRule = {
  pattern: RegExp;
  allowedRoles: AppRole[];
};

const LOCALES = ["en", "es"];
const DEFAULT_LOCALE = "en"; // English as global default
const STATIC_ASSET_REGEX = /\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/i;

// Spanish-speaking countries (ISO 3166-1 alpha-2 codes)
const SPANISH_SPEAKING_COUNTRIES = [
  "AR", // Argentina
  "BO", // Bolivia
  "CL", // Chile
  "CO", // Colombia
  "CR", // Costa Rica
  "CU", // Cuba
  "DO", // Dominican Republic
  "EC", // Ecuador
  "SV", // El Salvador
  "GT", // Guatemala
  "HN", // Honduras
  "MX", // Mexico
  "NI", // Nicaragua
  "PA", // Panama
  "PY", // Paraguay
  "PE", // Peru
  "PR", // Puerto Rico
  "ES", // Spain
  "UY", // Uruguay
  "VE", // Venezuela
];

// Patterns that match both localized and non-localized routes
const PROTECTED_ROUTES: RouteRule[] = [
  { pattern: /^\/(?:en|es)?\/dashboard\/pro(?:\/|$)/, allowedRoles: ["professional"] },
  { pattern: /^\/(?:en|es)?\/dashboard\/customer(?:\/|$)/, allowedRoles: ["customer"] },
  { pattern: /^\/(?:en|es)?\/admin(?:\/|$)/, allowedRoles: ["admin"] },
];

// Routes that should skip CSRF validation (e.g., webhooks with signature verification)
const CSRF_EXEMPT_ROUTES = [/^\/api\/webhooks\/stripe$/, /^\/api\/webhooks\//];

// Auth routes pattern (matches /auth, /en/auth, /es/auth)
const AUTH_ROUTES_PATTERN = /^\/(?:en|es)?\/auth/;

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
 * Detect user's preferred locale based on geolocation and Accept-Language header
 * Priority: Geolocation > Accept-Language > Default (English)
 */
function detectLocaleFromHeaders(request: NextRequest): string {
  // 1. Check geolocation first (most accurate for regional content)
  // Vercel provides x-vercel-ip-country header in production
  // Cloudflare provides cf-ipcountry header
  const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry");

  if (country) {
    // If user is in a Spanish-speaking country, show Spanish
    if (SPANISH_SPEAKING_COUNTRIES.includes(country.toUpperCase())) {
      return "es";
    }
    // Otherwise, show English
    return "en";
  }

  // 2. Fallback to Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");

  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // Parse Accept-Language header (e.g., "es-CO,es;q=0.9,en;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qPart] = lang.trim().split(";");
      if (!code) {
        return null;
      }
      const qualityStr = qPart?.split("=")[1];
      const quality = qualityStr ? Number.parseFloat(qualityStr) : 1.0;
      const langCode = code.split("-")[0]?.toLowerCase();
      if (!langCode) {
        return null;
      }
      return { code: langCode, quality };
    })
    .filter((item): item is { code: string; quality: number } => item !== null)
    .sort((a, b) => b.quality - a.quality);

  // Find first supported locale
  for (const { code } of languages) {
    if (LOCALES.includes(code)) {
      return code;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * CSRF Protection: Validate origin/referer for state-changing operations
 * Prevents cross-site request forgery attacks
 *
 * For web browsers: Validates Origin/Referer headers match the host
 * For mobile apps: Validates presence of Authorization header (JWT auth)
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

  // Mobile client detection: Allow if using Authorization header instead of cookies
  // Mobile apps (React Native, Flutter, etc.) don't send Origin/Referer headers
  // but authenticate via JWT in Authorization header
  const clientType = request.headers.get("x-client-type");
  const authorization = request.headers.get("authorization");

  if (clientType === "mobile" && authorization?.startsWith("Bearer ")) {
    // Mobile client with JWT auth - skip Origin/Referer validation
    // The JWT will be validated by Supabase in downstream API routes
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
 * Add security headers to response (2025 modern standards)
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking attacks
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy for privacy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enforce HTTPS (2 years, include subdomains, preload eligible)
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // Content Security Policy (basic - adjust as needed)
  response.headers.set("Content-Security-Policy", "frame-ancestors 'none';");

  // Permissions Policy (2025 modern syntax)
  // geolocation=(self): Allows same-origin geolocation for:
  //   - Professional check-in/check-out GPS verification (existing feature)
  //   - Future "nearby professionals" feature (e.g., "You're in Asunción, here are top pros near you")
  //   - Browser permission prompt still required (user-level protection)
  //   - Blocks third-party iframes from accessing location
  // interest-cohort=(): Blocks Google FLoC tracking for privacy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  );

  return response;
}

function isApiOrStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/studio") ||
    STATIC_ASSET_REGEX.test(pathname)
  );
}

function ensureLocaleCookie(
  response: NextResponse,
  localeCookie: string | undefined,
  locale: string
): void {
  if (!localeCookie || localeCookie !== locale) {
    response.cookies.set("NEXT_LOCALE", locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }
}

function maybeRedirectRoot(
  pathname: string,
  locale: string,
  request: NextRequest
): NextResponse | null {
  if (pathname !== "/") {
    return null;
  }
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

function maybeRedirectMissingLocale(
  pathname: string,
  locale: string,
  request: NextRequest
): NextResponse | null {
  if (getLocaleFromPathname(pathname) || isApiOrStaticPath(pathname)) {
    return null;
  }
  const localizedPath = addLocaleToPath(pathname, locale);
  const url = new URL(localizedPath, request.url);
  url.search = request.nextUrl.search;
  return NextResponse.redirect(url);
}

async function maybeRedirectAuthenticatedFromAuthRoutes({
  pathname,
  locale,
  request,
  user,
  supabase,
}: {
  pathname: string;
  locale: string;
  request: NextRequest;
  user: User | null;
  supabase: SupabaseClient;
}): Promise<NextResponse | null> {
  if (!AUTH_ROUTES_PATTERN.test(pathname)) {
    return null;
  }

  if (!user) {
    return null;
  }

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!userProfile?.role) {
    return null;
  }

  const dashboardRoute = getDashboardRouteForRole(userProfile.role as AppRole);
  const localizedRoute = addLocaleToPath(dashboardRoute, locale);
  const redirectUrl = new URL(localizedRoute, request.url);
  return NextResponse.redirect(redirectUrl);
}

async function enforceProtectedRouteAccess({
  matchedRule,
  user,
  locale,
  pathname,
  request,
  supabase,
}: {
  matchedRule: RouteRule;
  user: User | null;
  locale: string;
  pathname: string;
  request: NextRequest;
  supabase: SupabaseClient;
}): Promise<NextResponse | null> {
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

  return null;
}

export default async function proxy(request: NextRequest) {
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
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
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

  // Detect locale: Cookie > Accept-Language > Default (Spanish)
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  const detectedLocale = localeCookie || detectLocaleFromHeaders(request);
  const locale = getLocaleFromPathname(pathname) || detectedLocale;

  ensureLocaleCookie(response, localeCookie, locale);

  const rootRedirect = maybeRedirectRoot(pathname, locale, request);
  if (rootRedirect) {
    return rootRedirect;
  }

  const localeRedirect = maybeRedirectMissingLocale(pathname, locale, request);
  if (localeRedirect) {
    return localeRedirect;
  }

  const matchedRule = PROTECTED_ROUTES.find((rule) => rule.pattern.test(pathname));

  if (!matchedRule) {
    const authRedirect = await maybeRedirectAuthenticatedFromAuthRoutes({
      pathname,
      locale,
      request,
      user,
      supabase,
    });
    return authRedirect ?? response;
  }

  const protectedRedirect = await enforceProtectedRouteAccess({
    matchedRule,
    user,
    locale,
    pathname,
    request,
    supabase,
  });

  return protectedRedirect ?? response;
}

export const config = {
  matcher: [
    // Match root
    "/",
    // Match all localized routes
    "/(en|es)/:path*",
    // Match all non-localized routes (will redirect to add locale)
    // Excludes: _next, _vercel, api, studio, and file extensions
    "/((?!_next|_vercel|api|studio|.*\\..*).*)",
  ],
};
