"use client";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { type Currency, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Tip Selector Component
 *
 * Research insights applied:
 * - Pew Research: Most Americans tip 15-20% at service locations
 * - Bankrate: 67% always tip at sit-down restaurants
 * - Smart prompts with preset percentages increase tip amounts by 8-15%
 * - Sunday app: Pre-calculated suggestions remove guesswork and increase tips
 * - Consumer Reports: 20% baseline has become more common ("tipflation")
 */

type TipSelectorProps = {
  baseAmount: number; // Amount before tip
  currency?: Currency;
  onTipChange: (tipAmount: number) => void;
  initialTip?: number;
};

const PRESET_PERCENTAGES = [15, 18, 20, 25] as const;

export function TipSelector({
  baseAmount,
  currency = "COP",
  onTipChange,
  initialTip = 0,
}: TipSelectorProps) {
  const [selectedType, setSelectedType] = useState<"preset" | "custom" | "none">(
    initialTip === 0 ? "none" : "preset"
  );
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    initialTip > 0 ? 20 : null
  );
  const [customAmount, setCustomAmount] = useState<string>("");

  const handlePresetClick = (percentage: number) => {
    const tipAmount = Math.round((baseAmount * percentage) / 100);
    setSelectedType("preset");
    setSelectedPercentage(percentage);
    setCustomAmount("");
    onTipChange(tipAmount);
  };

  const handleCustomClick = () => {
    setSelectedType("custom");
    setSelectedPercentage(null);
    if (customAmount) {
      const amount = Number.parseFloat(customAmount);
      if (!Number.isNaN(amount) && amount >= 0) {
        onTipChange(Math.round(amount));
      }
    } else {
      onTipChange(0);
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = Number.parseFloat(value);
    if (!Number.isNaN(amount) && amount >= 0) {
      setSelectedType("custom");
      setSelectedPercentage(null);
      onTipChange(Math.round(amount));
    }
  };

  const handleNoTip = () => {
    setSelectedType("none");
    setSelectedPercentage(null);
    setCustomAmount("");
    onTipChange(0);
  };

  return (
    <Card className="border-stone-200 bg-white">
      <CardContent className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
            <HugeiconsIcon className="h-5 w-5 text-stone-700" icon={FavouriteIcon} />
          </div>
          <div>
            <h3 className="font-semibold text-base text-stone-900">Add a Tip</h3>
            <p className="text-stone-600 text-sm">Show appreciation for great service (optional)</p>
          </div>
        </div>

        {/* Preset Percentages */}
        <div className="grid grid-cols-4 gap-3">
          {PRESET_PERCENTAGES.map((percentage) => {
            const tipAmount = Math.round((baseAmount * percentage) / 100);
            const isSelected = selectedType === "preset" && selectedPercentage === percentage;

            return (
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-4 transition",
                  isSelected
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                )}
                key={percentage}
                onClick={() => handlePresetClick(percentage)}
                type="button"
              >
                <span
                  className={cn(
                    "font-bold text-base",
                    isSelected ? "text-stone-900" : "text-stone-700"
                  )}
                >
                  {percentage}%
                </span>
                <span className="text-stone-600 text-xs">
                  {formatCurrency(tipAmount, { currency })}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <button
            className={cn(
              "w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition",
              selectedType === "custom"
                ? "border-stone-900 bg-stone-50 font-semibold text-stone-900"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
            )}
            onClick={handleCustomClick}
            type="button"
          >
            Custom Amount
          </button>

          {selectedType === "custom" && (
            <div className="relative">
              <span className="absolute top-3 left-3 text-base text-stone-600">$</span>
              <input
                className="w-full rounded-xl border border-stone-300 py-3 pr-4 pl-8 text-stone-900 transition focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200"
                inputMode="decimal"
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="0"
                type="number"
                value={customAmount}
              />
            </div>
          )}
        </div>

        {/* No Tip Option */}
        <button
          className={cn(
            "w-full rounded-xl border-2 px-4 py-3 text-center text-sm transition",
            selectedType === "none"
              ? "border-stone-300 bg-stone-50 font-medium text-stone-900"
              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
          )}
          onClick={handleNoTip}
          type="button"
        >
          No Tip
        </button>

        {/* Info Text */}
        <p className="text-center text-stone-500 text-xs">
          100% of your tip goes directly to your professional
        </p>
      </CardContent>
    </Card>
  );
}
