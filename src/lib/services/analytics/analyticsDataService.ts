/**
 * Analytics Data Service
 *
 * Data fetching layer for enhanced analytics dashboard
 * Works with analyticsCalculations.ts for pure metric calculations
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type CategoryMetrics,
  type CityMetrics,
  calculateActiveProfessionals,
  calculateAvgTimeToFirstBooking,
  calculateCategoryMetrics,
  calculateCityMetrics,
  calculateFillRate,
  calculateRepeatBookingRate,
} from "./analyticsCalculations";

// ============================================================================
// Types
// ============================================================================

export type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

export type AnalyticsBooking = {
  id: string;
  status: string;
  created_at: string;
  customer_id: string | null;
  professional_id: string | null;
  amount_estimated: number | null;
  service_category: string | null;
  city: string | null;
};

export type AnalyticsProfessional = {
  id: string;
  role: string;
  created_at: string;
  approval_date: string | null;
};

export type AnalyticsCustomer = {
  id: string;
  role: string;
  created_at: string;
};

export type AnalyticsMetrics = {
  fillRate: number;
  avgTimeToFirstBooking: number;
  repeatBookingRate: number;
  activeProfessionals: number;
  totalBookings: number;
  totalRevenue: number;
  totalProfessionals: number;
  totalCustomers: number;
};

export type AnalyticsTrendData = {
  date: string;
  bookings: number;
  revenue: number;
  newProfessionals: number;
  newCustomers: number;
};

export type AnalyticsRawData = {
  bookings: AnalyticsBooking[];
  professionals: AnalyticsProfessional[];
  customers: AnalyticsCustomer[];
};

export type FullAnalyticsData = {
  metrics: AnalyticsMetrics;
  cityMetrics: CityMetrics[];
  categoryMetrics: CategoryMetrics[];
  trendData: AnalyticsTrendData[];
};

// ============================================================================
// Date Range Helpers
// ============================================================================

/**
 * Calculate start date based on time range
 * Returns null for "all" (no date filtering)
 */
export function getStartDateForRange(timeRange: TimeRange): Date | null {
  if (timeRange === "all") {
    return null;
  }

  const now = new Date();

  switch (timeRange) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
}

// ============================================================================
// Data Fetching Functions
// ============================================================================

/**
 * Fetch bookings within time range
 */
export async function fetchAnalyticsBookings(
  supabase: SupabaseClient,
  startDate: Date | null
): Promise<AnalyticsBooking[]> {
  let query = supabase
    .from("bookings")
    .select(
      "id, status, created_at, customer_id, professional_id, amount_estimated, service_category, city"
    );

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching analytics bookings:", error);
    return [];
  }

  return (data || []) as AnalyticsBooking[];
}

/**
 * Fetch professionals within time range
 */
export async function fetchAnalyticsProfessionals(
  supabase: SupabaseClient,
  startDate: Date | null
): Promise<AnalyticsProfessional[]> {
  let query = supabase
    .from("profiles")
    .select("id, role, created_at, approval_date")
    .eq("role", "professional");

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching analytics professionals:", error);
    return [];
  }

  return (data || []) as AnalyticsProfessional[];
}

/**
 * Fetch customers within time range
 */
export async function fetchAnalyticsCustomers(
  supabase: SupabaseClient,
  startDate: Date | null
): Promise<AnalyticsCustomer[]> {
  let query = supabase.from("profiles").select("id, role, created_at").eq("role", "customer");

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching analytics customers:", error);
    return [];
  }

  return (data || []) as AnalyticsCustomer[];
}

/**
 * Fetch all analytics raw data in parallel
 */
export async function fetchAnalyticsRawData(
  supabase: SupabaseClient,
  timeRange: TimeRange
): Promise<AnalyticsRawData> {
  const startDate = getStartDateForRange(timeRange);

  const [bookings, professionals, customers] = await Promise.all([
    fetchAnalyticsBookings(supabase, startDate),
    fetchAnalyticsProfessionals(supabase, startDate),
    fetchAnalyticsCustomers(supabase, startDate),
  ]);

  return { bookings, professionals, customers };
}

// ============================================================================
// Metrics Calculation Functions
// ============================================================================

/**
 * Calculate total revenue from completed bookings
 */
export function calculateTotalRevenue(bookings: AnalyticsBooking[]): number {
  return bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.amount_estimated || 0), 0);
}

/**
 * Generate trend data for charts
 */
export function generateTrendData(
  bookings: AnalyticsBooking[],
  professionals: AnalyticsProfessional[],
  customers: AnalyticsCustomer[],
  timeRange: TimeRange
): AnalyticsTrendData[] {
  let startDate = getStartDateForRange(timeRange);

  // For "all" time range, find the earliest date from the data
  if (!startDate) {
    const allDates = [
      ...bookings.map((b) => new Date(b.created_at)),
      ...professionals.map((p) => new Date(p.created_at)),
      ...customers.map((c) => new Date(c.created_at)),
    ].filter((d) => !Number.isNaN(d.getTime()));

    if (allDates.length === 0) {
      return [];
    }

    startDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  }

  const dayMap = new Map<
    string,
    { bookings: number; revenue: number; newPros: number; newCustomers: number }
  >();

  // Initialize all days in range
  const current = new Date(startDate);
  const now = new Date();
  while (current <= now) {
    const dateKey = current.toISOString().split("T")[0];
    dayMap.set(dateKey, { bookings: 0, revenue: 0, newPros: 0, newCustomers: 0 });
    current.setDate(current.getDate() + 1);
  }

  // Aggregate bookings
  for (const booking of bookings) {
    const dateKey = new Date(booking.created_at).toISOString().split("T")[0];
    const day = dayMap.get(dateKey);
    if (day) {
      day.bookings++;
      if (booking.status === "completed" && booking.amount_estimated) {
        day.revenue += booking.amount_estimated;
      }
    }
  }

  // Aggregate new professionals
  for (const pro of professionals) {
    const dateKey = new Date(pro.created_at).toISOString().split("T")[0];
    const day = dayMap.get(dateKey);
    if (day) {
      day.newPros++;
    }
  }

  // Aggregate new customers
  for (const customer of customers) {
    const dateKey = new Date(customer.created_at).toISOString().split("T")[0];
    const day = dayMap.get(dateKey);
    if (day) {
      day.newCustomers++;
    }
  }

  return Array.from(dayMap.entries())
    .map(([date, data]) => ({
      date,
      bookings: data.bookings,
      revenue: data.revenue,
      newProfessionals: data.newPros,
      newCustomers: data.newCustomers,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Compute all analytics metrics from raw data
 */
export function computeAnalyticsMetrics(data: AnalyticsRawData): AnalyticsMetrics {
  const { bookings, professionals, customers } = data;

  return {
    fillRate: calculateFillRate(bookings),
    avgTimeToFirstBooking: calculateAvgTimeToFirstBooking(professionals, bookings),
    repeatBookingRate: calculateRepeatBookingRate(bookings),
    activeProfessionals: calculateActiveProfessionals(bookings),
    totalBookings: bookings.length,
    totalRevenue: calculateTotalRevenue(bookings),
    totalProfessionals: professionals.length,
    totalCustomers: customers.length,
  };
}

// ============================================================================
// Orchestrator Function
// ============================================================================

/**
 * Load complete analytics data
 * Main orchestrator that fetches data and computes all metrics
 */
export async function loadAnalyticsData(
  supabase: SupabaseClient,
  timeRange: TimeRange
): Promise<FullAnalyticsData> {
  // Fetch raw data
  const rawData = await fetchAnalyticsRawData(supabase, timeRange);

  // Compute all metrics
  const metrics = computeAnalyticsMetrics(rawData);
  const cityMetrics = calculateCityMetrics(rawData.bookings, rawData.professionals);
  const categoryMetrics = calculateCategoryMetrics(rawData.bookings);
  const trendData = generateTrendData(
    rawData.bookings,
    rawData.professionals,
    rawData.customers,
    timeRange
  );

  return {
    metrics,
    cityMetrics,
    categoryMetrics,
    trendData,
  };
}
