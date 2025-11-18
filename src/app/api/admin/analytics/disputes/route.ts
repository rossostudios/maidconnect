/**
 * Admin Analytics Disputes API
 *
 * GET /api/admin/analytics/disputes?page=1&limit=20
 *
 * Returns recent disputes with pagination.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/shared/api/middleware";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handler(_context: unknown, req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const offset = (page - 1) * limit;

    // Fetch recent disputes with pagination
    const { data: disputes, count } = await supabase
      .from("disputes")
      .select(
        `
        id,
        dispute_type,
        status,
        priority,
        created_at,
        booking_id,
        opened_by,
        description
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Fetch booking details for disputes
    const disputesWithBookings = await Promise.all(
      (disputes ?? []).map(async (dispute) => {
        const { data: booking } = await supabase
          .from("bookings")
          .select("service_name, scheduled_start")
          .eq("id", dispute.booking_id)
          .single();

        return {
          ...dispute,
          serviceName: booking?.service_name ?? "Unknown",
          bookingDate: booking?.scheduled_start ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        disputes: disputesWithBookings,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error("Analytics disputes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });
