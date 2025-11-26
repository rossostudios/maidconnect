"use server";

import { headers } from "next/headers";
import { checkRateLimit, RateLimiters } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { AmbassadorApplicationState, ProfessionType, ReferralReach } from "./types";

const VALID_PROFESSIONS: ProfessionType[] = [
  "realtor",
  "lawyer",
  "accountant",
  "interior_designer",
  "property_manager",
  "blogger",
  "community_leader",
  "other",
];

const VALID_REACH: ReferralReach[] = ["1-5", "6-15", "16-30", "31+"];

const VALID_COUNTRIES = ["CO", "PY", "UY", "AR"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function extractApplicationData(formData: FormData) {
  return {
    fullName: stringOrNull(formData.get("fullName")),
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    phone: stringOrNull(formData.get("phone")),
    country: String(formData.get("country") ?? "CO"),
    city: stringOrNull(formData.get("city")),
    profession: stringOrNull(formData.get("profession")),
    companyName: stringOrNull(formData.get("companyName")),
    referralReach: stringOrNull(formData.get("referralReach")),
    motivation: stringOrNull(formData.get("motivation")),
    socialMedia: stringOrNull(formData.get("socialMedia")),
    termsAccepted: formData.get("termsAccepted") === "on",
  };
}

function validateApplicationFields(
  data: ReturnType<typeof extractApplicationData>
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!data.fullName || data.fullName.length < 3) {
    fieldErrors.fullName = "Please provide your full name.";
  }

  if (!data.email) {
    fieldErrors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email)) {
    fieldErrors.email = "Please enter a valid email address.";
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

  if (!(data.profession && VALID_PROFESSIONS.includes(data.profession as ProfessionType))) {
    fieldErrors.profession = "Please select your profession.";
  }

  if (!(data.referralReach && VALID_REACH.includes(data.referralReach as ReferralReach))) {
    fieldErrors.referralReach = "Please estimate your referral reach.";
  }

  if (!data.motivation || data.motivation.length < 20) {
    fieldErrors.motivation = "Please tell us why you want to join (at least 20 characters).";
  }

  if (!data.termsAccepted) {
    fieldErrors.termsAccepted = "You must accept the Ambassador Program terms.";
  }

  return fieldErrors;
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "AMB-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function submitAmbassadorApplication(
  _prev: AmbassadorApplicationState,
  formData: FormData
): Promise<AmbassadorApplicationState> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0]?.trim() || "unknown"
    : headersList.get("x-real-ip") || "unknown";

  const rateLimit = checkRateLimit(`ambassador-apply:${ip}`, RateLimiters.auth);

  if (!rateLimit.allowed) {
    return {
      status: "error",
      error: rateLimit.message || "Too many submissions. Please try again later.",
    };
  }

  const applicationData = extractApplicationData(formData);
  const fieldErrors = validateApplicationFields(applicationData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  // Check if email already has a pending/approved application
  const { data: existingApplication } = await supabase
    .from("ambassadors")
    .select("id, status")
    .eq("email", applicationData.email)
    .single();

  if (existingApplication) {
    if (existingApplication.status === "pending") {
      return {
        status: "error",
        error: "You already have a pending application. We'll review it soon!",
      };
    }
    if (existingApplication.status === "approved") {
      return {
        status: "error",
        error: "You're already an approved ambassador. Please log in to your dashboard.",
      };
    }
    // If rejected, allow reapplication
  }

  // Generate unique referral code
  let referralCode = generateReferralCode();
  let codeExists = true;
  let attempts = 0;

  while (codeExists && attempts < 10) {
    const { data: existing } = await supabase
      .from("ambassadors")
      .select("id")
      .eq("referral_code", referralCode)
      .single();

    if (existing) {
      referralCode = generateReferralCode();
      attempts++;
    } else {
      codeExists = false;
    }
  }

  // Create or update ambassador application
  const applicationPayload = {
    email: applicationData.email,
    full_name: applicationData.fullName,
    phone: applicationData.phone,
    country: applicationData.country,
    city: applicationData.city,
    profession: applicationData.profession,
    company_name: applicationData.companyName,
    referral_reach: applicationData.referralReach,
    motivation: applicationData.motivation,
    social_media_links: applicationData.socialMedia ? [applicationData.socialMedia] : [],
    referral_code: referralCode,
    status: "pending" as const,
    is_active: false,
    applied_at: new Date().toISOString(),
  };

  if (existingApplication) {
    // Update existing rejected application
    const { error } = await supabase
      .from("ambassadors")
      .update(applicationPayload)
      .eq("id", existingApplication.id);

    if (error) {
      console.error("Ambassador application update error:", error);
      return { status: "error", error: "Failed to submit application. Please try again." };
    }
  } else {
    // Create new application
    const { error } = await supabase.from("ambassadors").insert(applicationPayload);

    if (error) {
      console.error("Ambassador application insert error:", error);
      return { status: "error", error: "Failed to submit application. Please try again." };
    }
  }

  return {
    status: "success",
  };
}
