"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

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
  currency?: string;
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);

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
    <div className="space-y-4 rounded-2xl border border-[#ebe5d8] bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff5f3]">
          <Heart className="h-5 w-5 text-[#ff5d46]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#211f1a] text-base">Add a Tip</h3>
          <p className="text-[#7d7566] text-sm">Show appreciation for great service (optional)</p>
        </div>
      </div>

      {/* Preset Percentages */}
      <div className="grid grid-cols-4 gap-3">
        {PRESET_PERCENTAGES.map((percentage) => {
          const tipAmount = Math.round((baseAmount * percentage) / 100);
          const isSelected = selectedType === "preset" && selectedPercentage === percentage;

          return (
            <button
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-4 transition ${
                isSelected
                  ? "border-[#ff5d46] bg-[#fff5f3]"
                  : "border-[#e5dfd4] bg-white hover:border-[#d4cabb]"
              }`}
              key={percentage}
              onClick={() => handlePresetClick(percentage)}
              type="button"
            >
              <span
                className={`font-bold text-base ${isSelected ? "text-[#ff5d46]" : "text-[#211f1a]"}`}
              >
                {percentage}%
              </span>
              <span className="text-[#7d7566] text-xs">{formatCurrency(tipAmount)}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Amount */}
      <div className="space-y-2">
        <button
          className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition ${
            selectedType === "custom"
              ? "border-[#ff5d46] bg-[#fff5f3] font-semibold text-[#ff5d46]"
              : "border-[#e5dfd4] bg-white text-[#7d7566] hover:border-[#d4cabb]"
          }`}
          onClick={handleCustomClick}
          type="button"
        >
          Custom Amount
        </button>

        {selectedType === "custom" && (
          <div className="relative">
            <span className="absolute top-3 left-3 text-[#7d7566] text-base">$</span>
            <input
              className="w-full rounded-xl border border-[#e5dfd4] py-3 pr-4 pl-8 text-[#211f1a] transition focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
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
        className={`w-full rounded-xl border-2 px-4 py-3 text-center text-sm transition ${
          selectedType === "none"
            ? "border-[#d4cabb] bg-[#f5f2ed] font-medium text-[#211f1a]"
            : "border-[#e5dfd4] bg-white text-[#7d7566] hover:border-[#d4cabb]"
        }`}
        onClick={handleNoTip}
        type="button"
      >
        No Tip
      </button>

      {/* Info Text */}
      <p className="text-center text-[#7d7566] text-xs">
        100% of your tip goes directly to your professional
      </p>
    </div>
  );
}
