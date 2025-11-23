"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth";
import { trackSignupServer } from "@/lib/integrations/posthog/server";
import { checkRateLimit, RateLimiters } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  AvailabilityOption,
  ExperienceLevel,
  ProSignUpActionState,
  ServiceCategory,
} from "./types";

const VALID_SERVICES: ServiceCategory[] = [
  "housekeeping",
  "childcare",
  "cooking",
  "eldercare",
  "petcare",
  "gardening",
  "maintenance",
  "other",
];

const VALID_EXPERIENCE: ExperienceLevel[] = ["0-1", "1-3", "3-5", "5-10", "10+"];

const VALID_AVAILABILITY: AvailabilityOption[] = ["full-time", "part-time", "weekends", "flexible"];

const VALID_COUNTRIES = ["CO", "PY", "UY", "AR"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function extractProSignUpFormData(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    locale: String(formData.get("locale") ?? "en-US"),
    fullName: stringOrNull(formData.get("fullName")),
    phone: stringOrNull(formData.get("phone")),
    country: String(formData.get("country") ?? "CO"),
    city: stringOrNull(formData.get("city")),
    primaryService: stringOrNull(formData.get("primaryService")),
    experience: stringOrNull(formData.get("experience")),
    availability: stringOrNull(formData.get("availability")),
    referralCode: stringOrNull(formData.get("referralCode")),
    privacyConsent: formData.get("privacyConsent") === "on",
    termsConsent: formData.get("termsConsent") === "on",
    dataProcessingConsent: formData.get("dataProcessingConsent") === "on",
  };
}

function validateProSignUpFields(
  data: ReturnType<typeof extractProSignUpFormData>
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!data.email) {
    fieldErrors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email)) {
    fieldErrors.email = "Please enter a valid email address.";
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

  if (!data.fullName || data.fullName.length < 3) {
    fieldErrors.fullName = "Please provide your full name.";
  }

  if (!validatePhone(data.phone)) {
    fieldErrors.phone = "Please enter a valid phone number.";
  }

  if (!(data.country && VALID_COUNTRIES.includes(data.country))) {
    fieldErrors.country = "Please select a valid country.";
  }

  if (!data.city) {
    fieldErrors.city = "City is required.";
  }

  if (!(data.primaryService && VALID_SERVICES.includes(data.primaryService as ServiceCategory))) {
    fieldErrors.primaryService = "Please select your primary service.";
  }

  if (!(data.experience && VALID_EXPERIENCE.includes(data.experience as ExperienceLevel))) {
    fieldErrors.experience = "Please select your experience level.";
  }

  if (
    !(data.availability && VALID_AVAILABILITY.includes(data.availability as AvailabilityOption))
  ) {
    fieldErrors.availability = "Please select your availability.";
  }

  return fieldErrors;
}

function validateConsents(
  data: ReturnType<typeof extractProSignUpFormData>
): Record<string, string> {
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

function buildProUserMetadata(
  data: ReturnType<typeof extractProSignUpFormData>
): Record<string, unknown> {
  const consentTimestamp = new Date().toISOString();

  return {
    role: "professional",
    locale: data.locale,
    phone: data.phone,
    country: data.country,
    city: data.city,
    full_name: data.fullName,
    primary_service: data.primaryService,
    experience_level: data.experience,
    availability: data.availability,
    referral_code: data.referralCode || null,
    onboarding_completed: false,
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
    },
  };
}

async function trackAmbassadorReferral(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  referralCode: string,
  referredEmail: string,
  referredName: string | null
): Promise<void> {
  // Check if it's an ambassador referral code (starts with AMB-)
  if (!referralCode.startsWith("AMB-")) {
    return;
  }

  try {
    // Find the ambassador by referral code
    const { data: ambassador, error: ambassadorError } = await supabase
      .from("ambassadors")
      .select("id")
      .eq("referral_code", referralCode)
      .eq("is_active", true)
      .single();

    if (ambassadorError || !ambassador) {
      console.warn("Ambassador not found for code:", referralCode);
      return;
    }

    // Create the referral record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 days expiration

    await supabase.from("ambassador_referrals").insert({
      ambassador_id: ambassador.id,
      referred_email: referredEmail,
      referred_name: referredName,
      status: "pending",
      signed_up_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    // Update ambassador stats
    await supabase.rpc("increment_ambassador_referrals", {
      p_ambassador_id: ambassador.id,
    });
  } catch (error) {
    console.error("Error tracking ambassador referral:", error);
    // Don't fail signup if referral tracking fails
  }
}

export async function proSignUpAction(
  _prev: ProSignUpActionState,
  formData: FormData
): Promise<ProSignUpActionState> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0]?.trim() || "unknown"
    : headersList.get("x-real-ip") || "unknown";

  const rateLimit = checkRateLimit(`pro-signup:${ip}`, RateLimiters.auth);

  if (!rateLimit.allowed) {
    return {
      status: "error",
      error: rateLimit.message || "Too many signup attempts. Please try again later.",
    };
  }

  const signUpData = extractProSignUpFormData(formData);
  const fieldErrors = {
    ...validateProSignUpFields(signUpData),
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
  const metadata = buildProUserMetadata(signUpData);

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

  // Track ambassador referral if applicable
  if (signUpData.referralCode) {
    await trackAmbassadorReferral(
      supabase,
      signUpData.referralCode,
      signUpData.email,
      signUpData.fullName
    );
  }

  if (data.session?.user) {
    // Track successful signup
    await trackSignupServer({
      userId: data.session.user.id,
      method: "email",
      role: "professional",
      locale: signUpData.locale,
    });

    // Redirect to professional onboarding
    return redirect("/dashboard/pro/onboarding");
  }

  return {
    status: "success",
  };
}
