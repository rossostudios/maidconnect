/**
 * Admin Analytics Overview API
 *
 * GET /api/admin/analytics/overview
 *
 * Returns key metrics with comparison to previous period.
 * Cached for 1 minute (SHORT duration) to reduce database load.
 */

import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_TAGS } from "@/lib/cache";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

type AnalyticsOverview = {
  totalUsers: number;
  activeProfessionals: number;
  currentBookings: number;
  currentRevenue: number;
  bookingsChange: number;
  revenueChange: number;
};

/**
 * Cached analytics data fetch
 * Uses anon client since this is aggregate data, not user-specific
 */
const getCachedAnalyticsOverview = unstable_cache(
  async (): Promise<AnalyticsOverview> => {
    const supabase = createSupabaseAnonClient();
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month metrics
    const [totalUsersResult, activeProsResult, currentBookingsResult, currentRevenueResult] =
      await Promise.all([
        // Total users (customers + professionals)
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .in("role", ["customer", "professional"]),

        // Active professionals (not suspended)
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "professional")
          .eq("account_status", "active")
          .in("onboarding_status", ["approved", "active"]),

        // Current month bookings
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .gte("created_at", currentMonthStart.toISOString()),

        // Current month revenue (completed bookings only)
        supabase
          .from("bookings")
          .select("amount_final")
          .eq("status", "completed")
          .gte("completed_at", currentMonthStart.toISOString())
          .not("amount_final", "is", null),
      ]);

    // Last month metrics for comparison
    const [lastMonthBookingsResult, lastMonthRevenueResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("created_at", lastMonthStart.toISOString())
        .lt("created_at", lastMonthEnd.toISOString()),

      supabase
        .from("bookings")
        .select("amount_final")
        .eq("status", "completed")
        .gte("completed_at", lastMonthStart.toISOString())
        .lt("completed_at", lastMonthEnd.toISOString())
        .not("amount_final", "is", null),
    ]);

    // Calculate totals
    const totalUsers = totalUsersResult.count ?? 0;
    const activeProfessionals = activeProsResult.count ?? 0;
    const currentBookings = currentBookingsResult.count ?? 0;
    const lastMonthBookings = lastMonthBookingsResult.count ?? 0;

    const currentRevenue = (currentRevenueResult.data ?? []).reduce(
      (sum, booking) => sum + (booking.amount_final ?? 0),
      0
    );
    const lastMonthRevenue = (lastMonthRevenueResult.data ?? []).reduce(
      (sum, booking) => sum + (booking.amount_final ?? 0),
      0
    );

    // Calculate percentage changes
    const bookingsChange =
      lastMonthBookings > 0 ? ((currentBookings - lastMonthBookings) / lastMonthBookings) * 100 : 0;
    const revenueChange =
      lastMonthRevenue > 0 ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    return {
      totalUsers,
      activeProfessionals,
      currentBookings,
      currentRevenue,
      bookingsChange: Math.round(bookingsChange * 10) / 10,
      revenueChange: Math.round(revenueChange * 10) / 10,
    };
  },
  ["admin-analytics-overview"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.ADMIN_ANALYTICS, CACHE_TAGS.ADMIN_ANALYTICS_OVERVIEW],
  }
);

async function handler(_context: unknown, _req: NextRequest) {
  try {
    const data = await getCachedAnalyticsOverview();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics overview" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });
