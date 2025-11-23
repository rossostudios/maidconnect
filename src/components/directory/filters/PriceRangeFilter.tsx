"use client";

/**
 * PriceRangeFilter - Minimal Lia Design System
 *
 * Clean price range filter with slider and min/max inputs.
 */

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PriceRangeFilterProps = {
  minRate: number | null;
  maxRate: number | null;
  onMinRateChange: (value: number | null) => void;
  onMaxRateChange: (value: number | null) => void;
  currency?: string;
  className?: string;
  compact?: boolean;
};

// Price range bounds (COP)
const MIN_PRICE = 0;
const MAX_PRICE = 150_000;
const STEP = 5000;

export function PriceRangeFilter({
  minRate,
  maxRate,
  onMinRateChange,
  onMaxRateChange,
  currency = "COP",
  className,
  compact = false,
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState(minRate?.toString() || "");
  const [localMax, setLocalMax] = useState(maxRate?.toString() || "");
  const [sliderMin, setSliderMin] = useState(minRate ?? MIN_PRICE);
  const [sliderMax, setSliderMax] = useState(maxRate ?? MAX_PRICE);

  // Sync slider with external state changes
  useEffect(() => {
    setSliderMin(minRate ?? MIN_PRICE);
    setSliderMax(maxRate ?? MAX_PRICE);
    setLocalMin(minRate?.toString() || "");
    setLocalMax(maxRate?.toString() || "");
  }, [minRate, maxRate]);

  const handleMinBlur = () => {
    const value = localMin ? Number.parseInt(localMin, 10) : null;
    if (value !== null && Number.isNaN(value)) {
      return;
    }
    onMinRateChange(value);
    setSliderMin(value ?? MIN_PRICE);
  };

  const handleMaxBlur = () => {
    const value = localMax ? Number.parseInt(localMax, 10) : null;
    if (value !== null && Number.isNaN(value)) {
      return;
    }
    onMaxRateChange(value);
    setSliderMax(value ?? MAX_PRICE);
  };

  const handleSliderMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      const newMin = Math.min(value, sliderMax - STEP);
      setSliderMin(newMin);
      setLocalMin(newMin > MIN_PRICE ? newMin.toString() : "");
    },
    [sliderMax]
  );

  const handleSliderMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      const newMax = Math.max(value, sliderMin + STEP);
      setSliderMax(newMax);
      setLocalMax(newMax < MAX_PRICE ? newMax.toString() : "");
    },
    [sliderMin]
  );

  const handleSliderCommit = () => {
    onMinRateChange(sliderMin > MIN_PRICE ? sliderMin : null);
    onMaxRateChange(sliderMax < MAX_PRICE ? sliderMax : null);
  };

  // Calculate percentage for slider track fill
  const minPercent = ((sliderMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPercent = ((sliderMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          className="w-24"
          onBlur={handleMinBlur}
          onChange={(e) => setLocalMin(e.target.value)}
          placeholder="Min"
          type="number"
          value={localMin}
        />
        <span className="text-neutral-400">–</span>
        <Input
          className="w-24"
          onBlur={handleMaxBlur}
          onChange={(e) => setLocalMax(e.target.value)}
          placeholder="Max"
          type="number"
          value={localMax}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section label */}
      <p className="font-medium text-neutral-700 text-sm">
        Price Range <span className="font-normal text-neutral-400">({currency}/hr)</span>
      </p>

      {/* Dual-thumb slider */}
      <div className="relative h-6">
        {/* Track background */}
        <div className="-translate-y-1/2 absolute top-1/2 right-2 left-2 h-1 rounded-full bg-neutral-200" />

        {/* Active track */}
        <div
          className="-translate-y-1/2 absolute top-1/2 h-1 rounded-full bg-orange-400"
          style={{
            left: `calc(${minPercent}% + ${8 - minPercent * 0.16}px)`,
            right: `calc(${100 - maxPercent}% + ${8 - (100 - maxPercent) * 0.16}px)`,
          }}
        />

        {/* Min slider */}
        <input
          className="pointer-events-none absolute top-0 h-6 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-400 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-400 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:hover:border-orange-500"
          max={MAX_PRICE}
          min={MIN_PRICE}
          onChange={handleSliderMinChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          step={STEP}
          style={{ zIndex: sliderMin > MAX_PRICE - 10 ? 5 : 3 }}
          type="range"
          value={sliderMin}
        />

        {/* Max slider */}
        <input
          className="pointer-events-none absolute top-0 h-6 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-400 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-400 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:hover:border-orange-500"
          max={MAX_PRICE}
          min={MIN_PRICE}
          onChange={handleSliderMaxChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          step={STEP}
          style={{ zIndex: 4 }}
          type="range"
          value={sliderMax}
        />
      </div>

      {/* Min/Max inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-neutral-500 text-xs" htmlFor="price-min">
            Min
          </label>
          <Input
            className="h-9"
            id="price-min"
            min={0}
            onBlur={handleMinBlur}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder="0"
            type="number"
            value={localMin}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-neutral-500 text-xs" htmlFor="price-max">
            Max
          </label>
          <Input
            className="h-9"
            id="price-max"
            min={0}
            onBlur={handleMaxBlur}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder="No limit"
            type="number"
            value={localMax}
          />
        </div>
      </div>
    </div>
  );
}
