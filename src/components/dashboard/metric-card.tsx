/**
 * Metric Card Component
 *
 * Reusable KPI card for dashboards (admin, professional, customer)
 * Displays a metric with title, value, trend, and optional chart
 */

"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  icon?: any;
  /** Icon color class */
  iconColor?: string;
  /** Card variant */
  variant?: "default" | "success" | "warning" | "danger" | "info";
  /** Optional chart or sparkline */
  chart?: ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
};

const variantStyles = {
  default: {
    card: "border-[#E5E5E5]",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  success: {
    card: "border-[#E5E5E5]",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  warning: {
    card: "border-[#E5E5E5]",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  danger: {
    card: "border-[#E5E5E5]",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  info: {
    card: "border-[#E5E5E5]",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
};

export function MetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  iconColor,
  variant = "default",
  chart,
  isLoading = false,
  className,
  onClick,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-[var(--surface-elevated)]" />
            <div className="h-8 w-32 rounded bg-[var(--surface-elevated)]" />
            <div className="h-3 w-24 rounded bg-[var(--surface-elevated)]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-[#E5E5E5] bg-white",
        styles.card,
        onClick && "cursor-pointer hover:shadow-lg",
        className
      )}
      hoverable={!!onClick}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Icon & Title */}
          <div className="flex items-center gap-2">
            {icon && (
              <div className={cn("rounded-lg p-2", styles.iconBg, "flex-shrink-0")}>
                <HugeiconsIcon
                  className={cn("h-4 w-4", iconColor || styles.iconColor)}
                  icon={icon}
                />
              </div>
            )}
            <p className="font-medium text-[#737373] text-sm">{title}</p>
          </div>

          {/* Value */}
          <p className="font-bold text-3xl text-[#171717]">{value}</p>

          {/* Trend & Description */}
          {(trend && trendValue) || description ? (
            <div className="flex items-center gap-2">
              {trend && trendValue && (
                <>
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      trend === "up" && "text-green-600",
                      trend === "down" && "text-red-600",
                      trend === "neutral" && "text-[#737373]"
                    )}
                  >
                    {trendValue}
                  </span>
                  <span className="text-[#A3A3A3] text-sm">vs last month</span>
                </>
              )}
              {!trendValue && description && (
                <p className="text-[#737373] text-sm">{description}</p>
              )}
            </div>
          ) : null}
        </div>

        {/* Optional chart */}
        {chart && <div className="mt-6">{chart}</div>}
      </CardContent>
    </Card>
  );
}
