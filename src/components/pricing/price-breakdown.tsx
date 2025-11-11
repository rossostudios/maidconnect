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
  className?: string;
};

export function PriceBreakdown({
  baseAmount,
  addonsTotal = 0,
  hours,
  hourlyRate,
  showPlatformFee = false,
  className = "",
}: PriceBreakdownProps) {
  const PLATFORM_FEE_RATE = 0.15;
  const platformFee = Math.round(baseAmount * PLATFORM_FEE_RATE);
  const subtotal = baseAmount + addonsTotal;
  const totalWithFees = showPlatformFee ? subtotal + platformFee : subtotal;

  return (
    <Card className={`border-slate-200 bg-white ${className}`}>
      <CardContent className="space-y-3 p-5">
        <h3 className="font-semibold text-base text-slate-900">Price Breakdown</h3>

        <div className="space-y-2">
          <div className="flex items-start justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-slate-600">Service</span>
              <span className="text-slate-500 text-xs">
                {formatCOP(hourlyRate)}/hr × {hours} {hours === 1 ? "hour" : "hours"}
              </span>
            </div>
            <span className="font-medium text-slate-900">{formatCOP(baseAmount)}</span>
          </div>

          {addonsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Add-ons</span>
              <span className="font-medium text-slate-900">{formatCOP(addonsTotal)}</span>
            </div>
          )}

          {showPlatformFee && (
            <>
              <div className="flex justify-between pt-2 text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">{formatCOP(subtotal)}</span>
              </div>

              <div className="flex items-start justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Platform Fee</span>
                  <div className="group relative">
                    <HugeiconsIcon
                      className="h-3.5 w-3.5 text-slate-500 transition hover:text-slate-900"
                      icon={HelpCircleIcon}
                    />
                    <div className="pointer-events-none absolute top-full left-0 z-10 mt-2 hidden w-64 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100">
                      <p className="text-slate-600 text-xs leading-relaxed">
                        This fee supports platform operations including payment processing, customer
                        support, insurance, and technology infrastructure that keeps Casaora safe
                        and reliable.
                      </p>
                    </div>
                  </div>
                </div>
                <span className="font-medium text-slate-900">{formatCOP(platformFee)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between border-slate-200 border-t pt-3 font-semibold text-base">
            <span className="text-slate-900">Total</span>
            <span className="text-slate-900">{formatCOP(totalWithFees)}</span>
          </div>
        </div>

        {showPlatformFee && (
          <Card className="mt-3 border-green-200 bg-green-50">
            <CardContent className="p-3 text-center">
              <p className="text-green-800 text-xs leading-relaxed">
                <span className="font-semibold">100% Secure Payment</span> · Your payment is
                protected by Stripe. Funds are only released after service completion.
              </p>
            </CardContent>
          </Card>
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
      <div className={`font-semibold text-slate-900 ${className}`}>{formatCOP(hourlyRate)}/hr</div>
    );
  }

  return (
    <div className={className}>
      <div className="font-semibold text-slate-900">{formatCOP(hourlyRate)}/hr</div>
      <div className="text-slate-600 text-xs">{formatCOP(totalWithFee)}/hr total with fees</div>
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
