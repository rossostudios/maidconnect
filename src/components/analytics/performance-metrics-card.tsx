"use client";

import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  MoneyBag02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { PerformanceMetrics } from "@/types";

type PerformanceMetricsCardProps = {
  metrics: PerformanceMetrics;
};

/**
 * Performance Metrics Card Component
 *
 * Displays key performance indicators for a professional:
 * - Completion rate
 * - Average rating
 * - Total revenue
 * - Total bookings
 */
export function PerformanceMetricsCard({ metrics }: PerformanceMetricsCardProps) {
  const t = useTranslations("components.performanceMetricsCard");

  const formatCurrency = (amount: number) => `$${(amount / 1000).toFixed(0)}k COP`;

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) {
      return "text-stone-500";
    }
    if (rate >= 75) {
      return "text-stone-500";
    }
    return "text-stone-500";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) {
      return "text-stone-500";
    }
    if (rating >= 4.0) {
      return "text-stone-500";
    }
    return "text-stone-500";
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm ring-1 ring-black/5">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-stone-900">{t("title")}</h3>
        <p className="text-stone-500 text-sm">
          {t("lastUpdated", {
            date: new Date(metrics.lastCalculatedAt).toLocaleDateString(),
          })}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Completion Rate */}
        <div className="rounded-lg bg-stone-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-stone-500" icon={CheckmarkCircle02Icon} />
            <span className="font-medium text-stone-600 text-sm">{t("completionRate")}</span>
          </div>
          <p className={`font-bold text-3xl ${getCompletionRateColor(metrics.completionRate)}`}>
            {metrics.completionRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-stone-500 text-xs">
            {metrics.completedBookings} {t("of")} {metrics.totalBookings} {t("bookings")}
          </p>
        </div>

        {/* Average Rating */}
        <div className="rounded-lg bg-stone-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-stone-500" icon={StarIcon} />
            <span className="font-medium text-stone-600 text-sm">{t("averageRating")}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`font-bold text-3xl ${getRatingColor(metrics.averageRating)}`}>
              {metrics.averageRating.toFixed(2)}
            </p>
            <span className="text-stone-500 text-sm">/ 5.0</span>
          </div>
          <p className="mt-1 text-stone-500 text-xs">
            {metrics.totalReviews} {t("reviews")}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="rounded-lg bg-stone-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-stone-500" icon={MoneyBag02Icon} />
            <span className="font-medium text-stone-600 text-sm">{t("totalRevenue")}</span>
          </div>
          <p className="font-bold text-3xl text-stone-500">
            {formatCurrency(metrics.totalRevenueCop)}
          </p>
          <p className="mt-1 text-stone-500 text-xs">
            {t("last30Days")}: {formatCurrency(metrics.revenueLast30DaysCop)}
          </p>
        </div>

        {/* Cancellation Rate */}
        <div className="rounded-lg bg-stone-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-stone-500" icon={CancelCircleIcon} />
            <span className="font-medium text-stone-600 text-sm">{t("cancellationRate")}</span>
          </div>
          <p className="font-bold text-3xl text-stone-500">
            {metrics.cancellationRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-stone-500 text-xs">
            {metrics.cancelledBookings} {t("cancelled")}
          </p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-6 grid gap-3 border-stone-200 border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="text-stone-500 text-sm">{t("averageBookingValue")}</span>
          <span className="font-semibold text-stone-900">
            {formatCurrency(metrics.averageBookingValueCop)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-500 text-sm">{t("repeatCustomerRate")}</span>
          <span className="font-semibold text-stone-900">
            {metrics.repeatCustomerRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-500 text-sm">{t("onTimeArrivalRate")}</span>
          <span className="font-semibold text-stone-900">
            {metrics.onTimeArrivalRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-500 text-sm">{t("averageResponseTime")}</span>
          <span className="font-semibold text-stone-900">
            {metrics.averageResponseTimeMinutes} {t("minutes")}
          </span>
        </div>
      </div>
    </div>
  );
}
