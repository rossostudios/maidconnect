import {
  type DirectoryProfessional,
  ProfessionalsDirectory,
} from "@/components/professionals/professionals-directory";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import {
  computeAvailableToday,
  formatLocation,
  parseAvailability,
  parseServices,
} from "@/lib/professionals/transformers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ListActiveProfessionalRow = {
  profile_id: string;
  full_name: string | null;
  bio: string | null;
  experience_years: number | null;
  languages: string[] | null;
  services: unknown;
  primary_services: string[] | null;
  city: string | null;
  country: string | null;
  availability: unknown;
  professional_status: string | null;
};

const DEFAULT_PRO_PHOTO =
  "https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?auto=format&fit=crop&w=600&q=80";

function mapRowToDirectoryProfessional(row: ListActiveProfessionalRow): DirectoryProfessional {
  const services = parseServices(row.services);
  const availability = parseAvailability(row.availability);
  const primaryService =
    services.find((service) => Boolean(service.name))?.name ?? row.primary_services?.[0] ?? null;
  const hourlyRate =
    services.find((service) => typeof service.hourlyRateCop === "number")?.hourlyRateCop ?? null;

  return {
    id: row.profile_id,
    name: row.full_name ?? "MaidConnect Professional",
    service: primaryService,
    experienceYears: row.experience_years ?? null,
    hourlyRateCop: hourlyRate,
    languages: Array.isArray(row.languages)
      ? row.languages.filter((lang): lang is string => typeof lang === "string")
      : [],
    city: row.city ?? null,
    country: row.country ?? null,
    location: formatLocation(row.city, row.country) || "Colombia",
    availableToday: computeAvailableToday(availability),
    photoUrl: DEFAULT_PRO_PHOTO,
    bio: row.bio,
  };
}

export const dynamic = "force-dynamic";

export default async function ProfessionalsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("list_active_professionals");

  if (error) {
    console.error("Failed to load professional directory", error);
  }

  const professionals: DirectoryProfessional[] = Array.isArray(data)
    ? data
        .filter(
          (row): row is ListActiveProfessionalRow =>
            row !== null &&
            typeof row === "object" &&
            typeof (row as ListActiveProfessionalRow).profile_id === "string"
        )
        .map((row) => mapRowToDirectoryProfessional(row as ListActiveProfessionalRow))
    : [];

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
        <ProfessionalsDirectory professionals={professionals} />
      </main>
      <SiteFooter />
    </div>
  );
}
