import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import type { DirectoryProfessional, DirectoryResponse } from "@/components/directory/types";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import {
  CACHE_DURATIONS,
  CACHE_HEADERS,
  CACHE_TAGS,
  type DirectoryParams,
  directoryKey,
} from "@/lib/cache";

type DirectoryQueryParams = DirectoryParams & {
  minRating?: number;
};

/**
 * Cached function to fetch professionals directory data
 * Revalidates every 10 minutes (STANDARD duration)
 */
const getCachedDirectory = unstable_cache(
  async (params: DirectoryQueryParams): Promise<DirectoryResponse> => {
    const {
      country,
      city,
      service,
      minExperience,
      minRating,
      verifiedOnly,
      query,
      sort = "rating",
      page = 1,
      limit = 20,
    } = params;

    const supabase = createSupabaseAnonClient();

    // Build the query - Note: metrics are fetched separately since FK is on profiles, not professional_profiles
    let dbQuery = supabase
      .from("professional_profiles")
      .select(
        `
        profile_id,
        full_name,
        avatar_url,
        bio,
        country,
        city,
        country_code,
        city_id,
        primary_services,
        rate_expectations,
        experience_years,
        languages,
        verification_level,
        background_check_status,
        interview_completed,
        location_latitude,
        location_longitude,
        status,
        cities!city_id (
          name
        ),
        countries!country_code (
          name_en,
          name_es,
          currency_code
        )
      `,
        { count: "exact" }
      )
      .eq("status", "active");

    // Apply filters
    if (country) {
      dbQuery = dbQuery.eq("country_code", country.toUpperCase());
    }

    if (city) {
      dbQuery = dbQuery.eq("city_id", city);
    }

    // Note: neighborhood filter skipped - column doesn't exist in DB

    if (service) {
      // Filter by primary service (contains)
      dbQuery = dbQuery.contains("primary_services", [service]);
    }

    // Note: rate filtering requires parsing rate_expectations JSON
    // Skipping direct DB filtering for now - can filter post-query if needed

    if (minExperience) {
      dbQuery = dbQuery.gte("experience_years", minExperience);
    }

    if (verifiedOnly) {
      dbQuery = dbQuery.in("verification_level", ["standard", "premium", "elite"]);
    }

    // Background checks are MANDATORY for our boutique marketplace
    // All professionals must be background checked to appear in directory
    dbQuery = dbQuery.eq("background_check_status", "approved");

    if (query) {
      // Search by name or bio
      dbQuery = dbQuery.or(`full_name.ilike.%${query}%,bio.ilike.%${query}%`);
    }

    // Apply sorting
    switch (sort) {
      case "rating":
        // Sort by rating requires joining with metrics
        dbQuery = dbQuery.order("created_at", { ascending: false });
        break;
      case "reviews":
        dbQuery = dbQuery.order("created_at", { ascending: false });
        break;
      case "price-asc":
        dbQuery = dbQuery.order("hourly_rate", { ascending: true, nullsFirst: false });
        break;
      case "price-desc":
        dbQuery = dbQuery.order("hourly_rate", { ascending: false, nullsFirst: false });
        break;
      case "experience":
        dbQuery = dbQuery.order("experience_years", { ascending: false, nullsFirst: false });
        break;
      default:
        dbQuery = dbQuery.order("created_at", { ascending: false });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await dbQuery;

    if (error) {
      console.error("Error fetching professionals:", error);
      throw new Error("Failed to fetch professionals");
    }

    // Fetch metrics separately using profile_ids
    const profileIds = (data || []).map((p) => p.profile_id).filter(Boolean);
    let metricsMap: Record<
      string,
      { average_rating: number | null; total_reviews: number; total_bookings: number }
    > = {};

    if (profileIds.length > 0) {
      const { data: metricsData } = await supabase
        .from("professional_performance_metrics")
        .select("profile_id, average_rating, total_reviews, total_bookings")
        .in("profile_id", profileIds);

      if (metricsData) {
        metricsMap = metricsData.reduce(
          (acc, m) => {
            acc[m.profile_id] = {
              average_rating: m.average_rating,
              total_reviews: m.total_reviews || 0,
              total_bookings: m.total_bookings || 0,
            };
            return acc;
          },
          {} as typeof metricsMap
        );
      }
    }

    // Transform data to match DirectoryProfessional interface
    const professionals: DirectoryProfessional[] = (data || []).map((pro) => {
      const metrics = metricsMap[pro.profile_id] || {
        average_rating: null,
        total_reviews: 0,
        total_bookings: 0,
      };

      const cityData = Array.isArray(pro.cities) ? pro.cities[0] : pro.cities;
      const countryData = Array.isArray(pro.countries) ? pro.countries[0] : pro.countries;

      // Build location label
      const cityName = cityData?.name || pro.city || "";
      const countryName = countryData?.name_en || pro.country || "";
      const locationLabel = [cityName, countryName].filter(Boolean).join(", ");

      // Parse rate_expectations if available (JSON with min/max hourly rate)
      const rateExpectations = pro.rate_expectations as { min?: number; max?: number } | null;
      const hourlyRateCents = rateExpectations?.min ? rateExpectations.min * 100 : null;

      return {
        id: pro.profile_id,
        name: pro.full_name || "Professional",
        avatarUrl: pro.avatar_url,
        bio: pro.bio,
        country: pro.country_code as DirectoryProfessional["country"],
        city: pro.city_id || pro.city,
        neighborhood: null, // Not in DB schema
        locationLabel,
        primaryService: Array.isArray(pro.primary_services)
          ? pro.primary_services[0]
          : pro.primary_services,
        services: Array.isArray(pro.primary_services) ? pro.primary_services : [],
        hourlyRateCents,
        currency: countryData?.currency_code || "COP",
        experienceYears: pro.experience_years,
        languages: pro.languages || [],
        isAvailableToday: false, // TODO: Calculate from availability
        averageRating: metrics?.average_rating || null,
        totalReviews: metrics?.total_reviews || 0,
        totalBookings: metrics?.total_bookings || 0,
        verificationLevel: pro.verification_level || "unverified",
        isBackgroundChecked: pro.background_check_status === "approved",
        isDocumentsVerified: pro.verification_level !== "unverified",
        isInterviewCompleted: pro.interview_completed,
        isReferencesVerified: false, // TODO: Add to schema
        introVideoUrl: null, // Not in DB schema
        introVideoStatus: "none",
        latitude: pro.location_latitude,
        longitude: pro.location_longitude,
      };
    });

    // Apply rating filter (post-query since it requires joined data)
    let filteredProfessionals = professionals;
    if (minRating) {
      filteredProfessionals = professionals.filter(
        (p) => p.averageRating !== null && p.averageRating >= minRating
      );
    }

    // Sort by rating/reviews if needed (post-query sorting for joined data)
    if (sort === "rating") {
      filteredProfessionals.sort((a, b) => {
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        return ratingB - ratingA;
      });
    } else if (sort === "reviews") {
      filteredProfessionals.sort((a, b) => b.totalReviews - a.totalReviews);
    }

    return {
      professionals: filteredProfessionals,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      limit,
    };
  },
  ["directory-professionals"],
  {
    revalidate: CACHE_DURATIONS.STANDARD,
    tags: [CACHE_TAGS.PROFESSIONALS, CACHE_TAGS.PROFESSIONALS_DIRECTORY],
  }
);

/**
 * GET /api/directory/professionals
 *
 * Fetches professionals for the directory with filtering, sorting, and pagination.
 * Cached for 10 minutes with CDN support.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;
    const service = searchParams.get("service") || undefined;
    const minExperienceStr = searchParams.get("minExperience");
    const minRatingStr = searchParams.get("minRating");
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const backgroundCheck = searchParams.get("backgroundChecked") === "true";
    const query = searchParams.get("query") || undefined;
    const sort = searchParams.get("sort") || "rating";
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20", 10), 50);

    const params: DirectoryQueryParams = {
      country,
      city,
      service,
      minExperience: minExperienceStr ? Number.parseInt(minExperienceStr, 10) : undefined,
      minRating: minRatingStr ? Number.parseFloat(minRatingStr) : undefined,
      verifiedOnly,
      backgroundCheck,
      query,
      sort,
      page,
      limit,
    };

    // Use cached function for data fetching
    const response = await getCachedDirectory(params);

    // Return with CDN cache headers
    return NextResponse.json(response, { headers: CACHE_HEADERS.STANDARD });
  } catch (error) {
    console.error("Unexpected error in directory API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
