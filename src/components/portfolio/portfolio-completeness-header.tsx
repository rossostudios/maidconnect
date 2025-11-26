"use client";

/**
 * PortfolioCompletenessHeader - Gamified Progress Indicator
 *
 * Shows portfolio completion status with actionable tips.
 * Airbnb-inspired progress bar with milestone celebrations.
 *
 * Portfolio-Only Scoring (verification items moved to Settings):
 * - Featured image set: 25 points
 * - Featured description: 15 points
 * - 3+ portfolio images: 25 points
 * - 1+ before/after pair: 35 points
 * Total: 100 points
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import {
  Award01Icon,
  Camera02Icon,
  CheckmarkCircle02Icon,
  Image01Icon,
  StarIcon,
} from "hugeicons-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import type { BeforeAfterPair, PortfolioImage } from "@/app/api/professional/portfolio/route";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";

// ============================================================================
// Types
// ============================================================================

type Props = {
  images: PortfolioImage[];
  beforeAfterPairs: BeforeAfterPair[];
  featuredWork?: string;
  featuredImageId?: string;
  className?: string;
};

type CompletionItem = {
  key: string;
  labelKey: string;
  points: number;
  maxPoints: number;
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  actionKey?: string;
};

// ============================================================================
// Scoring Configuration
// ============================================================================

const SCORING = {
  featuredImage: { points: 25, maxPoints: 25 },
  featuredDescription: { points: 15, maxPoints: 15 },
  portfolioImages: { points: 25, maxPoints: 25, required: 3 },
  beforeAfterPairs: { points: 35, maxPoints: 35, required: 1 },
} as const;

const TOTAL_POINTS = Object.values(SCORING).reduce((sum, item) => sum + item.maxPoints, 0);

// ============================================================================
// Helper Functions
// ============================================================================

function calculateCompletionItems(props: Props): CompletionItem[] {
  const { images, beforeAfterPairs, featuredWork, featuredImageId } = props;

  return [
    {
      key: "featuredImage",
      labelKey: "completion.featuredImage",
      points: featuredImageId ? SCORING.featuredImage.points : 0,
      maxPoints: SCORING.featuredImage.maxPoints,
      completed: !!featuredImageId,
      icon: StarIcon,
      actionKey: "completion.featuredImageAction",
    },
    {
      key: "featuredDescription",
      labelKey: "completion.featuredDescription",
      points: featuredWork && featuredWork.length > 20 ? SCORING.featuredDescription.points : 0,
      maxPoints: SCORING.featuredDescription.maxPoints,
      completed: !!(featuredWork && featuredWork.length > 20),
      icon: Image01Icon,
      actionKey: "completion.featuredDescriptionAction",
    },
    {
      key: "portfolioImages",
      labelKey: "completion.portfolioImages",
      points:
        images.length >= SCORING.portfolioImages.required ? SCORING.portfolioImages.points : 0,
      maxPoints: SCORING.portfolioImages.maxPoints,
      completed: images.length >= SCORING.portfolioImages.required,
      icon: Camera02Icon,
      actionKey: "completion.portfolioImagesAction",
    },
    {
      key: "beforeAfterPairs",
      labelKey: "completion.beforeAfterPairs",
      points:
        beforeAfterPairs.length >= SCORING.beforeAfterPairs.required
          ? SCORING.beforeAfterPairs.points
          : 0,
      maxPoints: SCORING.beforeAfterPairs.maxPoints,
      completed: beforeAfterPairs.length >= SCORING.beforeAfterPairs.required,
      icon: Image01Icon,
      actionKey: "completion.beforeAfterPairsAction",
    },
  ];
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) {
    return "bg-green-500";
  }
  if (percentage >= 60) {
    return "bg-babu-500";
  }
  if (percentage >= 40) {
    return "bg-yellow-500";
  }
  return "bg-rausch-500";
}

function getProgressMessage(percentage: number, t: (key: string) => string): string {
  if (percentage >= 100) {
    return t("message.complete");
  }
  if (percentage >= 80) {
    return t("message.almostThere");
  }
  if (percentage >= 60) {
    return t("message.gettingThere");
  }
  if (percentage >= 40) {
    return t("message.goodStart");
  }
  return t("message.justStarted");
}

// ============================================================================
// Main Component
// ============================================================================

export function PortfolioCompletenessHeader(props: Props) {
  const t = useTranslations("dashboard.pro.portfolio.completeness");
  const { className } = props;

  const completionItems = useMemo(() => calculateCompletionItems(props), [props]);

  const totalScore = useMemo(
    () => completionItems.reduce((sum, item) => sum + item.points, 0),
    [completionItems]
  );

  const percentage = Math.round((totalScore / TOTAL_POINTS) * 100);
  const incompleteItems = completionItems.filter((item) => !item.completed);
  const nextAction = incompleteItems[0];

  return (
    <div className={cn("rounded-lg border border-border bg-card p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              percentage >= 100
                ? "bg-green-50 dark:bg-green-500/10"
                : "bg-rausch-50 dark:bg-rausch-500/10"
            )}
          >
            {percentage >= 100 ? (
              <Award01Icon className="h-6 w-6 text-green-500" />
            ) : (
              <StarIcon className="h-6 w-6 text-rausch-500" />
            )}
          </div>
          <div>
            <h2 className={cn("font-bold text-foreground text-xl", geistSans.className)}>
              {t("title")}
            </h2>
            <p className={cn("text-muted-foreground text-sm", geistSans.className)}>
              {getProgressMessage(percentage, t)}
            </p>
          </div>
        </div>

        {/* Score Badge */}
        <div className="text-right">
          <span
            className={cn(
              "font-bold text-3xl",
              percentage >= 100 ? "text-green-500" : "text-foreground",
              geistSans.className
            )}
          >
            {percentage}%
          </span>
          <p className={cn("text-muted-foreground text-sm", geistSans.className)}>
            {t("complete")}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              getProgressColor(percentage)
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Next Action Suggestion */}
      {nextAction && (
        <div className="mt-4 rounded-lg bg-rausch-50 p-4 dark:bg-rausch-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rausch-100 dark:bg-rausch-500/20">
              <nextAction.icon className="h-4 w-4 text-rausch-600" />
            </div>
            <div>
              <p
                className={cn(
                  "font-semibold text-rausch-700 text-sm dark:text-rausch-400",
                  geistSans.className
                )}
              >
                {t("nextStep")}
              </p>
              <p
                className={cn("text-rausch-600 text-sm dark:text-rausch-300", geistSans.className)}
              >
                {nextAction.actionKey ? t(nextAction.actionKey) : t(nextAction.labelKey)}
              </p>
              <p
                className={cn(
                  "mt-1 text-rausch-500 text-xs dark:text-rausch-400",
                  geistSans.className
                )}
              >
                +{nextAction.maxPoints} {t("points")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Checklist (Expandable) */}
      <details className="mt-4">
        <summary
          className={cn(
            "cursor-pointer font-semibold text-muted-foreground text-sm hover:text-foreground",
            geistSans.className
          )}
        >
          {t("viewChecklist")}
        </summary>
        <div className="mt-3 space-y-2">
          {completionItems.map((item) => (
            <div
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2",
                item.completed ? "bg-green-50 dark:bg-green-500/10" : "bg-muted"
              )}
              key={item.key}
            >
              <div className="flex items-center gap-2">
                {item.completed ? (
                  <CheckmarkCircle02Icon className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    item.completed ? "text-green-700 dark:text-green-400" : "text-muted-foreground",
                    geistSans.className
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  item.completed
                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                    : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400",
                  geistSans.className
                )}
              >
                {item.points}/{item.maxPoints}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
