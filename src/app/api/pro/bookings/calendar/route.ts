/**
 * Pro Bookings Calendar API Route
 * Fetches bookings formatted for FullCalendar display
 */

import { ok, withAuth, withRateLimit } from "@/lib/api";
import type { Currency } from "@/lib/format";

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  const url = new URL(request.url);
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");

  // Build query
  let query = supabase
    .from("bookings")
    .select(
      `
      id,
      scheduled_start,
      scheduled_end,
      status,
      service_name,
      amount_estimated,
      amount_final,
      currency,
      address,
      customer:profiles!customer_id (
        id,
        full_name
      )
    `
    )
    .eq("professional_id", user.id)
    .in("status", ["pending", "confirmed", "in_progress", "completed"])
    .order("scheduled_start", { ascending: true });

  // Filter by date range if provided
  if (startDate) {
    query = query.gte("scheduled_start", startDate);
  }
  if (endDate) {
    query = query.lte("scheduled_end", endDate);
  }

  const { data: bookingsData, error } = await query;

  if (error) {
    console.error("Failed to fetch calendar bookings:", error);
    return ok({ bookings: [] });
  }

  // Transform to calendar event format
  const bookings = (bookingsData || []).map((booking) => {
    const customer = booking.customer as { id: string; full_name: string } | null;
    return {
      id: booking.id,
      title: `${customer?.full_name || "Customer"} - ${booking.service_name || "Service"}`,
      start: booking.scheduled_start,
      end: booking.scheduled_end,
      status: booking.status as "pending" | "confirmed" | "in_progress" | "completed" | "cancelled",
      customer_name: customer?.full_name || "Unknown Customer",
      service_name: booking.service_name || "Service",
      amount: booking.amount_final || booking.amount_estimated || 0,
      currency: (booking.currency?.toUpperCase() || "COP") as Currency,
      address: booking.address || "",
    };
  });

  return ok({ bookings });
});

export const GET = withRateLimit(handler, "api");
