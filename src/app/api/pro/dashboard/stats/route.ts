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
    default:
      // Default to 7d if somehow an invalid period is passed
      start.setDate(start.getDate() - 7);
      previousStart.setDate(previousStart.getDate() - 14);
  }

  start.setHours(0, 0, 0, 0);
  previousStart.setHours(0, 0, 0, 0);

  return { start, end, previousStart };
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
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

    // Get all bookings for this professional (with service_name for breakdown)
    const { data: allBookings } = await supabase
      .from("bookings")
      .select(
        "id, status, scheduled_start, amount_captured, amount_authorized, amount_estimated, created_at, currency, service_name, customer_id"
      )
      .eq("professional_id", user.id);

    const bookings = allBookings || [];

    // Get recent bookings with client info for the table
    const { data: recentBookingsData } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        scheduled_start,
        amount_captured,
        amount_authorized,
        amount_estimated,
        service_name,
        customer_id,
        users!bookings_customer_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq("professional_id", user.id)
      .order("scheduled_start", { ascending: false })
      .limit(5);

    // Calculate earnings breakdown
    // PAID: Completed bookings with captured amounts in the period
    const paidBookings = bookings.filter((b) => {
      if (b.status !== "completed" || !b.amount_captured || !b.scheduled_start) {
        return false;
      }
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= start && bookingDate <= end;
    });
    const paidEarnings = paidBookings.reduce((sum, b) => sum + (b.amount_captured || 0), 0);

    // UPCOMING: Confirmed future bookings
    const now = new Date();
    const upcomingBookings = bookings.filter((b) => {
      if (b.status !== "confirmed" || !b.scheduled_start) {
        return false;
      }
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
      if (b.status !== "completed" || !b.amount_captured || !b.scheduled_start) {
        return false;
      }
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
      if (!b.scheduled_start) {
        return false;
      }
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= start && bookingDate <= end;
    });

    const completedCount = periodBookings.filter((b) => b.status === "completed").length;
    const upcomingCount = upcomingBookings.length;
    const cancelledCount = periodBookings.filter((b) => b.status === "cancelled").length;
    const totalCount = periodBookings.length;

    // Previous period booking count for trend
    const previousPeriodBookings = bookings.filter((b) => {
      if (!b.scheduled_start) {
        return false;
      }
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

    // Service breakdown for donut chart (completed bookings in period)
    const serviceBreakdown = buildServiceBreakdown(
      periodBookings.filter((b) => b.status === "completed")
    );

    // Revenue flow by month (last 12 months)
    const revenueFlow = buildRevenueFlowByMonth(bookings);

    // Active clients count (unique customers with completed/confirmed bookings in period)
    const activeClientIds = new Set(
      periodBookings
        .filter((b) => ["completed", "confirmed"].includes(b.status) && b.customer_id)
        .map((b) => b.customer_id)
    );
    const activeClientsCount = activeClientIds.size;

    // Previous period active clients for trend
    const previousActiveClientIds = new Set(
      previousPeriodBookings
        .filter((b) => ["completed", "confirmed"].includes(b.status) && b.customer_id)
        .map((b) => b.customer_id)
    );
    const activeClientsTrend = calculateTrend(activeClientsCount, previousActiveClientIds.size);

    // Format recent bookings for table
    const recentBookings = (recentBookingsData || []).map((booking) => {
      const client = booking.users as {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
      } | null;
      return {
        id: booking.id,
        client: {
          name: client?.full_name || "Unknown Client",
          avatar: client?.avatar_url || null,
        },
        serviceType: booking.service_name || "General Service",
        date: booking.scheduled_start,
        amount:
          booking.amount_captured || booking.amount_authorized || booking.amount_estimated || 0,
        status: booking.status,
      };
    });

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
      activeClients: {
        value: activeClientsCount,
        trend: activeClientsTrend,
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
        serviceBreakdown,
        revenueFlow,
      },
      recentBookings,
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
  service_name: string | null;
  customer_id: string | null;
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
      if (intervalEnd > end) {
        intervalEnd = end;
      }
    }

    const intervalBookings = bookings.filter((b) => {
      if (b.status !== "completed" || !b.amount_captured || !b.scheduled_start) {
        return false;
      }
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
      if (intervalEnd > end) {
        intervalEnd = end;
      }
    }

    const intervalBookings = bookings.filter((b) => {
      if (!b.scheduled_start) {
        return false;
      }
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

// Service colors matching Lia Design System
const SERVICE_COLORS: Record<string, string> = {
  Cleaning: "#7A3B4A", // rausch-500
  Nanny: "#00A699", // babu-500
  Cooking: "#788C5D", // green-500
  Errands: "#B0AEA5", // neutral-500
  Other: "#767676", // foggy gray
};

function buildServiceBreakdown(
  completedBookings: Booking[]
): Array<{ label: string; value: number; color: string }> {
  // Group by service name
  const serviceMap = new Map<string, number>();

  for (const booking of completedBookings) {
    const serviceName = booking.service_name || "Other";
    serviceMap.set(serviceName, (serviceMap.get(serviceName) || 0) + 1);
  }

  // Convert to array and sort by value descending
  const breakdown = Array.from(serviceMap.entries())
    .map(([label, value]) => ({
      label,
      value,
      color: SERVICE_COLORS[label] || SERVICE_COLORS.Other,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4); // Top 4 services

  return breakdown;
}

function buildRevenueFlowByMonth(bookings: Booking[]): Array<{ month: string; amount: number }> {
  const now = new Date();
  const months: Array<{ month: string; amount: number }> = [];

  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

    const monthBookings = bookings.filter((b) => {
      if (b.status !== "completed" || !b.amount_captured || !b.scheduled_start) {
        return false;
      }
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate >= monthDate && bookingDate <= monthEnd;
    });

    const amount = monthBookings.reduce((sum, b) => sum + (b.amount_captured || 0), 0);

    months.push({
      month: monthDate.toLocaleDateString("en-US", { month: "short" }),
      amount,
    });
  }

  return months;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
