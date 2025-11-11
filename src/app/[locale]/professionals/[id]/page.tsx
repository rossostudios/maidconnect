import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  type ProfessionalProfileDetail,
  ProfessionalProfileView,
} from "@/components/professionals/professional-profile-view";
import type {
  ProfessionalBookingSummary,
  ProfessionalReviewSummary,
} from "@/components/professionals/types";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { getSession } from "@/lib/auth";
import {
  computeAvailableToday,
  formatLocation,
  parseAvailability,
  parseServices,
} from "@/lib/professionals/transformers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProfessionalPortfolioImage = {
  url: string;
  caption: string | null;
};

function parsePortfolioImages(payload: unknown): ProfessionalPortfolioImage[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const record = entry as Record<string, unknown>;
      const url = typeof record.url === "string" ? record.url : null;
      if (!url) {
        return null;
      }
      const caption = typeof record.caption === "string" ? record.caption : null;
      return { url, caption } satisfies ProfessionalPortfolioImage;
    })
    .filter((value): value is ProfessionalPortfolioImage => Boolean(value));
}

type RouteParams = {
  params: Promise<{
    id: string;
    locale: string;
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
  portfolio_images: unknown;
  city: string | null;
  country: string | null;
};

function isValidUuid(value: string) {
  return UUID_REGEX.test(value);
}

function mapRowToProfessionalDetail(row: GetProfessionalRow): ProfessionalProfileDetail {
  const services = parseServices(row.services);
  const availability = parseAvailability(row.availability);
  const portfolioImages = parsePortfolioImages(row.portfolio_images);

  const primaryService =
    services.find((service) => Boolean(service.name))?.name ?? row.primary_services?.[0] ?? null;
  const hourlyRateCop =
    services.find((service) => typeof service.hourlyRateCop === "number")?.hourlyRateCop ?? null;

  const languages = Array.isArray(row.languages)
    ? row.languages.filter((entry): entry is string => typeof entry === "string")
    : [];

  return {
    id: row.profile_id,
    name: row.full_name ?? "Casaora Professional",
    service: primaryService,
    bio: row.bio,
    experienceYears: row.experience_years ?? null,
    languages,
    city: row.city ?? null,
    country: row.country ?? null,
    location: formatLocation(row.city, row.country) || "Colombia",
    services,
    availability,
    availableToday: computeAvailableToday(availability),
    hourlyRateCop,
    photoUrl: null,
    bookings: [],
    reviews: [],
    portfolioImages,
  };
}

async function fetchProfessional(profileId: string): Promise<ProfessionalProfileDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_professional_profile", {
    p_profile_id: profileId,
  });

  let professional: ProfessionalProfileDetail | null = null;

  if (!error && Array.isArray(data) && data.length > 0) {
    const row = data[0] as GetProfessionalRow | null;
    if (row && typeof row.profile_id === "string") {
      professional = mapRowToProfessionalDetail(row);
    }
  }

  if (error) {
    console.error("Error fetching professional profile:", error);
  }

  const { data: fallbackData, error: fallbackError } = await supabase.rpc(
    "list_active_professionals"
  );
  if (fallbackError) {
    return null;
  }

  if (!professional) {
    if (!Array.isArray(fallbackData)) {
      return null;
    }

    const match = fallbackData.find((row) => {
      if (!row || typeof row !== "object") {
        return false;
      }
      const value = (row as { profile_id?: string | null }).profile_id;
      return value === profileId;
    }) as GetProfessionalRow | undefined;

    if (!match) {
      return null;
    }

    professional = mapRowToProfessionalDetail(match);
  }

  if (!professional) {
    return null;
  }

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_start, duration_minutes, amount_estimated, amount_authorized, amount_captured, currency, service_name"
    )
    .eq("professional_id", profileId)
    .gte("scheduled_start", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("scheduled_start", { ascending: true });

  professional.bookings = (bookingsData ?? []).map(
    (booking) =>
      ({
        id: booking.id,
        status: booking.status,
        scheduledStart: booking.scheduled_start,
        durationMinutes: booking.duration_minutes,
        amountEstimated: booking.amount_estimated,
        amountAuthorized: booking.amount_authorized,
        amountCaptured: booking.amount_captured,
        currency: booking.currency,
        serviceName: booking.service_name,
      }) satisfies ProfessionalBookingSummary
  );

  const { data: reviewsData } = await supabase
    .from("professional_reviews")
    .select("id, rating, title, comment, reviewer_name, created_at")
    .eq("professional_id", profileId)
    .order("created_at", { ascending: false });

  professional.reviews = (reviewsData ?? []).map(
    (review) =>
      ({
        id: review.id,
        rating: review.rating ?? 5,
        title: review.title,
        comment: review.comment,
        reviewerName: review.reviewer_name,
        createdAt: review.created_at,
      }) satisfies ProfessionalReviewSummary
  );

  return professional;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id: rawId, locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.professionalProfile.meta" });
  const profileId = rawId;

  if (!isValidUuid(profileId)) {
    return {
      title: t("notFoundTitle"),
    };
  }

  const professional = await fetchProfessional(profileId);

  if (!professional) {
    return {
      title: t("notFoundTitle"),
    };
  }

  const locationSnippet = professional.location ? ` in ${professional.location}` : "";
  const serviceSnippet = professional.service ? ` for ${professional.service}` : "";

  return {
    title: `${professional.name} · Casaora`,
    description: t("descriptionTemplate", {
      name: professional.name,
      service: serviceSnippet,
      location: locationSnippet,
    }),
  };
}

export default async function ProfessionalProfileRoute({ params }: RouteParams) {
  const { id: rawId, locale } = await params;
  const profileId = rawId;
  if (!isValidUuid(profileId)) {
    notFound();
  }

  const [professional, session] = await Promise.all([fetchProfessional(profileId), getSession()]);

  if (!professional) {
    notFound();
  }

  return (
    <div className="bg-[#FFEEFF8E8] text-[#116611616]">
      <SiteHeader />
      <ProfessionalProfileView locale={locale} professional={professional} viewer={session.user} />
      <SiteFooter />
    </div>
  );
}
