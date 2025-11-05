/**
 * Executive Dashboard Component
 *
 * Real-time operational overview for admin dashboard
 * Features: tabs, charts, filters, minimal design
 */

"use client";

import {
  Alert01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  DollarCircleIcon,
  Edit02Icon,
  Maximize01Icon,
  MoreVerticalIcon,
  TimeScheduleIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { cn } from "@/lib/utils";

type DashboardMetrics = {
  // Today's stats
  todayRevenue: number;
  todayBookings: number;

  // Current operational status
  pendingBookings: number;
  activeBookings: number;
  pendingVetting: number;

  // Critical alerts
  criticalAlerts: Alert[];

  // Supply health
  activeProfessionals: number;
  totalProfessionals: number;

  // Customer stats
  totalCustomers: number;

  // Historical data for charts
  revenueData: Array<{ date: string; revenue: number; bookings: number }>;
  utilizationData: Array<{ date: string; rate: number }>;
  bookingFunnelData: Array<{ stage: string; count: number }>;
};

type Alert = {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: Date;
};

type DateRange = "7d" | "30d" | "90d" | "1y";

export function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const loadMetrics = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Calculate date range
      const rangeStart = new Date();
      if (dateRange === "7d") {
        rangeStart.setDate(rangeStart.getDate() - 7);
      } else if (dateRange === "30d") {
        rangeStart.setDate(rangeStart.getDate() - 30);
      } else if (dateRange === "90d") {
        rangeStart.setDate(rangeStart.getDate() - 90);
      } else {
        rangeStart.setFullYear(rangeStart.getFullYear() - 1);
      }

      // Fetch today's bookings
      const { data: todayBookings } = await supabase
        .from("bookings")
        .select("id, amount_estimated, status")
        .gte("created_at", todayStart.toISOString());

      // Fetch pending and active bookings
      const { data: pendingBookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("status", "pending");

      const { data: activeBookings } = await supabase
        .from("bookings")
        .select("id")
        .in("status", ["confirmed", "in_progress"]);

      // Fetch professionals pending vetting
      const { data: pendingVetting } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "professional")
        .eq("onboarding_status", "pending_review");

      // Fetch historical bookings for charts
      const { data: historicalBookings } = await supabase
        .from("bookings")
        .select("created_at, amount_estimated, status")
        .gte("created_at", rangeStart.toISOString())
        .order("created_at", { ascending: true });

      // Fetch active professionals (with booking in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentBookings } = await supabase
        .from("bookings")
        .select("professional_id")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .not("professional_id", "is", null);

      const activeProfessionalIds = new Set(recentBookings?.map((b) => b.professional_id));

      // Fetch total professionals and customers
      const { data: professionals } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "professional");

      const { data: customers } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer");

      // Calculate revenue
      const todayRevenue =
        todayBookings
          ?.filter((b) => b.status !== "cancelled")
          .reduce((sum, b) => sum + (b.amount_estimated || 0), 0) || 0;

      // Generate revenue chart data
      const revenueData = generateRevenueData(historicalBookings || [], dateRange);

      // Generate utilization data
      const utilizationData = generateUtilizationData(dateRange);

      // Generate booking funnel data
      const bookingFunnelData = [
        { stage: "Inquiries", count: (todayBookings?.length || 0) + 12 },
        { stage: "Pending", count: pendingBookings?.length || 0 },
        { stage: "Confirmed", count: activeBookings?.length || 0 },
        { stage: "Completed", count: Math.floor((activeBookings?.length || 0) * 0.8) },
      ];

      // Generate critical alerts
      const alerts: Alert[] = [];

      if ((pendingBookings?.length || 0) > 5) {
        alerts.push({
          id: "pending-bookings",
          type: "warning",
          title: `${pendingBookings?.length} pending bookings`,
          description: "Multiple bookings awaiting professional acceptance",
          timestamp: now,
        });
      }

      if ((pendingVetting?.length || 0) > 0) {
        alerts.push({
          id: "pending-vetting",
          type: "info",
          title: `${pendingVetting?.length} professionals awaiting review`,
          description: "Review queue requires attention",
          timestamp: now,
        });
      }

      const utilizationRate = professionals?.length
        ? (activeProfessionalIds.size / professionals.length) * 100
        : 0;

      if (utilizationRate < 30) {
        alerts.push({
          id: "low-utilization",
          type: "warning",
          title: "Low professional utilization",
          description: `Only ${utilizationRate.toFixed(0)}% of professionals active`,
          timestamp: now,
        });
      }

      setMetrics({
        todayRevenue,
        todayBookings: todayBookings?.length || 0,
        pendingBookings: pendingBookings?.length || 0,
        activeBookings: activeBookings?.length || 0,
        pendingVetting: pendingVetting?.length || 0,
        criticalAlerts: alerts,
        activeProfessionals: activeProfessionalIds.size,
        totalProfessionals: professionals?.length || 0,
        totalCustomers: customers?.length || 0,
        revenueData,
        utilizationData,
        bookingFunnelData,
      });
    } catch (error) {
      console.error("Failed to load dashboard metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadMetrics();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadMetrics();
    }, 30_000);

    return () => clearInterval(interval);
  }, [loadMetrics]);

  // Helper function to generate revenue data based on date range
  const generateRevenueData = (bookings: any[], range: DateRange) => {
    const data: Array<{ date: string; revenue: number; bookings: number }> = [];
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;

    // Group by day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayBookings = bookings.filter((b) => {
        const bookingDate = new Date(b.created_at);
        return bookingDate.toDateString() === date.toDateString();
      });

      const revenue =
        dayBookings
          .filter((b) => b.status !== "cancelled")
          .reduce((sum, b) => sum + (b.amount_estimated || 0), 0) / 100;

      data.push({
        date: dateStr,
        revenue,
        bookings: dayBookings.length,
      });
    }

    return data;
  };

  // Helper function to generate utilization data
  const generateUtilizationData = (range: DateRange) => {
    const data: Array<{ date: string; rate: number }> = [];
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      // Simulate utilization data (in real app, fetch from database)
      const rate = 35 + Math.random() * 20;

      data.push({
        date: dateStr,
        rate: Number(rate.toFixed(1)),
      });
    }

    return data;
  };

  if (isLoading || !metrics) {
    return (
      <div className="space-y-8">
        {/* Reserve space for alert banner - prevent layout shift */}
        <div className="min-h-[60px]">
          <div className="flex items-center gap-4 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4">
            <div className="h-5 w-5 animate-pulse rounded bg-[#F5F5F5] will-change-[opacity]" />
            <div className="h-5 w-48 animate-pulse rounded bg-[#F5F5F5] will-change-[opacity]" />
          </div>
        </div>

        {/* Tabs & Filter skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-96 animate-pulse rounded-lg bg-[#F5F5F5] will-change-[opacity]" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-[#F5F5F5] will-change-[opacity]" />
        </div>

        {/* Card grid with proper heights matching actual content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Large revenue card (2 columns) */}
          <div className="lg:col-span-2">
            <div className="h-[440px] animate-pulse rounded-xl border border-[#E5E5E5] bg-white p-6 will-change-[opacity]">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-xl bg-[#F5F5F5] will-change-[opacity]" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-[#F5F5F5] will-change-[opacity]" />
                    <div className="h-8 w-24 animate-pulse rounded bg-[#F5F5F5] will-change-[opacity]" />
                  </div>
                </div>
              </div>
              <div className="h-64 animate-pulse rounded bg-[#F5F5F5] will-change-[opacity]" />
            </div>
          </div>

          {/* Side metrics card */}
          <div className="h-[440px] animate-pulse rounded-xl border border-[#E5E5E5] bg-white p-6 will-change-[opacity]">
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div className="space-y-2" key={i}>
                  <div className="h-4 w-32 animate-pulse rounded bg-[#F5F5F5] will-change-[opacity]" />
                  <div className="h-8 w-20 animate-pulse rounded bg-[#F5F5F5] will-change-[opacity]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* System Status Banner */}
      {metrics.criticalAlerts.length > 0 ? (
        <div className="space-y-3">
          {metrics.criticalAlerts.map((alert) => (
            <div
              className={cn(
                "flex items-center gap-4 rounded-xl px-5 py-4 transition-all",
                alert.type === "critical" && "border border-red-200 bg-red-50",
                alert.type === "warning" && "border border-yellow-200 bg-yellow-50",
                alert.type === "info" && "border border-blue-200 bg-blue-50"
              )}
              key={alert.id}
            >
              <HugeiconsIcon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  alert.type === "critical" && "text-red-600",
                  alert.type === "warning" && "text-yellow-600",
                  alert.type === "info" && "text-blue-600"
                )}
                icon={Alert01Icon}
              />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[#171717] text-sm">{alert.title}</span>
                <span className="ml-3 text-[#737373] text-sm">{alert.description}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
          <HugeiconsIcon
            className="h-5 w-5 flex-shrink-0 text-green-600"
            icon={CheckmarkCircle02Icon}
          />
          <span className="font-semibold text-green-900 text-sm">All systems operational</span>
        </div>
      )}

      {/* Tabs & Filter */}
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="supply">Supply</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Date Range Filter */}
          <div className="flex items-center gap-3">
            <HugeiconsIcon className="h-4 w-4 text-[#737373]" icon={Calendar03Icon} />
            <Select onValueChange={(value) => setDateRange(value as DateRange)} value={dateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Revenue Card with Chart */}
            <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-green-50 p-3">
                    <HugeiconsIcon className="h-7 w-7 text-green-600" icon={DollarCircleIcon} />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                      Revenue Trend
                    </p>
                    <p className="font-bold text-3xl text-[#171717]">
                      ${(metrics.todayRevenue / 100).toLocaleString()}
                    </p>
                    <p className="mt-1 text-[#737373] text-sm">Today's revenue</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Edit revenue settings"
                    className="rounded-lg bg-[#F5F5F5] p-2 transition-colors hover:bg-[#E5E5E5]"
                    onClick={() => alert("Edit revenue tracking settings - Feature coming soon!")}
                  >
                    <HugeiconsIcon className="h-4 w-4 text-[#737373]" icon={Edit02Icon} />
                  </button>
                  <button
                    aria-label="Maximize chart"
                    className="rounded-lg bg-[#F5F5F5] p-2 transition-colors hover:bg-[#E5E5E5]"
                    onClick={() => alert("Expand revenue chart - Feature coming soon!")}
                  >
                    <HugeiconsIcon className="h-4 w-4 text-[#737373]" icon={Maximize01Icon} />
                  </button>
                  <button
                    aria-label="More options"
                    className="rounded-lg bg-[#F5F5F5] p-2 transition-colors hover:bg-[#E5E5E5]"
                    onClick={() => alert("Export CSV, Download PDF, Share - Coming soon!")}
                  >
                    <HugeiconsIcon className="h-4 w-4 text-[#737373]" icon={MoreVerticalIcon} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer height="100%" width="100%">
                    <AreaChart data={metrics.revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#E5E5E5" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="date"
                        fontSize={12}
                        stroke="#A3A3A3"
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        fontSize={12}
                        stroke="#A3A3A3"
                        tickFormatter={(value) => `$${value}`}
                        tickLine={false}
                      />
                      <Area
                        dataKey="revenue"
                        fill="url(#colorRevenue)"
                        stroke="#10b981"
                        strokeWidth={2}
                        type="monotone"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Column */}
            <div className="space-y-6">
              {/* Pending Bookings */}
              <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-yellow-50 p-3">
                      <HugeiconsIcon className="h-6 w-6 text-yellow-600" icon={TimeScheduleIcon} />
                    </div>
                    <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                      Pending Bookings
                    </p>
                  </div>
                  <p className="mb-2 font-bold text-4xl text-[#171717]">
                    {metrics.pendingBookings}
                  </p>
                  <p className="text-[#737373] text-sm">Awaiting acceptance</p>
                </CardContent>
              </Card>

              {/* Active Bookings */}
              <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <HugeiconsIcon
                        className="h-6 w-6 text-blue-600"
                        icon={CheckmarkCircle02Icon}
                      />
                    </div>
                    <p className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                      Active Bookings
                    </p>
                  </div>
                  <p className="mb-2 font-bold text-4xl text-[#171717]">{metrics.activeBookings}</p>
                  <p className="text-[#737373] text-sm">In progress</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Second Row */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Professional Supply with Chart */}
            <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-[#6B7F5C]/10 p-3">
                    <HugeiconsIcon className="h-6 w-6 text-[#6B7F5C]" icon={UserMultiple02Icon} />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                      Professional Utilization
                    </p>
                    <p className="font-bold text-2xl text-[#171717]">
                      {metrics.activeProfessionals}
                      <span className="text-[#737373] text-base">
                        /{metrics.totalProfessionals}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Maximize utilization chart"
                    className="rounded-lg bg-[#F5F5F5] p-2 transition-colors hover:bg-[#E5E5E5]"
                    onClick={() =>
                      alert("Expand professional utilization view - Feature coming soon!")
                    }
                  >
                    <HugeiconsIcon className="h-4 w-4 text-[#737373]" icon={Maximize01Icon} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-48">
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={metrics.utilizationData}>
                      <CartesianGrid stroke="#E5E5E5" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="date"
                        fontSize={12}
                        stroke="#A3A3A3"
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        fontSize={12}
                        stroke="#A3A3A3"
                        tickFormatter={(value) => `${value}%`}
                        tickLine={false}
                      />
                      <Line
                        dataKey="rate"
                        dot={false}
                        stroke="#6B7F5C"
                        strokeWidth={2}
                        type="monotone"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Booking Funnel */}
            <Card className="border-[#E5E5E5] bg-white transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <p className="mb-1 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                    Booking Funnel
                  </p>
                  <p className="text-[#737373] text-sm">Conversion pipeline</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Maximize funnel chart"
                    className="rounded-lg bg-[#F5F5F5] p-2 transition-colors hover:bg-[#E5E5E5]"
                    onClick={() => alert("Expand booking funnel analysis - Feature coming soon!")}
                  >
                    <HugeiconsIcon className="h-4 w-4 text-[#737373]" icon={Maximize01Icon} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-48">
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={metrics.bookingFunnelData} layout="vertical">
                      <CartesianGrid horizontal={false} stroke="#E5E5E5" strokeDasharray="3 3" />
                      <XAxis
                        axisLine={false}
                        fontSize={12}
                        stroke="#A3A3A3"
                        tickLine={false}
                        type="number"
                      />
                      <YAxis
                        axisLine={false}
                        dataKey="stage"
                        fontSize={12}
                        stroke="#A3A3A3"
                        tickLine={false}
                        type="category"
                      />
                      <Bar dataKey="count" fill="#E63946" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="py-20 text-center">
            <p className="text-[#737373]">Revenue analytics coming soon...</p>
          </div>
        </TabsContent>

        {/* Supply Tab */}
        <TabsContent value="supply">
          <div className="py-20 text-center">
            <p className="text-[#737373]">Supply management coming soon...</p>
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <div className="py-20 text-center">
            <p className="text-[#737373]">Booking analytics coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
