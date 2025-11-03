"use client";

import { Check } from "lucide-react";
import { TipSelector } from "@/components/payments/tip-selector";
import { isFeatureEnabled } from "@/lib/feature-flags";

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
  currency?: string;
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
  const [tipAmount, setTipAmount] = React.useState(0);

  const handleTipChange = (amount: number) => {
    setTipAmount(amount);
    onTipChange?.(amount);
  };

  const subtotal = baseAmount;
  const totalAmount = subtotal + taxAmount + tipAmount;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Service Summary */}
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <h3 className="mb-4 font-semibold text-[#211f1a] text-lg">Booking Summary</h3>

        <div className="space-y-3">
          {/* Service Name */}
          <div className="flex justify-between">
            <span className="text-[#7d7566] text-sm">Service</span>
            <span className="font-medium text-[#211f1a] text-sm">{serviceName}</span>
          </div>

          {/* Duration (if provided) */}
          {durationHours && hourlyRate && (
            <div className="flex justify-between">
              <span className="text-[#7d7566] text-sm">Duration</span>
              <span className="text-[#211f1a] text-sm">
                {formatCurrency(hourlyRate)} × {durationHours}h
              </span>
            </div>
          )}

          <div className="border-[#ebe5d8] border-t pt-3">
            <div className="flex justify-between">
              <span className="text-[#7d7566] text-sm">Subtotal</span>
              <span className="font-semibold text-[#211f1a] text-sm">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>

          {/* Recurring Discount (if applicable) */}
          {recurringDiscount && recurringDiscount > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 text-sm">Recurring discount</span>
              </div>
              <span className="font-semibold text-green-600 text-sm">
                -{formatCurrency(recurringDiscount)}
              </span>
            </div>
          )}

          {/* Tax */}
          <div className="flex justify-between">
            <span className="text-[#7d7566] text-sm">Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span className="text-[#211f1a] text-sm">{formatCurrency(taxAmount)}</span>
          </div>

          {/* Tip Line (if enabled) */}
          {tippingEnabled && tipAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-[#7d7566] text-sm">Tip</span>
              <span className="font-medium text-[#8B7355] text-sm">
                {formatCurrency(tipAmount)}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between border-[#ebe5d8] border-t pt-3">
            <span className="font-bold text-[#211f1a]">Total</span>
            <span className="font-bold text-2xl text-[#8B7355]">{formatCurrency(totalAmount)}</span>
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

// Need to import React for useState
import React from "react";
