"use client";

import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { RevenueTrendDataPoint } from "@/types";

type RevenueTrendChartProps = {
  trend: RevenueTrendDataPoint[];
  periodDays?: number;
};

/**
 * Revenue Trend Chart Component
 *
 * Displays a simple line chart showing revenue trends over time.
 * Includes growth percentage and visual indicators.
 */
export function RevenueTrendChart({ trend, periodDays = 30 }: RevenueTrendChartProps) {
  const t = useTranslations("components.revenueTrendChart");

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}k`;
  };

  const calculateGrowth = () => {
    if (trend.length < 2) {
      return 0;
    }

    // Compare first half vs second half
    const midpoint = Math.floor(trend.length / 2);
    const firstHalfTotal = trend
      .slice(0, midpoint)
      .reduce((sum, point) => sum + point.revenueCop, 0);
    const secondHalfTotal = trend.slice(midpoint).reduce((sum, point) => sum + point.revenueCop, 0);

    if (firstHalfTotal === 0) {
      return secondHalfTotal > 0 ? 100 : 0;
    }

    return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
  };

  const totalRevenue = trend.reduce((sum, point) => sum + point.revenueCop, 0);
  const totalBookings = trend.reduce((sum, point) => sum + point.bookingsCount, 0);
  const growth = calculateGrowth();
  const isPositiveGrowth = growth >= 0;

  // Calculate chart dimensions
  const maxRevenue = Math.max(...trend.map((p) => p.revenueCop), 1);
  const chartHeight = 200;

  return (
    <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#0f172a] text-lg">{t("title")}</h3>
          <p className="text-[#94a3b8] text-sm">{t("period", { days: periodDays })}</p>
        </div>
        <div className="flex items-center gap-2">
          {isPositiveGrowth ? (
            <HugeiconsIcon className="h-5 w-5 text-[#64748b]" icon={ArrowUp01Icon} />
          ) : (
            <HugeiconsIcon className="h-5 w-5 text-[#64748b]" icon={ArrowDown01Icon} />
          )}
          <span
            className={`font-semibold text-sm ${
              isPositiveGrowth ? "text-[#64748b]" : "text-[#64748b]"
            }`}
          >
            {isPositiveGrowth ? "+" : ""}
            {growth.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="mb-1 text-[#94a3b8] text-xs">{t("totalRevenue")}</p>
          <p className="font-bold text-2xl text-[#64748b]">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="mb-1 text-[#94a3b8] text-xs">{t("totalBookings")}</p>
          <p className="font-bold text-2xl text-[#0f172a]">{totalBookings}</p>
        </div>
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="mb-1 text-[#94a3b8] text-xs">{t("averagePerBooking")}</p>
          <p className="font-bold text-2xl text-[#0f172a]">
            {totalBookings > 0 ? formatCurrency(totalRevenue / totalBookings) : "$0"}
          </p>
        </div>
      </div>

      {/* Simple Bar Chart */}
      {trend.length > 0 ? (
        <div className="relative">
          <div className="flex items-end justify-between gap-1" style={{ height: chartHeight }}>
            {trend.map((point, index) => {
              const barHeight = (point.revenueCop / maxRevenue) * chartHeight;
              const date = new Date(point.date);

              return (
                <div className="group relative flex flex-1 flex-col items-center" key={index}>
                  {/* Bar */}
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#64748b] to-[#64748b] transition-all hover:opacity-80"
                    style={{ height: `${barHeight}px` }}
                  />

                  {/* Tooltip on hover */}
                  <div className="-top-16 -translate-x-1/2 pointer-events-none absolute left-1/2 z-10 hidden rounded-lg bg-[#0f172a] px-3 py-2 text-[#f8fafc] text-xs shadow-lg group-hover:block">
                    <p className="font-semibold">{formatCurrency(point.revenueCop)}</p>
                    <p className="text-[#e2e8f0]">
                      {point.bookingsCount} {t("bookings")}
                    </p>
                    <p className="text-[#e2e8f0]">{date.toLocaleDateString()}</p>
                    <div className="-bottom-1 -translate-x-1/2 absolute left-1/2 h-2 w-2 rotate-45 bg-[#0f172a]" />
                  </div>

                  {/* Date label (show every 5th day for 30-day view) */}
                  {(index % 5 === 0 || index === trend.length - 1) && (
                    <p className="mt-2 text-[#94a3b8] text-[10px]">
                      {date.getDate()}/{date.getMonth() + 1}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Zero line */}
          <div className="absolute right-0 bottom-0 left-0 h-px bg-[#e2e8f0]" />
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-[#94a3b8] text-sm">{t("noData")}</p>
        </div>
      )}
    </div>
  );
}
