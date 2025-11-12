"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode } from "react";
import {
  CARD_LAYOUT,
  ICON_CONTAINER,
  STATUS_VARIANTS,
  type StatusVariant,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type StatusCardProps = {
  /** Card title */
  title: string;
  /** Main metric value */
  value: string | number;
  /** Optional description or subtitle */
  description?: string;
  /** Hugeicons icon component */
  icon: HugeIcon;
  /** Status variant for semantic coloring */
  variant?: StatusVariant;
  /** Optional trend indicator */
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  /** Additional content below the main value */
  children?: ReactNode;
  /** Optional click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
};

/**
 * StatusCard Component
 *
 * A standardized card component following 8px grid design system.
 * Features consistent icon styling with proper spacing and semantic colors.
 *
 * Design principles:
 * - 8px grid alignment throughout
 * - Icon has 24px (3 × 8px) top margin from card edge
 * - Internal spacing ≤ external spacing
 * - Lightest slate background for icons in neutral variant
 * - Rounded square (lg = 8px) icon containers
 *
 * @example
 * ```tsx
 * <StatusCard
 *   title="PENDING BOOKINGS"
 *   value={12}
 *   icon={TimeScheduleIcon}
 *   variant="pending"
 *   description="Awaiting confirmation"
 * />
 * ```
 */
export function StatusCard({
  title,
  value,
  description,
  icon,
  variant = "neutral",
  trend,
  children,
  onClick,
  className,
}: StatusCardProps) {
  const statusStyle = STATUS_VARIANTS[variant];
  const isClickable = Boolean(onClick);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950",
        "transition-all duration-200",
        isClickable &&
          "cursor-pointer hover:border-stone-300 hover:shadow-md dark:hover:border-stone-700",
        CARD_LAYOUT.padding,
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Icon Container - Following 8px grid with top spacing */}
      <div className={cn("inline-flex", CARD_LAYOUT.iconTopMargin)}>
        <div
          className={cn(
            "inline-flex items-center justify-center",
            ICON_CONTAINER.containerSize,
            ICON_CONTAINER.borderRadius,
            ICON_CONTAINER.padding,
            statusStyle.container
          )}
        >
          <HugeiconsIcon className={cn(ICON_CONTAINER.iconSize, statusStyle.icon)} icon={icon} />
        </div>
      </div>

      {/* Content - 16px spacing from icon (2 × 8px) */}
      <div className={cn("mt-4 flex flex-col", CARD_LAYOUT.sectionGap)}>
        {/* Title */}
        <h3 className="font-medium text-stone-600 text-sm uppercase tracking-wide dark:text-stone-400">
          {title}
        </h3>

        {/* Value and Trend */}
        <div className="flex items-baseline gap-3">
          <span className="font-bold text-3xl text-stone-900 dark:text-stone-100">{value}</span>
          {trend && (
            <span
              className={cn(
                "font-medium text-sm",
                trend.direction === "up" && "text-emerald-600 dark:text-emerald-400",
                trend.direction === "down" && "text-red-600 dark:text-red-400",
                trend.direction === "neutral" && "text-stone-600 dark:text-stone-400"
              )}
            >
              {trend.direction === "up" && "↑"}
              {trend.direction === "down" && "↓"}
              {trend.value}
            </span>
          )}
        </div>

        {/* Description */}
        {description && <p className="text-stone-600 text-sm dark:text-stone-400">{description}</p>}

        {/* Additional Content */}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}

/**
 * StatusCardGrid Component
 *
 * A grid container for StatusCards following 8px spacing system.
 * Automatically responsive with proper gap spacing.
 */
type StatusCardGridProps = {
  children: ReactNode;
  className?: string;
};

export function StatusCardGrid({ children, className }: StatusCardGridProps) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}
