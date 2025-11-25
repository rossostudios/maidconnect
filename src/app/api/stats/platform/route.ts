import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

type PlatformStats = {
  totalBookings: number;
  totalProfessionals: number;
  averageRating: number;
  lastUpdated: string;
};

/**
 * Cached function to fetch platform statistics
 * Revalidates every 5 minutes to reduce DB load while keeping data fresh
 */
const getPlatformStats = unstable_cache(
  async (): Promise<PlatformStats> => {
    const supabase = createSupabaseAnonClient();

    // Fetch total successful bookings (completed bookings)
    const { count: totalBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    if (bookingsError) {
      console.error("Error fetching bookings count:", bookingsError);
    }

    // Fetch total verified professionals
    const { count: totalProfessionals, error: professionalsError } = await supabase
      .from("professional_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "verified")
      .eq("is_active", true);

    if (professionalsError) {
      console.error("Error fetching professionals count:", professionalsError);
    }

    // Fetch average rating using efficient SQL AVG() via RPC
    const { data: avgRatingData, error: ratingsError } = await supabase.rpc(
      "get_average_professional_rating"
    );

    let averageRating = 4.9; // Default fallback

    if (ratingsError) {
      console.error("Error fetching average rating:", ratingsError);
    } else if (avgRatingData !== null) {
      averageRating = Number(avgRatingData);
    }

    return {
      totalBookings: totalBookings || 0,
      totalProfessionals: totalProfessionals || 0,
      averageRating,
      lastUpdated: new Date().toISOString(),
    };
  },
  ["platform-stats"], // Cache key
  {
    revalidate: 300, // Revalidate every 5 minutes
    tags: ["platform-stats", "bookings", "professionals"],
  }
);

// Cache headers for CDN and browser caching
const cacheHeaders = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

/**
 * GET /api/stats/platform
 *
 * Returns platform statistics (cached for 5 minutes):
 * - Total successful bookings (completed status)
 * - Total verified professionals (active with verified status)
 * - Average rating across all professionals
 */
export async function GET() {
  try {
    const stats = await getPlatformStats();

    return NextResponse.json(stats, { headers: cacheHeaders });
  } catch (error) {
    console.error("Error fetching platform stats:", error);

    // Return fallback values on error
    return NextResponse.json(
      {
        totalBookings: 0,
        totalProfessionals: 0,
        averageRating: 4.9,
        lastUpdated: new Date().toISOString(),
        error: "Failed to fetch live stats",
      },
      { headers: cacheHeaders }
    );
  }
}
