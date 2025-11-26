"use client";

/**
 * KPICard - Reusable Key Performance Indicator Card
 *
 * Airbnb host dashboard-style metric display component.
 * Used across Finances, Add-ons, and Portfolio pages.
 *
 * Features:
 * - Numeric value with optional formatting
 * - Trend indicator (up/down/neutral)
 * - Optional comparison period text
 * - Icon support
 * - Multiple size variants
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - green-500 for positive trends
 * - neutral color palette
 */

import { ArrowDown01Icon, ArrowUp01Icon, MinusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";
import type { HugeIcon } from "@/types/icons";

// ============================================================================
// Types
// ============================================================================

export type KPITrend = "up" | "down" | "neutral";

export type KPICardSize = "sm" | "md" | "lg";

export type KPICardProps = {
  /** The main label/title */
  label: string;
  /** The primary value to display */
  value: string | number;
  /** Optional trend direction */
  trend?: KPITrend;
  /** Optional trend value (e.g., "+12%") */
  trendValue?: string;
  /** Optional comparison text (e.g., "vs last month") */
  comparisonText?: string;
  /** Optional icon to display */
  icon?: HugeIcon;
  /** Size variant */
  size?: KPICardSize;
  /** Whether the value represents currency */
  isCurrency?: boolean;
  /** Optional subtitle or secondary info */
  subtitle?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Size Configuration
// ============================================================================

const SIZE_CONFIG: Record<
  KPICardSize,
  {
    padding: string;
    iconSize: string;
    iconWrapper: string;
    labelSize: string;
    valueSize: string;
    trendSize: string;
  }
> = {
  sm: {
    padding: "p-3",
    iconSize: "h-4 w-4",
    iconWrapper: "h-8 w-8",
    labelSize: "text-xs",
    valueSize: "text-lg",
    trendSize: "text-xs",
  },
  md: {
    padding: "p-4",
    iconSize: "h-5 w-5",
    iconWrapper: "h-10 w-10",
    labelSize: "text-sm",
    valueSize: "text-2xl",
    trendSize: "text-sm",
  },
  lg: {
    padding: "p-6",
    iconSize: "h-6 w-6",
    iconWrapper: "h-12 w-12",
    labelSize: "text-sm",
    valueSize: "text-3xl",
    trendSize: "text-sm",
  },
};

// ============================================================================
// Trend Configuration
// ============================================================================

const TREND_CONFIG: Record<
  KPITrend,
  {
    icon: HugeIcon;
    textColor: string;
    bgColor: string;
  }
> = {
  up: {
    icon: ArrowUp01Icon,
    textColor: "text-green-600",
    bgColor: "bg-green-50",
  },
  down: {
    icon: ArrowDown01Icon,
    textColor: "text-red-600",
    bgColor: "bg-red-50",
  },
  neutral: {
    icon: MinusSignIcon,
    textColor: "text-neutral-500",
    bgColor: "bg-neutral-50",
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function KPICard({
  label,
  value,
  trend,
  trendValue,
  comparisonText,
  icon,
  size = "md",
  subtitle,
  onClick,
  className,
}: KPICardProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const trendConfig = trend ? TREND_CONFIG[trend] : null;

  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white",
        sizeConfig.padding,
        isClickable && [
          "cursor-pointer transition-all",
          "hover:border-rausch-200 hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        ],
        className
      )}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Header Row - Icon and Label */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p
            className={cn(
              "font-medium text-neutral-500",
              sizeConfig.labelSize,
              geistSans.className
            )}
          >
            {label}
          </p>
          {subtitle && <p className="mt-0.5 text-neutral-400 text-xs">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              "flex items-center justify-center rounded-lg bg-rausch-50",
              sizeConfig.iconWrapper
            )}
          >
            <HugeiconsIcon className={cn("text-rausch-500", sizeConfig.iconSize)} icon={icon} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-2">
        <p
          className={cn(
            "font-semibold text-neutral-900 tabular-nums tracking-tight",
            sizeConfig.valueSize,
            geistSans.className
          )}
        >
          {value}
        </p>
      </div>

      {/* Trend Indicator */}
      {(trendConfig || comparisonText) && (
        <div className="mt-2 flex items-center gap-2">
          {trendConfig && trendValue && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5",
                trendConfig.bgColor,
                trendConfig.textColor,
                sizeConfig.trendSize,
                "font-medium",
                geistSans.className
              )}
            >
              <HugeiconsIcon className="h-3 w-3" icon={trendConfig.icon} />
              {trendValue}
            </span>
          )}
          {comparisonText && (
            <span className={cn("text-neutral-400", sizeConfig.trendSize, geistSans.className)}>
              {comparisonText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// KPI Card Grid - Layout Helper
// ============================================================================

export type KPICardGridProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

export function KPICardGrid({ children, columns = 3, className }: KPICardGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={cn("grid gap-4", gridCols[columns], className)}>{children}</div>;
}

// ============================================================================
// Skeleton Loading State
// ============================================================================

export type KPICardSkeletonProps = {
  size?: KPICardSize;
  className?: string;
};

export function KPICardSkeleton({ size = "md", className }: KPICardSkeletonProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-neutral-200 bg-white",
        sizeConfig.padding,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-20 rounded bg-neutral-200" />
        <div className={cn("rounded-lg bg-neutral-100", sizeConfig.iconWrapper)} />
      </div>
      <div className="mt-3">
        <div className="h-8 w-24 rounded bg-neutral-200" />
      </div>
      <div className="mt-2">
        <div className="h-4 w-16 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

// ============================================================================
// Compact Stat Display (Inline)
// ============================================================================

export type CompactStatProps = {
  label: string;
  value: string | number;
  trend?: KPITrend;
  trendValue?: string;
  className?: string;
};

export function CompactStat({ label, value, trend, trendValue, className }: CompactStatProps) {
  const trendConfig = trend ? TREND_CONFIG[trend] : null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div>
        <p className={cn("text-neutral-500 text-xs", geistSans.className)}>{label}</p>
        <p
          className={cn("font-semibold text-lg text-neutral-900 tabular-nums", geistSans.className)}
        >
          {value}
        </p>
      </div>
      {trendConfig && trendValue && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs",
            trendConfig.bgColor,
            trendConfig.textColor,
            "font-medium",
            geistSans.className
          )}
        >
          <HugeiconsIcon className="h-3 w-3" icon={trendConfig.icon} />
          {trendValue}
        </span>
      )}
    </div>
  );
}
