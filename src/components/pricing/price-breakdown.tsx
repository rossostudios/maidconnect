import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatCOP } from "@/lib/format";

type PriceBreakdownProps = {
  baseAmount: number;
  addonsTotal?: number;
  hours: number;
  hourlyRate: number;
  showPlatformFee?: boolean; // Feature flag controlled
  className?: string;
};

/**
 * Price Breakdown Component
 * Transparent pricing display showing all fees
 * Part of Week 3-4 live price breakdown feature
 */
export function PriceBreakdown({
  baseAmount,
  addonsTotal = 0,
  hours,
  hourlyRate,
  showPlatformFee = false,
  className = "",
}: PriceBreakdownProps) {
  // Platform fee configuration (15% - can be made configurable)
  const PLATFORM_FEE_RATE = 0.15;
  const platformFee = Math.round(baseAmount * PLATFORM_FEE_RATE);

  // Calculate totals
  const subtotal = baseAmount + addonsTotal;
  const totalWithFees = showPlatformFee ? subtotal + platformFee : subtotal;

  return (
    <div className={`space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-5 ${className}`}>
      <h3 className="font-semibold text-base text-gray-900">Price Breakdown</h3>

      <div className="space-y-2">
        {/* Base service cost */}
        <div className="flex items-start justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-stone-600">Service</span>
            <span className="text-stone-500 text-xs">
              {formatCOP(hourlyRate)}/hr × {hours} {hours === 1 ? "hour" : "hours"}
            </span>
          </div>
          <span className="font-medium text-gray-900">{formatCOP(baseAmount)}</span>
        </div>

        {/* Add-ons */}
        {addonsTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Add-ons</span>
            <span className="font-medium text-gray-900">{formatCOP(addonsTotal)}</span>
          </div>
        )}

        {/* Subtotal (if showing platform fee) */}
        {showPlatformFee && (
          <div className="flex justify-between pt-2 text-sm">
            <span className="text-stone-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCOP(subtotal)}</span>
          </div>
        )}

        {/* Platform fee (Week 3-4 feature) */}
        {showPlatformFee && (
          <div className="flex items-start justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-600">Platform Fee</span>
              <div className="group relative">
                <HugeiconsIcon
                  className="h-3.5 w-3.5 text-stone-500 transition hover:text-gray-900"
                  icon={HelpCircleIcon}
                />
                <div className="pointer-events-none absolute top-full left-0 z-10 mt-2 hidden w-64 rounded-lg border border-stone-200 bg-white p-3 opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100">
                  <p className="text-stone-600 text-xs leading-relaxed">
                    This fee supports platform operations including payment processing, customer
                    support, insurance, and technology infrastructure that keeps Casaora safe and
                    reliable.
                  </p>
                </div>
              </div>
            </div>
            <span className="font-medium text-gray-900">{formatCOP(platformFee)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between pt-3 font-semibold text-base">
          <span className="text-gray-900">Total</span>
          <span className="text-orange-500">{formatCOP(totalWithFees)}</span>
        </div>
      </div>

      {/* Trust badge */}
      {showPlatformFee && (
        <div className="mt-3 rounded-lg bg-green-50 p-3 text-center">
          <p className="text-green-700 text-xs leading-relaxed">
            <span className="font-semibold">100% Secure Payment</span> · Your payment is protected
            by Stripe. Funds are only released after service completion.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Price Display (for cards and listings)
 * Shows either simple total or breakdown based on feature flag
 */
type CompactPriceProps = {
  hourlyRate: number;
  showBreakdown?: boolean;
  className?: string;
};

export function CompactPrice({
  hourlyRate,
  showBreakdown = false,
  className = "",
}: CompactPriceProps) {
  const PLATFORM_FEE_RATE = 0.15;
  const totalWithFee = hourlyRate * (1 + PLATFORM_FEE_RATE);

  if (!showBreakdown) {
    return (
      <div className={`font-semibold text-gray-900 ${className}`}>{formatCOP(hourlyRate)}/hr</div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="font-semibold text-gray-900">{formatCOP(hourlyRate)}/hr</div>
      <div className="text-stone-600 text-xs">{formatCOP(totalWithFee)}/hr total with fees</div>
    </div>
  );
}

/**
 * Calculate total amount with platform fees
 * Utility function for consistent calculations across the app
 */
export function calculateTotalWithFees(
  baseAmount: number,
  addonsTotal = 0,
  includePlatformFee = false
): {
  subtotal: number;
  platformFee: number;
  total: number;
} {
  const PLATFORM_FEE_RATE = 0.15;
  const subtotal = baseAmount + addonsTotal;
  const platformFee = includePlatformFee ? Math.round(subtotal * PLATFORM_FEE_RATE) : 0;
  const total = subtotal + platformFee;

  return {
    subtotal,
    platformFee,
    total,
  };
}
