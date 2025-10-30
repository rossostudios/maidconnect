"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { type OnboardingActionState, OPTIONAL_DOCUMENTS, REQUIRED_DOCUMENTS } from "./state";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function stringOrNull(value: FormDataEntryValue | null): string | null {
  if (!value) {
    return null;
  }
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
    const { error: insertError } = await supabase
      .from("professional_profiles")
      .insert({ profile_id: profileId });
    if (insertError) {
      throw insertError;
    }
  }
}

export async function submitApplication(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", error: "Not authenticated." };
  }

  try {
    await ensureProfessionalProfile(user.id, supabase);
  } catch (_error) {
    return { status: "error", error: "Could not initialize professional profile." };
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
  const experienceYears =
    parsedExperience !== null && !Number.isNaN(parsedExperience) ? parsedExperience : null;

  const rateRaw = stringOrNull(formData.get("rate"));
  const parsedRate = rateRaw ? Number.parseInt(rateRaw, 10) : null;
  const hourlyRate = parsedRate !== null && !Number.isNaN(parsedRate) ? parsedRate : null;

  const primaryServices = formData
    .getAll("services")
    .map((value) => value.toString())
    .filter(Boolean);

  const fieldErrors: Record<string, string> = {};

  if (!fullName) {
    fieldErrors.fullName = "Full name is required.";
  }
  if (!idNumber) {
    fieldErrors.idNumber = "ID number is required.";
  }
  if (!phone) {
    fieldErrors.phone = "Phone number is required.";
  }
  if (!country) {
    fieldErrors.country = "Country is required.";
  }
  if (!city) {
    fieldErrors.city = "City is required.";
  }
  if (experienceYears === null || experienceYears < 0) {
    fieldErrors.experienceYears = "Enter your years of experience.";
  }
  if (hourlyRate === null || hourlyRate <= 0) {
    fieldErrors.rate = "Provide your standard hourly rate in COP.";
  }
  if (primaryServices.length === 0) {
    fieldErrors.services = "Select at least one service you offer.";
  }
  if (!consentBackgroundCheck) {
    fieldErrors.consent = "Consent is required for background checks.";
  }

  const references: Array<ReferenceEntry | null> = [1, 2].map((index) => {
    const name = stringOrNull(formData.get(`reference_name_${index}`));
    const relationship = stringOrNull(formData.get(`reference_relationship_${index}`));
    const contact = stringOrNull(formData.get(`reference_contact_${index}`));
    if (!(name || relationship || contact)) {
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

  referencesData.forEach((reference, index) => {
    if (!reference.name) {
      fieldErrors[`reference_name_${index + 1}`] = "Reference name is required.";
    }
    if (!reference.contact) {
      fieldErrors[`reference_contact_${index + 1}`] = "Reference contact is required.";
    }
  });

  if (referencesData.length < 2) {
    fieldErrors.references = "Provide two references with contact information.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

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

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);
  if (profileError) {
    return { status: "error", error: profileError.message };
  }

  const { error: professionalError } = await supabase
    .from("professional_profiles")
    .upsert(professionalUpdate, { onConflict: "profile_id" });

  if (professionalError) {
    return { status: "error", error: professionalError.message };
  }

  revalidatePath("/dashboard/pro");
  return {
    status: "success",
    message: "Application submitted. We'll review your details shortly.",
    fieldErrors: {},
  };
}

const DOCUMENTS_BUCKET_ID = "professional-documents";
const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
]);

type DocumentCandidate = {
  documentType: string;
  file: File;
  note: string | null;
};

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]+/g, "-");
}

export async function submitDocuments(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", error: "Not authenticated." };
  }

  const fieldErrors: Record<string, string> = {};
  const uploads: DocumentCandidate[] = [];

  for (const doc of REQUIRED_DOCUMENTS) {
    const file = formData.get(`document_${doc.key}`) as File | null;
    const note = stringOrNull(formData.get(`document_${doc.key}_note`));
    if (!file || file.size === 0) {
      fieldErrors[`document_${doc.key}`] = `${doc.label} is required.`;
      continue;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      fieldErrors[`document_${doc.key}`] = "File must be 5MB or smaller.";
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.type)) {
      fieldErrors[`document_${doc.key}`] = "Only PDF, JPG, or PNG files are supported.";
    }

    uploads.push({ documentType: doc.key, file, note });
  }

  for (const doc of OPTIONAL_DOCUMENTS) {
    const file = formData.get(`document_${doc.key}`) as File | null;
    const note = stringOrNull(formData.get(`document_${doc.key}_note`));
    if (!file || file.size === 0) {
      continue;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      fieldErrors[`document_${doc.key}`] = "File must be 5MB or smaller.";
      continue;
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.type)) {
      fieldErrors[`document_${doc.key}`] = "Only PDF, JPG, or PNG files are supported.";
      continue;
    }

    uploads.push({ documentType: doc.key, file, note });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      error: "Please fix the highlighted files before continuing.",
      fieldErrors,
    };
  }

  const { data: existingDocs, error: existingDocsError } = await supabase
    .from("professional_documents")
    .select("storage_path")
    .eq("profile_id", user.id);

  if (existingDocsError) {
    return { status: "error", error: existingDocsError.message };
  }

  const uploadedPaths: string[] = [];

  if (existingDocs && existingDocs.length > 0) {
    const existingPaths = existingDocs.map((doc) => doc.storage_path);
    const { error: storageRemoveError } = await supabase.storage
      .from(DOCUMENTS_BUCKET_ID)
      .remove(existingPaths);

    if (storageRemoveError) {
      return {
        status: "error",
        error: "Unable to replace existing documents right now. Please try again.",
      };
    }
  }

  const { error: deleteError } = await supabase
    .from("professional_documents")
    .delete()
    .eq("profile_id", user.id);
  if (deleteError) {
    return { status: "error", error: deleteError.message };
  }

  const documentRows: Array<{
    profile_id: string;
    document_type: string;
    storage_path: string;
    metadata: Record<string, unknown>;
  }> = [];

  for (const candidate of uploads) {
    const sanitizedName = sanitizeFileName(candidate.file.name || `${candidate.documentType}.dat`);
    const storagePath = `${user.id}/${candidate.documentType}/${Date.now()}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET_ID)
      .upload(storagePath, candidate.file, {
        cacheControl: "3600",
        upsert: false,
        contentType: candidate.file.type || undefined,
      });

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(DOCUMENTS_BUCKET_ID).remove(uploadedPaths);
      }
      return { status: "error", error: "We couldn't upload your files. Please try again." };
    }

    uploadedPaths.push(storagePath);
    documentRows.push({
      profile_id: user.id,
      document_type: candidate.documentType,
      storage_path: storagePath,
      metadata: {
        originalName: candidate.file.name,
        size: candidate.file.size,
        mimeType: candidate.file.type,
        note: candidate.note,
      },
    });
  }

  if (documentRows.length > 0) {
    const { error: insertError } = await supabase
      .from("professional_documents")
      .insert(documentRows);
    if (insertError) {
      await supabase.storage.from(DOCUMENTS_BUCKET_ID).remove(uploadedPaths);
      return { status: "error", error: insertError.message };
    }
  }

  const { error: statusError } = await supabase
    .from("profiles")
    .update({ onboarding_status: "approved" })
    .eq("id", user.id);

  if (statusError) {
    return { status: "error", error: statusError.message };
  }

  revalidatePath("/dashboard/pro");
  return {
    status: "success",
    message: "Documents uploaded successfully. We'll review and confirm within 3-5 business days.",
  };
}

export async function submitProfile(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", error: "Not authenticated." };
  }

  const bio = stringOrNull(formData.get("bio"));
  const languages = Array.from(
    new Set(formData.getAll("languages").map((value) => value.toString()))
  );

  const serviceNames = formData.getAll("service_name").map((value) => value.toString());
  const serviceRates = formData.getAll("service_rate").map((value) => stringOrNull(value));
  const serviceDescriptions = formData
    .getAll("service_description")
    .map((value) => stringOrNull(value));

  const fieldErrors: Record<string, string> = {};

  if (!bio || bio.length < 150) {
    fieldErrors.bio = "Please provide a bio with at least 150 characters.";
  }

  if (languages.length === 0) {
    fieldErrors.languages = "Select at least one language.";
  }

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

  if (services.length === 0) {
    fieldErrors.services = "Provide rates or descriptions for at least one service.";
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const availabilitySchedule = days
    .map((day) => {
      const slug = day.toLowerCase().replace(/\s+/g, "_");
      const start = stringOrNull(formData.get(`availability_${slug}_start`));
      const end = stringOrNull(formData.get(`availability_${slug}_end`));
      const notes = stringOrNull(formData.get(`availability_${slug}_notes`));

      if (!(start || end || notes)) {
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

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

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
    return { status: "error", error: professionalError.message };
  }

  const { error: statusError } = await supabase
    .from("profiles")
    .update({ onboarding_status: "active" })
    .eq("id", user.id);

  if (statusError) {
    return { status: "error", error: statusError.message };
  }

  revalidatePath("/dashboard/pro");
  return {
    status: "success",
    message: "Profile submitted. Welcome to MaidConnect!",
  };
}
