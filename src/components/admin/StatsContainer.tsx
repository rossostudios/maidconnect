/**
 * StatsContainer - KPI cards grid with asymmetric layout and Lia design
 *
 * Layout (Desktop):
 * ┌───────────────────┬───────────────────┐
 * │                   │                   │
 * │   Featured KPI    │   Featured KPI    │  ← Larger (span 2 rows)
 * │   (Fill Rate)     │   (TTFB)          │
 * │                   │                   │
 * ├───────────────────┼───────────────────┤
 * │  Repeat Rate      │  Active Pros      │  ← Smaller (single row)
 * └───────────────────┴───────────────────┘
 *
 * Features:
 * - Asymmetric CSS Grid layout for visual hierarchy
 * - Staggered reveal animation on page load (animation-delay)
 * - Responsive breakpoints (mobile: stack, tablet: 2-col, desktop: asymmetric)
 * - Featured cards: Fill Rate + TTFB (most important metrics)
 * - Secondary cards: Repeat Rate + Active Professionals
 * - Smooth transitions with orchestrated timing
 */

"use client";

import type { AnalyticsMetrics } from "@/hooks/useAnalytics";
import { StatCard } from "./StatCard";

type Props = {
  metrics: AnalyticsMetrics;
  sparklineData?: {
    fillRate: { day: number; value: number }[];
    ttfb: { day: number; value: number }[];
    repeatRate: { day: number; value: number }[];
    activePros: { day: number; value: number }[];
  };
};

/**
 * Determine status level based on metric value and thresholds
 */
function getStatusLevel(
  value: number,
  goodThreshold: number,
  neutralThreshold: number,
  inverse = false
): "good" | "neutral" | "poor" {
  if (inverse) {
    // Lower is better (e.g., TTFB)
    if (value <= goodThreshold) {
      return "good";
    }
    if (value <= neutralThreshold) {
      return "neutral";
    }
    return "poor";
  }
  // Higher is better (e.g., Fill Rate, Repeat Rate)
  if (value >= goodThreshold) {
    return "good";
  }
  if (value >= neutralThreshold) {
    return "neutral";
  }
  return "poor";
}

export function StatsContainer({ metrics, sparklineData }: Props) {
  // Calculate status levels for each metric
  const fillRateStatus = getStatusLevel(metrics.fillRate, 70, 50);
  const ttfbStatus = getStatusLevel(metrics.avgTimeToFirstBooking, 7, 14, true); // Inverse: lower is better
  const repeatRateStatus = getStatusLevel(metrics.repeatBookingRate, 40, 25);
  const activeProsRatio =
    metrics.totalProfessionals > 0
      ? (metrics.activeProfessionals / metrics.totalProfessionals) * 100
      : 0;
  const activeProsStatus = getStatusLevel(activeProsRatio, 50, 30);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Featured Card 1: Fill Rate (span 2 columns on large screens) */}
      <div className="stat-card lg:col-span-2" style={{ animationDelay: "0.1s" }}>
        <StatCard
          description="Booking requests accepted"
          featured
          sparklineData={sparklineData?.fillRate}
          status={fillRateStatus}
          title="Fill Rate"
          value={`${metrics.fillRate.toFixed(1)}%`}
        />
      </div>

      {/* Featured Card 2: Time to First Booking (span 2 columns on large screens) */}
      <div className="stat-card lg:col-span-2" style={{ animationDelay: "0.2s" }}>
        <StatCard
          description="Avg. professional onboarding"
          featured
          sparklineData={sparklineData?.ttfb}
          status={ttfbStatus}
          title="Time to First Booking"
          value={`${metrics.avgTimeToFirstBooking.toFixed(1)} days`}
        />
      </div>

      {/* Secondary Card 3: Repeat Booking Rate */}
      <div className="stat-card lg:col-span-2" style={{ animationDelay: "0.3s" }}>
        <StatCard
          description="Customers with 2+ bookings"
          sparklineData={sparklineData?.repeatRate}
          status={repeatRateStatus}
          title="Repeat Booking Rate"
          value={`${metrics.repeatBookingRate.toFixed(1)}%`}
        />
      </div>

      {/* Secondary Card 4: Active Professionals */}
      <div className="stat-card lg:col-span-2" style={{ animationDelay: "0.4s" }}>
        <StatCard
          description="Bookings in last 30 days"
          sparklineData={sparklineData?.activePros}
          status={activeProsStatus}
          title="Active Professionals"
          value={`${metrics.activeProfessionals} / ${metrics.totalProfessionals}`}
        />
      </div>
    </div>
  );
}
