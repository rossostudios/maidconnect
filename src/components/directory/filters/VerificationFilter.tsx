"use client";

/**
 * VerificationFilter - Minimal Lia Design System
 *
 * Clean verification filter for boutique marketplace.
 * Note: Background checks are mandatory - all professionals must be background checked.
 */

import { CheckmarkCircle01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type VerificationFilterProps = {
  verifiedOnly: boolean;
  /** @deprecated Background checks are now mandatory - this prop is ignored */
  backgroundChecked?: boolean;
  onVerifiedOnlyChange: (value: boolean) => void;
  /** @deprecated Background checks are now mandatory - this prop is ignored */
  onBackgroundCheckedChange?: (value: boolean) => void;
  className?: string;
  compact?: boolean;
};

export function VerificationFilter({
  verifiedOnly,
  onVerifiedOnlyChange,
  className,
  compact = false,
}: VerificationFilterProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          className={cn(
            "flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium text-sm transition-colors",
            verifiedOnly
              ? "border-rausch-500 bg-rausch-50 text-rausch-600 dark:border-rausch-400 dark:bg-rausch-800/50 dark:text-rausch-100"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-rausch-200 dark:border-rausch-700 dark:bg-rausch-800/30 dark:text-rausch-200 dark:hover:border-rausch-500"
          )}
          onClick={() => onVerifiedOnlyChange(!verifiedOnly)}
          type="button"
        >
          <HugeiconsIcon className="h-3.5 w-3.5" icon={Shield01Icon} />
          Verified
        </button>
        {/* Background checked badge - informational only */}
        <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 font-medium text-green-700 text-xs dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
          <HugeiconsIcon className="h-3 w-3" icon={CheckmarkCircle01Icon} />
          All Background Checked
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section label */}
      <label className="font-medium text-neutral-700 text-sm dark:text-rausch-100">
        Verification
      </label>

      {/* Verified professionals toggle */}
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 font-medium text-sm transition-colors",
          verifiedOnly
            ? "border-rausch-500 bg-rausch-50 text-rausch-600 dark:border-rausch-400 dark:bg-rausch-800/50 dark:text-rausch-100"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-rausch-300 hover:bg-neutral-50 dark:border-rausch-700 dark:bg-rausch-800/30 dark:text-rausch-200 dark:hover:border-rausch-500 dark:hover:bg-rausch-800/50"
        )}
        onClick={() => onVerifiedOnlyChange(!verifiedOnly)}
        type="button"
      >
        <HugeiconsIcon
          className={cn(
            "h-4 w-4",
            verifiedOnly
              ? "text-rausch-500 dark:text-rausch-400"
              : "text-neutral-500 dark:text-rausch-300"
          )}
          icon={Shield01Icon}
        />
        Premium Verified Only
      </button>

      {/* Background check notice - informational */}
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/30">
        <HugeiconsIcon
          className="h-4 w-4 text-green-600 dark:text-green-400"
          icon={CheckmarkCircle01Icon}
        />
        <span className="text-green-700 text-xs dark:text-green-300">
          All professionals are background checked
        </span>
      </div>
    </div>
  );
}
