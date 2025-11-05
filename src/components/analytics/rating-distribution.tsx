"use client";

import { StarIcon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import type { PerformanceMetrics } from "@/types";

type RatingDistributionProps = {
  metrics: PerformanceMetrics;
};

/**
 * Rating Distribution Component
 *
 * Displays a bar chart showing the distribution of ratings (1-5 stars).
 * Shows percentage breakdown and total count for each rating level.
 */
export function RatingDistribution({ metrics }: RatingDistributionProps) {
  const t = useTranslations("components.ratingDistribution");

  const ratingData = [
    { stars: 5, count: metrics.fiveStarCount, color: "bg-green-500" },
    { stars: 4, count: metrics.fourStarCount, color: "bg-green-400" },
    { stars: 3, count: metrics.threeStarCount, color: "bg-yellow-500" },
    { stars: 2, count: metrics.twoStarCount, color: "bg-orange-500" },
    { stars: 1, count: metrics.oneStarCount, color: "bg-red-500" },
  ];

  const totalRatings = ratingData.reduce((sum, item) => sum + item.count, 0);
  const satisfactionRate =
    totalRatings > 0 ? ((metrics.fiveStarCount + metrics.fourStarCount) / totalRatings) * 100 : 0;

  return (
    <div className="rounded-[24px] border-2 border-[#e5e7eb] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--foreground)] text-lg">{t("title")}</h3>
          <p className="text-[#6b7280] text-sm">
            {totalRatings} {t("totalRatings")}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <StarIcon className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <span className="font-bold text-2xl text-[var(--foreground)]">
              {metrics.averageRating.toFixed(2)}
            </span>
          </div>
          <p className="text-[#6b7280] text-xs">{t("averageRating")}</p>
        </div>
      </div>

      {/* Rating Bars */}
      <div className="space-y-3">
        {ratingData.map((item) => {
          const percentage = totalRatings > 0 ? (item.count / totalRatings) * 100 : 0;

          return (
            <div className="flex items-center gap-3" key={item.stars}>
              {/* Star Label */}
              <div className="flex w-12 items-center gap-1">
                <span className="font-medium text-[var(--foreground)] text-sm">{item.stars}</span>
                <StarIcon className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              </div>

              {/* Progress Bar */}
              <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div
                  className={`h-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Count & Percentage */}
              <div className="flex w-24 items-center justify-end gap-2 text-sm">
                <span className="font-semibold text-[var(--foreground)]">{item.count}</span>
                <span className="text-[#9ca3af]">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Satisfaction Rate */}
      <div className="mt-6 rounded-xl border-[#e5e7eb] border-t bg-gradient-to-r from-green-50 to-green-100 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[var(--foreground)] text-sm">{t("satisfactionRate")}</p>
            <p className="text-[#6b7280] text-xs">{t("satisfactionRateDescription")}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl text-green-600">{satisfactionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
