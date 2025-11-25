/**
 * Admin Analytics Top Performers API
 *
 * GET /api/admin/analytics/top-performers
 *
 * Returns top professionals by revenue and top services by booking count.
 * Cached for 1 minute (SHORT duration) to reduce database load.
 */

import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_TAGS } from "@/lib/cache";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

type TopPerformersData = {
  topProfessionals: { id: string; name: string; revenue: number; count: number }[];
  topServices: { service: string; count: number }[];
};

/**
 * Cached top performers data fetch
 * Uses anon client since this is aggregate data, not user-specific
 */
const getCachedTopPerformers = unstable_cache(
  async (): Promise<TopPerformersData> => {
    const supabase = createSupabaseAnonClient();

    // Top 10 professionals by revenue (completed bookings only)
    const { data: professionalRevenue } = await supabase
      .from("bookings")
      .select(`
        professional_id,
        amount_final,
        professional_profiles!inner(
          profile_id,
          full_name
        )
      `)
      .eq("status", "completed")
      .not("amount_final", "is", null);

    // Aggregate revenue by professional
    const proRevenueMap: Record<
      string,
      { id: string; name: string; revenue: number; count: number }
    > = {};

    (professionalRevenue ?? []).forEach((booking) => {
      const proId = booking.professional_id;
      const proProfile = Array.isArray(booking.professional_profiles)
        ? booking.professional_profiles[0]
        : booking.professional_profiles;

      if (!proRevenueMap[proId]) {
        proRevenueMap[proId] = {
          id: proId,
          name: proProfile?.full_name ?? "Unknown",
          revenue: 0,
          count: 0,
        };
      }

      proRevenueMap[proId].revenue += booking.amount_final ?? 0;
      proRevenueMap[proId].count += 1;
    });

    const topProfessionals = Object.values(proRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top 10 services by booking count
    const { data: serviceBookings } = await supabase
      .from("bookings")
      .select("service_name")
      .not("service_name", "is", null);

    // Aggregate bookings by service
    const serviceMap: Record<string, number> = {};

    (serviceBookings ?? []).forEach((booking) => {
      const serviceName = booking.service_name ?? "Unknown Service";
      serviceMap[serviceName] = (serviceMap[serviceName] ?? 0) + 1;
    });

    const topServices = Object.entries(serviceMap)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { topProfessionals, topServices };
  },
  ["admin-analytics-top-performers"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.ADMIN_ANALYTICS, CACHE_TAGS.ADMIN_ANALYTICS_TOP_PERFORMERS],
  }
);

async function handler(_context: unknown, _req: NextRequest) {
  try {
    const data = await getCachedTopPerformers();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Analytics top performers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch top performers" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });
