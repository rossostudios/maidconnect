import type { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n";
import { createSupabaseServerClient } from "@/lib/integrations/supabase/serverClient";
import { getAuthRoute, getDashboardRouteForRole } from "./routes";
import type { AppRole, AppUser, SessionContext } from "./types";

type RequireUserOptions = {
  allowedRoles?: AppRole[];
  fallback?: string;
};

// Regex pattern for extracting locale from pathname
const LOCALE_PATTERN = /^\/?([a-z]{2})\//;

/**
 * Extract locale from request pathname
 * Falls back to default locale if not found
 */
async function getLocaleFromHeaders(): Promise<string> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";

  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const match = pathname.match(LOCALE_PATTERN);
  return match?.[1] || defaultLocale;
}

/**
 * Get user's preferred locale, falling back to request locale or default
 */
async function getUserLocale(user: AppUser | null): Promise<string> {
  if (user?.locale) {
    // User profile has locale preference (e.g., "en-US")
    // Extract the language code (e.g., "en")
    return user.locale.split("-")[0] || defaultLocale;
  }
  return await getLocaleFromHeaders();
}

async function fetchProfileForUser(
  supabase: SupabaseClient,
  userId: string,
  roleFallback: AppRole = "customer"
): Promise<AppUser | null> {
  const [{ data: profile, error: profileError }, { data: authUser, error: authError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("role, locale, onboarding_status, country")
        .eq("id", userId)
        .maybeSingle(),
      supabase.auth.getUser(),
    ]);

  if (profileError) {
    return null;
  }

  if (authError) {
    return null;
  }

  const user = authUser.user;
  if (!user) {
    return null;
  }

  const role = (profile?.role as AppRole | null) ?? roleFallback;
  const locale = profile?.locale ?? "en-US";
  const onboardingStatus =
    (profile?.onboarding_status as AppUser["onboardingStatus"]) ?? "application_pending";

  return {
    id: user.id,
    email: user.email ?? null,
    role,
    locale,
    onboardingStatus,
    country: profile?.country ?? null,
  };
}

export async function getSession(): Promise<SessionContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { user: null };
  }

  const appUser = await fetchProfileForUser(supabase, session.user.id);
  return { user: appUser };
}

export async function requireUser(options: RequireUserOptions = {}): Promise<AppUser> {
  const { allowedRoles, fallback } = options;
  const { user } = await getSession();

  if (!user) {
    // Get locale from headers since we don't have a user
    const locale = await getLocaleFromHeaders();
    const redirectPath = fallback || getAuthRoute("signIn", locale);
    redirect(redirectPath);
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Use user's preferred locale for the redirect
    const locale = await getUserLocale(user);
    redirect(getDashboardRouteForRole(user.role, locale));
  }

  return user;
}
