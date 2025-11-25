/**
 * Pro Bookings API Route
 * Paginated endpoint for professional bookings with filtering
 */

import { z } from "zod";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import type { Currency } from "@/lib/utils/format";

// Query parameters schema
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["all", "pending", "confirmed", "in_progress", "completed", "cancelled"]).default("all"),
  date: z.enum(["all", "today", "week", "month"]).default("all"),
  search: z.string().optional(),
});

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type ProBookingWithCustomer = {
  id: string;
  status: BookingStatus;
  scheduledStart: string;
  scheduledEnd: string | null;
  durationMinutes: number | null;
  serviceName: string | null;
  amount: number;
  currency: Currency;
  address: string | null;
  specialInstructions: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phone: string | null;
  } | null;
};

export type BookingsSummary = {
  today: number;
  pending: number;
  confirmed: number;
  inProgress: number;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  const url = new URL(request.url);
  const params = querySchema.parse({
    page: url.searchParams.get("page") || 1,
    limit: url.searchParams.get("limit") || 20,
    status: url.searchParams.get("status") || "all",
    date: url.searchParams.get("date") || "all",
    search: url.searchParams.get("search") || undefined,
  });

  const { page, limit, status, date, search } = params;
  const offset = (page - 1) * limit;

  // Calculate date ranges
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const monthEnd = new Date(todayStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  // Build base query for bookings
  let query = supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      scheduled_start,
      scheduled_end,
      duration_minutes,
      service_name,
      amount_final,
      amount_estimated,
      currency,
      address,
      special_instructions,
      checked_in_at,
      checked_out_at,
      created_at,
      customer:profiles!customer_id (
        id,
        full_name,
        avatar_url,
        phone
      )
    `,
      { count: "exact" }
    )
    .eq("professional_id", user.id);

  // Apply status filter
  if (status !== "all") {
    query = query.eq("status", status);
  } else {
    // Exclude cancelled by default unless explicitly requested
    query = query.in("status", ["pending", "confirmed", "in_progress", "completed"]);
  }

  // Apply date filter
  if (date === "today") {
    query = query
      .gte("scheduled_start", todayStart.toISOString())
      .lte("scheduled_start", todayEnd.toISOString());
  } else if (date === "week") {
    query = query
      .gte("scheduled_start", todayStart.toISOString())
      .lte("scheduled_start", weekEnd.toISOString());
  } else if (date === "month") {
    query = query
      .gte("scheduled_start", todayStart.toISOString())
      .lte("scheduled_start", monthEnd.toISOString());
  }

  // Apply search filter (customer name)
  // Note: For customer name search, we need to fetch all and filter client-side
  // or use a full-text search index. For now, we'll do basic search.

  // Order by scheduled_start (soonest first for upcoming, most recent for history)
  if (date === "all" && status === "completed") {
    query = query.order("scheduled_start", { ascending: false });
  } else {
    query = query.order("scheduled_start", { ascending: true });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: bookingsData, error: bookingsError, count } = await query;

  if (bookingsError) {
    console.error("Failed to fetch pro bookings:", bookingsError);
    return ok({
      success: false,
      error: "Failed to fetch bookings",
      bookings: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      summary: { today: 0, pending: 0, confirmed: 0, inProgress: 0 },
    });
  }

  // Transform bookings
  let bookings: ProBookingWithCustomer[] = (bookingsData || []).map((b) => {
    const customer = b.customer as { id: string; full_name: string; avatar_url: string | null; phone: string | null } | null;
    return {
      id: b.id,
      status: b.status as BookingStatus,
      scheduledStart: b.scheduled_start,
      scheduledEnd: b.scheduled_end,
      durationMinutes: b.duration_minutes,
      serviceName: b.service_name,
      amount: b.amount_final || b.amount_estimated || 0,
      currency: (b.currency?.toUpperCase() || "COP") as Currency,
      address: b.address,
      specialInstructions: b.special_instructions,
      checkedInAt: b.checked_in_at,
      checkedOutAt: b.checked_out_at,
      createdAt: b.created_at,
      customer: customer
        ? {
            id: customer.id,
            fullName: customer.full_name || "Unknown Customer",
            avatarUrl: customer.avatar_url,
            phone: customer.phone,
          }
        : null,
    };
  });

  // Apply client-side search filter if provided
  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    bookings = bookings.filter((b) => {
      const customerName = b.customer?.fullName?.toLowerCase() || "";
      const serviceName = b.serviceName?.toLowerCase() || "";
      const bookingId = b.id.toLowerCase();
      return (
        customerName.includes(searchLower) ||
        serviceName.includes(searchLower) ||
        bookingId.includes(searchLower)
      );
    });
  }

  // Fetch summary counts
  const [todayCountResult, pendingCountResult, confirmedCountResult, inProgressCountResult] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.id)
        .gte("scheduled_start", todayStart.toISOString())
        .lte("scheduled_start", todayEnd.toISOString())
        .in("status", ["pending", "confirmed", "in_progress"]),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.id)
        .eq("status", "confirmed"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.id)
        .eq("status", "in_progress"),
    ]);

  const summary: BookingsSummary = {
    today: todayCountResult.count || 0,
    pending: pendingCountResult.count || 0,
    confirmed: confirmedCountResult.count || 0,
    inProgress: inProgressCountResult.count || 0,
  };

  const total = count || 0;
  const pagination: PaginationInfo = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return ok({
    success: true,
    bookings,
    pagination,
    summary,
  });
});

export const GET = withRateLimit(handler, "api");
