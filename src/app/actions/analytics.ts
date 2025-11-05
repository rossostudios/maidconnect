"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  GenerateSnapshotResponse,
  GetPerformanceMetricsResponse,
  GetPerformanceSummaryResponse,
  GetRevenueTrendResponse,
  GetTopProfessionalsResponse,
  InitializeMetricsResponse,
  PerformanceMetrics,
  PerformanceSummary,
  RevenueSnapshot,
  RevenueTrendDataPoint,
  TopProfessional,
} from "@/types";

/**
 * Get performance metrics for a professional
 */
export async function getPerformanceMetrics(
  profileId: string
): Promise<GetPerformanceMetricsResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("professional_performance_metrics")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (error) {
      // If no metrics exist, initialize them
      if (error.code === "PGRST116") {
        return await initializePerformanceMetrics(profileId);
      }
      console.error("Error fetching performance metrics:", error);
      return { success: false, error: error.message };
    }

    const metrics: PerformanceMetrics = {
      id: data.id,
      profileId: data.profile_id,
      totalBookings: data.total_bookings,
      completedBookings: data.completed_bookings,
      cancelledBookings: data.cancelled_bookings,
      completionRate: Number.parseFloat(data.completion_rate),
      cancellationRate: Number.parseFloat(data.cancellation_rate),
      totalRevenueCop: data.total_revenue_cop,
      revenueLast30DaysCop: data.revenue_last_30_days_cop,
      revenueLast7DaysCop: data.revenue_last_7_days_cop,
      averageBookingValueCop: data.average_booking_value_cop,
      averageRating: Number.parseFloat(data.average_rating),
      totalReviews: data.total_reviews,
      fiveStarCount: data.five_star_count,
      fourStarCount: data.four_star_count,
      threeStarCount: data.three_star_count,
      twoStarCount: data.two_star_count,
      oneStarCount: data.one_star_count,
      averageResponseTimeMinutes: data.average_response_time_minutes,
      onTimeArrivalRate: Number.parseFloat(data.on_time_arrival_rate),
      repeatCustomerRate: Number.parseFloat(data.repeat_customer_rate),
      bookingsLast30Days: data.bookings_last_30_days,
      bookingsLast7Days: data.bookings_last_7_days,
      lastCalculatedAt: data.last_calculated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { success: true, metrics };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get performance summary for a professional
 */
export async function getPerformanceSummary(
  profileId: string
): Promise<GetPerformanceSummaryResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_performance_summary", {
      professional_profile_id: profileId,
    });

    if (error) {
      console.error("Error fetching performance summary:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      // Return default summary if none exists
      const defaultSummary: PerformanceSummary = {
        totalBookings: 0,
        completionRate: 0,
        averageRating: 0,
        totalRevenueCop: 0,
        revenueLast30DaysCop: 0,
        bookingsLast30Days: 0,
        averageBookingValueCop: 0,
        repeatCustomerRate: 0,
      };
      return { success: true, summary: defaultSummary };
    }

    const summary: PerformanceSummary = {
      totalBookings: data[0].total_bookings,
      completionRate: Number.parseFloat(data[0].completion_rate),
      averageRating: Number.parseFloat(data[0].average_rating),
      totalRevenueCop: data[0].total_revenue_cop,
      revenueLast30DaysCop: data[0].revenue_last_30_days_cop,
      bookingsLast30Days: data[0].bookings_last_30_days,
      averageBookingValueCop: data[0].average_booking_value_cop,
      repeatCustomerRate: Number.parseFloat(data[0].repeat_customer_rate),
    };

    return { success: true, summary };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get revenue trend for a professional
 */
export async function getRevenueTrend(
  profileId: string,
  days = 30
): Promise<GetRevenueTrendResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_revenue_trend", {
      professional_profile_id: profileId,
      days,
    });

    if (error) {
      console.error("Error fetching revenue trend:", error);
      return { success: false, error: error.message };
    }

    const trend: RevenueTrendDataPoint[] = (data || []).map((point: any) => ({
      date: point.date,
      revenueCop: point.revenue_cop,
      bookingsCount: point.bookings_count,
    }));

    return { success: true, trend };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get top professionals by completion rate
 */
export async function getTopProfessionals(
  limitCount = 10,
  minBookings = 5
): Promise<GetTopProfessionalsResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_top_professionals_by_completion_rate", {
      limit_count: limitCount,
      min_bookings: minBookings,
    });

    if (error) {
      console.error("Error fetching top professionals:", error);
      return { success: false, error: error.message };
    }

    const professionals: TopProfessional[] = (data || []).map((pro: any) => ({
      profileId: pro.profile_id,
      fullName: pro.full_name,
      completionRate: Number.parseFloat(pro.completion_rate),
      totalBookings: pro.total_bookings,
      averageRating: Number.parseFloat(pro.average_rating),
    }));

    return { success: true, professionals };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize performance metrics for a professional
 */
export async function initializePerformanceMetrics(
  profileId: string
): Promise<InitializeMetricsResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("initialize_performance_metrics", {
      professional_profile_id: profileId,
    });

    if (error) {
      console.error("Error initializing performance metrics:", error);
      return { success: false, error: error.message };
    }

    const metrics: PerformanceMetrics = {
      id: data.id,
      profileId: data.profile_id,
      totalBookings: data.total_bookings || 0,
      completedBookings: data.completed_bookings || 0,
      cancelledBookings: data.cancelled_bookings || 0,
      completionRate: Number.parseFloat(data.completion_rate || 0),
      cancellationRate: Number.parseFloat(data.cancellation_rate || 0),
      totalRevenueCop: data.total_revenue_cop || 0,
      revenueLast30DaysCop: data.revenue_last_30_days_cop || 0,
      revenueLast7DaysCop: data.revenue_last_7_days_cop || 0,
      averageBookingValueCop: data.average_booking_value_cop || 0,
      averageRating: Number.parseFloat(data.average_rating || 0),
      totalReviews: data.total_reviews || 0,
      fiveStarCount: data.five_star_count || 0,
      fourStarCount: data.four_star_count || 0,
      threeStarCount: data.three_star_count || 0,
      twoStarCount: data.two_star_count || 0,
      oneStarCount: data.one_star_count || 0,
      averageResponseTimeMinutes: data.average_response_time_minutes || 0,
      onTimeArrivalRate: Number.parseFloat(data.on_time_arrival_rate || 0),
      repeatCustomerRate: Number.parseFloat(data.repeat_customer_rate || 0),
      bookingsLast30Days: data.bookings_last_30_days || 0,
      bookingsLast7Days: data.bookings_last_7_days || 0,
      lastCalculatedAt: data.last_calculated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { success: true, metrics };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate daily revenue snapshot
 */
export async function generateDailySnapshot(
  profileId: string,
  snapshotDate?: string
): Promise<GenerateSnapshotResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("generate_daily_revenue_snapshot", {
      professional_profile_id: profileId,
      snapshot_date: snapshotDate || new Date().toISOString().split("T")[0],
    });

    if (error) {
      console.error("Error generating daily snapshot:", error);
      return { success: false, error: error.message };
    }

    const snapshot: RevenueSnapshot = {
      id: data.id,
      profileId: data.profile_id,
      snapshotDate: data.snapshot_date,
      periodType: data.period_type,
      totalRevenueCop: data.total_revenue_cop,
      completedBookings: data.completed_bookings,
      averageBookingValueCop: data.average_booking_value_cop,
      createdAt: data.created_at,
    };

    return { success: true, snapshot };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
