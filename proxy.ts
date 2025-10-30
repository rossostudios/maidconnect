import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { AppRole } from "@/lib/auth";
import { AUTH_ROUTES, getDashboardRouteForRole } from "@/lib/auth";

type RouteRule = {
  pattern: RegExp;
  allowedRoles: AppRole[];
};

const PROTECTED_ROUTES: RouteRule[] = [
  { pattern: /^\/dashboard\/pro(?:\/|$)/, allowedRoles: ["professional"] },
  { pattern: /^\/dashboard\/customer(?:\/|$)/, allowedRoles: ["customer"] },
  { pattern: /^\/admin(?:\/|$)/, allowedRoles: ["admin"] },
];

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function ensureEnv() {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`${key} is required for Supabase proxy.`);
    }
  }
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
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const matchedRule = PROTECTED_ROUTES.find((rule) => rule.pattern.test(pathname));

  if (!matchedRule) {
    if (pathname.startsWith("/auth")) {
      if (!session) {
        return response;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role) {
        const redirectUrl = new URL(getDashboardRouteForRole(profile.role as AppRole), request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return response;
  }

  // Protected route handling
  if (!session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AUTH_ROUTES.signIn;
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_status")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError || !profile?.role) {
    const logoutUrl = new URL(AUTH_ROUTES.signOut, request.url);
    return NextResponse.redirect(logoutUrl);
  }

  const role = profile.role as AppRole;

  if (!matchedRule.allowedRoles.includes(role)) {
    const redirectUrl = new URL(getDashboardRouteForRole(role), request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (role === "professional" && profile.onboarding_status === "suspended") {
    const redirectUrl = new URL("/support/account-suspended", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
