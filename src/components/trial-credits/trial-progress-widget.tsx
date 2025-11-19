/**
 * Trial Progress Widget Component
 *
 * Displays comprehensive trial credit progress for a customer-professional pair.
 * Shows bookings completed, credit earned, progress bar, and helpful tips.
 *
 * Design: Lia Design System compliant
 * - Anthropic rounded-lg cards
 * - 4px grid spacing
 * - Three-accent palette (orange primary, green success)
 * - Warm neutral backgrounds
 *
 * @module components/trial-credits
 */

import { formatCurrency } from "@/lib/utils/format";

export type TrialProgressWidgetProps = {
  /** Available credit in COP cents */
  creditAvailableCOP: number;
  /** Available credit in USD (pre-calculated) */
  creditAvailableUSD: number;
  /** Number of completed bookings */
  bookingsCompleted: number;
  /** Total value of all bookings in COP cents */
  totalBookingsValueCOP: number;
  /** Percentage of max credit earned (0-100) */
  percentageEarned: number;
  /** Professional's name */
  professionalName: string;
  /** Maximum credit amount in COP cents */
  maxCreditCOP?: number;
};

/**
 * Trial Progress Widget
 *
 * @example
 * <TrialProgressWidget
 *   creditAvailableCOP={200000}
 *   creditAvailableUSD={50}
 *   bookingsCompleted={2}
 *   totalBookingsValueCOP={400000}
 *   percentageEarned={33}
 *   professionalName="Maria García"
 * />
 */
export function TrialProgressWidget({
  creditAvailableCOP: _creditAvailableCOP,
  creditAvailableUSD,
  bookingsCompleted,
  totalBookingsValueCOP,
  percentageEarned,
  professionalName,
  maxCreditCOP = 598_000, // Default: 50% of $299 = ~$150
}: TrialProgressWidgetProps) {
  const maxCreditUSD = Math.round(maxCreditCOP / 4000);
  const totalSpentUSD = Math.round(totalBookingsValueCOP / 4000);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg text-neutral-900">Trial Credit Progress</h3>
          <p className="mt-1 text-neutral-700 text-sm">
            Book more with {professionalName} to earn credit toward direct hire
          </p>
        </div>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-700 text-sm">
          {bookingsCompleted} booking{bookingsCompleted !== 1 ? "s" : ""} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-700">Credit Earned</span>
          <span className="font-semibold text-neutral-900">
            {formatCurrency(creditAvailableUSD, "USD")} / {formatCurrency(maxCreditUSD, "USD")} max
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            aria-label="Trial credit progress"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percentageEarned}
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ease-out"
            role="progressbar"
            style={{ width: `${Math.min(percentageEarned, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-neutral-500 text-xs">Total Spent</p>
          <p className="mt-1 font-semibold text-lg text-neutral-900">
            {formatCurrency(totalSpentUSD, "USD")}
          </p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs">Credit Available</p>
          <p className="mt-1 font-semibold text-green-600 text-lg">
            {formatCurrency(creditAvailableUSD, "USD")}
          </p>
        </div>
      </div>

      {/* Pro Tip Callout */}
      <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-neutral-900 text-sm">
          <strong className="font-semibold text-neutral-900">Pro tip:</strong> Each completed
          booking earns you 50% credit (up to {formatCurrency(maxCreditUSD, "USD")} total). Use it
          to reduce your direct hire fee!
        </p>
      </div>

      {/* How It Works (Expandable) */}
      {bookingsCompleted === 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer font-medium text-orange-600 text-sm transition-colors hover:text-orange-700">
            How does trial credit work?
          </summary>
          <div className="mt-3 space-y-2 text-neutral-700 text-sm">
            <p>
              <strong className="font-medium text-neutral-900">1. Book services:</strong> Complete
              up to 3 bookings with {professionalName}
            </p>
            <p>
              <strong className="font-medium text-neutral-900">2. Earn credit:</strong> Get 50% of
              your booking fees back as credit
            </p>
            <p>
              <strong className="font-medium text-neutral-900">3. Apply to direct hire:</strong> Use
              your credit to reduce the $299 placement fee
            </p>
            <p className="mt-3 text-neutral-500 text-xs">
              Example: 3 bookings at $40 each = $120 spent → $60 credit toward direct hire
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
