/**
 * Booking Pipeline Service
 *
 * Data fetching layer for admin booking pipeline visualization
 * Extracts Supabase queries from booking-pipeline.tsx component
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export type PipelineStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "pending_payment"
  | "completed";

export type PipelineFilter = "all" | "today" | "week" | "overdue";

export type BookingWithCustomer = {
  id: string;
  status: PipelineStatus;
  created_at: string;
  amount_estimated: number | null;
  customer_id: string | null;
  professional_id: string | null;
  profiles: {
    full_name: string | null;
  } | null;
};

export type PipelineStage = {
  id: PipelineStatus;
  title: string;
  bookings: BookingWithCustomer[];
  count: number;
};

export type PipelineData = {
  stages: PipelineStage[];
  total: number;
};

// ============================================================================
// Constants
// ============================================================================

const PIPELINE_STATUSES: PipelineStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "pending_payment",
  "completed",
];

const STAGE_TITLES: Record<PipelineStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  pending_payment: "Pending Payment",
  completed: "Completed",
};

// ============================================================================
// Query Builder Functions
// ============================================================================

/**
 * Calculate date filter start based on filter type
 */
export function getFilterStartDate(filter: PipelineFilter): Date | null {
  const now = new Date();

  switch (filter) {
    case "today": {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    }
    case "overdue": {
      // Overdue means pending bookings older than 24 hours
      const dayAgo = new Date(now);
      dayAgo.setDate(dayAgo.getDate() - 1);
      return dayAgo;
    }
    default:
      return null;
  }
}

/**
 * Fetch pipeline bookings with optional filter
 */
export async function fetchPipelineBookings(
  supabase: SupabaseClient,
  filter: PipelineFilter = "all"
): Promise<BookingWithCustomer[]> {
  let query = supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      created_at,
      amount_estimated,
      customer_id,
      professional_id,
      profiles!bookings_customer_id_fkey (
        full_name
      )
    `
    )
    .in("status", PIPELINE_STATUSES)
    .order("created_at", { ascending: false });

  // Apply date filter
  const filterStart = getFilterStartDate(filter);
  if (filterStart) {
    if (filter === "overdue") {
      // For overdue, get pending bookings older than 24 hours
      query = query.eq("status", "pending").lt("created_at", filterStart.toISOString());
    } else {
      query = query.gte("created_at", filterStart.toISOString());
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching pipeline bookings:", error);
    return [];
  }

  return (data || []) as BookingWithCustomer[];
}

// ============================================================================
// Data Transformation Functions
// ============================================================================

/**
 * Group bookings by pipeline stage
 */
export function groupBookingsByStage(bookings: BookingWithCustomer[]): PipelineStage[] {
  const stageMap = new Map<PipelineStatus, BookingWithCustomer[]>();

  // Initialize all stages
  for (const status of PIPELINE_STATUSES) {
    stageMap.set(status, []);
  }

  // Group bookings
  for (const booking of bookings) {
    const stage = stageMap.get(booking.status as PipelineStatus);
    if (stage) {
      stage.push(booking);
    }
  }

  // Convert to stage array
  return PIPELINE_STATUSES.map((status) => {
    const stageBookings = stageMap.get(status) || [];
    return {
      id: status,
      title: STAGE_TITLES[status],
      bookings: stageBookings,
      count: stageBookings.length,
    };
  });
}

/**
 * Calculate pipeline statistics
 */
export function calculatePipelineStats(stages: PipelineStage[]): {
  total: number;
  pending: number;
  active: number;
  completed: number;
} {
  const pending = stages.find((s) => s.id === "pending")?.count || 0;
  const confirmed = stages.find((s) => s.id === "confirmed")?.count || 0;
  const inProgress = stages.find((s) => s.id === "in_progress")?.count || 0;
  const pendingPayment = stages.find((s) => s.id === "pending_payment")?.count || 0;
  const completed = stages.find((s) => s.id === "completed")?.count || 0;

  return {
    total: stages.reduce((sum, s) => sum + s.count, 0),
    pending,
    active: confirmed + inProgress + pendingPayment,
    completed,
  };
}

// ============================================================================
// Orchestrator Function
// ============================================================================

/**
 * Load complete pipeline data
 */
export async function loadPipelineData(
  supabase: SupabaseClient,
  filter: PipelineFilter = "all"
): Promise<PipelineData> {
  const bookings = await fetchPipelineBookings(supabase, filter);
  const stages = groupBookingsByStage(bookings);

  return {
    stages,
    total: bookings.length,
  };
}

/**
 * Get customer name from booking safely
 */
export function getCustomerName(booking: BookingWithCustomer): string {
  return booking.profiles?.full_name || "Unknown Customer";
}
