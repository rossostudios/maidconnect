"use server";

import { redirect } from "next/navigation";
import type { AppRole } from "@/lib/auth";
import { AUTH_ROUTES, getDashboardRouteForRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { SignUpActionState } from "./types";

const VALID_ROLES: AppRole[] = ["customer", "professional"];

function sanitizeRole(roleCandidate: string | null): AppRole | null {
  if (!roleCandidate) return null;
  return VALID_ROLES.includes(roleCandidate as AppRole) ? (roleCandidate as AppRole) : null;
}

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

function stringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value) return null;
  const trimmed = value.toString().trim();
  return trimmed.length ? trimmed : null;
}

function validatePhone(phone: string | null) {
  if (!phone) return false;
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return cleaned.length >= 7;
}

export async function signUpAction(
  _prev: SignUpActionState,
  formData: FormData
): Promise<SignUpActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const locale = String(formData.get("locale") ?? "en-US");
  const role = sanitizeRole(formData.get("role") as string | null);
  const fullName = stringOrNull(formData.get("fullName"));
  const phone = stringOrNull(formData.get("phone"));
  const city = stringOrNull(formData.get("city"));
  const propertyType = stringOrNull(formData.get("propertyType"));
  const termsAccepted = formData.get("terms") === "on";

  const fieldErrors: Record<string, string> = {};

  if (!email) {
    fieldErrors.email = "Email is required.";
  }

  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (!role) {
    fieldErrors.role = "Select an account type.";
  }

  if (!fullName || fullName.length < 3) {
    fieldErrors.fullName = "Provide your full name.";
  }

  if (!validatePhone(phone)) {
    fieldErrors.phone = "Enter a valid phone number.";
  }

  if (!city) {
    fieldErrors.city = "City is required.";
  }

  if (role === "customer" && !propertyType) {
    fieldErrors.propertyType = "Select a property type.";
  }

  if (!termsAccepted) {
    fieldErrors.terms = "You must accept the terms to continue.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  const metadata: Record<string, unknown> = {
    role,
    locale,
    phone,
    country: "Colombia",
    city,
    full_name: fullName,
  };

  if (role === "customer") {
    metadata.property_preferences = propertyType ? { property_type: propertyType } : {};
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_ORIGIN}${AUTH_ROUTES.signIn}`,
      data: metadata,
    },
  });

  if (error) {
    return { status: "error", error: error.message };
  }

  if (data.session?.user) {
    return redirect(getDashboardRouteForRole(role!));
  }

  return {
    status: "success",
  };
}
