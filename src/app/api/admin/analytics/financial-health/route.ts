/**
 * Admin Analytics Financial Health API
 *
 * GET /api/admin/analytics/financial-health
 *
 * Returns financial health indicators including platform revenue,
 * pending payouts, average booking value, cancellation rate, and dispute rate.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/shared/api/middleware";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handler(_context: unknown, _req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Platform fee is 15% of completed bookings
    const PLATFORM_FEE_PERCENTAGE = 0.15;

    // Fetch completed bookings for platform revenue calculation
    const { data: completedBookings } = await supabase
      .from("bookings")
      .select("amount_final")
      .eq("status", "completed")
      .not("amount_final", "is", null);

    const totalRevenue = (completedBookings ?? []).reduce(
      (sum, booking) => sum + (booking.amount_final ?? 0),
      0
    );
    const platformFeeRevenue = totalRevenue * PLATFORM_FEE_PERCENTAGE;

    // Fetch pending payouts
    const { data: pendingPayouts } = await supabase
      .from("payouts")
      .select("net_amount")
      .eq("status", "pending");

    const professionalPayoutsPending = (pendingPayouts ?? []).reduce(
      (sum, payout) => sum + (payout.net_amount ?? 0),
      0
    );

    // Average booking value
    const avgBookingValue =
      completedBookings && completedBookings.length > 0
        ? totalRevenue / completedBookings.length
        : 0;

    // Cancellation rate
    const { data: allBookings, count: totalBookingsCount } = await supabase
      .from("bookings")
      .select("id, status", { count: "exact" })
      .in("status", ["completed", "canceled"]);

    const canceledCount = (allBookings ?? []).filter((b) => b.status === "canceled").length;
    const cancellationRate =
      totalBookingsCount && totalBookingsCount > 0 ? (canceledCount / totalBookingsCount) * 100 : 0;

    // Dispute rate
    const { count: disputeCount } = await supabase
      .from("disputes")
      .select("id", { count: "exact", head: true });

    const disputeRate =
      totalBookingsCount && totalBookingsCount > 0
        ? ((disputeCount ?? 0) / totalBookingsCount) * 100
        : 0;

    // Determine health status for each metric
    const getHealthStatus = (metric: string, value: number) => {
      switch (metric) {
        case "cancellationRate":
          if (value < 10) return "healthy";
          if (value < 20) return "warning";
          return "critical";
        case "disputeRate":
          if (value < 5) return "healthy";
          if (value < 10) return "warning";
          return "critical";
        default:
          return "healthy";
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        platformFeeRevenue,
        professionalPayoutsPending,
        avgBookingValue,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        cancellationRateStatus: getHealthStatus("cancellationRate", cancellationRate),
        disputeRate: Math.round(disputeRate * 10) / 10,
        disputeRateStatus: getHealthStatus("disputeRate", disputeRate),
      },
    });
  } catch (error) {
    console.error("Analytics financial health error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch financial health metrics" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });
