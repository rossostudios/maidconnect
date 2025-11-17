import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCOP } from "@/lib/format";

type PriceBreakdownProps = {
  baseAmount: number;
  addonsTotal?: number;
  hours: number;
  hourlyRate: number;
  showPlatformFee?: boolean;
  serviceType?: "marketplace" | "concierge";
  className?: string;
};

export function PriceBreakdown({
  baseAmount,
  addonsTotal = 0,
  hours,
  hourlyRate,
  showPlatformFee = true, // Changed default to true for transparency
  serviceType = "marketplace",
  className = "",
}: PriceBreakdownProps) {
  // 15% for marketplace, 25% for concierge
  const PLATFORM_FEE_RATE = serviceType === "concierge" ? 0.25 : 0.15;
  const platformFee = Math.round(baseAmount * PLATFORM_FEE_RATE);
  const subtotal = baseAmount + addonsTotal;
  const totalWithFees = showPlatformFee ? subtotal + platformFee : subtotal;

  return (
    <Card className={`border-neutral-200 bg-white ${className}`}>
      <CardContent className="space-y-3 p-5">
        <h3 className="font-semibold text-base text-neutral-900">Price Breakdown</h3>

        <div className="space-y-2">
          <div className="flex items-start justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-neutral-600">Service</span>
              <span className="text-neutral-700 text-xs">
                {formatCOP(hourlyRate)}/hr × {hours} {hours === 1 ? "hour" : "hours"}
              </span>
            </div>
            <span className="font-medium text-neutral-900">{formatCOP(baseAmount)}</span>
          </div>

          {addonsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Add-ons</span>
              <span className="font-medium text-neutral-900">{formatCOP(addonsTotal)}</span>
            </div>
          )}

          {showPlatformFee && (
            <>
              <div className="flex justify-between pt-2 text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium text-neutral-900">{formatCOP(subtotal)}</span>
              </div>

              <div className="flex items-start justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-600">
                    Platform Fee ({Math.round(PLATFORM_FEE_RATE * 100)}%)
                  </span>
                  <div className="group relative">
                    <HugeiconsIcon
                      className="h-3.5 w-3.5 cursor-help text-orange-600 transition hover:text-orange-700"
                      icon={HelpCircleIcon}
                    />
                    <div className="pointer-events-none absolute top-full left-0 z-10 mt-2 hidden w-72 border-2 border-orange-200 bg-white p-4 opacity-0 shadow-xl transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100">
                      <p className="mb-2 font-semibold text-neutral-900 text-sm">
                        {serviceType === "concierge" ? "Concierge Service Fee" : "Platform Fee"}
                      </p>
                      <p className="mb-2 text-neutral-700 text-xs leading-relaxed">
                        {serviceType === "concierge"
                          ? "Your concierge fee includes expert matching, English-speaking coordinators, priority booking, and satisfaction guarantee."
                          : "This fee covers background checks, payment protection via Stripe, insurance coverage, 24/7 support, and platform technology."}
                      </p>
                      <p className="font-semibold text-orange-600 text-xs">
                        ✓ Professional receives 100% of their rate
                      </p>
                    </div>
                  </div>
                </div>
                <span className="font-medium text-neutral-900">{formatCOP(platformFee)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between border-neutral-200 border-t pt-3 font-semibold text-base">
            <span className="text-neutral-900">Total</span>
            <span className="text-neutral-900">{formatCOP(totalWithFees)}</span>
          </div>
        </div>

        {showPlatformFee && (
          <div className="mt-4 space-y-2">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-3">
                <p className="text-center text-orange-900 text-xs leading-relaxed">
                  <span className="font-semibold">Professional Receives:</span>{" "}
                  {formatCOP(baseAmount)} · <span className="font-semibold">You Pay:</span>{" "}
                  {formatCOP(totalWithFees)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3 text-center">
                <p className="text-green-800 text-xs leading-relaxed">
                  <span className="font-semibold">🔒 100% Secure Payment</span> · Protected by
                  Stripe escrow. Funds only released after service completion.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CompactPrice({
  hourlyRate,
  showBreakdown = false,
  className = "",
}: {
  hourlyRate: number;
  showBreakdown?: boolean;
  className?: string;
}) {
  const PLATFORM_FEE_RATE = 0.15;
  const totalWithFee = hourlyRate * (1 + PLATFORM_FEE_RATE);

  if (!showBreakdown) {
    return (
      <div className={`font-semibold text-neutral-900 ${className}`}>
        {formatCOP(hourlyRate)}/hr
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="font-semibold text-neutral-900">{formatCOP(hourlyRate)}/hr</div>
      <div className="text-neutral-600 text-xs">{formatCOP(totalWithFee)}/hr total with fees</div>
    </div>
  );
}

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
