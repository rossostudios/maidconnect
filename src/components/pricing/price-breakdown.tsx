import { HelpCircle } from "lucide-react";

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
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);

  // Platform fee configuration (15% - can be made configurable)
  const PLATFORM_FEE_RATE = 0.15;
  const platformFee = Math.round(baseAmount * PLATFORM_FEE_RATE);

  // Calculate totals
  const subtotal = baseAmount + addonsTotal;
  const totalWithFees = showPlatformFee ? subtotal + platformFee : subtotal;

  return (
    <div className={`space-y-3 rounded-xl border border-[#f0ece5] bg-[#fbfafa] p-5 ${className}`}>
      <h3 className="font-semibold text-[#211f1a] text-base">Price Breakdown</h3>

      <div className="space-y-2">
        {/* Base service cost */}
        <div className="flex items-start justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-[#5a5549]">Service</span>
            <span className="text-[#9a8f82] text-xs">
              {formatCurrency(hourlyRate)}/hr × {hours} {hours === 1 ? "hour" : "hours"}
            </span>
          </div>
          <span className="font-medium text-[#211f1a]">{formatCurrency(baseAmount)}</span>
        </div>

        {/* Add-ons */}
        {addonsTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#5a5549]">Add-ons</span>
            <span className="font-medium text-[#211f1a]">{formatCurrency(addonsTotal)}</span>
          </div>
        )}

        {/* Subtotal (if showing platform fee) */}
        {showPlatformFee && (
          <div className="flex justify-between border-[#e8e4db] border-t pt-2 text-sm">
            <span className="text-[#5a5549]">Subtotal</span>
            <span className="font-medium text-[#211f1a]">{formatCurrency(subtotal)}</span>
          </div>
        )}

        {/* Platform fee (Week 3-4 feature) */}
        {showPlatformFee && (
          <div className="flex items-start justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[#5a5549]">Platform Fee</span>
              <div className="group relative">
                <HelpCircle className="h-3.5 w-3.5 text-[#9a8f82] transition hover:text-[#211f1a]" />
                <div className="pointer-events-none absolute top-full left-0 z-10 mt-2 hidden w-64 rounded-lg border border-[#e8e4db] bg-white p-3 opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100">
                  <p className="text-[#5a5549] text-xs leading-relaxed">
                    This fee supports platform operations including payment processing, customer
                    support, insurance, and technology infrastructure that keeps MaidConnect safe
                    and reliable.
                  </p>
                </div>
              </div>
            </div>
            <span className="font-medium text-[#211f1a]">{formatCurrency(platformFee)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between border-[#e8e4db] border-t pt-3 font-semibold text-base">
          <span className="text-[#211f1a]">Total</span>
          <span className="text-[#ff5d46]">{formatCurrency(totalWithFees)}</span>
        </div>
      </div>

      {/* Trust badge */}
      {showPlatformFee && (
        <div className="mt-3 rounded-lg bg-[#f1f8e9] p-3 text-center">
          <p className="text-[#558b2f] text-xs leading-relaxed">
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
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);

  const PLATFORM_FEE_RATE = 0.15;
  const totalWithFee = hourlyRate * (1 + PLATFORM_FEE_RATE);

  if (!showBreakdown) {
    return (
      <div className={`font-semibold text-[#211f1a] ${className}`}>
        {formatCurrency(hourlyRate)}/hr
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="font-semibold text-[#211f1a]">{formatCurrency(hourlyRate)}/hr</div>
      <div className="text-[#7a6d62] text-xs">
        {formatCurrency(totalWithFee)}/hr total with fees
      </div>
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
