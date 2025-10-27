import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AUTH_ROUTES, getDashboardRouteForRole } from "./routes";
import type { AppRole, AppUser, SessionContext } from "./types";

import type { SupabaseClient } from "@supabase/supabase-js";

type RequireUserOptions = {
  allowedRoles?: AppRole[];
  fallback?: string;
};

async function fetchProfileForUser(
  supabase: SupabaseClient,
  userId: string,
  roleFallback: AppRole = "customer",
): Promise<AppUser | null> {
  const [{ data: profile, error: profileError }, { data: authUser, error: authError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, locale, onboarding_status")
      .eq("id", userId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (profileError) {
    console.error("Failed to load profile", profileError);
    return null;
  }

  if (authError) {
    console.error("Failed to load auth user", authError);
    return null;
  }

  const user = authUser.user;
  if (!user) return null;

  const role = (profile?.role as AppRole | null) ?? roleFallback;
  const locale = profile?.locale ?? "en-US";
  const onboardingStatus = (profile?.onboarding_status as AppUser["onboardingStatus"]) ?? "application_pending";

  return {
    id: user.id,
    email: user.email,
    role,
    locale,
    onboardingStatus,
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
  const { allowedRoles, fallback = AUTH_ROUTES.signIn } = options;
  const { user } = await getSession();

  if (!user) {
    redirect(fallback);
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(getDashboardRouteForRole(user.role));
  }

  return user;
}
