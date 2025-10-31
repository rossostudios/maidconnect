"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AppRole } from "@/lib/auth";
import { AUTH_ROUTES, getDashboardRouteForRole } from "@/lib/auth";
import { checkRateLimit, RateLimiters } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { SignUpActionState } from "./types";

const VALID_ROLES: AppRole[] = ["customer", "professional"];

function sanitizeRole(roleCandidate: string | null): AppRole | null {
  if (!roleCandidate) {
    return null;
  }
  return VALID_ROLES.includes(roleCandidate as AppRole) ? (roleCandidate as AppRole) : null;
}

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

function stringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.toString().trim();
  return trimmed.length ? trimmed : null;
}

function validatePhone(phone: string | null) {
  if (!phone) {
    return false;
  }
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return cleaned.length >= 7;
}

function extractSignUpFormData(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    locale: String(formData.get("locale") ?? "en-US"),
    role: sanitizeRole(formData.get("role") as string | null),
    fullName: stringOrNull(formData.get("fullName")),
    phone: stringOrNull(formData.get("phone")),
    city: stringOrNull(formData.get("city")),
    propertyType: stringOrNull(formData.get("propertyType")),
    privacyConsent: formData.get("privacyConsent") === "on",
    termsConsent: formData.get("termsConsent") === "on",
    dataProcessingConsent: formData.get("dataProcessingConsent") === "on",
    marketingConsent: formData.get("marketingConsent") === "on",
  };
}

function validateSignUpFields(data: ReturnType<typeof extractSignUpFormData>): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!data.email) {
    fieldErrors.email = "Email is required.";
  }

  if (!data.password) {
    fieldErrors.password = "Password is required.";
  } else if (data.password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (!data.confirmPassword) {
    fieldErrors.confirmPassword = "Please confirm your password.";
  } else if (data.password !== data.confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (!data.role) {
    fieldErrors.role = "Select an account type.";
  }

  if (!data.fullName || data.fullName.length < 3) {
    fieldErrors.fullName = "Provide your full name.";
  }

  if (!validatePhone(data.phone)) {
    fieldErrors.phone = "Enter a valid phone number.";
  }

  if (!data.city) {
    fieldErrors.city = "City is required.";
  }

  if (data.role === "customer" && !data.propertyType) {
    fieldErrors.propertyType = "Select a property type.";
  }

  return fieldErrors;
}

function validateConsents(data: ReturnType<typeof extractSignUpFormData>): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!data.privacyConsent) {
    fieldErrors.privacyConsent = "You must accept the Privacy Policy.";
  }

  if (!data.termsConsent) {
    fieldErrors.termsConsent = "You must accept the Terms and Conditions.";
  }

  if (!data.dataProcessingConsent) {
    fieldErrors.dataProcessingConsent = "You must authorize data processing to use the platform.";
  }

  return fieldErrors;
}

function buildUserMetadata(data: ReturnType<typeof extractSignUpFormData>): Record<string, unknown> {
  const consentTimestamp = new Date().toISOString();

  const metadata: Record<string, unknown> = {
    role: data.role,
    locale: data.locale,
    phone: data.phone,
    country: "Colombia",
    city: data.city,
    full_name: data.fullName,
    consents: {
      privacy_policy: {
        accepted: data.privacyConsent,
        timestamp: consentTimestamp,
      },
      terms_of_service: {
        accepted: data.termsConsent,
        timestamp: consentTimestamp,
      },
      data_processing: {
        accepted: data.dataProcessingConsent,
        timestamp: consentTimestamp,
      },
      marketing: {
        accepted: data.marketingConsent,
        timestamp: data.marketingConsent ? consentTimestamp : null,
      },
    },
  };

  if (data.role === "customer") {
    metadata.property_preferences = data.propertyType ? { property_type: data.propertyType } : {};
  }

  return metadata;
}

export async function signUpAction(
  _prev: SignUpActionState,
  formData: FormData
): Promise<SignUpActionState> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : headersList.get("x-real-ip") || "unknown";

  const rateLimit = checkRateLimit(`signup:${ip}`, RateLimiters.auth);

  if (!rateLimit.allowed) {
    return {
      status: "error",
      error: rateLimit.message || "Too many signup attempts. Please try again later.",
    };
  }

  const signUpData = extractSignUpFormData(formData);
  const fieldErrors = {
    ...validateSignUpFields(signUpData),
    ...validateConsents(signUpData),
  };

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const metadata = buildUserMetadata(signUpData);

  const { data, error } = await supabase.auth.signUp({
    email: signUpData.email,
    password: signUpData.password,
    options: {
      emailRedirectTo: `${SITE_ORIGIN}${AUTH_ROUTES.signIn}`,
      data: metadata,
    },
  });

  if (error) {
    return { status: "error", error: error.message };
  }

  if (data.session?.user) {
    return redirect(getDashboardRouteForRole(signUpData.role!));
  }

  return {
    status: "success",
  };
}
