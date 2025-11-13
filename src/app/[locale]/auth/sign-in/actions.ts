"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AppRole } from "@/lib/auth";
import { AUTH_ROUTES, getDashboardRouteForRole } from "@/lib/auth";
import { trackLoginServer } from "@/lib/integrations/posthog/server";
import { checkRateLimit, RateLimiters } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type SignInActionState = {
  error?: string;
};

function sanitizeRedirectPath(path: string | null): string | null {
  if (!path) {
    return null;
  }
  if (!path.startsWith("/")) {
    return null;
  }
  if (path.startsWith(AUTH_ROUTES.signIn) || path.startsWith(AUTH_ROUTES.signUp)) {
    return null;
  }
  return path;
}

export async function signInAction(
  _prevState: SignInActionState,
  formData: FormData
): Promise<SignInActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectHint = sanitizeRedirectPath(formData.get("redirectTo") as string | null);

  if (!(email && password)) {
    return { error: "Email and password are required." };
  }

  // Rate limiting: 5 sign-in attempts per 15 minutes per IP
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0]?.trim() || "unknown"
    : headersList.get("x-real-ip") || "unknown";

  const rateLimit = checkRateLimit(`signin:${ip}`, RateLimiters.auth);

  if (!rateLimit.allowed) {
    const retrySeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    const retryMinutes = Math.ceil(retrySeconds / 60);
    return {
      error: `Too many sign-in attempts. Please try again in ${retryMinutes} minutes.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: error?.message ?? "Invalid credentials." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile?.role) {
    return { error: "Could not determine account role. Contact support." };
  }

  // Track successful login
  await trackLoginServer({
    userId: data.user.id,
    method: "email",
  });

  const destination = redirectHint ?? getDashboardRouteForRole(profile.role as AppRole);
  redirect(destination);
}
