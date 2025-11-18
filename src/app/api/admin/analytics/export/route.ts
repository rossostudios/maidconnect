/**
 * Admin Analytics Export API
 *
 * POST /api/admin/analytics/export
 *
 * Generates CSV export with all metrics.
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

    // Fetch all necessary data
    const [
      { count: totalUsers },
      { count: activePros },
      { count: totalBookings },
      { data: completedBookings },
      { data: disputes },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("role", ["customer", "professional"]),

      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "professional")
        .eq("account_status", "active"),

      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString()),

      supabase
        .from("bookings")
        .select("amount_final")
        .eq("status", "completed")
        .not("amount_final", "is", null),

      supabase
        .from("disputes")
        .select("id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const totalRevenue = (completedBookings ?? []).reduce(
      (sum, b) => sum + (b.amount_final ?? 0),
      0
    );

    // Generate CSV content
    const csv = [
      ["Casaora Analytics Export"],
      [`Generated: ${now.toISOString()}`],
      [],
      ["Metric", "Value"],
      ["Total Users", totalUsers ?? 0],
      ["Active Professionals", activePros ?? 0],
      ["Total Bookings (30d)", totalBookings ?? 0],
      ["Total Revenue (COP)", totalRevenue],
      ["Platform Fee Revenue (15%)", Math.round(totalRevenue * 0.15)],
      ["Active Disputes", (disputes ?? []).filter((d) => d.status !== "resolved").length],
      [],
      ["Recent Disputes"],
      ["ID", "Status", "Created At"],
      ...(disputes ?? []).map((d) => [d.id, d.status, d.created_at]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="casaora-analytics-${now.toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Analytics export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export analytics" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const POST = withAuth(handler, { requiredRole: "admin" });
