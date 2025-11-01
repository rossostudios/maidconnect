import { Suspense } from "react";
import {
  type DirectoryProfessional,
  ProfessionalsDirectory,
} from "@/components/professionals/professionals-directory";
import { type VerificationLevel } from "@/components/professionals/verification-badge";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { ProfessionalsGridSkeleton } from "@/components/skeletons/professionals-skeletons";
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
  // Week 3-4: Trust signals
  verification_level?: string | null;
  rating?: number | null;
  review_count?: number | null;
  on_time_rate?: number | null;
  // Enhanced stats
  total_completed_bookings?: number | null;
  total_earnings?: number | null;
  favorites_count?: number | null;
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

  // Parse verification level
  const verificationLevel: VerificationLevel =
    row.verification_level === "basic" ||
    row.verification_level === "enhanced" ||
    row.verification_level === "background-check"
      ? row.verification_level
      : "none";

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
    // Week 3-4: Trust signals
    verificationLevel,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    onTimeRate: row.on_time_rate ?? 0,
    // Enhanced stats
    totalCompletedBookings: row.total_completed_bookings ?? 0,
    totalEarnings: row.total_earnings ?? 0,
    favoritesCount: row.favorites_count ?? 0,
  };
}

// Async component for professionals grid
async function ProfessionalsGrid() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("list_active_professionals", {
    p_customer_lat: null,
    p_customer_lon: null,
  });

  if (error) {
    console.error("Error fetching professionals:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error,
    });
    return <ProfessionalsDirectory professionals={[]} />;
  }

  const rows = Array.isArray(data)
    ? data.filter(
        (row): row is ListActiveProfessionalRow =>
          row !== null &&
          typeof row === "object" &&
          typeof (row as ListActiveProfessionalRow).profile_id === "string"
      )
    : [];

  const professionals = rows.map((row) => mapRowToDirectoryProfessional(row));

  return <ProfessionalsDirectory professionals={professionals} />;
}

export default function ProfessionalsPage() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      {/* Static shell - loads instantly */}
      <SiteHeader />
      <main>
        {/* React 19: Suspense boundary - grid streams in progressively */}
        <Suspense fallback={<ProfessionalsGridSkeleton />}>
          <ProfessionalsGrid />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
