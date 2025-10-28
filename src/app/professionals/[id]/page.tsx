import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProfessionalProfileView,
  type ProfessionalProfileDetail,
} from "@/components/professionals/professional-profile-view";
import {
  computeAvailableToday,
  formatLocation,
  parseAvailability,
  parseReferences,
  parseServices,
} from "@/lib/professionals/transformers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type GetProfessionalRow = {
  profile_id: string;
  full_name: string | null;
  bio: string | null;
  experience_years: number | null;
  languages: string[] | null;
  services: unknown;
  primary_services: string[] | null;
  availability: unknown;
  references_data: unknown;
  city: string | null;
  country: string | null;
};

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapRowToProfessionalDetail(row: GetProfessionalRow): ProfessionalProfileDetail {
  const services = parseServices(row.services);
  const availability = parseAvailability(row.availability);
  const references = parseReferences(row.references_data);

  const primaryService =
    services.find((service) => Boolean(service.name))?.name ?? row.primary_services?.[0] ?? null;
  const hourlyRateCop =
    services.find((service) => typeof service.hourlyRateCop === "number")?.hourlyRateCop ?? null;

  const languages = Array.isArray(row.languages)
    ? row.languages.filter((entry): entry is string => typeof entry === "string")
    : [];

  return {
    id: row.profile_id,
    name: row.full_name ?? "MaidConnect Professional",
    service: primaryService,
    bio: row.bio,
    experienceYears: row.experience_years ?? null,
    languages,
    city: row.city ?? null,
    country: row.country ?? null,
    location: formatLocation(row.city, row.country) || "Colombia",
    services,
    availability,
    references,
    availableToday: computeAvailableToday(availability),
    hourlyRateCop,
    photoUrl: null,
  };
}

async function fetchProfessional(profileId: string): Promise<ProfessionalProfileDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_professional_profile", {
    p_profile_id: profileId,
  });

  if (!error && Array.isArray(data) && data.length > 0) {
    const row = data[0] as GetProfessionalRow | null;
    if (row && typeof row.profile_id === "string") {
      return mapRowToProfessionalDetail(row);
    }
  }

  if (error) {
    console.warn("get_professional_profile failed, falling back to list_active_professionals", error);
  }

  const { data: fallbackData, error: fallbackError } = await supabase.rpc("list_active_professionals");
  if (fallbackError) {
    console.error("Failed to load professionals via fallback", fallbackError);
    return null;
  }

  if (!Array.isArray(fallbackData)) {
    return null;
  }

  const match = fallbackData.find((row) => {
    if (!row || typeof row !== "object") return false;
    const value = (row as { profile_id?: string | null }).profile_id;
    return value === profileId;
  }) as GetProfessionalRow | undefined;

  if (!match) {
    return null;
  }

  return mapRowToProfessionalDetail(match);
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id: rawId } = await params;
  const profileId = rawId;
  if (!isValidUuid(profileId)) {
    return {
      title: "Professional not found · MaidConnect",
    };
  }

  const professional = await fetchProfessional(profileId);

  if (!professional) {
    return {
      title: "Professional not found · MaidConnect",
    };
  }

  const locationSnippet = professional.location ? ` in ${professional.location}` : "";
  const serviceSnippet = professional.service ? ` for ${professional.service}` : "";

  return {
    title: `${professional.name} · MaidConnect`,
    description: `View ${professional.name}'s MaidConnect profile${serviceSnippet}${locationSnippet}.`,
  };
}

export default async function ProfessionalProfileRoute({ params }: RouteParams) {
  const { id: rawId } = await params;
  const profileId = rawId;
  if (!isValidUuid(profileId)) {
    notFound();
  }

  const professional = await fetchProfessional(profileId);

  if (!professional) {
    notFound();
  }

  return <ProfessionalProfileView professional={professional} />;
}
