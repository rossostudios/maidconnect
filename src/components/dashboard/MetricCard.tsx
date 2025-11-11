/**
 * Metric Card Component - 8px Grid Design System
 *
 * Following 2025/2026 best practices:
 * - 8px grid spacing system
 * - Consistent icon backgrounds (lightest slate)
 * - Proper visual hierarchy
 * - Smooth animations with motion.dev
 * - 8px rounded corners (rounded-lg)
 * - Icon has 24px top margin (3 × 8px grid)
 */

"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { CARD_LAYOUT, ICON_CONTAINER } from "@/lib/designSystem";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

export type MetricTrend = "up" | "down" | "neutral";

export type MetricCardProps = {
  /** Metric title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle or description */
  description?: string;
  /** Trend indicator */
  trend?: MetricTrend;
  /** Trend percentage (e.g., "+12.5%" or "-3.2%") */
  trendValue?: string;
  /** Icon to display */
  icon?: HugeIcon;
  /** Color theme */
  variant?: "blue" | "green" | "stone-700" | "pink" | "purple" | "default";
  /** Optional chart or sparkline */
  chart?: ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
};

/**
 * Color variants - Following 8px Grid Design System
 * Icons now use consistent slate background, color only for accents
 */
const colorVariants = {
  blue: {
    accent: "border-stone-200 dark:border-blue-900",
    trend: "text-stone-600 dark:text-blue-400",
  },
  green: {
    accent: "border-stone-200 dark:border-green-900",
    trend: "text-stone-700 dark:text-green-400",
  },
  stone-700: {
    accent: "border-stone-200 dark:border-stone-900",
    trend: "text-stone-700 dark:text-stone-400",
  },
  pink: {
    accent: "border-pink-200 dark:border-pink-900",
    trend: "text-pink-600 dark:text-pink-400",
  },
  purple: {
    accent: "border-purple-200 dark:border-purple-900",
    trend: "text-stone-600 dark:text-purple-400",
  },
  default: {
    accent: "border-stone-200 dark:border-stone-800",
    trend: "text-stone-600 dark:text-stone-400",
  },
};

/**
 * Motion.dev animation variants
 */
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

const cardHoverVariants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  hover: {
    y: -4,
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
};

const iconVariants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      delay: 0.1,
    },
  },
};

const valueVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      delay: 0.2,
    },
  },
};

export function MetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  variant = "default",
  chart,
  isLoading = false,
  className,
  onClick,
}: MetricCardProps) {
  const colors = colorVariants[variant];

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950",
          "animate-pulse",
          className
        )}
      >
        <div className={cn("flex flex-col", CARD_LAYOUT.sectionGap)}>
          {/* Icon skeleton - Following 8px grid with top spacing */}
          <div className={CARD_LAYOUT.iconTopMargin}>
            <div
              className={cn(
                ICON_CONTAINER.containerSize,
                ICON_CONTAINER.borderRadius,
                "bg-stone-100 dark:bg-stone-900"
              )}
            />
          </div>
          {/* Content skeleton */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 rounded bg-stone-200 dark:bg-stone-800" />
            <div className="h-8 w-32 rounded bg-stone-200 dark:bg-stone-800" />
            {trendValue && <div className="h-6 w-28 rounded-full bg-stone-200 dark:bg-stone-800" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      animate="visible"
      className={cn(className)}
      initial="hidden"
      variants={cardVariants}
      whileHover={onClick ? cardHoverVariants.hover : undefined}
    >
      <div
        className={cn(
          // Base styles - 8px grid system with proper spacing
          "rounded-lg border bg-white shadow-sm dark:bg-stone-950",
          CARD_LAYOUT.padding,
          // Border color from variant
          variant !== "default" ? colors.accent : "border-stone-200 dark:border-stone-800",
          // Interactive styles
          onClick && "cursor-pointer hover:shadow-md",
          // Smooth transitions
          "transition-all duration-200"
        )}
        onClick={onClick}
      >
        <div className={cn("flex flex-col", CARD_LAYOUT.sectionGap)}>
          {/* Icon Container - Following 8px grid with top spacing */}
          {icon && (
            <motion.div
              animate="visible"
              className={CARD_LAYOUT.iconTopMargin}
              initial="hidden"
              variants={iconVariants}
            >
              <div
                className={cn(
                  "inline-flex items-center justify-center",
                  ICON_CONTAINER.containerSize,
                  ICON_CONTAINER.borderRadius,
                  ICON_CONTAINER.background,
                  ICON_CONTAINER.padding
                )}
              >
                <HugeiconsIcon
                  className={cn(ICON_CONTAINER.iconSize, ICON_CONTAINER.iconColor)}
                  icon={icon}
                />
              </div>
            </motion.div>
          )}

          {/* Title */}
          <h3 className="font-medium text-sm text-stone-600 uppercase tracking-wide dark:text-stone-400">
            {title}
          </h3>

          {/* Value and Trend - 16px spacing (2 × 8px) */}
          <div className="flex flex-col gap-2">
            <motion.div
              animate="visible"
              className="flex items-baseline gap-3"
              initial="hidden"
              variants={valueVariants}
            >
              <p className="font-bold text-3xl text-stone-900 dark:text-stone-100">{value}</p>
              {trend && trendValue && (
                <Badge
                  className="font-semibold"
                  size="sm"
                  variant={trend === "up" ? "success" : trend === "down" ? "danger" : "outline"}
                >
                  {trendValue}
                </Badge>
              )}
            </motion.div>

            {/* Description */}
            {description && (
              <p className="text-sm text-stone-600 dark:text-stone-400">{description}</p>
            )}
          </div>

          {/* Optional chart */}
          {chart && (
            <motion.div
              animate={{ opacity: 1 }}
              className="mt-2"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {chart}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
