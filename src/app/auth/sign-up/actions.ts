"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AUTH_ROUTES, getDashboardRouteForRole } from "@/lib/auth";
import type { AppRole } from "@/lib/auth";

export type SignUpActionState = {
  error?: string;
  success?: boolean;
};

const VALID_ROLES: AppRole[] = ["customer", "professional"];

function sanitizeRole(roleCandidate: string | null): AppRole | null {
  if (!roleCandidate) return null;
  return VALID_ROLES.includes(roleCandidate as AppRole) ? (roleCandidate as AppRole) : null;
}

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function signUpAction(_prev: SignUpActionState, formData: FormData): Promise<SignUpActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const locale = String(formData.get("locale") ?? "en-US");
  const role = sanitizeRole(formData.get("role") as string | null);

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  if (!role) {
    return { error: "Please select a valid account type." };
  }

  const supabase = await createSupabaseServerClient();
  const origin = SITE_ORIGIN;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}${AUTH_ROUTES.signIn}`,
      data: {
        role,
        locale,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session?.user) {
    return redirect(getDashboardRouteForRole(role));
  }

  return {
    success: true,
  };
}
