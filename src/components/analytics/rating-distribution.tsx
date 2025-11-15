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
    { stars: 5, count: metrics.fiveStarCount, color: "bg-[neutral-500]/100" },
    { stars: 4, count: metrics.fourStarCount, color: "bg-[neutral-500]" },
    { stars: 3, count: metrics.threeStarCount, color: "bg-[neutral-500]/50" },
    { stars: 2, count: metrics.twoStarCount, color: "bg-[neutral-500]/100" },
    { stars: 1, count: metrics.oneStarCount, color: "bg-[neutral-500]/100" },
  ];

  const totalRatings = ratingData.reduce((sum, item) => sum + item.count, 0);
  const satisfactionRate =
    totalRatings > 0 ? ((metrics.fiveStarCount + metrics.fourStarCount) / totalRatings) * 100 : 0;

  return (
    <div className="border-2 border-[neutral-200] bg-[neutral-50] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[neutral-900] text-lg">{t("title")}</h3>
          <p className="text-[neutral-400] text-sm">
            {totalRatings} {t("totalRatings")}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <HugeiconsIcon
              className="h-5 w-5 fill-[neutral-500] text-[neutral-500]"
              icon={StarIcon}
            />
            <span className="font-bold text-2xl text-[neutral-900]">
              {metrics.averageRating.toFixed(2)}
            </span>
          </div>
          <p className="text-[neutral-400] text-xs">{t("averageRating")}</p>
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
                <span className="font-medium text-[neutral-900] text-sm">{item.stars}</span>
                <HugeiconsIcon
                  className="h-4 w-4 fill-[neutral-500] text-[neutral-500]"
                  icon={StarIcon}
                />
              </div>

              {/* Progress Bar */}
              <div className="relative h-6 flex-1 overflow-hidden bg-[neutral-50]">
                <div
                  className={`h-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Count & Percentage */}
              <div className="flex w-24 items-center justify-end gap-2 text-sm">
                <span className="font-semibold text-[neutral-900]">{item.count}</span>
                <span className="text-[neutral-400]">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Satisfaction Rate */}
      <div className="mt-6 border-[neutral-200] border-t bg-gradient-to-r from-[neutral-500]/10 to-[neutral-500]/10 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[neutral-900] text-sm">{t("satisfactionRate")}</p>
            <p className="text-[neutral-400] text-xs">{t("satisfactionRateDescription")}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl text-[neutral-500]">{satisfactionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
