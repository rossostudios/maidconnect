"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
    { stars: 5, count: metrics.fiveStarCount, color: "bg-[#64748b]/100" },
    { stars: 4, count: metrics.fourStarCount, color: "bg-[#64748b]" },
    { stars: 3, count: metrics.threeStarCount, color: "bg-[#64748b]/50" },
    { stars: 2, count: metrics.twoStarCount, color: "bg-[#64748b]/100" },
    { stars: 1, count: metrics.oneStarCount, color: "bg-[#64748b]/100" },
  ];

  const totalRatings = ratingData.reduce((sum, item) => sum + item.count, 0);
  const satisfactionRate =
    totalRatings > 0 ? ((metrics.fiveStarCount + metrics.fourStarCount) / totalRatings) * 100 : 0;

  return (
    <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#0f172a] text-lg">{t("title")}</h3>
          <p className="text-[#94a3b8] text-sm">
            {totalRatings} {t("totalRatings")}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <HugeiconsIcon className="h-5 w-5 fill-[#64748b] text-[#64748b]" icon={StarIcon} />
            <span className="font-bold text-2xl text-[#0f172a]">
              {metrics.averageRating.toFixed(2)}
            </span>
          </div>
          <p className="text-[#94a3b8] text-xs">{t("averageRating")}</p>
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
                <span className="font-medium text-[#0f172a] text-sm">{item.stars}</span>
                <HugeiconsIcon className="h-4 w-4 fill-[#64748b] text-[#64748b]" icon={StarIcon} />
              </div>

              {/* Progress Bar */}
              <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-[#f8fafc]">
                <div
                  className={`h-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Count & Percentage */}
              <div className="flex w-24 items-center justify-end gap-2 text-sm">
                <span className="font-semibold text-[#0f172a]">{item.count}</span>
                <span className="text-[#94a3b8]">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Satisfaction Rate */}
      <div className="mt-6 rounded-xl border-[#e2e8f0] border-t bg-gradient-to-r from-[#64748b]/10 to-[#64748b]/10 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#0f172a] text-sm">{t("satisfactionRate")}</p>
            <p className="text-[#94a3b8] text-xs">{t("satisfactionRateDescription")}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl text-[#64748b]">{satisfactionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
