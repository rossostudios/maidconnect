/**
 * Platform Analytics Dashboard Component
 *
 * Displays liquidity metrics and supply/demand insights
 * Sprint 2: Supply & Ops
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

type TimeRange = "7d" | "30d" | "90d" | "all";
type SupabaseBrowserClient = ReturnType<typeof createSupabaseBrowserClient>;
const TIME_RANGE_OPTIONS: readonly TimeRange[] = ["7d", "30d", "90d", "all"];

type BookingRecord = {
  id: string;
  status: string;
  created_at: string;
  scheduled_start: string | null;
  customer_id: string | null;
  professional_id: string | null;
  amount_estimated: number | null;
  service_category: string | null;
  city: string | null;
};

type ProfessionalRecord = {
  id: string;
  approval_date: string | null;
};

type CustomerRecord = {
  id: string;
};

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

type CityStats = {
  total: number;
  accepted: number;
  professionals: Set<string>;
  ttfbDays: number[];
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
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("30d");

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const startDate = getStartDate(selectedTimeRange);
      const [bookings, professionals, customers] = await Promise.all([
        fetchBookings(supabase, startDate),
        fetchProfessionals(supabase),
        fetchCustomers(supabase),
      ]);

      const bookingsByProfessional = groupBookingsByProfessional(bookings);
      setMetrics(buildPlatformMetrics(bookings, professionals, customers, bookingsByProfessional));
      setCityMetrics(buildCityMetrics(bookings, professionals, bookingsByProfessional));
      setCategoryMetrics(buildCategoryMetrics(bookings));
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
      <div className="border border-[#ebe5d8] bg-white p-8 text-center">
        <p className="text-[#7d7566]">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        {TIME_RANGE_OPTIONS.map((range) => (
          <button
            className={`px-4 py-2 font-medium text-sm transition ${
              selectedTimeRange === range
                ? "bg-[#E85D48] text-white"
                : "border border-[#e5dfd4] text-gray-900 hover:border-[#E85D48]"
            }`}
            key={range}
            onClick={() => setSelectedTimeRange(range)}
            type="button"
          >
            {formatRangeLabel(range)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          description="Booking requests accepted"
          title="Fill Rate"
          trend={getFillRateTrend(metrics.fillRate)}
          value={`${metrics.fillRate.toFixed(1)}%`}
        />
        <MetricCard
          description="Avg. professional onboarding"
          title="Time to First Booking"
          trend={getTimeToFirstBookingTrend(metrics.avgTimeToFirstBooking)}
          value={`${metrics.avgTimeToFirstBooking.toFixed(1)} days`}
        />
        <MetricCard
          description="Customers with 2+ bookings"
          title="Repeat Booking Rate"
          trend={getRepeatBookingTrend(metrics.repeatBookingRate)}
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
                        className={`-full inline-flex px-3 py-1 font-semibold text-xs ${getFillRateBadgeClasses(
                          city.fillRate
                        )}`}
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
                        className={`-full inline-flex px-3 py-1 font-semibold text-xs ${getFillRateBadgeClasses(
                          category.fillRate
                        )}`}
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
    good: "border-neutral-200 bg-neutral-100",
    neutral: "border-neutral-300 bg-neutral-100",
    poor: "border-neutral-300 bg-[#E85D48]/10",
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

function getFillRateTrend(fillRate: number): "good" | "neutral" | "poor" {
  if (fillRate >= 70) {
    return "good";
  }
  if (fillRate >= 50) {
    return "neutral";
  }
  return "poor";
}

function getTimeToFirstBookingTrend(days: number): "good" | "neutral" | "poor" {
  if (days <= 7) {
    return "good";
  }
  if (days <= 14) {
    return "neutral";
  }
  return "poor";
}

function getRepeatBookingTrend(rate: number): "good" | "neutral" | "poor" {
  if (rate >= 40) {
    return "good";
  }
  if (rate >= 25) {
    return "neutral";
  }
  return "poor";
}

function getFillRateBadgeClasses(value: number): string {
  if (value >= 70) {
    return "bg-neutral-100 text-neutral-700";
  }
  if (value >= 50) {
    return "bg-neutral-100 text-neutral-600";
  }
  return "bg-neutral-100 text-neutral-800";
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function getStartDate(range: TimeRange): Date | null {
  const days = getRangeInDays(range);
  if (!days) {
    return null;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return startDate;
}

function getRangeInDays(range: TimeRange): number | null {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return null;
  }
}

function formatRangeLabel(range: TimeRange): string {
  switch (range) {
    case "all":
      return "All Time";
    case "7d":
      return "7 Days";
    case "30d":
      return "30 Days";
    case "90d":
      return "90 Days";
    default:
      return range;
  }
}

async function fetchBookings(
  supabase: SupabaseBrowserClient,
  startDate: Date | null
): Promise<BookingRecord[]> {
  let query = supabase.from("bookings").select(`
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
    query = query.gte("created_at", startDate.toISOString());
  }

  const { data } = await query;
  return (data ?? []) as BookingRecord[];
}

async function fetchProfessionals(supabase: SupabaseBrowserClient): Promise<ProfessionalRecord[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, approval_date")
    .eq("role", "professional");

  return (data ?? []) as ProfessionalRecord[];
}

async function fetchCustomers(supabase: SupabaseBrowserClient): Promise<CustomerRecord[]> {
  const { data } = await supabase.from("profiles").select("id").eq("role", "customer");
  return (data ?? []) as CustomerRecord[];
}

function groupBookingsByProfessional(bookings: BookingRecord[]) {
  const map = new Map<string, BookingRecord[]>();

  for (const booking of bookings) {
    if (!booking.professional_id || booking.status === "cancelled") {
      continue;
    }

    const existing = map.get(booking.professional_id) ?? [];
    existing.push(booking);
    map.set(booking.professional_id, existing);
  }

  for (const bookingList of map.values()) {
    bookingList.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  return map;
}

function buildPlatformMetrics(
  bookings: BookingRecord[],
  professionals: ProfessionalRecord[],
  customers: CustomerRecord[],
  bookingsByProfessional: Map<string, BookingRecord[]>
): AnalyticsMetrics {
  return {
    fillRate: calculateFillRate(bookings),
    avgTimeToFirstBooking: calculateAverageTimeToFirstBooking(
      bookingsByProfessional,
      professionals
    ),
    repeatBookingRate: calculateRepeatBookingRate(bookings),
    totalBookings: bookings.length,
    totalProfessionals: professionals.length,
    totalCustomers: customers.length,
    activeProfessionals: calculateActiveProfessionals(bookings),
  };
}

function calculateFillRate(bookings: BookingRecord[]): number {
  if (bookings.length === 0) {
    return 0;
  }

  let accepted = 0;
  for (const booking of bookings) {
    if (isAcceptedBooking(booking)) {
      accepted += 1;
    }
  }

  return (accepted / bookings.length) * 100;
}

function calculateAverageTimeToFirstBooking(
  bookingsByProfessional: Map<string, BookingRecord[]>,
  professionals: ProfessionalRecord[]
) {
  const daysToFirstBooking: number[] = [];

  for (const professional of professionals) {
    if (!professional.approval_date) {
      continue;
    }

    const firstBooking = bookingsByProfessional.get(professional.id)?.[0];
    if (!firstBooking) {
      continue;
    }

    const diff = calculateDaysBetween(professional.approval_date, firstBooking.created_at);
    if (diff >= 0) {
      daysToFirstBooking.push(diff);
    }
  }

  if (daysToFirstBooking.length === 0) {
    return 0;
  }

  const total = daysToFirstBooking.reduce((sum, day) => sum + day, 0);
  return total / daysToFirstBooking.length;
}

function calculateRepeatBookingRate(bookings: BookingRecord[]): number {
  const customerBookingCounts = new Map<string, number>();

  for (const booking of bookings) {
    if (!booking.customer_id || booking.status === "cancelled") {
      continue;
    }

    customerBookingCounts.set(
      booking.customer_id,
      (customerBookingCounts.get(booking.customer_id) ?? 0) + 1
    );
  }

  if (customerBookingCounts.size === 0) {
    return 0;
  }

  let customersWithMultipleBookings = 0;
  for (const count of customerBookingCounts.values()) {
    if (count >= 2) {
      customersWithMultipleBookings += 1;
    }
  }

  return (customersWithMultipleBookings / customerBookingCounts.size) * 100;
}

function calculateActiveProfessionals(bookings: BookingRecord[]): number {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeProfessionalIds = new Set<string>();

  for (const booking of bookings) {
    if (!booking.professional_id || booking.status === "cancelled") {
      continue;
    }

    if (new Date(booking.created_at) >= thirtyDaysAgo) {
      activeProfessionalIds.add(booking.professional_id);
    }
  }

  return activeProfessionalIds.size;
}

function buildCityMetrics(
  bookings: BookingRecord[],
  professionals: ProfessionalRecord[],
  bookingsByProfessional: Map<string, BookingRecord[]>
): CityMetrics[] {
  const cityStats = collectCityStats(bookings);
  const approvalDates = mapProfessionalApprovals(professionals);
  appendCityTtfbData(cityStats, bookingsByProfessional, approvalDates);
  return mapCityStatsToMetrics(cityStats);
}

type CityStatsMap = Map<string, CityStats>;

function collectCityStats(bookings: BookingRecord[]): CityStatsMap {
  const cityStats: CityStatsMap = new Map();

  for (const booking of bookings) {
    const cityName = booking.city || "Unknown";
    const cityData = cityStats.get(cityName) ?? createCityStatsEntry();
    cityData.total += 1;
    if (isAcceptedBooking(booking)) {
      cityData.accepted += 1;
    }
    if (booking.professional_id) {
      cityData.professionals.add(booking.professional_id);
    }

    cityStats.set(cityName, cityData);
  }

  return cityStats;
}

function createCityStatsEntry(): CityStats {
  return {
    total: 0,
    accepted: 0,
    professionals: new Set(),
    ttfbDays: [],
  };
}

function mapProfessionalApprovals(professionals: ProfessionalRecord[]) {
  const approvals = new Map<string, string>();
  for (const professional of professionals) {
    if (professional.approval_date) {
      approvals.set(professional.id, professional.approval_date);
    }
  }
  return approvals;
}

function appendCityTtfbData(
  cityStats: CityStatsMap,
  bookingsByProfessional: Map<string, BookingRecord[]>,
  approvalDates: Map<string, string>
) {
  for (const [professionalId, professionalBookings] of bookingsByProfessional.entries()) {
    const approvalDate = approvalDates.get(professionalId);
    const firstBooking = professionalBookings[0];
    if (!(approvalDate && firstBooking?.city)) {
      continue;
    }

    const diff = calculateDaysBetween(approvalDate, firstBooking.created_at);
    if (diff >= 0) {
      cityStats.get(firstBooking.city)?.ttfbDays.push(diff);
    }
  }
}

function mapCityStatsToMetrics(cityStats: CityStatsMap): CityMetrics[] {
  return Array.from(cityStats.entries())
    .map(([city, data]) => ({
      city,
      fillRate: data.total ? (data.accepted / data.total) * 100 : 0,
      avgTimeToFirstBooking: data.ttfbDays.length
        ? data.ttfbDays.reduce((sum, day) => sum + day, 0) / data.ttfbDays.length
        : 0,
      bookingCount: data.total,
      professionalCount: data.professionals.size,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount);
}

function buildCategoryMetrics(bookings: BookingRecord[]): CategoryMetrics[] {
  const categoryStats = new Map<string, { total: number; accepted: number; totalAmount: number }>();

  for (const booking of bookings) {
    const category = booking.service_category || "Unknown";
    if (!categoryStats.has(category)) {
      categoryStats.set(category, { total: 0, accepted: 0, totalAmount: 0 });
    }

    const categoryData = categoryStats.get(category)!;
    categoryData.total += 1;
    if (isAcceptedBooking(booking)) {
      categoryData.accepted += 1;
      categoryData.totalAmount += booking.amount_estimated ?? 0;
    }
  }

  return Array.from(categoryStats.entries())
    .map(([category, data]) => ({
      category,
      fillRate: data.total ? (data.accepted / data.total) * 100 : 0,
      bookingCount: data.total,
      avgPrice: data.accepted ? data.totalAmount / data.accepted : 0,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount);
}

function calculateDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.floor((endDate.getTime() - startDate.getTime()) / DAY_IN_MS);
}

function isAcceptedBooking(booking: BookingRecord): boolean {
  return booking.status !== "cancelled" && booking.status !== "pending_payment";
}
