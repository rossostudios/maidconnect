/**
 * useAnalytics Hook - Analytics Data Fetching & Calculations
 *
 * Extracts all data fetching and calculation logic from AnalyticsDashboard
 * for separation of concerns and reusability.
 *
 * Features:
 * - Platform-wide KPI calculations (fill rate, TTFB, repeat rate)
 * - City-level metrics aggregation
 * - Category-level metrics aggregation
 * - Time range filtering (7d, 30d, 90d, all)
 * - Loading and error states
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/integrations/supabase/browserClient";
import {
  type TimeRange as ServiceTimeRange,
  type AnalyticsMetrics as ServiceAnalyticsMetrics,
  fetchAnalyticsRawData,
  computeAnalyticsMetrics,
} from "@/lib/services/analytics/analyticsDataService";
import {
  calculateCityMetrics,
  calculateCategoryMetrics,
  type CityMetrics as ServiceCityMetrics,
  type CategoryMetrics as ServiceCategoryMetrics,
} from "@/lib/services/analytics/analyticsCalculations";

export type TimeRange = "7d" | "30d" | "90d" | "all";

export type AnalyticsMetrics = {
  fillRate: number; // % of booking requests that were accepted
  avgTimeToFirstBooking: number; // Days from approval to first booking
  repeatBookingRate: number; // % of customers with 2+ bookings
  totalBookings: number;
  totalProfessionals: number;
  totalCustomers: number;
  activeProfessionals: number; // Professionals with booking in last 30 days
};

export type CityMetrics = ServiceCityMetrics;

export type CategoryMetrics = ServiceCategoryMetrics;

export function useAnalytics(timeRange: TimeRange = "30d") {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [cityMetrics, setCityMetrics] = useState<CityMetrics[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      // Fetch raw data using service layer
      const rawData = await fetchAnalyticsRawData(supabase, timeRange as ServiceTimeRange);

      // Compute metrics using service layer
      const serviceMetrics = computeAnalyticsMetrics(rawData);

      // Map service metrics to hook's expected format (excluding totalRevenue)
      setMetrics({
        fillRate: serviceMetrics.fillRate,
        avgTimeToFirstBooking: serviceMetrics.avgTimeToFirstBooking,
        repeatBookingRate: serviceMetrics.repeatBookingRate,
        totalBookings: serviceMetrics.totalBookings,
        totalProfessionals: serviceMetrics.totalProfessionals,
        totalCustomers: serviceMetrics.totalCustomers,
        activeProfessionals: serviceMetrics.activeProfessionals,
      });

      // Calculate city and category metrics using service layer
      const cityMetricsArray = calculateCityMetrics(rawData.bookings, rawData.professionals);
      setCityMetrics(cityMetricsArray);

      const categoryMetricsArray = calculateCategoryMetrics(rawData.bookings);
      setCategoryMetrics(categoryMetricsArray);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    metrics,
    cityMetrics,
    categoryMetrics,
    isLoading,
    error,
    refresh: loadAnalytics,
  };
}
