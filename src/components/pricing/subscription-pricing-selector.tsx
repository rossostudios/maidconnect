"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculateSubscriptionPricing,
  estimateBookingsCount,
  formatCOP,
  getTierBenefits,
  getTierDescription,
  getTierDiscountLabel,
  type SubscriptionTier,
} from "@/lib/subscription-pricing";
import { cn } from "@/lib/utils";

type Props = {
  basePrice: number;
  selectedTier: SubscriptionTier;
  onTierChange: (tier: SubscriptionTier) => void;
  recommendedTier?: SubscriptionTier | null;
};

export function SubscriptionPricingSelector({
  basePrice,
  selectedTier,
  onTierChange,
  recommendedTier,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const tiers: SubscriptionTier[] = ["none", "monthly", "biweekly", "weekly"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900 text-sm">Booking Frequency</h3>
        <button
          className="text-neutral-700 text-xs hover:text-neutral-900"
          onClick={() => setShowDetails(!showDetails)}
          type="button"
        >
          {showDetails ? "Hide savings" : "See savings"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tiers.map((tier) => {
          const pricing = calculateSubscriptionPricing(basePrice, tier, 3);
          const isSelected = selectedTier === tier;
          const isRecommended = recommendedTier === tier;
          const discountLabel = getTierDiscountLabel(tier);

          return (
            <button
              className={cn(
                "relative rounded-lg border p-4 text-left transition",
                isSelected
                  ? "border-neutral-900 bg-neutral-50 ring-2 ring-neutral-200"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
              key={tier}
              onClick={() => onTierChange(tier)}
              type="button"
            >
              {isRecommended && (
                <Badge className="-right-1 -top-1 absolute" size="sm" variant="success">
                  Recommended
                </Badge>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-lg", isSelected ? "opacity-100" : "opacity-40")}>
                      {isSelected ? "⚫" : "○"}
                    </span>
                    <h4 className="font-semibold text-neutral-900">{getTierDescription(tier)}</h4>
                  </div>
                  {discountLabel && (
                    <p className="mt-1 font-semibold text-green-700 text-xs">💰 {discountLabel}</p>
                  )}
                </div>
              </div>

              <div className="mt-3">
                {tier === "none" ? (
                  <p className="font-bold text-lg text-neutral-900">
                    {formatCOP(pricing.finalPrice)}
                  </p>
                ) : (
                  <div>
                    <p className="text-neutral-600 text-xs line-through">
                      {formatCOP(pricing.basePrice)}
                    </p>
                    <p className="font-bold text-green-700 text-lg">
                      {formatCOP(pricing.finalPrice)}
                    </p>
                  </div>
                )}
                <p className="mt-1 text-neutral-600 text-xs">per booking</p>
              </div>

              {tier !== "none" && (
                <Card className="mt-3 border-neutral-200 bg-white">
                  <CardContent className="px-2 py-1.5 text-xs">
                    <p className="font-semibold text-neutral-900">
                      Save {formatCOP(pricing.totalSavingsEstimate || 0)} over 3 months
                    </p>
                    <p className="text-neutral-600">~{estimateBookingsCount(tier, 3)} bookings</p>
                  </CardContent>
                </Card>
              )}
            </button>
          );
        })}
      </div>

      {showDetails && selectedTier !== "none" && (
        <Card className="border-neutral-200 bg-neutral-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-neutral-900 text-sm">
              {getTierDescription(selectedTier)} Benefits
            </h4>
            <ul className="mt-3 space-y-2">
              {getTierBenefits(selectedTier).map((benefit, index) => (
                <li className="flex items-start gap-2 text-sm" key={index}>
                  <span className="text-green-600">✓</span>
                  <span className="text-neutral-600">{benefit}</span>
                </li>
              ))}
            </ul>

            <Card className="mt-4 border-neutral-200 bg-white">
              <CardContent className="p-3 text-neutral-600 text-xs">
                <p className="font-semibold text-neutral-900">Flexible cancellation</p>
                <p className="mt-1">
                  You can skip one booking, pause your subscription, or cancel anytime with 24-hour
                  notice. No long-term commitment required.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {selectedTier === "none" && showDetails && (
        <Card className="border-neutral-200 bg-neutral-50">
          <CardContent className="p-4 text-neutral-600 text-sm">
            💡 <span className="font-semibold">Tip:</span> Switch to recurring bookings anytime to
            unlock discounts and priority service. You can always pause or cancel.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function SubscriptionPricingBadge({
  basePrice,
  tier,
}: {
  basePrice: number;
  tier: SubscriptionTier;
}) {
  if (tier === "none") {
    return null;
  }

  const pricing = calculateSubscriptionPricing(basePrice, tier);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
      <span className="font-semibold text-green-700 text-xs">
        💰 {pricing.discountPercent}% OFF
      </span>
      <span className="text-neutral-600 text-xs">
        Save {formatCOP(pricing.savingsPerBooking)} per booking
      </span>
    </div>
  );
}
