import { NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

/**
 * GET /api/stats/platform
 *
 * Returns real-time platform statistics:
 * - Total successful bookings (completed status)
 * - Total verified professionals (active with verified status)
 * - Average rating across all professionals
 *
 * Note: Using no-store cache directive for real-time data
 */
export async function GET() {
  // Force no caching for real-time stats
  const headers = {
    "Cache-Control": "no-store, max-age=0",
  };
  try {
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

    // Fetch average rating across all professionals
    const { data: ratingsData, error: ratingsError } = await supabase
      .from("professional_profiles")
      .select("rating")
      .eq("status", "verified")
      .eq("is_active", true)
      .not("rating", "is", null);

    let averageRating = 4.9; // Default fallback

    if (ratingsError) {
      console.error("Error fetching ratings:", ratingsError);
    } else if (ratingsData && ratingsData.length > 0) {
      const sum = ratingsData.reduce((acc, prof) => acc + (prof.rating || 0), 0);
      averageRating = sum / ratingsData.length;
      // Round to 1 decimal place
      averageRating = Math.round(averageRating * 10) / 10;
    }

    return NextResponse.json(
      {
        totalBookings: totalBookings || 0,
        totalProfessionals: totalProfessionals || 0,
        averageRating,
        lastUpdated: new Date().toISOString(),
      },
      { headers }
    );
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
      { headers }
    );
  }
}
