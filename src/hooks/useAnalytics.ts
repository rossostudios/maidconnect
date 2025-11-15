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

export type CityMetrics = {
  city: string;
  fillRate: number;
  avgTimeToFirstBooking: number;
  bookingCount: number;
  professionalCount: number;
};

export type CategoryMetrics = {
  category: string;
  fillRate: number;
  bookingCount: number;
  avgPrice: number;
};

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

      // Calculate date range
      const now = new Date();
      let startDate: Date | null = null;

      if (timeRange !== "all") {
        startDate = new Date(now);
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        startDate.setDate(startDate.getDate() - days);
      }

      // Fetch bookings with filters
      let bookingsQuery = supabase.from("bookings").select(`
        id,
        status,
        created_at,
        scheduled_start,
        customer_id,
        professional_id,
        amount_estimated,
        service_category,
        city
      `);

      if (startDate) {
        bookingsQuery = bookingsQuery.gte("created_at", startDate.toISOString());
      }

      const { data: bookings } = await bookingsQuery;

      // Fetch professionals with approval dates
      const { data: professionals } = await supabase
        .from("profiles")
        .select("id, role, created_at, approval_date")
        .eq("role", "professional");

      // Fetch all customers
      const { data: customers } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer");

      // === PLATFORM-WIDE METRICS ===

      // Fill Rate calculation
      const totalBookings = bookings?.length || 0;
      const acceptedBookings =
        bookings?.filter((b) => b.status !== "cancelled" && b.status !== "pending_payment")
          .length || 0;
      const fillRate = totalBookings > 0 ? (acceptedBookings / totalBookings) * 100 : 0;

      // Time to First Booking (TTFB) calculation
      const proFirstBookings = professionals
        ?.map((pro) => {
          const firstBooking = bookings
            ?.filter((b) => b.professional_id === pro.id && b.status !== "cancelled")
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

          if (!(firstBooking && pro.approval_date)) {
            return null;
          }

          const approvalDate = new Date(pro.approval_date);
          const firstBookingDate = new Date(firstBooking.created_at);
          const daysDiff = Math.floor(
            (firstBookingDate.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return daysDiff >= 0 ? daysDiff : null;
        })
        .filter((days): days is number => days !== null);

      const avgTimeToFirstBooking =
        proFirstBookings && proFirstBookings.length > 0
          ? proFirstBookings.reduce((sum, days) => sum + days, 0) / proFirstBookings.length
          : 0;

      // Repeat Booking Rate calculation
      const customerBookingCounts = new Map<string, number>();
      bookings?.forEach((booking) => {
        if (booking.customer_id && booking.status !== "cancelled") {
          customerBookingCounts.set(
            booking.customer_id,
            (customerBookingCounts.get(booking.customer_id) || 0) + 1
          );
        }
      });

      const customersWithMultipleBookings = Array.from(customerBookingCounts.values()).filter(
        (count) => count >= 2
      ).length;
      const totalUniqueCustomers = customerBookingCounts.size;
      const repeatBookingRate =
        totalUniqueCustomers > 0 ? (customersWithMultipleBookings / totalUniqueCustomers) * 100 : 0;

      // Active Professionals calculation (bookings in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeProfessionalIds = new Set(
        bookings
          ?.filter((b) => new Date(b.created_at) >= thirtyDaysAgo && b.status !== "cancelled")
          .map((b) => b.professional_id)
      );

      setMetrics({
        fillRate,
        avgTimeToFirstBooking,
        repeatBookingRate,
        totalBookings,
        totalProfessionals: professionals?.length || 0,
        totalCustomers: customers?.length || 0,
        activeProfessionals: activeProfessionalIds.size,
      });

      // === CITY-LEVEL METRICS ===

      const citiesMap = new Map<
        string,
        { total: number; accepted: number; professionals: Set<string>; ttfbDays: number[] }
      >();

      bookings?.forEach((booking) => {
        const city = booking.city || "Unknown";
        if (!citiesMap.has(city)) {
          citiesMap.set(city, { total: 0, accepted: 0, professionals: new Set(), ttfbDays: [] });
        }

        const cityData = citiesMap.get(city)!;
        cityData.total++;
        if (booking.status !== "cancelled" && booking.status !== "pending_payment") {
          cityData.accepted++;
        }
        if (booking.professional_id) {
          cityData.professionals.add(booking.professional_id);
        }
      });

      // Add TTFB data for cities
      professionals?.forEach((pro) => {
        const firstBooking = bookings
          ?.filter((b) => b.professional_id === pro.id && b.status !== "cancelled")
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

        if (firstBooking && pro.approval_date && firstBooking.city) {
          const approvalDate = new Date(pro.approval_date);
          const firstBookingDate = new Date(firstBooking.created_at);
          const daysDiff = Math.floor(
            (firstBookingDate.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff >= 0) {
            const cityData = citiesMap.get(firstBooking.city);
            if (cityData) {
              cityData.ttfbDays.push(daysDiff);
            }
          }
        }
      });

      const cityMetricsArray = Array.from(citiesMap.entries())
        .map(([city, data]) => ({
          city,
          fillRate: data.total > 0 ? (data.accepted / data.total) * 100 : 0,
          avgTimeToFirstBooking:
            data.ttfbDays.length > 0
              ? data.ttfbDays.reduce((sum, d) => sum + d, 0) / data.ttfbDays.length
              : 0,
          bookingCount: data.total,
          professionalCount: data.professionals.size,
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount);

      setCityMetrics(cityMetricsArray);

      // === CATEGORY-LEVEL METRICS ===

      const categoriesMap = new Map<
        string,
        { total: number; accepted: number; totalAmount: number }
      >();

      bookings?.forEach((booking) => {
        const category = booking.service_category || "Unknown";
        if (!categoriesMap.has(category)) {
          categoriesMap.set(category, { total: 0, accepted: 0, totalAmount: 0 });
        }

        const categoryData = categoriesMap.get(category)!;
        categoryData.total++;
        if (booking.status !== "cancelled" && booking.status !== "pending_payment") {
          categoryData.accepted++;
          categoryData.totalAmount += booking.amount_estimated || 0;
        }
      });

      const categoryMetricsArray = Array.from(categoriesMap.entries())
        .map(([category, data]) => ({
          category,
          fillRate: data.total > 0 ? (data.accepted / data.total) * 100 : 0,
          bookingCount: data.total,
          avgPrice: data.accepted > 0 ? data.totalAmount / data.accepted : 0,
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount);

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
