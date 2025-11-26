/**
 * Pro Booking Service - Query builders and utilities for professional bookings
 *
 * Provides reusable query builders and business logic for professional
 * booking management features including pagination, filtering, and summary calculations.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Currency } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type DateFilter = "all" | "today" | "week" | "month" | "history";

export type ProBookingsQueryParams = {
  professionalId: string;
  page?: number;
  limit?: number;
  status?: BookingStatus | "all";
  dateFilter?: DateFilter;
  search?: string;
};

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
  completedThisWeek: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Get date range boundaries for filtering
 */
export function getDateBoundaries() {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date(todayStart);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const monthEnd = new Date(todayStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  // For history, look back 30 days
  const historyStart = new Date(todayStart);
  historyStart.setDate(historyStart.getDate() - 30);

  return {
    now,
    todayStart,
    todayEnd,
    weekStart,
    weekEnd,
    monthEnd,
    historyStart,
  };
}

/**
 * Check if a booking is happening "today"
 */
export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Check if a booking is within the next N minutes
 */
export function isWithinMinutes(dateStr: string, minutes: number): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return diff > 0 && diff <= minutes * 60 * 1000;
}

/**
 * Get relative time label (e.g., "Starting in 15m", "In Progress")
 */
export function getTimeLabel(booking: {
  scheduledStart: string;
  status: BookingStatus;
}): string | null {
  if (booking.status === "in_progress") {
    return "In Progress";
  }

  if (booking.status === "pending" || booking.status === "confirmed") {
    const date = new Date(booking.scheduledStart);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (diffMs < 0) {
      // Past due
      return "Past Due";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `Starting in ${diffMinutes}m`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Starting in ${diffHours}h`;
    }

    return null;
  }

  return null;
}

// ============================================================================
// Query Builders
// ============================================================================

/**
 * Build base Supabase query for professional bookings
 */
export function buildProBookingsQuery(
  supabase: SupabaseClient,
  professionalId: string,
  options: {
    withCount?: boolean;
    statusFilter?: BookingStatus | "all";
    dateFilter?: DateFilter;
  } = {}
) {
  const { withCount = false, statusFilter = "all", dateFilter = "all" } = options;
  const dates = getDateBoundaries();

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
      withCount ? { count: "exact" } : undefined
    )
    .eq("professional_id", professionalId);

  // Status filter
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  } else {
    // By default, show all non-cancelled bookings
    query = query.in("status", ["pending", "confirmed", "in_progress", "completed"]);
  }

  // Date filter
  switch (dateFilter) {
    case "today":
      query = query
        .gte("scheduled_start", dates.todayStart.toISOString())
        .lte("scheduled_start", dates.todayEnd.toISOString());
      break;
    case "week":
      query = query
        .gte("scheduled_start", dates.todayStart.toISOString())
        .lte("scheduled_start", dates.weekEnd.toISOString());
      break;
    case "month":
      query = query
        .gte("scheduled_start", dates.todayStart.toISOString())
        .lte("scheduled_start", dates.monthEnd.toISOString());
      break;
    case "history":
      query = query
        .gte("scheduled_start", dates.historyStart.toISOString())
        .lt("scheduled_start", dates.todayStart.toISOString());
      break;
    // "all" - no date filter
  }

  return query;
}

/**
 * Apply ordering to bookings query
 */
export function applyBookingsOrder(
  query: ReturnType<typeof buildProBookingsQuery>,
  dateFilter: DateFilter
) {
  // For history, show most recent first
  // For upcoming, show soonest first
  const ascending = dateFilter !== "history";
  return query.order("scheduled_start", { ascending });
}

/**
 * Apply pagination to query
 */
export function applyPagination<T>(
  query: T & { range: (from: number, to: number) => T },
  page: number,
  limit: number
): T {
  const offset = (page - 1) * limit;
  return query.range(offset, offset + limit - 1);
}

// ============================================================================
// Data Transformers
// ============================================================================

/**
 * Transform raw Supabase booking data to typed response
 */
export function transformBooking(raw: {
  id: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string | null;
  duration_minutes: number | null;
  service_name: string | null;
  amount_final: number | null;
  amount_estimated: number | null;
  currency: string | null;
  address: string | null;
  special_instructions: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_at: string;
  customer: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
}): ProBookingWithCustomer {
  return {
    id: raw.id,
    status: raw.status as BookingStatus,
    scheduledStart: raw.scheduled_start,
    scheduledEnd: raw.scheduled_end,
    durationMinutes: raw.duration_minutes,
    serviceName: raw.service_name,
    amount: raw.amount_final || raw.amount_estimated || 0,
    currency: (raw.currency?.toUpperCase() || "COP") as Currency,
    address: raw.address,
    specialInstructions: raw.special_instructions,
    checkedInAt: raw.checked_in_at,
    checkedOutAt: raw.checked_out_at,
    createdAt: raw.created_at,
    customer: raw.customer
      ? {
          id: raw.customer.id,
          fullName: raw.customer.full_name || "Unknown Customer",
          avatarUrl: raw.customer.avatar_url,
          phone: raw.customer.phone,
        }
      : null,
  };
}

/**
 * Client-side search filter for bookings
 */
export function filterBookingsBySearch(
  bookings: ProBookingWithCustomer[],
  search: string
): ProBookingWithCustomer[] {
  if (!search.trim()) {
    return bookings;
  }

  const searchLower = search.toLowerCase();
  return bookings.filter((b) => {
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

// ============================================================================
// Summary Calculations
// ============================================================================

/**
 * Fetch booking summary counts for a professional
 */
export async function fetchBookingsSummary(
  supabase: SupabaseClient,
  professionalId: string
): Promise<BookingsSummary> {
  const dates = getDateBoundaries();

  const [todayResult, pendingResult, confirmedResult, inProgressResult, completedWeekResult] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", professionalId)
        .gte("scheduled_start", dates.todayStart.toISOString())
        .lte("scheduled_start", dates.todayEnd.toISOString())
        .in("status", ["pending", "confirmed", "in_progress"]),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", professionalId)
        .eq("status", "pending"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", professionalId)
        .eq("status", "confirmed"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", professionalId)
        .eq("status", "in_progress"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", professionalId)
        .eq("status", "completed")
        .gte("scheduled_start", dates.weekStart.toISOString())
        .lte("scheduled_start", dates.todayEnd.toISOString()),
    ]);

  return {
    today: todayResult.count || 0,
    pending: pendingResult.count || 0,
    confirmed: confirmedResult.count || 0,
    inProgress: inProgressResult.count || 0,
    completedThisWeek: completedWeekResult.count || 0,
  };
}

// ============================================================================
// Urgency Calculations
// ============================================================================

export type UrgencyLevel = "urgent" | "important" | "normal";

/**
 * Calculate urgency level for a booking
 */
export function calculateUrgency(booking: {
  status: BookingStatus;
  scheduledStart: string;
}): UrgencyLevel {
  const now = new Date();
  const startTime = new Date(booking.scheduledStart);
  const diffMs = startTime.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  // In progress - urgent
  if (booking.status === "in_progress") {
    return "urgent";
  }

  // Pending requests are always urgent (need response)
  if (booking.status === "pending") {
    return "urgent";
  }

  // Starting within 30 minutes - urgent
  if (booking.status === "confirmed" && diffMinutes >= 0 && diffMinutes <= 30) {
    return "urgent";
  }

  // Today - important
  if (booking.status === "confirmed" && isToday(booking.scheduledStart)) {
    return "important";
  }

  // Everything else - normal
  return "normal";
}

/**
 * Group bookings by urgency level
 */
export function groupBookingsByUrgency(
  bookings: ProBookingWithCustomer[]
): Record<UrgencyLevel, ProBookingWithCustomer[]> {
  const groups: Record<UrgencyLevel, ProBookingWithCustomer[]> = {
    urgent: [],
    important: [],
    normal: [],
  };

  for (const booking of bookings) {
    const urgency = calculateUrgency(booking);
    groups[urgency].push(booking);
  }

  return groups;
}
