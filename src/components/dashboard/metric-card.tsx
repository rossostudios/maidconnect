/**
 * Metric Card Component - Anthropic Lia Design System
 *
 * Following Anthropic design principles:
 * - 4px grid spacing system
 * - Thoughtful rounded corners (rounded-lg)
 * - Geist Sans typography
 * - Warm neutral palette with orange accents
 * - Smooth animations with motion.dev
 */

"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { type ReactNode } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

export type MetricTrend = "up" | "down" | "neutral";

// Lookup object to replace nested ternary (Biome noNestedTernary fix)
const TREND_BADGE_VARIANTS: Record<MetricTrend, "success" | "danger" | "outline"> = {
  up: "success",
  down: "danger",
  neutral: "outline",
};

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
  variant?: "blue" | "green" | "orange" | "pink" | "purple" | "default";
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
 * Color variants - Anthropic Lia Design System
 * Using warm neutrals with orange, blue, and green accents
 */
const colorVariants = {
  blue: {
    accent: "border-babu-500",
    iconBg: "bg-babu-50",
    iconColor: "text-babu-500",
    trend: "text-babu-500",
  },
  green: {
    accent: "border-green-500",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    trend: "text-green-500",
  },
  orange: {
    accent: "border-rausch-500",
    iconBg: "bg-rausch-50",
    iconColor: "text-rausch-500",
    trend: "text-rausch-500",
  },
  pink: {
    accent: "border-pink-500",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    trend: "text-pink-500",
  },
  purple: {
    accent: "border-purple-500",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    trend: "text-purple-500",
  },
  default: {
    accent: "border-neutral-200",
    iconBg: "bg-neutral-50",
    iconColor: "text-neutral-500",
    trend: "text-neutral-500",
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
          "animate-pulse rounded-lg border border-neutral-200 bg-white p-6 shadow-sm",
          className
        )}
      >
        <div className="flex flex-col gap-4">
          {/* Icon skeleton */}
          <div className="h-10 w-10 rounded-lg bg-neutral-100" />
          {/* Content skeleton */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 rounded bg-neutral-200" />
            <div className="h-8 w-32 rounded bg-neutral-200" />
            {trendValue && <div className="h-6 w-28 rounded bg-neutral-200" />}
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
          // Base styles - Anthropic Lia rounded corners
          "rounded-lg border bg-white p-6 shadow-sm",
          // Border color from variant
          variant !== "default" ? colors.accent : "border-neutral-200",
          // Interactive styles
          onClick && "cursor-pointer hover:shadow-md",
          // Smooth transitions
          "transition-all duration-200"
        )}
        onClick={onClick}
      >
        <div className="flex flex-col gap-4">
          {/* Icon Container - Anthropic Lia Design */}
          {icon && (
            <motion.div animate="visible" initial="hidden" variants={iconVariants}>
              <div
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-lg",
                  colors.iconBg
                )}
              >
                <HugeiconsIcon className={cn("h-5 w-5", colors.iconColor)} icon={icon} />
              </div>
            </motion.div>
          )}

          {/* Title */}
          <h3
            className={cn(
              "font-semibold text-neutral-900 text-sm leading-none",
              geistSans.className
            )}
          >
            {title}
          </h3>

          {/* Value and Trend */}
          <div className="flex flex-col gap-2">
            <motion.div
              animate="visible"
              className="flex items-baseline gap-3"
              initial="hidden"
              variants={valueVariants}
            >
              <p
                className={cn(
                  "font-semibold text-4xl text-neutral-900 leading-none tracking-tight",
                  geistSans.className
                )}
              >
                {value}
              </p>
              {trend && trendValue && (
                <Badge className="font-semibold" size="sm" variant={TREND_BADGE_VARIANTS[trend]}>
                  {trendValue}
                </Badge>
              )}
            </motion.div>

            {/* Description */}
            {description && (
              <p className={cn("text-neutral-500 text-sm leading-none", geistSans.className)}>
                {description}
              </p>
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
