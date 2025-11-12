/**
 * Platform Analytics Dashboard Component
 *
 * Displays liquidity metrics and supply/demand insights
 * Sprint 2: Supply & Ops
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

type AnalyticsMetrics = {
  fillRate: number; // % of booking requests that were accepted
  avgTimeToFirstBooking: number; // Days from approval to first booking
  repeatBookingRate: number; // % of customers with 2+ bookings
  totalBookings: number;
  totalProfessionals: number;
  totalCustomers: number;
  activeProfessionals: number; // Professionals with booking in last 30 days
};

type CityMetrics = {
  city: string;
  fillRate: number;
  avgTimeToFirstBooking: number;
  bookingCount: number;
  professionalCount: number;
};

type CategoryMetrics = {
  category: string;
  fillRate: number;
  bookingCount: number;
  avgPrice: number;
};

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [cityMetrics, setCityMetrics] = useState<CityMetrics[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Calculate date range
      const now = new Date();
      let startDate: Date | null = null;

      if (selectedTimeRange !== "all") {
        startDate = new Date(now);
        const days = selectedTimeRange === "7d" ? 7 : selectedTimeRange === "30d" ? 30 : 90;
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

      // Calculate platform-wide metrics
      const totalBookings = bookings?.length || 0;
      const acceptedBookings =
        bookings?.filter((b) => b.status !== "cancelled" && b.status !== "pending_payment")
          .length || 0;
      const fillRate = totalBookings > 0 ? (acceptedBookings / totalBookings) * 100 : 0;

      // Calculate time to first booking
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

      // Calculate repeat booking rate
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

      // Calculate active professionals (bookings in last 30 days)
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

      // Calculate city-level metrics
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

      // Calculate category-level metrics
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
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#7d7566]">Loading analytics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-lg border border-[#ebe5d8] bg-white p-8 text-center">
        <p className="text-[#7d7566]">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        {(["7d", "30d", "90d", "all"] as const).map((range) => (
          <button
            className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
              selectedTimeRange === range
                ? "bg-[#E85D48] text-white"
                : "border border-[#e5dfd4] text-gray-900 hover:border-[#E85D48]"
            }`}
            key={range}
            onClick={() => setSelectedTimeRange(range)}
          >
            {range === "all"
              ? "All Time"
              : range === "7d"
                ? "7 Days"
                : range === "30d"
                  ? "30 Days"
                  : "90 Days"}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          description="Booking requests accepted"
          title="Fill Rate"
          trend={metrics.fillRate >= 70 ? "good" : metrics.fillRate >= 50 ? "neutral" : "poor"}
          value={`${metrics.fillRate.toFixed(1)}%`}
        />
        <MetricCard
          description="Avg. professional onboarding"
          title="Time to First Booking"
          trend={
            metrics.avgTimeToFirstBooking <= 7
              ? "good"
              : metrics.avgTimeToFirstBooking <= 14
                ? "neutral"
                : "poor"
          }
          value={`${metrics.avgTimeToFirstBooking.toFixed(1)} days`}
        />
        <MetricCard
          description="Customers with 2+ bookings"
          title="Repeat Booking Rate"
          trend={
            metrics.repeatBookingRate >= 40
              ? "good"
              : metrics.repeatBookingRate >= 25
                ? "neutral"
                : "poor"
          }
          value={`${metrics.repeatBookingRate.toFixed(1)}%`}
        />
        <MetricCard
          description="Bookings in last 30 days"
          title="Active Professionals"
          trend={
            metrics.activeProfessionals / metrics.totalProfessionals >= 0.5 ? "good" : "neutral"
          }
          value={`${metrics.activeProfessionals} / ${metrics.totalProfessionals}`}
        />
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-2 font-semibold text-[#7d7566] text-sm uppercase tracking-wide">
            Total Bookings
          </h3>
          <p className="font-bold text-3xl text-gray-900">{metrics.totalBookings}</p>
        </div>
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-2 font-semibold text-[#7d7566] text-sm uppercase tracking-wide">
            Total Professionals
          </h3>
          <p className="font-bold text-3xl text-gray-900">{metrics.totalProfessionals}</p>
        </div>
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <h3 className="mb-2 font-semibold text-[#7d7566] text-sm uppercase tracking-wide">
            Total Customers
          </h3>
          <p className="font-bold text-3xl text-gray-900">{metrics.totalCustomers}</p>
        </div>
      </div>

      {/* City Metrics */}
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <h2 className="mb-4 font-bold text-gray-900 text-xl">Metrics by City</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fbfafa]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">City</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                  Fill Rate
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                  Avg. TTFB
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                  Bookings
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                  Professionals
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe5d8]">
              {cityMetrics.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-[#7d7566]" colSpan={5}>
                    No city data available
                  </td>
                </tr>
              ) : (
                cityMetrics.map((city) => (
                  <tr key={city.city}>
                    <td className="px-6 py-4 font-medium text-gray-900">{city.city}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-semibold text-xs ${
                          city.fillRate >= 70
                            ? "bg-stone-100 text-stone-700"
                            : city.fillRate >= 50
                              ? "bg-stone-100 text-stone-600"
                              : "bg-stone-100 text-stone-800"
                        }`}
                      >
                        {city.fillRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#7d7566] text-sm">
                      {city.avgTimeToFirstBooking > 0
                        ? `${city.avgTimeToFirstBooking.toFixed(1)} days`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-[#7d7566] text-sm">{city.bookingCount}</td>
                    <td className="px-6 py-4 text-[#7d7566] text-sm">{city.professionalCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Metrics */}
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <h2 className="mb-4 font-bold text-gray-900 text-xl">Metrics by Service Category</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fbfafa]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                  Category
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                  Fill Rate
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                  Bookings
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
                  Avg. Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe5d8]">
              {categoryMetrics.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-[#7d7566]" colSpan={4}>
                    No category data available
                  </td>
                </tr>
              ) : (
                categoryMetrics.map((category) => (
                  <tr key={category.category}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {category.category
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-semibold text-xs ${
                          category.fillRate >= 70
                            ? "bg-stone-100 text-stone-700"
                            : category.fillRate >= 50
                              ? "bg-stone-100 text-stone-600"
                              : "bg-stone-100 text-stone-800"
                        }`}
                      >
                        {category.fillRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#7d7566] text-sm">{category.bookingCount}</td>
                    <td className="px-6 py-4 text-[#7d7566] text-sm">
                      {category.avgPrice > 0 ? `$${(category.avgPrice / 100).toFixed(0)} COP` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  trend: "good" | "neutral" | "poor";
};

function MetricCard({ title, value, description, trend }: MetricCardProps) {
  const trendColors = {
    good: "border-stone-200 bg-stone-100",
    neutral: "border-stone-300 bg-stone-100",
    poor: "border-stone-300 bg-[#E85D48]/10",
  };

  const trendIndicators = {
    good: "↗",
    neutral: "→",
    poor: "↘",
  };

  return (
    <div className={`rounded-2xl border-2 ${trendColors[trend]} p-6`}>
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-[#7d7566] text-sm uppercase tracking-wide">{title}</h3>
        <span className="text-2xl">{trendIndicators[trend]}</span>
      </div>
      <p className="mt-3 font-bold text-3xl text-gray-900">{value}</p>
      <p className="mt-1 text-[#7d7566] text-sm">{description}</p>
    </div>
  );
}
