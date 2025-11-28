/**
 * ServiceBreakdownChart - CSS Conic-Gradient Donut Chart
 *
 * Displays service type distribution as a donut chart:
 * - Cleaning (rausch-500)
 * - Nanny (babu-500)
 * - Cooking (green-500)
 * - Errands (neutral-500)
 *
 * Uses CSS conic-gradient for lightweight visualization.
 * Following Lia Design System with Casaora Dark Mode palette.
 */

"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

// ========================================
// Types
// ========================================

export type ServiceBreakdown = {
  label: string;
  value: number;
  color: string;
};

type ServiceBreakdownChartProps = {
  data: ServiceBreakdown[];
  className?: string;
};

// ========================================
// Mock Data (Development)
// ========================================

export const MOCK_SERVICE_BREAKDOWN: ServiceBreakdown[] = [
  { label: "Cleaning", value: 1445, color: "#7A3B4A" },
  { label: "Nanny", value: 903, color: "#00A699" },
  { label: "Cooking", value: 792, color: "#788C5D" },
  { label: "Errands", value: 451, color: "#B0AEA5" },
];

// ========================================
// Components
// ========================================

export function ServiceBreakdownChart({ data, className }: ServiceBreakdownChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  // Generate conic-gradient stops
  const conicGradient = useMemo(() => {
    let currentAngle = 0;
    const stops: string[] = [];

    for (const item of data) {
      const percentage = (item.value / total) * 100;
      const nextAngle = currentAngle + percentage;
      stops.push(`${item.color} ${currentAngle}% ${nextAngle}%`);
      currentAngle = nextAngle;
    }

    return `conic-gradient(from 0deg, ${stops.join(", ")})`;
  }, [data, total]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-5",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Header */}
      <h3
        className={cn(
          "mb-4 font-semibold text-sm",
          "text-neutral-900 dark:text-foreground",
          geistSans.className
        )}
      >
        Service Breakdown
      </h3>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative">
          <div
            className="h-32 w-32 rounded-full"
            style={{
              background: conicGradient,
            }}
          >
            {/* Inner white circle for donut effect */}
            <div
              className={cn(
                "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex h-20 w-20 items-center justify-center rounded-full",
                "bg-white dark:bg-background"
              )}
            >
              <div className="text-center">
                <p
                  className={cn(
                    "font-bold text-xl",
                    "text-neutral-900 dark:text-foreground",
                    geistSans.className
                  )}
                >
                  {total.toLocaleString()}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    "text-neutral-600 dark:text-muted-foreground",
                    geistSans.className
                  )}
                >
                  total bookings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {data.map((item) => (
            <div className="flex items-center gap-2" key={item.label}>
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span
                className={cn(
                  "text-sm",
                  "text-neutral-700 dark:text-muted-foreground",
                  geistSans.className
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "ml-auto font-medium text-sm",
                  "text-neutral-900 dark:text-foreground",
                  geistSans.className
                )}
              >
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* More Details Link */}
      <button
        className={cn(
          "mt-4 font-medium text-sm",
          "text-rausch-500 hover:text-rausch-400",
          "transition-colors",
          geistSans.className
        )}
        type="button"
      >
        More details
      </button>
    </motion.div>
  );
}

// ========================================
// Skeleton
// ========================================

export function ServiceBreakdownChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border p-5",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
    >
      <div className="mb-4 h-4 w-36 rounded bg-neutral-200 dark:bg-muted" />
      <div className="flex items-center gap-6">
        <div className="h-32 w-32 rounded-full bg-neutral-200 dark:bg-muted" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div className="flex items-center gap-2" key={i}>
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-200 dark:bg-muted" />
              <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-muted" />
              <div className="h-4 w-10 rounded bg-neutral-200 dark:bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
