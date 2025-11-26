"use client";

/**
 * RatingFilter - Minimal Lia Design System
 *
 * Clean inline rating selector for boutique marketplace.
 */

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type RatingFilterProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
  compact?: boolean;
};

const RATING_OPTIONS = [
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4+" },
  { value: 3.5, label: "3.5+" },
  { value: 3.0, label: "3+" },
];

export function RatingFilter({ value, onChange, className, compact = false }: RatingFilterProps) {
  const handleClick = (rating: number) => {
    onChange(value === rating ? null : rating);
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {RATING_OPTIONS.map((opt) => (
          <button
            className={cn(
              "flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium text-sm transition-colors",
              value === opt.value
                ? "border-rausch-500 bg-rausch-50 text-rausch-600 dark:border-rausch-400 dark:bg-rausch-800/50 dark:text-rausch-100"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-rausch-200 dark:border-rausch-700 dark:bg-rausch-800/30 dark:text-rausch-200 dark:hover:border-rausch-500"
            )}
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            type="button"
          >
            <HugeiconsIcon
              className="h-3.5 w-3.5 text-rausch-500 dark:text-rausch-400"
              icon={StarIcon}
            />
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section label */}
      <label className="font-medium text-neutral-700 text-sm dark:text-rausch-100">
        Minimum Rating
      </label>

      {/* Inline rating options */}
      <div className="flex flex-wrap gap-2">
        {RATING_OPTIONS.map((opt) => (
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 font-medium text-sm transition-colors",
              value === opt.value
                ? "border-rausch-500 bg-rausch-50 text-rausch-600 dark:border-rausch-400 dark:bg-rausch-800/50 dark:text-rausch-100"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-rausch-300 hover:bg-neutral-50 dark:border-rausch-700 dark:bg-rausch-800/30 dark:text-rausch-200 dark:hover:border-rausch-500 dark:hover:bg-rausch-800/50"
            )}
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            type="button"
          >
            <HugeiconsIcon
              className={cn(
                "h-4 w-4",
                value === opt.value
                  ? "text-rausch-500 dark:text-rausch-400"
                  : "text-rausch-400 dark:text-rausch-500"
              )}
              icon={StarIcon}
            />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
