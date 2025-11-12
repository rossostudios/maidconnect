"use client";

import { InformationCircleIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { TipSelector } from "@/components/payments/tip-selector";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { type Currency, formatCurrency } from "@/lib/format";

/**
 * Checkout Summary Component
 *
 * Displays booking cost breakdown with optional tipping
 * Research: 67% of users always tip at service locations (Bankrate 2024)
 */

type CheckoutSummaryProps = {
  serviceName: string;
  baseAmount: number;
  taxRate?: number; // Defaults to 0.19 (19% VAT for Colombia)
  currency?: Currency;
  durationHours?: number;
  hourlyRate?: number;
  onTipChange?: (tipAmount: number) => void;
  recurringDiscount?: number;
  showTipping?: boolean;
};

export function CheckoutSummary({
  serviceName,
  baseAmount,
  taxRate = 0.19,
  currency = "COP",
  durationHours,
  hourlyRate,
  onTipChange,
  recurringDiscount,
  showTipping = true,
}: CheckoutSummaryProps) {
  const tippingEnabled = isFeatureEnabled("enable_tipping") && showTipping;
  const taxAmount = Math.round(baseAmount * taxRate);

  // State for tip amount (managed internally if no callback provided)
  const [tipAmount, setTipAmount] = useState(0);

  // State for deposit tooltip visibility
  const [showDepositInfo, setShowDepositInfo] = useState(false);

  const handleTipChange = (amount: number) => {
    setTipAmount(amount);
    onTipChange?.(amount);
  };

  const subtotal = baseAmount;
  const totalAmount = subtotal + taxAmount + tipAmount;

  return (
    <div className="space-y-6">
      {/* Service Summary */}
      <div className="rounded-2xl border border-[neutral-200] bg-[neutral-50] p-6">
        <h3 className="mb-4 font-semibold text-[neutral-900] text-lg">Booking Summary</h3>

        <div className="space-y-3">
          {/* Service Name */}
          <div className="flex justify-between">
            <span className="text-[neutral-400] text-sm">Service</span>
            <span className="font-medium text-[neutral-900] text-sm">{serviceName}</span>
          </div>

          {/* Duration (if provided) */}
          {durationHours && hourlyRate && (
            <div className="flex justify-between">
              <span className="text-[neutral-400] text-sm">Duration</span>
              <span className="text-[neutral-900] text-sm">
                {formatCurrency(hourlyRate, { currency })} × {durationHours}h
              </span>
            </div>
          )}

          <div className="border-[neutral-200] border-t pt-3">
            <div className="flex justify-between">
              <span className="text-[neutral-400] text-sm">Subtotal</span>
              <span className="font-semibold text-[neutral-900] text-sm">
                {formatCurrency(subtotal, { currency })}
              </span>
            </div>
          </div>

          {/* Recurring Discount (if applicable) */}
          {recurringDiscount && recurringDiscount > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-[neutral-500]/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-4 w-4 text-[neutral-500]" icon={Tick02Icon} />
                <span className="font-medium text-[neutral-500] text-sm">Recurring discount</span>
              </div>
              <span className="font-semibold text-[neutral-500] text-sm">
                -{formatCurrency(recurringDiscount, { currency })}
              </span>
            </div>
          )}

          {/* Tax */}
          <div className="flex justify-between">
            <span className="text-[neutral-400] text-sm">Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span className="text-[neutral-900] text-sm">
              {formatCurrency(taxAmount, { currency })}
            </span>
          </div>

          {/* Tip Line (if enabled) */}
          {tippingEnabled && tipAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-[neutral-400] text-sm">Tip</span>
              <span className="font-medium text-[neutral-500] text-sm">
                {formatCurrency(tipAmount, { currency })}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between border-[neutral-200] border-t pt-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[neutral-900]">Total</span>
              <button
                aria-label="Payment information"
                className="text-[neutral-400] transition-colors hover:text-[neutral-900]"
                onClick={() => setShowDepositInfo(!showDepositInfo)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={InformationCircleIcon} />
              </button>
            </div>
            <span className="font-bold text-2xl text-[neutral-500]">
              {formatCurrency(totalAmount, { currency })}
            </span>
          </div>

          {/* Deposit Information Tooltip */}
          {showDepositInfo && (
            <div className="rounded-lg bg-[neutral-50] p-4 text-sm">
              <p className="mb-2 font-medium text-[neutral-500]">How payment works</p>
              <p className="text-[neutral-500] leading-relaxed">
                We place a temporary hold (not a charge) on your payment method to secure your
                booking. The amount is only captured after the service is completed. If you cancel
                within the free cancellation window, the hold is released immediately.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tip Selector (if enabled) */}
      {tippingEnabled && (
        <TipSelector
          baseAmount={baseAmount}
          currency={currency}
          initialTip={tipAmount}
          onTipChange={handleTipChange}
        />
      )}

      {/* Cancellation Policy */}
      <div className="rounded-2xl border border-[neutral-200] bg-[neutral-50] p-6">
        <h3 className="mb-3 font-semibold text-[neutral-900] text-base">Cancellation Policy</h3>
        <div className="space-y-2 text-[neutral-400] text-sm">
          <p className="leading-relaxed">
            Free reschedule up to <span className="font-semibold text-[neutral-900]">24 hours</span>{" "}
            before your service. Cancelling inside 24 hours may incur fees to respect your
            professional's time:
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <span className="font-medium text-[neutral-900]">24+ hours:</span> 100% refund
            </li>
            <li>
              <span className="font-medium text-[neutral-900]">12-24 hours:</span> 50% refund
            </li>
            <li>
              <span className="font-medium text-[neutral-900]">4-12 hours:</span> 25% refund
            </li>
            <li>
              <span className="font-medium text-[neutral-900]">Less than 4 hours:</span> No refund
            </li>
          </ul>
          <p className="pt-2 text-[neutral-400] text-xs italic">
            Once the service starts, cancellation is not possible.
          </p>
        </div>
      </div>
    </div>
  );
}
