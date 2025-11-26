/**
 * Performance Metrics Component
 * Week 7-8: Safety Package - Display on-time and acceptance rates
 *
 * Shows professional reliability metrics to build trust
 */

import { AnalyticsUpIcon, CheckmarkCircle01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PerformanceMetrics = {
  onTimeRate?: number; // Percentage (0-100)
  acceptanceRate?: number; // Percentage (0-100)
  totalCompletedBookings?: number;
};

const performanceMetricsVariants = cva("space-y-4", {
  variants: {
    variant: {
      compact: "",
      detailed: "",
    },
  },
  defaultVariants: {
    variant: "compact",
  },
});

type Props = VariantProps<typeof performanceMetricsVariants> & {
  metrics: PerformanceMetrics;
  showLabels?: boolean;
  className?: string;
};

export function PerformanceMetrics({
  metrics,
  variant = "compact",
  showLabels = true,
  className,
}: Props) {
  const { onTimeRate, acceptanceRate, totalCompletedBookings } = metrics;

  // Helper to determine badge variant based on rate
  const getRateBadgeClass = (rate: number | undefined) => {
    if (rate === undefined || rate < 75) {
      return "bg-neutral-100 text-neutral-700";
    }
    if (rate < 90) {
      return "bg-neutral-100 text-neutral-900";
    }
    return "bg-rausch-500/10 text-rausch-600";
  };

  const onTimeBadgeClass = getRateBadgeClass(onTimeRate);
  const acceptanceBadgeClass = getRateBadgeClass(acceptanceRate);

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {/* On-Time Rate */}
        {onTimeRate !== undefined && onTimeRate >= 75 && (
          <Badge className={cn("flex items-center gap-1.5", onTimeBadgeClass)} variant="secondary">
            <HugeiconsIcon className="h-3.5 w-3.5" icon={Clock01Icon} />
            <span className="font-semibold text-xs">{Math.round(onTimeRate)}% on-time</span>
          </Badge>
        )}

        {/* Acceptance Rate */}
        {acceptanceRate !== undefined && acceptanceRate >= 75 && (
          <Badge
            className={cn("flex items-center gap-1.5", acceptanceBadgeClass)}
            variant="secondary"
          >
            <HugeiconsIcon className="h-3.5 w-3.5" icon={CheckmarkCircle01Icon} />
            <span className="font-semibold text-xs">{Math.round(acceptanceRate)}% acceptance</span>
          </Badge>
        )}

        {/* Completion Count */}
        {totalCompletedBookings !== undefined && totalCompletedBookings > 0 && (
          <Badge
            className="flex items-center gap-1.5 bg-neutral-100 text-neutral-700"
            variant="secondary"
          >
            <HugeiconsIcon className="h-3.5 w-3.5" icon={AnalyticsUpIcon} />
            <span className="font-semibold text-xs">{totalCompletedBookings} completed</span>
          </Badge>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn(performanceMetricsVariants({ variant }), className)}>
      {showLabels && (
        <h3 className="font-semibold text-neutral-900 text-sm">Performance Metrics</h3>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* On-Time Rate */}
        {onTimeRate !== undefined && (
          <Card className={cn("border-neutral-200 bg-neutral-50 p-4", onTimeBadgeClass)}>
            <div className="flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={Clock01Icon} />
              <div>
                <p className="font-semibold text-neutral-900">{Math.round(onTimeRate)}%</p>
                <p className="text-neutral-600 text-xs">On-Time Arrival</p>
              </div>
            </div>
            <p className="mt-2 text-neutral-700 text-xs">
              {(() => {
                if (onTimeRate >= 90) {
                  return "Consistently arrives within 15 minutes of scheduled time";
                }
                if (onTimeRate >= 75) {
                  return "Usually arrives on time";
                }
                return "Arrival time varies";
              })()}
            </p>
          </Card>
        )}

        {/* Acceptance Rate */}
        {acceptanceRate !== undefined && (
          <Card className={cn("border-neutral-200 bg-neutral-50 p-4", acceptanceBadgeClass)}>
            <div className="flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={CheckmarkCircle01Icon} />
              <div>
                <p className="font-semibold text-neutral-900">{Math.round(acceptanceRate)}%</p>
                <p className="text-neutral-600 text-xs">Acceptance Rate</p>
              </div>
            </div>
            <p className="mt-2 text-neutral-700 text-xs">
              {(() => {
                if (acceptanceRate >= 90) {
                  return "Highly responsive and reliable";
                }
                if (acceptanceRate >= 75) {
                  return "Responds to most requests";
                }
                return "May decline requests";
              })()}
            </p>
          </Card>
        )}
      </div>

      {/* Completion Badge */}
      {totalCompletedBookings !== undefined && totalCompletedBookings > 0 && (
        <Card className="flex items-center gap-2 border-neutral-200 bg-white p-3">
          <HugeiconsIcon className="h-4 w-4 text-neutral-600" icon={AnalyticsUpIcon} />
          <p className="text-neutral-600 text-sm">
            <span className="font-semibold text-neutral-900">{totalCompletedBookings}</span>{" "}
            {totalCompletedBookings === 1 ? "service" : "services"} completed on Casaora
          </p>
        </Card>
      )}
    </div>
  );
}

/**
 * Helper function to calculate acceptance rate from booking data
 * Week 7-8: Safety Package
 */
export function calculateAcceptanceRate(stats: {
  acceptedCount: number;
  declinedCount: number;
}): number {
  const total = stats.acceptedCount + stats.declinedCount;
  if (total === 0) {
    return 0;
  }
  return (stats.acceptedCount / total) * 100;
}
