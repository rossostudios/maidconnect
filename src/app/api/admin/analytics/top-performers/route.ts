/**
 * Admin Analytics Top Performers API
 *
 * GET /api/admin/analytics/top-performers
 *
 * Returns top professionals by revenue and top services by booking count.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/shared/api/middleware";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handler(_context: unknown, _req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

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

    return NextResponse.json({
      success: true,
      data: {
        topProfessionals,
        topServices,
      },
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
