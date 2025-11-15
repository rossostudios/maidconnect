import { Suspense } from "react";
import {
  type DirectoryProfessional,
  ProfessionalsDirectory,
} from "@/components/professionals/professionals-directory";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { ProfessionalsGridSkeleton } from "@/components/skeletons/professionals-skeletons";
import {
  extractHourlyRate,
  extractPrimaryService,
  filterLanguages,
  parseVerificationLevel,
} from "@/lib/professionals/mapper-helpers";
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

  // Extract service information using helper functions
  const primaryService = extractPrimaryService(services, row.primary_services);
  const hourlyRate = extractHourlyRate(services);

  return {
    id: row.profile_id,
    name: row.full_name ?? "Casaora Professional",
    service: primaryService,
    experienceYears: row.experience_years ?? null,
    hourlyRateCop: hourlyRate,
    languages: filterLanguages(row.languages),
    city: row.city ?? null,
    country: row.country ?? null,
    location: formatLocation(row.city, row.country) || "Colombia",
    availableToday: computeAvailableToday(availability),
    photoUrl: DEFAULT_PRO_PHOTO,
    bio: row.bio,
    // Week 3-4: Trust signals
    verificationLevel: parseVerificationLevel(row.verification_level),
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
    // Proper error handling following Supabase best practices
    console.error("Error fetching professionals:", {
      message: error.message || "Unknown error",
      details: error.details || null,
      hint: error.hint || null,
      code: error.code || null,
      // Serialize the full error properly
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });

    // Log to help debug RPC function issues
    console.error("RPC call failed: list_active_professionals", {
      parameters: { p_customer_lat: null, p_customer_lon: null },
      errorType: error.constructor.name,
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
    <div className="bg-neutral-50 text-neutral-900">
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
