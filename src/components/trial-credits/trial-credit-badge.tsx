/**
 * Trial Credit Badge Component
 *
 * Displays trial credit availability as a badge.
 * Used on professional profile cards and direct hire checkout.
 *
 * Design: Lia Design System compliant
 * - Anthropic rounded-full pill shape
 * - Green accent color (success state)
 * - Compact and detailed variants
 *
 * @module components/trial-credits
 */

import { cn } from "@/lib/utils/core";
import { formatCurrency } from "@/lib/utils/format";

export type TrialCreditBadgeProps = {
  /** Available credit amount in COP cents */
  creditAvailableCOP: number;
  /** Number of completed bookings with this professional */
  bookingsCompleted: number;
  /** Maximum bookings to show in progress (default: 3) */
  maxBookings?: number;
  /** Display variant */
  variant?: "compact" | "detailed";
  /** Additional CSS classes */
  className?: string;
};

/**
 * Trial Credit Badge
 *
 * @example
 * <TrialCreditBadge
 *   creditAvailableCOP={200000}
 *   bookingsCompleted={2}
 *   variant="compact"
 * />
 * // Renders: "~$50 Credit Available"
 *
 * @example
 * <TrialCreditBadge
 *   creditAvailableCOP={300000}
 *   bookingsCompleted={3}
 *   variant="detailed"
 * />
 * // Renders: "Trial Credit: ~$75 (3/3 bookings)"
 */
export function TrialCreditBadge({
  creditAvailableCOP,
  bookingsCompleted,
  maxBookings = 3,
  variant = "compact",
  className,
}: TrialCreditBadgeProps) {
  // Don't render if no credit available
  if (creditAvailableCOP === 0) {
    return null;
  }

  // Convert COP to USD (approximate)
  const creditUSD = Math.round(creditAvailableCOP / 4000);

  return (
    <div
      className={cn(
        // Anthropic rounded-full pill shape (Lia design system)
        "inline-flex items-center gap-2 rounded-full border px-3 py-1",
        // Green accent (success state) - Lia three-accent palette
        "border-green-200 bg-green-50 text-green-700",
        // Typography
        "font-medium text-sm",
        className
      )}
    >
      {variant === "compact" ? (
        <span>~{formatCurrency(creditUSD, "USD")} Credit Available</span>
      ) : (
        <span>
          Trial Credit: ~{formatCurrency(creditUSD, "USD")} ({bookingsCompleted}/{maxBookings}{" "}
          bookings)
        </span>
      )}
    </div>
  );
}
