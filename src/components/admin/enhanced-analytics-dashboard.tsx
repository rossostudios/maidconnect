/**
 * Enhanced Analytics Dashboard Component
 *
 * Advanced analytics with charts and visualizations
 * Uses Recharts via shadcn/ui chart components
 */

"use client";

import {
  Analytics01Icon,
  RepeatIcon,
  TimeScheduleIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { geistSans } from "@/app/fonts";
import { AnalyticsEmptyState } from "@/components/admin/analytics-empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { createSupabaseBrowserClient } from "@/lib/integrations/supabase/browserClient";
import {
  type AnalyticsTrendData,
  loadAnalyticsData,
  type TimeRange as ServiceTimeRange,
} from "@/lib/services/analytics/analyticsDataService";
import { cn } from "@/lib/utils/core";

type AnalyticsMetrics = {
  fillRate: number;
  avgTimeToFirstBooking: number;
  repeatBookingRate: number;
  totalBookings: number;
  totalProfessionals: number;
  totalCustomers: number;
  activeProfessionals: number;
};

type TrendData = {
  date: string;
  bookings: number;
  revenue: number;
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

const COLORS = ["#FF5200", "#6B7F5C", "#1A1A1A", "#F4A259", "#457B9D"];

const getDaysForRange = (range: "7d" | "30d" | "90d") => {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    default:
      return 90;
  }
};

const getRangeLabel = (range: "7d" | "30d" | "90d") => {
  switch (range) {
    case "7d":
      return "7 Days";
    case "30d":
      return "30 Days";
    default:
      return "90 Days";
  }
};

const getFillRateTrend = (value: number) => {
  if (value >= 70) {
    return "up";
  }
  if (value >= 50) {
    return "neutral";
  }
  return "down";
};

const getFillRateVariant = (value: number) => {
  if (value >= 70) {
    return "green";
  }
  if (value >= 50) {
    return "orange";
  }
  return "pink";
};

const getAvgTimeVariant = (value: number) => {
  if (value <= 7) {
    return "green";
  }
  if (value <= 14) {
    return "orange";
  }
  return "pink";
};

const getRepeatVariant = (value: number) => {
  if (value >= 40) {
    return "green";
  }
  if (value >= 25) {
    return "orange";
  }
  return "pink";
};

/**
 * Format category name for display (capitalize, replace underscores)
 */
const formatCategoryName = (category: string): string =>
  category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

/**
 * Format trend data date for display
 */
const formatTrendDataForDisplay = (trendData: AnalyticsTrendData[]): TrendData[] => {
  return trendData.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    bookings: item.bookings,
    revenue: item.revenue / 100, // Convert to display format
  }));
};

export function EnhancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [cityMetrics, setCityMetrics] = useState<CityMetrics[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Use service layer to fetch and compute all analytics
      const analyticsData = await loadAnalyticsData(
        supabase,
        selectedTimeRange as ServiceTimeRange
      );

      // Map service metrics to component's expected format (excluding totalRevenue)
      setMetrics({
        fillRate: analyticsData.metrics.fillRate,
        avgTimeToFirstBooking: analyticsData.metrics.avgTimeToFirstBooking,
        repeatBookingRate: analyticsData.metrics.repeatBookingRate,
        totalBookings: analyticsData.metrics.totalBookings,
        totalProfessionals: analyticsData.metrics.totalProfessionals,
        totalCustomers: analyticsData.metrics.totalCustomers,
        activeProfessionals: analyticsData.metrics.activeProfessionals,
      });

      // Format trend data for display
      setTrendData(formatTrendDataForDisplay(analyticsData.trendData));

      // Use city metrics directly (top 5 for display)
      setCityMetrics(analyticsData.cityMetrics.slice(0, 5));

      // Format category names for display
      setCategoryMetrics(
        analyticsData.categoryMetrics.map((cat) => ({
          ...cat,
          category: formatCategoryName(cat.category),
        }))
      );
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={cn("text-neutral-500", geistSans.className)}>Loading analytics...</div>
      </div>
    );
  }

  // Show empty state when no bookings exist
  if (metrics.totalBookings === 0) {
    return <AnalyticsEmptyState />;
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        {(["7d", "30d", "90d"] as const).map((range) => (
          <button
            className={cn(
              "rounded-lg px-4 py-2 font-semibold text-sm transition-all",
              geistSans.className,
              selectedTimeRange === range
                ? "bg-rausch-500 text-white shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-900 hover:border-rausch-500 hover:bg-rausch-50"
            )}
            key={range}
            onClick={() => setSelectedTimeRange(range)}
            type="button"
          >
            {getRangeLabel(range)}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          description="Booking requests accepted"
          icon={Analytics01Icon}
          title="Fill Rate"
          trend={getFillRateTrend(metrics.fillRate)}
          trendValue={`${metrics.fillRate.toFixed(0)}%`}
          value={`${metrics.fillRate.toFixed(1)}%`}
          variant={getFillRateVariant(metrics.fillRate)}
        />
        <MetricCard
          description="Days (avg. professional)"
          icon={TimeScheduleIcon}
          title="Time to First Booking"
          value={`${metrics.avgTimeToFirstBooking.toFixed(1)}`}
          variant={getAvgTimeVariant(metrics.avgTimeToFirstBooking)}
        />
        <MetricCard
          description="Customers with 2+ bookings"
          icon={RepeatIcon}
          title="Repeat Booking Rate"
          value={`${metrics.repeatBookingRate.toFixed(1)}%`}
          variant={getRepeatVariant(metrics.repeatBookingRate)}
        />
        <MetricCard
          description="With bookings (30 days)"
          icon={UserMultiple02Icon}
          title="Active Professionals"
          value={`${metrics.activeProfessionals}/${metrics.totalProfessionals}`}
          variant="blue"
        />
      </div>

      {/* Booking & Revenue Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
              Booking Trend
            </h3>
            <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
              Daily bookings over time
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: { label: "Bookings", color: "#FF5200" },
              }}
            >
              <LineChart data={trendData} height={300}>
                <CartesianGrid stroke="#E5E5E5" strokeDasharray="3 3" />
                <XAxis
                  axisLine={{ stroke: "#E5E5E5" }}
                  dataKey="date"
                  tick={{ fill: "#737373", fontSize: 12 }}
                />
                <YAxis axisLine={{ stroke: "#E5E5E5" }} tick={{ fill: "#737373", fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  activeDot={{ r: 6 }}
                  dataKey="bookings"
                  dot={{ fill: "#FF5200", r: 4 }}
                  stroke="#FF5200"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
              Revenue Trend
            </h3>
            <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
              Daily revenue (COP)
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Revenue", color: "#6B7F5C" },
              }}
            >
              <LineChart data={trendData} height={300}>
                <CartesianGrid stroke="#E5E5E5" strokeDasharray="3 3" />
                <XAxis
                  axisLine={{ stroke: "#E5E5E5" }}
                  dataKey="date"
                  tick={{ fill: "#737373", fontSize: 12 }}
                />
                <YAxis axisLine={{ stroke: "#E5E5E5" }} tick={{ fill: "#737373", fontSize: 12 }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent valueFormatter={(value) => `$${value.toLocaleString()}`} />
                  }
                />
                <Line
                  activeDot={{ r: 6 }}
                  dataKey="revenue"
                  dot={{ fill: "#6B7F5C", r: 4 }}
                  stroke="#6B7F5C"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* City Performance */}
      <Card>
        <CardHeader>
          <h3 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
            Top Cities by Bookings
          </h3>
          <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
            Performance by location
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              bookings: { label: "Bookings", color: "#FF5200" },
            }}
          >
            <BarChart data={cityMetrics} height={300}>
              <CartesianGrid stroke="#E5E5E5" strokeDasharray="3 3" />
              <XAxis
                axisLine={{ stroke: "#E5E5E5" }}
                dataKey="city"
                tick={{ fill: "#737373", fontSize: 12 }}
              />
              <YAxis axisLine={{ stroke: "#E5E5E5" }} tick={{ fill: "#737373", fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="bookingCount" fill="#FF5200" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <h3 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
            Service Category Distribution
          </h3>
          <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
            Bookings by service type
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            <div className="w-full flex-1">
              <ResponsiveContainer height={300} width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={categoryMetrics}
                    dataKey="bookingCount"
                    label
                    nameKey="category"
                    outerRadius={100}
                  >
                    {categoryMetrics.map((_entry, index) => (
                      <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryMetrics.map((category, index) => (
                <div className="flex items-center gap-3" key={category.category}>
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className={cn("flex-1 text-neutral-900 text-sm", geistSans.className)}>
                    {category.category}
                  </span>
                  <span
                    className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}
                  >
                    {category.bookingCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
