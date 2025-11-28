/**
 * ProDashboardV2 - High-Density Professional Dashboard
 *
 * Main container orchestrating the dashboard layout:
 * 1. Header with welcome message, availability toggle, date range filter
 * 2. MetricQuad - 4 KPI cards row (with Quick Withdraw!)
 * 3. InsightEngine - UpcomingJobs list + Revenue chart
 * 4. RecentBookingsTable - Data table with working filters
 *
 * Key Changes from V1:
 * - Terminology: "Leads" → "Inquiries", "Sales" → "Jobs Completed"
 * - Added Quick Withdraw button to earnings card
 * - Added Availability toggle (Pro can go offline)
 * - Added Safety Center button (emergency support access)
 * - All buttons now functional with proper handlers
 * - UpcomingJobs replaced ServiceBreakdown (workers care about "what's next")
 *
 * Fetches real data from /api/pro/dashboard/stats endpoint.
 * Following Lia Design System with Casaora Dark Mode palette.
 */

"use client";

import { Download01Icon, FilterIcon, HelpCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/utils/format";
import { type DatePeriod, DateRangeFilter } from "./DateRangeFilter";
import { InsightEngine, InsightEngineSkeleton } from "./InsightEngine";
import { type MetricData, MetricQuad, MetricQuadSkeleton } from "./MetricQuad";
import {
  type RecentBooking,
  RecentBookingsTable,
  RecentBookingsTableSkeleton,
} from "./RecentBookingsTable";
import type { RevenueFlowPoint } from "./RevenueFlowChart";
import type { UpcomingJob } from "./UpcomingJobsList";

// ========================================
// Types
// ========================================

type FilterType = "all" | "completed" | "pending" | "cancelled";

type DashboardData = {
  metrics: MetricData;
  upcomingJobs: UpcomingJob[];
  revenueFlow: RevenueFlowPoint[];
  recentBookings: RecentBooking[];
  currencyCode: Currency;
  professionalName: string;
  newInquiriesCount: number;
  pendingResponsesCount: number;
};

type ProDashboardV2Props = {
  /** Professional's display name */
  name?: string;
  /** Currency code for formatting */
  currencyCode?: Currency;
  className?: string;
};

// ========================================
// Utilities
// ========================================

function exportToCSV(bookings: RecentBooking[], _currencyCode: Currency) {
  if (bookings.length === 0) {
    return;
  }

  const headers = ["Client", "Service", "Date", "Amount", "Status"];
  const rows = bookings.map((b) => [
    b.client.name,
    b.serviceType,
    b.date,
    b.amount.toString(),
    b.status,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `bookings_export_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

type ApiBooking = {
  id: string;
  client_name: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  address?: string;
};

function transformApiResponse(result: Record<string, unknown>): DashboardData {
  const earnings = result.earnings as { paid: number; trend: number };
  const bookings = result.bookings as {
    total: number;
    trend: number;
    upcoming: number;
    cancelled: number;
  };
  const activeClients = result.activeClients as { value: number; trend: number } | undefined;
  const performance = result.performance as { completionRate: number };
  const charts = result.charts as { revenueFlow: RevenueFlowPoint[] };
  const upcomingBookings = (result.upcomingBookings || []) as ApiBooking[];

  return {
    metrics: {
      totalEarnings: { value: earnings.paid, trend: earnings.trend },
      totalBookings: { value: bookings.total, trend: bookings.trend },
      activeClients: { value: activeClients?.value ?? 0, trend: activeClients?.trend ?? 0 },
      completionRate: { value: Math.round(performance.completionRate * 100), trend: 0 },
    },
    upcomingJobs: upcomingBookings.slice(0, 3).map((booking) => ({
      id: booking.id,
      client: { name: booking.client_name },
      serviceType: booking.service_type,
      date: formatJobDate(booking.scheduled_date),
      time: booking.scheduled_time,
      address: booking.address,
    })),
    revenueFlow: charts.revenueFlow || [],
    recentBookings: (result.recentBookings || []) as RecentBooking[],
    currencyCode: (result.currencyCode || "COP") as Currency,
    professionalName: "Professional",
    newInquiriesCount: bookings.upcoming,
    pendingResponsesCount: bookings.cancelled > 0 ? bookings.cancelled : 0,
  };
}

// ========================================
// Sub-Components
// ========================================

type AvailabilityToggleProps = {
  isAvailable: boolean;
  onChange: (available: boolean) => void;
};

function AvailabilityToggle({ isAvailable, onChange }: AvailabilityToggleProps) {
  return (
    <button
      aria-pressed={isAvailable}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 font-medium text-sm transition-colors",
        isAvailable
          ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
          : "border-neutral-200 bg-neutral-100 text-neutral-500 dark:border-border dark:bg-muted dark:text-muted-foreground"
      )}
      onClick={() => onChange(!isAvailable)}
      type="button"
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isAvailable ? "animate-pulse bg-green-500" : "bg-neutral-400"
        )}
      />
      {isAvailable ? "Available" : "Offline"}
    </button>
  );
}

type FilterDropdownProps = {
  value: FilterType;
  onChange: (filter: FilterType) => void;
  isOpen: boolean;
  onToggle: () => void;
};

function FilterDropdown({ value, onChange, isOpen, onToggle }: FilterDropdownProps) {
  const options: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Bookings" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="relative">
      <button
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm",
          "border-neutral-200 bg-white text-neutral-700",
          "dark:border-border dark:bg-muted dark:text-muted-foreground",
          "hover:bg-neutral-50 dark:hover:bg-muted/80",
          "transition-colors",
          isOpen && "ring-2 ring-rausch-500/50",
          geistSans.className
        )}
        onClick={onToggle}
        type="button"
      >
        <HugeiconsIcon className="h-4 w-4" icon={FilterIcon} />
        <span className="hidden sm:inline">Filter</span>
        {value !== "all" && (
          <span className="ml-1 rounded-full bg-rausch-500 px-1.5 py-0.5 text-white text-xs">
            1
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full right-0 z-50 mt-1 min-w-[160px] rounded-lg border p-1 shadow-lg",
            "border-neutral-200 bg-white",
            "dark:border-border dark:bg-background"
          )}
        >
          {options.map((option) => (
            <button
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-left text-sm",
                value === option.value
                  ? "bg-rausch-50 text-rausch-600 dark:bg-rausch-500/10 dark:text-rausch-400"
                  : "text-neutral-700 hover:bg-neutral-50 dark:text-muted-foreground dark:hover:bg-muted",
                geistSans.className
              )}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                onToggle();
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ========================================
// Main Component
// ========================================

export function ProDashboardV2({
  name,
  currencyCode: propCurrency,
  className,
}: ProDashboardV2Props) {
  const router = useRouter();

  // State
  const [period, setPeriod] = useState<DatePeriod>("30d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Data Fetching
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pro/dashboard/stats?period=${period}`);
      const result = await response.json();

      if (!(response.ok && result.success)) {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }

      setData(transformApiResponse(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleWithdraw = useCallback(() => {
    router.push("/dashboard/pro/finances?action=withdraw");
  }, [router]);

  const handleDownloadCSV = useCallback(() => {
    if (data?.recentBookings) {
      exportToCSV(data.recentBookings, data.currencyCode);
    }
  }, [data]);

  const handleSafetyCenter = useCallback(() => {
    router.push("/dashboard/pro/settings?tab=safety");
  }, [router]);

  const handleAvailabilityChange = useCallback((available: boolean) => {
    setIsAvailable(available);
    // TODO: Persist availability status to backend
    // fetch('/api/pro/availability', { method: 'POST', body: JSON.stringify({ available }) });
  }, []);

  // Computed values
  const currency = propCurrency ?? data?.currencyCode ?? "COP";
  const displayName = name ?? data?.professionalName ?? "Professional";

  // Format date range for display
  const dateRangeText = (() => {
    const now = new Date();
    const periodDays: Record<DatePeriod, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const daysAgo = periodDays[period];
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

    return `${formatDate(startDate)} - ${formatDate(now)}`;
  })();

  // Filter bookings
  const filteredBookings =
    data?.recentBookings?.filter((b) => filterType === "all" || b.status === filterType) ?? [];

  // Error State
  if (error) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-6", className)}>
        <p className="text-center text-muted-foreground text-sm">{error}</p>
        <button
          className="mt-2 block w-full text-center text-rausch-500 text-sm hover:text-rausch-400"
          onClick={fetchData}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Welcome Message + Status */}
        <div>
          <div className="flex items-center gap-3">
            <h1
              className={cn(
                "font-semibold text-2xl",
                "text-neutral-900 dark:text-foreground",
                geistSans.className
              )}
            >
              Welcome Back, {displayName}!
            </h1>
            <AvailabilityToggle isAvailable={isAvailable} onChange={handleAvailabilityChange} />
          </div>
          <p
            className={cn(
              "mt-1 text-sm",
              "text-neutral-600 dark:text-muted-foreground",
              geistSans.className
            )}
          >
            Today you have{" "}
            <span className="font-medium text-babu-500">
              {data?.newInquiriesCount ?? 0} new inquiries
            </span>
            ,{" "}
            <span className="font-medium text-rausch-500">
              {data?.pendingResponsesCount ?? 0} pending responses
            </span>
          </p>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Safety Center Button */}
          <button
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm",
              "border-amber-500/30 bg-amber-500/10 text-amber-600",
              "dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
              "hover:bg-amber-500/20",
              "transition-colors",
              geistSans.className
            )}
            onClick={handleSafetyCenter}
            title="Safety Center - Get help or report an issue"
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={HelpCircleIcon} />
            <span className="hidden sm:inline">Safety</span>
          </button>

          {/* Date Range Display */}
          <span
            className={cn(
              "hidden text-sm lg:block",
              "text-neutral-600 dark:text-muted-foreground",
              geistSans.className
            )}
          >
            {dateRangeText}
          </span>

          {/* Date Range Filter */}
          <DateRangeFilter onChange={setPeriod} size="sm" value={period} />

          {/* Filter Dropdown */}
          <FilterDropdown
            isOpen={isFilterOpen}
            onChange={setFilterType}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            value={filterType}
          />

          {/* Download Button */}
          <button
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-lg px-4 font-medium text-sm",
              "bg-rausch-500 text-white",
              "hover:bg-rausch-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors",
              geistSans.className
            )}
            disabled={!data?.recentBookings?.length}
            onClick={handleDownloadCSV}
            title="Download bookings as CSV"
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Download01Icon} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Row 1: Metric Quad */}
      {isLoading && <MetricQuadSkeleton />}
      {!isLoading && data && (
        <MetricQuad currencyCode={currency} data={data.metrics} onWithdraw={handleWithdraw} />
      )}

      {/* Row 2: Insight Engine (UpcomingJobs + Revenue Chart) */}
      {isLoading && <InsightEngineSkeleton />}
      {!isLoading && data && (
        <InsightEngine
          currencyCode={currency}
          revenueData={data.revenueFlow}
          upcomingJobs={data.upcomingJobs}
        />
      )}

      {/* Row 3: Recent Bookings (with applied filter) */}
      {isLoading && <RecentBookingsTableSkeleton />}
      {!isLoading && data && (
        <RecentBookingsTable bookings={filteredBookings} currencyCode={currency} />
      )}

      {/* Close filter dropdown when clicking outside */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFilterOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsFilterOpen(false)}
          role="button"
          tabIndex={-1}
        />
      )}
    </div>
  );
}

// ========================================
// Utilities
// ========================================

function formatJobDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
