"use client";

import { Tick02Icon } from "hugeicons-react";
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

  const handleTipChange = (amount: number) => {
    setTipAmount(amount);
    onTipChange?.(amount);
  };

  const subtotal = baseAmount;
  const totalAmount = subtotal + taxAmount + tipAmount;

  return (
    <div className="space-y-6">
      {/* Service Summary */}
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <h3 className="mb-4 font-semibold text-[var(--foreground)] text-lg">Booking Summary</h3>

        <div className="space-y-3">
          {/* Service Name */}
          <div className="flex justify-between">
            <span className="text-[#7d7566] text-sm">Service</span>
            <span className="font-medium text-[var(--foreground)] text-sm">{serviceName}</span>
          </div>

          {/* Duration (if provided) */}
          {durationHours && hourlyRate && (
            <div className="flex justify-between">
              <span className="text-[#7d7566] text-sm">Duration</span>
              <span className="text-[var(--foreground)] text-sm">
                {formatCurrency(hourlyRate, { currency })} × {durationHours}h
              </span>
            </div>
          )}

          <div className="border-[#ebe5d8] border-t pt-3">
            <div className="flex justify-between">
              <span className="text-[#7d7566] text-sm">Subtotal</span>
              <span className="font-semibold text-[var(--foreground)] text-sm">
                {formatCurrency(subtotal, { currency })}
              </span>
            </div>
          </div>

          {/* Recurring Discount (if applicable) */}
          {recurringDiscount && recurringDiscount > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Tick02Icon className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 text-sm">Recurring discount</span>
              </div>
              <span className="font-semibold text-green-600 text-sm">
                -{formatCurrency(recurringDiscount, { currency })}
              </span>
            </div>
          )}

          {/* Tax */}
          <div className="flex justify-between">
            <span className="text-[#7d7566] text-sm">Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span className="text-[var(--foreground)] text-sm">
              {formatCurrency(taxAmount, { currency })}
            </span>
          </div>

          {/* Tip Line (if enabled) */}
          {tippingEnabled && tipAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-[#7d7566] text-sm">Tip</span>
              <span className="font-medium text-[var(--red)] text-sm">
                {formatCurrency(tipAmount, { currency })}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between border-[#ebe5d8] border-t pt-3">
            <span className="font-bold text-[var(--foreground)]">Total</span>
            <span className="font-bold text-2xl text-[var(--red)]">
              {formatCurrency(totalAmount, { currency })}
            </span>
          </div>
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
    </div>
  );
}
