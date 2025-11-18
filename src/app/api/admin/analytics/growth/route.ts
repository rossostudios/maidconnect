/**
 * Admin Analytics Growth API
 *
 * GET /api/admin/analytics/growth
 *
 * Returns time-series data for users, bookings, and revenue.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/shared/api/middleware";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handler(_context: unknown, _req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all bookings from last 30 days
    const { data: bookings } = await supabase
      .from("bookings")
      .select("created_at, status, amount_final")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    // Fetch all user registrations from last 30 days
    const { data: users } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    // Group by date
    const dateMap: Record<
      string,
      { date: string; users: number; bookings: number; revenue: number }
    > = {};

    // Initialize last 30 days with zeros
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0] ?? "";
      if (dateStr) {
        dateMap[dateStr] = { date: dateStr, users: 0, bookings: 0, revenue: 0 };
      }
    }

    // Populate users
    (users ?? []).forEach((user) => {
      const dateStr = user.created_at.split("T")[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].users += 1;
      }
    });

    // Populate bookings and revenue
    (bookings ?? []).forEach((booking) => {
      const dateStr = booking.created_at.split("T")[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].bookings += 1;
        if (booking.status === "completed" && booking.amount_final) {
          dateMap[dateStr].revenue += booking.amount_final;
        }
      }
    });

    // Convert to array and sort
    const growthData = Object.values(dateMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: growthData,
    });
  } catch (error) {
    console.error("Analytics growth error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch growth analytics" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });
