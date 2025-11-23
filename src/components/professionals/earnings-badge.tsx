import { geistSans } from "@/app/fonts";
import {
  type BadgeTier,
  calculateTierProgress,
  formatEarningsForBadge,
  getBadgeColorClasses,
  getBadgeFromBookings,
} from "@/lib/professionals/earnings-badges";
import { cn } from "@/lib/utils/core";

// ========================================
// Types
// ========================================

type EarningsBadgeProps = {
  /**
   * Total bookings completed
   */
  totalBookings: number;

  /**
   * Total earnings in COP (optional, only shown if user opted in)
   */
  totalEarningsCOP?: number;

  /**
   * Whether to show earnings amount
   */
  showEarnings?: boolean;

  /**
   * Whether to show progress to next tier
   */
  showProgress?: boolean;

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";

  /**
   * Custom class name
   */
  className?: string;
};

type EarningsBadgeCompactProps = {
  /**
   * Badge tier
   */
  tier: BadgeTier;

  /**
   * Custom class name
   */
  className?: string;
};

// ========================================
// Earnings Badge Component
// ========================================

/**
 * EarningsBadge - Display professional's earnings badge with tier
 *
 * Features:
 * - Shows badge tier (Bronze, Silver, Gold, Platinum)
 * - Optionally displays total earnings
 * - Optionally shows progress to next tier
 * - Multiple size variants
 *
 * @example
 * ```tsx
 * <EarningsBadge
 *   totalBookings={45}
 *   totalEarningsCOP={25000000}
 *   showEarnings
 *   showProgress
 *   size="md"
 * />
 * ```
 */
export function EarningsBadge({
  totalBookings,
  totalEarningsCOP,
  showEarnings = false,
  showProgress = false,
  size = "md",
  className,
}: EarningsBadgeProps) {
  const badge = getBadgeFromBookings(totalBookings);
  const colors = getBadgeColorClasses(badge.tier);

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-2",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-3",
  };

  const iconSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  if (badge.tier === "none") {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Badge */}
      <div
        className={cn(
          "inline-flex items-center rounded-full border font-semibold",
          colors.bg,
          colors.border,
          colors.text,
          sizeClasses[size],
          geistSans.className
        )}
      >
        {/* Icon */}
        <span className={iconSizes[size]}>{badge.icon}</span>

        {/* Tier Name */}
        <span>{badge.displayName}</span>

        {/* Earnings (optional) */}
        {showEarnings && totalEarningsCOP !== undefined && totalEarningsCOP > 0 && (
          <>
            <span className="text-neutral-400">•</span>
            <span>{formatEarningsForBadge(totalEarningsCOP)} earned</span>
          </>
        )}
      </div>

      {/* Progress to Next Tier (optional) */}
      {showProgress && badge.tier !== "platinum" && (
        <div className="space-y-1.5">
          {(() => {
            const progress = calculateTierProgress(totalBookings);
            if (!progress.nextTier) {
              return null;
            }

            return (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className={cn("text-neutral-600", geistSans.className)}>
                    Progress to {progress.nextTier}
                  </span>
                  <span className={cn("font-semibold text-neutral-700", geistSans.className)}>
                    {progress.bookingsUntilNext} bookings to go
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ========================================
// Compact Badge Component
// ========================================

/**
 * EarningsBadgeCompact - Minimal badge display (icon + tier name)
 *
 * Use this for space-constrained areas like profile cards
 *
 * @example
 * ```tsx
 * <EarningsBadgeCompact tier="gold" />
 * ```
 */
export function EarningsBadgeCompact({ tier, className }: EarningsBadgeCompactProps) {
  if (tier === "none") {
    return null;
  }

  const badge = getBadgeFromBookings(
    tier === "platinum" ? 101 : tier === "gold" ? 51 : tier === "silver" ? 11 : 1
  );
  const colors = getBadgeColorClasses(tier);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium text-sm",
        colors.bg,
        colors.border,
        colors.text,
        geistSans.className,
        className
      )}
    >
      <span className="text-sm">{badge.icon}</span>
      <span>{badge.displayName}</span>
    </div>
  );
}

// ========================================
// Badge Tooltip Component
// ========================================

type EarningsBadgeTooltipProps = {
  totalBookings: number;
  children: React.ReactNode;
};

/**
 * EarningsBadgeTooltip - Shows badge information on hover
 *
 * @example
 * ```tsx
 * <EarningsBadgeTooltip totalBookings={45}>
 *   <EarningsBadgeCompact tier="silver" />
 * </EarningsBadgeTooltip>
 * ```
 */
export function EarningsBadgeTooltip({ totalBookings, children }: EarningsBadgeTooltipProps) {
  const badge = getBadgeFromBookings(totalBookings);
  const progress = calculateTierProgress(totalBookings);

  return (
    <div className="group relative inline-block">
      {children}

      {/* Tooltip */}
      <div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 group-hover:block">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-lg">
          {/* Badge Info */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <div className={cn("font-semibold text-neutral-900", geistSans.className)}>
                {badge.displayName}
              </div>
              <div className={cn("text-neutral-600 text-sm", geistSans.className)}>
                {badge.description}
              </div>
            </div>
          </div>

          {/* Progress */}
          {progress.nextTier && (
            <div className="border-neutral-200 border-t pt-3">
              <div className={cn("mb-2 font-medium text-neutral-700 text-sm", geistSans.className)}>
                {progress.bookingsUntilNext} more bookings to reach {progress.nextTier}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
