/**
 * Professional Dashboard Stats API
 * GET /api/pro/dashboard/stats - Get professional's dashboard statistics
 *
 * Query Parameters:
 * - period: '7d' | '30d' | '90d' (default: '7d')
 *
 * Returns:
 * - Period-based earnings (paid, upcoming, pending)
 * - Booking counts and trends
 * - Performance metrics
 * - Chart data for visualizations
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { COUNTRIES, type CountryCode } from "@/lib/shared/config/territories";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Period = "7d" | "30d" | "90d";

function getPeriodDates(period: Period): { start: Date; end: Date; previousStart: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  const previousStart = new Date(now);

  switch (period) {
    case "7d":
      start.setDate(start.getDate() - 7);
      previousStart.setDate(previousStart.getDate() - 14);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      previousStart.setDate(previousStart.getDate() - 60);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      previousStart.setDate(previousStart.getDate() - 180);
      break;
  }

  start.setHours(0, 0, 0, 0);
  previousStart.setHours(0, 0, 0, 0);

  return { start, end, previousStart };
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const period = (searchParams.get("period") as Period) || "7d";

  if (!["7d", "30d", "90d"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  try {
    const { start, end, previousStart } = getPeriodDates(period);

    // Get professional profile with balance data
    const { data: profile } = await supabase
      .from("professional_profiles")
      .select("available_balance_cents, pending_balance_cents, total_earnings_cents, country_code")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    const countryCode = (profile.country_code as CountryCode) || "CO";
    const currencyCode = COUNTRIES[countryCode]?.currencyCode || "COP";

    // Get all bookings for this professional
    const { data: allBookings } = await supabase
      .from("bookings")
      .select(
        "id, status, scheduled_start, amount_captured, amount_authorized, amount_estimated, created_at, currency"
      )
      .eq("professional_id", user.id);

    const bookings = allBookings || [];

    // Calculate earnings breakdown
    // PAID: Completed bookings with captured amounts in the period
    const paidBookings = bookings.filter((b) => {
      if (b.status !== "completed" || !b.amount_captured || !b.scheduled_start) return false;
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= start && bookingDate <= end;
    });
    const paidEarnings = paidBookings.reduce((sum, b) => sum + (b.amount_captured || 0), 0);

    // UPCOMING: Confirmed future bookings
    const now = new Date();
    const upcomingBookings = bookings.filter((b) => {
      if (b.status !== "confirmed" || !b.scheduled_start) return false;
      return new Date(b.scheduled_start) > now;
    });
    const upcomingEarnings = upcomingBookings.reduce(
      (sum, b) => sum + (b.amount_authorized || b.amount_estimated || 0),
      0
    );

    // PENDING: In-progress bookings or completed but not yet paid out (from balance)
    const pendingEarnings = profile.pending_balance_cents || 0;

    // Calculate previous period for trend
    const previousPaidBookings = bookings.filter((b) => {
      if (b.status !== "completed" || !b.amount_captured || !b.scheduled_start) return false;
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= previousStart && bookingDate < start;
    });
    const previousPaidEarnings = previousPaidBookings.reduce(
      (sum, b) => sum + (b.amount_captured || 0),
      0
    );
    const earningsTrend = calculateTrend(paidEarnings, previousPaidEarnings);

    // Booking counts
    const periodBookings = bookings.filter((b) => {
      if (!b.scheduled_start) return false;
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= start && bookingDate <= end;
    });

    const completedCount = periodBookings.filter((b) => b.status === "completed").length;
    const upcomingCount = upcomingBookings.length;
    const cancelledCount = periodBookings.filter((b) => b.status === "cancelled").length;
    const totalCount = periodBookings.length;

    // Previous period booking count for trend
    const previousPeriodBookings = bookings.filter((b) => {
      if (!b.scheduled_start) return false;
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= previousStart && bookingDate < start;
    });
    const bookingsTrend = calculateTrend(totalCount, previousPeriodBookings.length);

    // Get performance metrics
    const { data: metrics } = await supabase
      .from("professional_performance_metrics")
      .select("average_rating, total_reviews, completion_rate, average_response_time_minutes")
      .eq("profile_id", user.id)
      .maybeSingle();

    // Calculate response rate (inverted from avg response time - simplified)
    const responseRate = metrics?.average_response_time_minutes
      ? Math.max(0, Math.min(100, 100 - metrics.average_response_time_minutes / 2))
      : 0;

    // Build chart data - earnings trend by day/week
    const earningsTrendData = buildEarningsTrendData(bookings, start, end, period);
    const bookingActivityData = buildBookingActivityData(bookings, start, end, period);

    return NextResponse.json({
      success: true,
      period,
      currencyCode,
      earnings: {
        paid: paidEarnings,
        upcoming: upcomingEarnings,
        pending: pendingEarnings,
        trend: earningsTrend,
        paidBookingsCount: paidBookings.length,
        upcomingBookingsCount: upcomingBookings.length,
      },
      bookings: {
        total: totalCount,
        completed: completedCount,
        upcoming: upcomingCount,
        cancelled: cancelledCount,
        trend: bookingsTrend,
      },
      performance: {
        rating: metrics?.average_rating || 0,
        totalReviews: metrics?.total_reviews || 0,
        responseRate: Math.round(responseRate),
        completionRate: Math.round((metrics?.completion_rate || 0) * 100) / 100,
      },
      charts: {
        earningsTrend: earningsTrendData,
        bookingActivity: bookingActivityData,
      },
    });
  } catch (error) {
    logger.error("[Dashboard Stats API] Failed to get stats", {
      professionalId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}

type Booking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  amount_captured: number | null;
  amount_authorized: number | null;
  amount_estimated: number | null;
  created_at: string | null;
  currency: string | null;
};

function buildEarningsTrendData(
  bookings: Booking[],
  start: Date,
  end: Date,
  period: Period
): Array<{ date: string; amount: number }> {
  const data: Array<{ date: string; amount: number }> = [];

  // For 7d: daily, for 30d: weekly, for 90d: weekly
  const interval = period === "7d" ? "day" : "week";

  const current = new Date(start);
  while (current <= end) {
    let intervalEnd: Date;

    if (interval === "day") {
      intervalEnd = new Date(current);
      intervalEnd.setHours(23, 59, 59, 999);
    } else {
      intervalEnd = new Date(current);
      intervalEnd.setDate(intervalEnd.getDate() + 6);
      intervalEnd.setHours(23, 59, 59, 999);
      if (intervalEnd > end) intervalEnd = end;
    }

    const intervalBookings = bookings.filter((b) => {
      if (b.status !== "completed" || !b.amount_captured || !b.scheduled_start) return false;
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= current && bookingDate <= intervalEnd;
    });

    const amount = intervalBookings.reduce((sum, b) => sum + (b.amount_captured || 0), 0);

    const dateLabel =
      interval === "day"
        ? current.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `${current.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    data.push({ date: dateLabel, amount });

    if (interval === "day") {
      current.setDate(current.getDate() + 1);
    } else {
      current.setDate(current.getDate() + 7);
    }
  }

  return data;
}

function buildBookingActivityData(
  bookings: Booking[],
  start: Date,
  end: Date,
  period: Period
): Array<{ date: string; completed: number; upcoming: number; cancelled: number }> {
  const data: Array<{ date: string; completed: number; upcoming: number; cancelled: number }> = [];
  const now = new Date();

  const interval = period === "7d" ? "day" : "week";

  const current = new Date(start);
  while (current <= end) {
    let intervalEnd: Date;

    if (interval === "day") {
      intervalEnd = new Date(current);
      intervalEnd.setHours(23, 59, 59, 999);
    } else {
      intervalEnd = new Date(current);
      intervalEnd.setDate(intervalEnd.getDate() + 6);
      intervalEnd.setHours(23, 59, 59, 999);
      if (intervalEnd > end) intervalEnd = end;
    }

    const intervalBookings = bookings.filter((b) => {
      if (!b.scheduled_start) return false;
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= current && bookingDate <= intervalEnd;
    });

    const completed = intervalBookings.filter((b) => b.status === "completed").length;
    const upcoming = intervalBookings.filter(
      (b) => b.status === "confirmed" && b.scheduled_start && new Date(b.scheduled_start) > now
    ).length;
    const cancelled = intervalBookings.filter((b) => b.status === "cancelled").length;

    const dateLabel =
      interval === "day"
        ? current.toLocaleDateString("en-US", { weekday: "short" })
        : `${current.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    data.push({ date: dateLabel, completed, upcoming, cancelled });

    if (interval === "day") {
      current.setDate(current.getDate() + 1);
    } else {
      current.setDate(current.getDate() + 7);
    }
  }

  return data;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
