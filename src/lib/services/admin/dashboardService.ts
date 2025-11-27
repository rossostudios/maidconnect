/**
 * Admin Dashboard Service
 *
 * Data fetching layer for executive dashboard metrics
 * Extracts Supabase queries from executive-dashboard.tsx component
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "pending_payment";

export type BookingRecord = {
  id: string;
  status: BookingStatus;
  created_at: string;
  amount_estimated: number | null;
  professional_id: string | null;
  customer_id: string | null;
};

export type ProfessionalRecord = {
  id: string;
  role: string;
  vetting_status: string | null;
  created_at: string;
};

export type CustomerRecord = {
  id: string;
  role: string;
  created_at: string;
};

export type DashboardRawData = {
  todayBookings: BookingRecord[];
  pendingBookings: BookingRecord[];
  activeBookings: BookingRecord[];
  pendingVetting: ProfessionalRecord[];
  historicalBookings: BookingRecord[];
  recentBookings: BookingRecord[];
  professionals: ProfessionalRecord[];
  customers: CustomerRecord[];
};

export type DateRange = {
  from: Date;
  to: Date;
};

// ============================================================================
// Data Fetching Functions
// ============================================================================

/**
 * Fetch today's bookings (created today)
 */
export async function fetchTodayBookings(
  supabase: SupabaseClient,
  todayStart: Date
): Promise<BookingRecord[]> {
  const { data } = await supabase
    .from("bookings")
    .select("id, amount_estimated, status")
    .gte("created_at", todayStart.toISOString());

  return (data || []) as BookingRecord[];
}

/**
 * Fetch pending bookings awaiting confirmation
 */
export async function fetchPendingBookings(supabase: SupabaseClient): Promise<BookingRecord[]> {
  const { data } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("status", "pending");

  return (data || []) as BookingRecord[];
}

/**
 * Fetch active bookings (confirmed or in_progress)
 */
export async function fetchActiveBookings(supabase: SupabaseClient): Promise<BookingRecord[]> {
  const { data } = await supabase
    .from("bookings")
    .select("id, status, professional_id")
    .in("status", ["confirmed", "in_progress"]);

  return (data || []) as BookingRecord[];
}

/**
 * Fetch professionals pending vetting
 */
export async function fetchPendingVetting(supabase: SupabaseClient): Promise<ProfessionalRecord[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, role, vetting_status")
    .eq("role", "professional")
    .eq("vetting_status", "pending");

  return (data || []) as ProfessionalRecord[];
}

/**
 * Fetch historical bookings within date range
 */
export async function fetchHistoricalBookings(
  supabase: SupabaseClient,
  dateRange: DateRange
): Promise<BookingRecord[]> {
  const { data } = await supabase
    .from("bookings")
    .select("id, amount_estimated, status, created_at, professional_id")
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  return (data || []) as BookingRecord[];
}

/**
 * Fetch recent bookings (last 7 days)
 */
export async function fetchRecentBookings(
  supabase: SupabaseClient,
  sevenDaysAgo: Date
): Promise<BookingRecord[]> {
  const { data } = await supabase
    .from("bookings")
    .select("id, status, created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  return (data || []) as BookingRecord[];
}

/**
 * Fetch all professionals
 */
export async function fetchProfessionals(supabase: SupabaseClient): Promise<ProfessionalRecord[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, role, created_at")
    .eq("role", "professional");

  return (data || []) as ProfessionalRecord[];
}

/**
 * Fetch all customers
 */
export async function fetchCustomers(supabase: SupabaseClient): Promise<CustomerRecord[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, role, created_at")
    .eq("role", "customer");

  return (data || []) as CustomerRecord[];
}

// ============================================================================
// Orchestrator Function
// ============================================================================

/**
 * Fetch all dashboard data in parallel
 * Main orchestrator that retrieves all data needed for executive dashboard
 */
export async function fetchDashboardData(
  supabase: SupabaseClient,
  dateRange: DateRange
): Promise<DashboardRawData> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Parallel fetch all data
  const [
    todayBookings,
    pendingBookings,
    activeBookings,
    pendingVetting,
    historicalBookings,
    recentBookings,
    professionals,
    customers,
  ] = await Promise.all([
    fetchTodayBookings(supabase, todayStart),
    fetchPendingBookings(supabase),
    fetchActiveBookings(supabase),
    fetchPendingVetting(supabase),
    fetchHistoricalBookings(supabase, dateRange),
    fetchRecentBookings(supabase, sevenDaysAgo),
    fetchProfessionals(supabase),
    fetchCustomers(supabase),
  ]);

  return {
    todayBookings,
    pendingBookings,
    activeBookings,
    pendingVetting,
    historicalBookings,
    recentBookings,
    professionals,
    customers,
  };
}

// ============================================================================
// Metrics Calculation Functions
// ============================================================================

/**
 * Calculate revenue from completed bookings
 */
export function calculateRevenue(bookings: BookingRecord[]): number {
  return bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.amount_estimated || 0), 0);
}

/**
 * Count bookings by status
 */
export function countBookingsByStatus(
  bookings: BookingRecord[],
  status: BookingStatus
): number {
  return bookings.filter((b) => b.status === status).length;
}

/**
 * Calculate unique active professionals (with active bookings)
 */
export function calculateActiveProfessionals(activeBookings: BookingRecord[]): number {
  const uniquePros = new Set(
    activeBookings.map((b) => b.professional_id).filter(Boolean)
  );
  return uniquePros.size;
}

/**
 * Generate revenue trend data for chart
 */
export function generateRevenueData(
  bookings: BookingRecord[],
  dateRange: DateRange
): Array<{ date: string; revenue: number }> {
  const dayMap = new Map<string, number>();

  // Initialize all days in range
  const current = new Date(dateRange.from);
  while (current <= dateRange.to) {
    const dateKey = current.toISOString().split("T")[0];
    dayMap.set(dateKey, 0);
    current.setDate(current.getDate() + 1);
  }

  // Sum revenue by day
  for (const booking of bookings) {
    if (booking.status === "completed" && booking.amount_estimated) {
      const dateKey = new Date(booking.created_at).toISOString().split("T")[0];
      if (dayMap.has(dateKey)) {
        dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + booking.amount_estimated);
      }
    }
  }

  return Array.from(dayMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Generate utilization trend data for chart
 */
export function generateUtilizationData(
  bookings: BookingRecord[],
  dateRange: DateRange,
  totalProfessionals: number
): Array<{ date: string; utilization: number }> {
  const dayMap = new Map<string, Set<string>>();

  // Initialize all days in range
  const current = new Date(dateRange.from);
  while (current <= dateRange.to) {
    const dateKey = current.toISOString().split("T")[0];
    dayMap.set(dateKey, new Set());
    current.setDate(current.getDate() + 1);
  }

  // Track active professionals by day
  for (const booking of bookings) {
    if (booking.professional_id && booking.status !== "cancelled") {
      const dateKey = new Date(booking.created_at).toISOString().split("T")[0];
      if (dayMap.has(dateKey)) {
        dayMap.get(dateKey)!.add(booking.professional_id);
      }
    }
  }

  return Array.from(dayMap.entries())
    .map(([date, proSet]) => ({
      date,
      utilization: totalProfessionals > 0 ? (proSet.size / totalProfessionals) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
