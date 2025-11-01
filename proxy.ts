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
  if (segments.length > 0 && LOCALES.includes(segments[0])) {
    return segments[0];
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

export async function proxy(request: NextRequest) {
  ensureEnv();

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name) {
          response.cookies.delete(name);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

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
      if (!session) {
        return response;
      }

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
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
  if (!session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = addLocaleToPath(AUTH_ROUTES.signIn, locale);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_status")
    .eq("id", session.user.id)
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
  ],
};
