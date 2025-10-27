"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getDashboardRouteForRole } from "@/lib/auth";

export const REQUIRED_DOCUMENTS = [
  { key: "government_id", label: "Government ID" },
  { key: "proof_of_address", label: "Proof of address" },
] as const;

export const OPTIONAL_DOCUMENTS = [
  { key: "certification", label: "Professional certification (optional)" },
] as const;

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function stringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value) return null;
  const trimmed = value.toString().trim();
  return trimmed.length ? trimmed : null;
}

function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

type ReferenceEntry = {
  name: string | null;
  relationship: string | null;
  contact: string | null;
};

async function ensureProfessionalProfile(profileId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("professional_profiles")
    .select("profile_id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (!data) {
    const { error: insertError } = await supabase.from("professional_profiles").insert({ profile_id: profileId });
    if (insertError) {
      throw insertError;
    }
  }
}

export async function submitApplication(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  try {
    await ensureProfessionalProfile(user.id, supabase);
  } catch (error) {
    console.error("Failed to ensure professional profile", error);
    return { error: "Could not initialize professional profile." };
  }

  const fullName = stringOrNull(formData.get("fullName"));
  const idNumber = stringOrNull(formData.get("idNumber"));
  const phone = stringOrNull(formData.get("phone"));
  const country = stringOrNull(formData.get("country"));
  const city = stringOrNull(formData.get("city"));
  const availabilityNotes = stringOrNull(formData.get("availability"));
  const consentBackgroundCheck = formData.get("consent") === "on";

  const experienceYearsRaw = stringOrNull(formData.get("experienceYears"));
  const parsedExperience = experienceYearsRaw ? Number.parseInt(experienceYearsRaw, 10) : null;
  const experienceYears = parsedExperience !== null && !Number.isNaN(parsedExperience) ? parsedExperience : null;

  const rateRaw = stringOrNull(formData.get("rate"));
  const parsedRate = rateRaw ? Number.parseInt(rateRaw, 10) : null;
  const hourlyRate = parsedRate !== null && !Number.isNaN(parsedRate) ? parsedRate : null;

  const primaryServices = formData.getAll("services").map((value) => value.toString()).filter(Boolean);

  const references: Array<ReferenceEntry | null> = [1, 2].map((index) => {
    const name = stringOrNull(formData.get(`reference_name_${index}`));
    const relationship = stringOrNull(formData.get(`reference_relationship_${index}`));
    const contact = stringOrNull(formData.get(`reference_contact_${index}`));
    if (!name && !relationship && !contact) {
      return null;
    }
    return {
      name,
      relationship,
      contact,
    };
  });

  const referencesData = references.filter(isNotNull);

  const availabilityData: Record<string, unknown> = {};
  if (availabilityNotes) {
    availabilityData.application_notes = availabilityNotes;
  }

  const profileUpdate = {
    phone: phone ?? null,
    country: country ?? null,
    city: city ?? null,
    onboarding_status: "application_in_review",
  };

  const professionalUpdate = {
    profile_id: user.id,
    full_name: fullName ?? null,
    id_number: idNumber ?? null,
    experience_years: experienceYears ?? null,
    primary_services: primaryServices,
    rate_expectations: hourlyRate != null ? { hourly_cop: hourlyRate } : null,
    availability: availabilityData,
    references_data: referencesData,
    consent_background_check: consentBackgroundCheck,
    status: "application_submitted",
  };

  const { error: profileError } = await supabase.from("profiles").update(profileUpdate).eq("id", user.id);
  if (profileError) {
    return { error: profileError.message };
  }

  const { error: professionalError } = await supabase
    .from("professional_profiles")
    .upsert(professionalUpdate, { onConflict: "profile_id" });

  if (professionalError) {
    return { error: professionalError.message };
  }

  revalidatePath("/dashboard/pro");
  revalidatePath("/dashboard/pro/onboarding");
  return { success: true, next: "application_in_review" };
}

export async function submitDocuments(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const documentRows: Array<{
    profile_id: string;
    document_type: string;
    storage_path: string;
    metadata: Record<string, unknown>;
  }> = [];

  for (const doc of REQUIRED_DOCUMENTS) {
    const reference = stringOrNull(formData.get(`document_${doc.key}`));
    const note = stringOrNull(formData.get(`document_${doc.key}_note`));
    if (!reference) {
      return { error: `Please provide ${doc.label}.` };
    }
    documentRows.push({
      profile_id: user.id,
      document_type: doc.key,
      storage_path: reference,
      metadata: note ? { note } : {},
    });
  }

  for (const doc of OPTIONAL_DOCUMENTS) {
    const reference = stringOrNull(formData.get(`document_${doc.key}`));
    const note = stringOrNull(formData.get(`document_${doc.key}_note`));
    if (reference) {
      documentRows.push({
        profile_id: user.id,
        document_type: doc.key,
        storage_path: reference,
        metadata: note ? { note } : {},
      });
    }
  }

  const { error: deleteError } = await supabase.from("professional_documents").delete().eq("profile_id", user.id);
  if (deleteError) {
    return { error: deleteError.message };
  }

  if (documentRows.length > 0) {
    const { error: insertError } = await supabase.from("professional_documents").insert(documentRows);
    if (insertError) {
      return { error: insertError.message };
    }
  }

  const { error: statusError } = await supabase
    .from("profiles")
    .update({ onboarding_status: "approved" })
    .eq("id", user.id);

  if (statusError) {
    return { error: statusError.message };
  }

  revalidatePath("/dashboard/pro");
  revalidatePath("/dashboard/pro/onboarding");
  return { success: true, next: "approved" };
}

export async function submitProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const bio = stringOrNull(formData.get("bio"));
  const languages = Array.from(new Set(formData.getAll("languages").map((value) => value.toString())));

  const serviceNames = formData.getAll("service_name").map((value) => value.toString());
  const serviceRates = formData.getAll("service_rate").map((value) => stringOrNull(value));
  const serviceDescriptions = formData.getAll("service_description").map((value) => stringOrNull(value));

  const services = serviceNames
    .map((name, index) => {
      const rateEntry = serviceRates[index];
      const parsedRate = rateEntry ? Number.parseInt(rateEntry, 10) : null;
      const rateValue = parsedRate !== null && !Number.isNaN(parsedRate) ? parsedRate : null;
      const description = serviceDescriptions[index];

      const hasMeaningfulData = rateValue !== null || (description && description.length > 0);
      if (!hasMeaningfulData) {
        return null;
      }

      return {
        name,
        hourly_rate_cop: rateValue,
        description: description ?? null,
      };
    })
    .filter(isNotNull);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const availabilitySchedule = days
    .map((day) => {
      const slug = day.toLowerCase().replace(/\s+/g, "_");
      const start = stringOrNull(formData.get(`availability_${slug}_start`));
      const end = stringOrNull(formData.get(`availability_${slug}_end`));
      const notes = stringOrNull(formData.get(`availability_${slug}_notes`));

      if (!start && !end && !notes) {
        return null;
      }

      return {
        day,
        start,
        end,
        notes,
      };
    })
    .filter(isNotNull);

  const professionalUpdate: Record<string, unknown> = {
    bio: bio ?? null,
    languages,
    services: services.length > 0 ? services : [],
    onboarding_completed_at: new Date().toISOString(),
    status: "profile_submitted",
  };

  if (availabilitySchedule.length > 0) {
    professionalUpdate.availability = { schedule: availabilitySchedule };
  }

  const { error: professionalError } = await supabase
    .from("professional_profiles")
    .update(professionalUpdate)
    .eq("profile_id", user.id);

  if (professionalError) {
    return { error: professionalError.message };
  }

  const { error: statusError } = await supabase
    .from("profiles")
    .update({ onboarding_status: "active" })
    .eq("id", user.id);

  if (statusError) {
    return { error: statusError.message };
  }

  revalidatePath("/dashboard/pro");
  revalidatePath("/dashboard/pro/onboarding");
  return { success: true, next: getDashboardRouteForRole("professional") };
}
