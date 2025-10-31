/**
 * Performance Metrics Component
 * Week 7-8: Safety Package - Display on-time and acceptance rates
 *
 * Shows professional reliability metrics to build trust
 */

import { CheckCircle, Clock, TrendingUp } from "lucide-react";

export type PerformanceMetrics = {
  onTimeRate?: number; // Percentage (0-100)
  acceptanceRate?: number; // Percentage (0-100)
  totalCompletedBookings?: number;
};

type Props = {
  metrics: PerformanceMetrics;
  variant?: "compact" | "detailed";
  showLabels?: boolean;
};

export function PerformanceMetrics({ metrics, variant = "compact", showLabels = true }: Props) {
  const { onTimeRate, acceptanceRate, totalCompletedBookings } = metrics;

  // Helper to determine color based on rate
  const getRateColor = (rate: number | undefined) => {
    if (rate === undefined || rate < 75) {
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: "text-gray-500",
      };
    }
    if (rate < 90) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "text-yellow-600",
      };
    }
    return {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "text-green-600",
    };
  };

  const onTimeColor = getRateColor(onTimeRate);
  const acceptanceColor = getRateColor(acceptanceRate);

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {/* On-Time Rate */}
        {onTimeRate !== undefined && onTimeRate >= 75 && (
          <div className={`flex items-center gap-1.5 rounded-full ${onTimeColor.bg} px-3 py-1.5`}>
            <Clock className={`h-3.5 w-3.5 ${onTimeColor.icon}`} />
            <span className={`font-semibold text-xs ${onTimeColor.text}`}>
              {Math.round(onTimeRate)}% on-time
            </span>
          </div>
        )}

        {/* Acceptance Rate */}
        {acceptanceRate !== undefined && acceptanceRate >= 75 && (
          <div
            className={`flex items-center gap-1.5 rounded-full ${acceptanceColor.bg} px-3 py-1.5`}
          >
            <CheckCircle className={`h-3.5 w-3.5 ${acceptanceColor.icon}`} />
            <span className={`font-semibold text-xs ${acceptanceColor.text}`}>
              {Math.round(acceptanceRate)}% acceptance
            </span>
          </div>
        )}

        {/* Completion Count */}
        {totalCompletedBookings !== undefined && totalCompletedBookings > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-semibold text-blue-800 text-xs">
              {totalCompletedBookings} completed
            </span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className="space-y-4">
      {showLabels && <h3 className="font-semibold text-[#211f1a] text-sm">Performance Metrics</h3>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* On-Time Rate */}
        {onTimeRate !== undefined && (
          <div className={`rounded-xl ${onTimeColor.bg} p-4`}>
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${onTimeColor.icon}`} />
              <div>
                <p className={`font-semibold ${onTimeColor.text}`}>{Math.round(onTimeRate)}%</p>
                <p className={`text-xs ${onTimeColor.text}`}>On-Time Arrival</p>
              </div>
            </div>
            <p className="mt-2 text-[#7a6d62] text-xs">
              {onTimeRate >= 90
                ? "Consistently arrives within 15 minutes of scheduled time"
                : onTimeRate >= 75
                  ? "Usually arrives on time"
                  : "Arrival time varies"}
            </p>
          </div>
        )}

        {/* Acceptance Rate */}
        {acceptanceRate !== undefined && (
          <div className={`rounded-xl ${acceptanceColor.bg} p-4`}>
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-5 w-5 ${acceptanceColor.icon}`} />
              <div>
                <p className={`font-semibold ${acceptanceColor.text}`}>
                  {Math.round(acceptanceRate)}%
                </p>
                <p className={`text-xs ${acceptanceColor.text}`}>Acceptance Rate</p>
              </div>
            </div>
            <p className="mt-2 text-[#7a6d62] text-xs">
              {acceptanceRate >= 90
                ? "Highly responsive and reliable"
                : acceptanceRate >= 75
                  ? "Responds to most requests"
                  : "May decline requests"}
            </p>
          </div>
        )}
      </div>

      {/* Completion Badge */}
      {totalCompletedBookings !== undefined && totalCompletedBookings > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-[#ebe5d8] bg-white p-3">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <p className="text-[#5d574b] text-sm">
            <span className="font-semibold text-[#211f1a]">{totalCompletedBookings}</span>{" "}
            {totalCompletedBookings === 1 ? "service" : "services"} completed on Maidconnect
          </p>
        </div>
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
