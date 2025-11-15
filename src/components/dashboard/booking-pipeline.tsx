/**
 * Booking Pipeline Component
 *
 * Visual representation of booking flow status
 * Features: tabs, filters, charts, minimal design
 */

"use client";

import {
  CheckmarkCircle02Icon,
  DollarCircleIcon,
  FilterIcon,
  Loading03Icon,
  Maximize01Icon,
  MoreVerticalIcon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
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
import type { HugeIcon } from "@/types/icons";

type BookingWithProfile = {
  id: string;
  status: string | null;
  created_at: string;
  amount_estimated: number | null;
  customer_id: string;
  professional_id: string;
  profiles: {
    full_name: string | null;
  } | null;
};

type PipelineStage = {
  id: string;
  label: string;
  icon: HugeIcon;
  count: number;
  color: string;
  bgColor: string;
  chartColor: string;
  bookings: Array<{
    id: string;
    created_at: string;
    customer_name?: string;
    professional_name?: string;
    amount: number;
  }>;
};

type FilterStatus = "all" | "today" | "week" | "month";

export function BookingPipeline() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const loadPipeline = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();

      // Calculate filter date range
      let dateFilter: Date | null = null;
      if (filter === "today") {
        dateFilter = new Date();
        dateFilter.setHours(0, 0, 0, 0);
      } else if (filter === "week") {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (filter === "month") {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 30);
      }

      // Fetch all active bookings with related data
      let query = supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          amount_estimated,
          customer_id,
          professional_id,
          profiles!bookings_customer_id_fkey (
            full_name
          )
        `)
        .in("status", ["pending", "confirmed", "in_progress", "pending_payment", "completed"]);

      if (dateFilter) {
        query = query.gte("created_at", dateFilter.toISOString());
      }

      const { data: bookings } = (await query) as { data: BookingWithProfile[] | null };

      // Group bookings by stage
      const pendingBookings = bookings?.filter((b) => b.status === "pending") || [];
      const confirmedBookings = bookings?.filter((b) => b.status === "confirmed") || [];
      const inProgressBookings = bookings?.filter((b) => b.status === "in_progress") || [];
      const pendingPaymentBookings = bookings?.filter((b) => b.status === "pending_payment") || [];
      const completedBookings = bookings?.filter((b) => b.status === "completed") || [];

      const pipelineStages: PipelineStage[] = [
        {
          id: "pending",
          label: "Pending",
          icon: TimeScheduleIcon,
          count: pendingBookings.length,
          color: "text-neutral-600",
          bgColor: "bg-neutral-50",
          chartColor: "neutral-500",
          bookings: pendingBookings.map((b) => ({
            id: b.id,
            created_at: b.created_at,
            customer_name: b.profiles?.full_name || "Unknown",
            amount: b.amount_estimated || 0,
          })),
        },
        {
          id: "confirmed",
          label: "Confirmed",
          icon: CheckmarkCircle02Icon,
          count: confirmedBookings.length,
          color: "text-neutral-700",
          bgColor: "bg-neutral-100",
          chartColor: "neutral-600",
          bookings: confirmedBookings.map((b) => ({
            id: b.id,
            created_at: b.created_at,
            customer_name: b.profiles?.full_name || "Unknown",
            amount: b.amount_estimated || 0,
          })),
        },
        {
          id: "in_progress",
          label: "In Progress",
          icon: Loading03Icon,
          count: inProgressBookings.length,
          color: "text-neutral-800",
          bgColor: "bg-neutral-200",
          chartColor: "neutral-700",
          bookings: inProgressBookings.map((b) => ({
            id: b.id,
            created_at: b.created_at,
            customer_name: b.profiles?.full_name || "Unknown",
            amount: b.amount_estimated || 0,
          })),
        },
        {
          id: "pending_payment",
          label: "Pending Payment",
          icon: DollarCircleIcon,
          count: pendingPaymentBookings.length,
          color: "text-neutral-700",
          bgColor: "bg-neutral-100",
          chartColor: "neutral-600",
          bookings: pendingPaymentBookings.map((b) => ({
            id: b.id,
            created_at: b.created_at,
            customer_name: b.profiles?.full_name || "Unknown",
            amount: b.amount_estimated || 0,
          })),
        },
        {
          id: "completed",
          label: "Completed",
          icon: CheckmarkCircle02Icon,
          count: completedBookings.length,
          color: "text-neutral-900",
          bgColor: "bg-neutral-300",
          chartColor: "neutral-900",
          bookings: completedBookings.map((b) => ({
            id: b.id,
            created_at: b.created_at,
            customer_name: b.profiles?.full_name || "Unknown",
            amount: b.amount_estimated || 0,
          })),
        },
      ];

      setStages(pipelineStages);
    } catch (error) {
      console.error("Failed to load booking pipeline:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPipeline();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadPipeline();
    }, 30_000);

    return () => clearInterval(interval);
  }, [loadPipeline]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Tabs & Filter skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-96 animate-pulse rounded-lg bg-neutral-100 will-change-[opacity]" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-pulse rounded bg-neutral-100 will-change-[opacity]" />
            <div className="h-10 w-40 animate-pulse rounded-lg bg-neutral-100 will-change-[opacity]" />
          </div>
        </div>

        {/* Stage Cards skeleton - matching actual p-8 content height */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              className="animate-pulse rounded-xl border border-neutral-200 bg-white p-8 will-change-[opacity]"
              key={i}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-neutral-100 will-change-[opacity]" />
                <div className="h-3 w-16 animate-pulse rounded bg-neutral-100 will-change-[opacity]" />
              </div>
              <div className="mb-2 h-10 w-16 animate-pulse rounded bg-neutral-100 will-change-[opacity]" />
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-100 will-change-[opacity]" />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              className="h-[380px] animate-pulse rounded-xl border border-neutral-200 bg-white p-6 will-change-[opacity]"
              key={i}
            >
              <div className="mb-6 h-16 w-full animate-pulse rounded bg-neutral-100 will-change-[opacity]" />
              <div className="h-64 animate-pulse rounded bg-neutral-100 will-change-[opacity]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalActive = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div className="space-y-8">
      {/* Tabs & Filter */}
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <HugeiconsIcon className="h-4 w-4 text-neutral-400" icon={FilterIcon} />
            <Select onValueChange={(value) => setFilter(value as FilterStatus)} value={filter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {/* Stage Cards - Horizontal scroll on mobile, comfortable card sizes */}
          <div className="-mx-4 sm:-mx-6 overflow-x-auto px-4 sm:px-6">
            <div className="flex min-w-min gap-4 pb-2">
              {stages.map((stage) => (
                <Card
                  className="w-[160px] flex-shrink-0 border-neutral-200 bg-white transition-shadow hover:shadow-md sm:w-[180px]"
                  key={stage.id}
                >
                  <CardContent className="p-4">
                    <div className="mb-4 flex flex-col gap-3">
                      <div
                        className="w-fit rounded-lg p-2.5"
                        style={{ backgroundColor: stage.bgColor }}
                      >
                        <HugeiconsIcon className={cn("h-5 w-5", stage.color)} icon={stage.icon} />
                      </div>
                      <p className="font-semibold text-[10px] text-neutral-500 uppercase leading-tight tracking-wider">
                        {stage.label}
                      </p>
                    </div>
                    <p className="mb-2 font-bold text-3xl text-neutral-900">{stage.count}</p>
                    <p className="text-neutral-500 text-xs leading-tight">
                      {totalActive > 0
                        ? `${((stage.count / totalActive) * 100).toFixed(0)}% of total`
                        : "No bookings"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Charts Row */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Stage Distribution Bar Chart */}
            <Card className="border-neutral-200 bg-white transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <p className="mb-1 font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Stage Distribution
                  </p>
                  <p className="text-neutral-500 text-sm">Bookings by lifecycle stage</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Maximize chart"
                    className="rounded-lg bg-neutral-50 p-2 transition-colors hover:bg-neutral-100"
                    onClick={() => alert("Expand chart view - Feature coming soon!")}
                  >
                    <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={Maximize01Icon} />
                  </button>
                  <button
                    aria-label="More options"
                    className="rounded-lg bg-neutral-50 p-2 transition-colors hover:bg-neutral-100"
                    onClick={() => alert("Export data, Refresh, Settings - Coming soon!")}
                  >
                    <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={MoreVerticalIcon} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={stages}>
                      <CartesianGrid stroke="neutral-200" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="label"
                        fontSize={12}
                        stroke="neutral-400"
                        tickLine={false}
                      />
                      <YAxis axisLine={false} fontSize={12} stroke="neutral-400" tickLine={false} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {stages.map((entry, index) => (
                          <Cell fill={entry.chartColor} key={`cell-${index}`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Health Card */}
            <Card className="border-neutral-200 bg-white transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <p className="mb-1 font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Pipeline Health
                  </p>
                  <p className="text-neutral-500 text-sm">Current conversion metrics</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Maximize metrics"
                    className="rounded-lg bg-neutral-50 p-2 transition-colors hover:bg-neutral-100"
                    onClick={() => alert("Expand metrics view - Feature coming soon!")}
                  >
                    <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={Maximize01Icon} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Conversion Rate */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-neutral-500 text-sm">Conversion Rate</span>
                      <span className="font-bold text-lg text-neutral-900">
                        {totalActive > 0
                          ? `${(((stages.find((s) => s.id === "completed")?.count || 0) / totalActive) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-neutral-100">
                      <div
                        className="h-3 rounded-full bg-neutral-600 transition-all"
                        style={{
                          width:
                            totalActive > 0
                              ? `${((stages.find((s) => s.id === "completed")?.count || 0) / totalActive) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  {/* Pending Acceptance Rate */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-neutral-500 text-sm">Pending Acceptance</span>
                      <span className="font-bold text-lg text-neutral-900">
                        {totalActive > 0
                          ? `${(((stages.find((s) => s.id === "pending")?.count || 0) / totalActive) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-neutral-100">
                      <div
                        className="h-3 rounded-full bg-neutral-400 transition-all"
                        style={{
                          width:
                            totalActive > 0
                              ? `${((stages.find((s) => s.id === "pending")?.count || 0) / totalActive) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  {/* In Progress Rate */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-neutral-500 text-sm">In Progress</span>
                      <span className="font-bold text-lg text-neutral-900">
                        {totalActive > 0
                          ? `${(((stages.find((s) => s.id === "in_progress")?.count || 0) / totalActive) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-neutral-100">
                      <div
                        className="h-3 rounded-full bg-neutral-500 transition-all"
                        style={{
                          width:
                            totalActive > 0
                              ? `${((stages.find((s) => s.id === "in_progress")?.count || 0) / totalActive) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  {/* Total Active */}
                  <div className="border-neutral-200 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900 text-sm">
                        Total Active Bookings
                      </span>
                      <span className="font-bold text-2xl text-neutral-900">{totalActive}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stages Tab */}
        <TabsContent value="stages">
          <div className="py-20 text-center">
            <p className="text-neutral-500">Detailed stage breakdown coming soon...</p>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="py-20 text-center">
            <p className="text-neutral-500">Booking timeline view coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
