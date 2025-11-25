import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import type { DirectoryProfessional, DirectoryResponse } from "@/components/directory/types";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import {
  CACHE_DURATIONS,
  CACHE_HEADERS,
  CACHE_TAGS,
  type DirectoryParams,
} from "@/lib/cache";

type DirectoryQueryParams = DirectoryParams & {
  minRating?: number;
};

/**
 * Cached function to fetch professionals directory data using optimized RPC
 * Joins metrics at database level for proper sorting and pagination
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

    // Use optimized RPC function that joins metrics at database level
    const { data, error } = await supabase.rpc("get_directory_professionals", {
      p_country_code: country || null,
      p_city_id: city || null,
      p_service: service || null,
      p_min_experience: minExperience || null,
      p_min_rating: minRating || null,
      p_verified_only: verifiedOnly || false,
      p_search_query: query || null,
      p_sort_by: sort,
      p_page: page,
      p_limit: limit,
    });

    if (error) {
      console.error("Error fetching professionals:", error);
      throw new Error("Failed to fetch professionals");
    }

    // Get total count from first row (all rows have same total_count)
    const totalCount = data?.[0]?.total_count || 0;

    // Transform data to match DirectoryProfessional interface
    const professionals: DirectoryProfessional[] = (data || []).map((pro: any) => {
      // Build location label
      const cityName = pro.city_name || pro.city || "";
      const countryName = pro.country_name_en || pro.country || "";
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
        currency: pro.currency_code || "COP",
        experienceYears: pro.experience_years,
        languages: pro.languages || [],
        isAvailableToday: false, // TODO: Calculate from availability
        averageRating: pro.average_rating || null,
        totalReviews: pro.total_reviews || 0,
        totalBookings: pro.total_bookings || 0,
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

    return {
      professionals,
      total: Number(totalCount),
      page,
      totalPages: Math.ceil(Number(totalCount) / limit),
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
