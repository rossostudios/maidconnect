"use client";

import { useState } from "react";
import {
  calculateSubscriptionPricing,
  getTierDescription,
  getTierDiscountLabel,
  getTierBenefits,
  formatCOP,
  estimateBookingsCount,
  type SubscriptionTier,
} from "@/lib/subscription-pricing";

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
        <h3 className="text-sm font-semibold text-[#211f1a]">
          Booking Frequency
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-[#ff5d46] hover:text-[#eb6c65]"
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
              key={tier}
              onClick={() => onTierChange(tier)}
              className={`relative rounded-lg border p-4 text-left transition ${
                isSelected
                  ? "border-[#ff5d46] bg-[#ff5d46]/5 ring-2 ring-[#ff5d46]/20"
                  : "border-[#e5dfd4] bg-white hover:border-[#ff5d46]/50"
              }`}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -right-1 -top-1 rounded-full bg-[#ff5d46] px-2 py-0.5 text-xs font-semibold text-white">
                  Recommended
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg ${isSelected ? "opacity-100" : "opacity-40"}`}
                    >
                      {isSelected ? "⚫" : "○"}
                    </span>
                    <h4 className="font-semibold text-[#211f1a]">
                      {getTierDescription(tier)}
                    </h4>
                  </div>
                  {discountLabel && (
                    <p className="mt-1 text-xs font-semibold text-[#ff5d46]">
                      💰 {discountLabel}
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mt-3">
                {tier === "none" ? (
                  <p className="text-lg font-bold text-[#211f1a]">
                    {formatCOP(pricing.finalPrice)}
                  </p>
                ) : (
                  <div>
                    <p className="text-xs text-[#7a6d62] line-through">
                      {formatCOP(pricing.basePrice)}
                    </p>
                    <p className="text-lg font-bold text-[#ff5d46]">
                      {formatCOP(pricing.finalPrice)}
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-[#7a6d62]">per booking</p>
              </div>

              {/* Savings Summary */}
              {tier !== "none" && (
                <div className="mt-3 rounded-md bg-[#fdfaf6] px-2 py-1.5 text-xs">
                  <p className="font-semibold text-[#211f1a]">
                    Save {formatCOP(pricing.totalSavingsEstimate || 0)} over 3
                    months
                  </p>
                  <p className="text-[#7a6d62]">
                    ~{estimateBookingsCount(tier, 3)} bookings
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Benefits */}
      {showDetails && selectedTier !== "none" && (
        <div className="rounded-lg border border-[#f0ece5] bg-[#fdfaf6] p-4">
          <h4 className="text-sm font-semibold text-[#211f1a]">
            {getTierDescription(selectedTier)} Benefits
          </h4>
          <ul className="mt-3 space-y-2">
            {getTierBenefits(selectedTier).map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-[#ff5d46]">✓</span>
                <span className="text-[#7a6d62]">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Cancellation Policy */}
          <div className="mt-4 rounded-md bg-white p-3 text-xs text-[#7a6d62]">
            <p className="font-semibold text-[#211f1a]">
              Flexible cancellation
            </p>
            <p className="mt-1">
              You can skip one booking, pause your subscription, or cancel
              anytime with 24-hour notice. No long-term commitment required.
            </p>
          </div>
        </div>
      )}

      {/* One-time booking info */}
      {selectedTier === "none" && showDetails && (
        <div className="rounded-lg border border-[#f0ece5] bg-white p-4">
          <p className="text-sm text-[#7a6d62]">
            💡 <span className="font-semibold">Tip:</span> Switch to recurring
            bookings anytime to unlock discounts and priority service. You can
            always pause or cancel.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Inline pricing display showing savings
 */
export function SubscriptionPricingBadge({
  basePrice,
  tier,
}: {
  basePrice: number;
  tier: SubscriptionTier;
}) {
  if (tier === "none") return null;

  const pricing = calculateSubscriptionPricing(basePrice, tier);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#ff5d46]/10 px-3 py-1">
      <span className="text-xs font-semibold text-[#ff5d46]">
        💰 {pricing.discountPercent}% OFF
      </span>
      <span className="text-xs text-[#7a6d62]">
        Save {formatCOP(pricing.savingsPerBooking)} per booking
      </span>
    </div>
  );
}
