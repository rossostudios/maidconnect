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
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  calculateActiveProfessionals,
  calculateAvgTimeToFirstBooking,
  calculateCategoryMetrics,
  calculateCityMetrics,
  calculateFillRate,
  calculateRepeatBookingRate,
} from "@/lib/services/analytics/analyticsCalculations";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

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

const COLORS = ["#E85D48", "#6B7F5C", "#1A1A1A", "#F4A259", "#457B9D"];

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

      // Calculate date range
      const now = new Date();
      const startDate = new Date(now);
      const days = selectedTimeRange === "7d" ? 7 : selectedTimeRange === "30d" ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          customer_id,
          professional_id,
          amount_estimated,
          service_category,
          city
        `)
        .gte("created_at", startDate.toISOString());

      // Fetch professionals
      const { data: professionals } = await supabase
        .from("profiles")
        .select("id, role, created_at, approval_date")
        .eq("role", "professional");

      // Fetch customers
      const { data: customers } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer");

      // Calculate metrics using service functions
      const fillRate = calculateFillRate(bookings);
      const avgTimeToFirstBooking = calculateAvgTimeToFirstBooking(professionals, bookings);
      const repeatBookingRate = calculateRepeatBookingRate(bookings);
      const activeProfessionals = calculateActiveProfessionals(bookings);

      setMetrics({
        fillRate,
        avgTimeToFirstBooking,
        repeatBookingRate,
        totalBookings: bookings?.length || 0,
        totalProfessionals: professionals?.length || 0,
        totalCustomers: customers?.length || 0,
        activeProfessionals,
      });

      // Generate trend data (last N days)
      const trendDays = days;
      const trendDataArray: TrendData[] = [];
      for (let i = trendDays - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        const dayBookings = bookings?.filter((b) => {
          const bookingDate = new Date(b.created_at);
          return bookingDate.toDateString() === date.toDateString();
        });

        const dayRevenue =
          dayBookings
            ?.filter((b) => b.status !== "cancelled")
            .reduce((sum, b) => sum + (b.amount_estimated || 0), 0) || 0;

        trendDataArray.push({
          date: dateStr,
          bookings: dayBookings?.length || 0,
          revenue: dayRevenue / 100, // Convert to dollars
        });
      }
      setTrendData(trendDataArray);

      // Calculate city and category metrics using service functions
      const cityMetricsArray = calculateCityMetrics(bookings, professionals).slice(0, 5); // Top 5 cities
      const categoryMetricsArray = calculateCategoryMetrics(bookings);

      setCityMetrics(cityMetricsArray);
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

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#737373]">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        {(["7d", "30d", "90d"] as const).map((range) => (
          <button
            className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
              selectedTimeRange === range
                ? "bg-[#E85D48] text-white"
                : "border border-[#E5E5E5] text-[#171717] hover:border-[#E85D48]"
            }`}
            key={range}
            onClick={() => setSelectedTimeRange(range)}
          >
            {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          description="Booking requests accepted"
          icon={Analytics01Icon}
          title="Fill Rate"
          trend={metrics.fillRate >= 70 ? "up" : metrics.fillRate >= 50 ? "neutral" : "down"}
          trendValue={`${metrics.fillRate.toFixed(0)}%`}
          value={`${metrics.fillRate.toFixed(1)}%`}
          variant={metrics.fillRate >= 70 ? "green" : metrics.fillRate >= 50 ? "default" : "pink"}
        />
        <MetricCard
          description="Days (avg. professional)"
          icon={TimeScheduleIcon}
          title="Time to First Booking"
          value={`${metrics.avgTimeToFirstBooking.toFixed(1)}`}
          variant={
            metrics.avgTimeToFirstBooking <= 7
              ? "green"
              : metrics.avgTimeToFirstBooking <= 14
                ? "default"
                : "pink"
          }
        />
        <MetricCard
          description="Customers with 2+ bookings"
          icon={RepeatIcon}
          title="Repeat Booking Rate"
          value={`${metrics.repeatBookingRate.toFixed(1)}%`}
          variant={
            metrics.repeatBookingRate >= 40
              ? "green"
              : metrics.repeatBookingRate >= 25
                ? "default"
                : "pink"
          }
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
            <h3 className="font-semibold text-[#171717] text-lg">Booking Trend</h3>
            <p className="text-[#737373] text-sm">Daily bookings over time</p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: { label: "Bookings", color: "#E85D48" },
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
                  dot={{ fill: "#E85D48", r: 4 }}
                  stroke="#E85D48"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[#171717] text-lg">Revenue Trend</h3>
            <p className="text-[#737373] text-sm">Daily revenue (COP)</p>
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
          <h3 className="font-semibold text-[#1A1A1A] text-lg">Top Cities by Bookings</h3>
          <p className="text-[#6A6A6A] text-sm">Performance by location</p>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              bookings: { label: "Bookings", color: "#E85D48" },
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
              <Bar dataKey="bookingCount" fill="#E85D48" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#1A1A1A] text-lg">Service Category Distribution</h3>
          <p className="text-[#6A6A6A] text-sm">Bookings by service type</p>
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
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="flex-1 text-[#171717] text-sm">{category.category}</span>
                  <span className="font-semibold text-[#1A1A1A] text-sm">
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
