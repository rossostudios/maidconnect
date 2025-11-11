"use client";

import { ChartIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getPerformanceMetrics, getRevenueTrend } from "@/app/actions/analytics";
import type { PerformanceMetrics, RevenueTrendDataPoint } from "@/types";
import { PerformanceMetricsCard } from "./performance-metrics-card";
import { RatingDistribution } from "./rating-distribution";
import { RevenueTrendChart } from "./revenue-trend-chart";

type AnalyticsDashboardProps = {
  profileId: string;
};

/**
 * Analytics Dashboard Component
 *
 * Main dashboard for displaying professional performance metrics.
 * Fetches and displays:
 * - Performance metrics (completion rate, revenue, ratings)
 * - Revenue trend chart
 * - Rating distribution
 */
export function AnalyticsDashboard({ profileId }: AnalyticsDashboardProps) {
  const t = useTranslations("components.analyticsDashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendDataPoint[]>([]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch metrics
      const metricsResponse = await getPerformanceMetrics(profileId);
      if (!metricsResponse.success) {
        setError(metricsResponse.error);
        return;
      }
      setMetrics(metricsResponse.metrics);

      // Fetch revenue trend
      const trendResponse = await getRevenueTrend(profileId, 30);
      if (!trendResponse.success) {
        setError(trendResponse.error);
        return;
      }
      setRevenueTrend(trendResponse.trend);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-[#64748b] border-t-2 border-b-2" />
          <p className="text-[#94a3b8]">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border-2 border-[#64748b]/30 bg-[#64748b]/10 p-6">
        <p className="font-semibold text-[#64748b]">{t("error")}</p>
        <p className="mt-2 text-[#64748b] text-sm">{error}</p>
        <button
          className="mt-4 rounded-xl bg-[#64748b] px-4 py-2 font-medium text-[#f8fafc] text-sm transition hover:bg-[#64748b]"
          onClick={() => loadData()}
          type="button"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-6">
        <p className="text-center text-[#94a3b8]">{t("noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HugeiconsIcon className="h-6 w-6 text-[#64748b]" icon={ChartIcon} />
          <h2 className="font-bold text-2xl text-[#0f172a]">{t("title")}</h2>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl border-2 border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 font-medium text-[#0f172a] text-sm transition hover:bg-[#f8fafc] disabled:opacity-50"
          disabled={refreshing}
          onClick={handleRefresh}
          type="button"
        >
          <HugeiconsIcon
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            icon={RefreshIcon}
          />
          {refreshing ? t("refreshing") : t("refresh")}
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Metrics */}
        <div className="lg:col-span-2">
          <PerformanceMetricsCard metrics={metrics} />
        </div>

        {/* Revenue Trend */}
        <div className="lg:col-span-2">
          <RevenueTrendChart periodDays={30} trend={revenueTrend} />
        </div>

        {/* Rating Distribution */}
        <div>
          <RatingDistribution metrics={metrics} />
        </div>

        {/* Recent Activity Summary */}
        <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-[#0f172a] text-lg">{t("recentActivity")}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[#f8fafc] p-4">
              <span className="text-[#94a3b8] text-sm">{t("bookingsLast7Days")}</span>
              <span className="font-bold text-[#0f172a] text-xl">{metrics.bookingsLast7Days}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#f8fafc] p-4">
              <span className="text-[#94a3b8] text-sm">{t("bookingsLast30Days")}</span>
              <span className="font-bold text-[#0f172a] text-xl">{metrics.bookingsLast30Days}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#f8fafc] p-4">
              <span className="text-[#94a3b8] text-sm">{t("revenueLast7Days")}</span>
              <span className="font-bold text-[#64748b] text-xl">
                ${(metrics.revenueLast7DaysCop / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#f8fafc] p-4">
              <span className="text-[#94a3b8] text-sm">{t("revenueLast30Days")}</span>
              <span className="font-bold text-[#64748b] text-xl">
                ${(metrics.revenueLast30DaysCop / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="rounded-xl bg-[#f8fafc] p-4 text-[#64748b] text-sm">
        <p className="font-semibold">{t("noteTitle")}</p>
        <p className="mt-1 text-[#64748b]">{t("noteDescription")}</p>
      </div>
    </div>
  );
}
