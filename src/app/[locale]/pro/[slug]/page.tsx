import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  type ProfessionalProfileDetail,
  ProfessionalProfileView,
} from "@/components/professionals/professional-profile-view";
import type {
  ProfessionalBookingSummary,
  ProfessionalReviewSummary,
} from "@/components/professionals/types";
import { ShareSection } from "@/components/professionals/social-share-buttons";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { getSession } from "@/lib/auth";
import {
  computeAvailableToday,
  formatLocation,
  parseAvailability,
  parseServices,
} from "@/lib/professionals/transformers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isValidSlug } from "@/lib/utils/slug";

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
    slug: string;
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
  verification_level?: string | null;
  interview_completed?: boolean | null;
  direct_hire_fee_cop?: number | null;
  profile_visibility?: string | null;
  share_earnings_badge?: boolean | null;
  total_earnings_cop?: number | null;
  total_bookings_completed?: number | null;
  // Verification data from admin_professional_reviews (joined)
  background_check_passed?: boolean | null;
  documents_verified?: boolean | null;
  references_verified?: boolean | null;
};

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
    directHireFeeCOP: row.direct_hire_fee_cop ?? null,
    // Enhanced verification data
    verification: {
      level: (row.verification_level as any) ?? "none",
      backgroundCheckPassed: row.background_check_passed ?? undefined,
      documentsVerified: row.documents_verified ?? undefined,
      interviewCompleted: row.interview_completed ?? undefined,
      referencesVerified: row.references_verified ?? undefined,
    },
    // Public profile features
    shareEarningsBadge: row.share_earnings_badge ?? false,
    totalEarningsCOP: row.total_earnings_cop ?? undefined,
    totalBookingsCompleted: row.total_bookings_completed ?? undefined,
  };
}

/**
 * Fetches professional profile by slug
 * Only returns profiles with profile_visibility = 'public'
 */
async function fetchProfessionalBySlug(
  slug: string
): Promise<ProfessionalProfileDetail | null> {
  const supabase = await createSupabaseServerClient();

  // Look up professional by slug
  const { data: profileData, error: profileError } = await supabase
    .from("professional_profiles")
    .select(
      `
      profile_id,
      full_name,
      bio,
      experience_years,
      languages,
      services,
      primary_services,
      availability,
      references_data,
      portfolio_images,
      city,
      country,
      verification_level,
      direct_hire_fee_cop,
      profile_visibility,
      share_earnings_badge,
      total_earnings_cop,
      total_bookings_completed
    `
    )
    .eq("slug", slug)
    .eq("profile_visibility", "public")
    .eq("status", "active")
    .maybeSingle();

  if (profileError || !profileData) {
    return null;
  }

  // Get verification data from admin reviews
  const { data: verificationData } = await supabase.rpc("get_professional_profile", {
    p_profile_id: profileData.profile_id,
  });

  let professional: ProfessionalProfileDetail | null = null;

  if (verificationData && Array.isArray(verificationData) && verificationData.length > 0) {
    const row = verificationData[0] as GetProfessionalRow;
    professional = mapRowToProfessionalDetail({
      ...profileData,
      ...row,
    });
  } else {
    professional = mapRowToProfessionalDetail(profileData as GetProfessionalRow);
  }

  if (!professional) {
    return null;
  }

  // Fetch bookings (recent 30 days)
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_start, duration_minutes, amount_estimated, amount_authorized, amount_captured, currency, service_name"
    )
    .eq("professional_id", profileData.profile_id)
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

  // Fetch reviews
  const { data: reviewsData } = await supabase
    .from("professional_reviews")
    .select("id, rating, title, comment, reviewer_name, created_at")
    .eq("professional_id", profileData.profile_id)
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
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.professionalProfile.meta" });

  if (!isValidSlug(slug)) {
    return {
      title: t("notFoundTitle"),
    };
  }

  const professional = await fetchProfessionalBySlug(slug);

  if (!professional) {
    return {
      title: t("notFoundTitle"),
    };
  }

  const locationSnippet = professional.location ? ` in ${professional.location}` : "";
  const serviceSnippet = professional.service ? ` for ${professional.service}` : "";

  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/og/pro/${slug}`;

  return {
    title: `${professional.name} · Casaora`,
    description: t("descriptionTemplate", {
      name: professional.name,
      service: serviceSnippet,
      location: locationSnippet,
    }),
    openGraph: {
      title: `${professional.name} · Casaora`,
      description: t("descriptionTemplate", {
        name: professional.name,
        service: serviceSnippet,
        location: locationSnippet,
      }),
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/pro/${slug}`,
      siteName: "Casaora",
      type: "profile",
      locale: locale,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${professional.name} - ${professional.service || 'Professional'}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${professional.name} · Casaora`,
      description: t("descriptionTemplate", {
        name: professional.name,
        service: serviceSnippet,
        location: locationSnippet,
      }),
      images: [ogImageUrl],
    },
  };
}

export default async function PublicProfessionalProfileRoute({ params }: RouteParams) {
  const { slug, locale } = await params;

  // Validate slug format
  if (!isValidSlug(slug)) {
    notFound();
  }

  // Fetch professional profile
  const [professional, session] = await Promise.all([
    fetchProfessionalBySlug(slug),
    getSession(),
  ]);

  // If profile not found or not public, show 404
  if (!professional) {
    notFound();
  }

  // Construct vanity URL for sharing
  const vanityUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pro/${slug}`;

  return (
    <div className="bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <ProfessionalProfileView
        locale={locale}
        professional={professional}
        viewer={session.user}
        isPublicView={true}
      />

      {/* Social Share Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <ShareSection
          url={vanityUrl}
          professionalName={professional.name}
          service={professional.service ?? undefined}
        />
      </div>

      <SiteFooter />
    </div>
  );
}
