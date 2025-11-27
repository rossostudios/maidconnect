"use client";

/**
 * FeeTransparencySection - Collapsible Platform Fee Breakdown
 *
 * Ultra-minimal Airbnb-inspired design:
 * - Collapsed by default (single line showing total fee %)
 * - Expands to show full fee breakdown + example calculation
 * - Clean animation with chevron indicator
 */

import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  MoneyBag01Icon,
  PercentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { geistSans } from "@/app/fonts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/core";
import { formatCurrency } from "@/lib/utils/format";
import type { HugeIcon } from "@/types/icons";

// ============================================================================
// Types
// ============================================================================

export type CurrencyCode = "COP" | "PYG" | "UYU" | "ARS" | "USD";

export type FeeBreakdown = {
  platformFeePercent: number;
  processingFeePercent?: number;
  taxWithholdingPercent?: number;
};

export type FeeTransparencySectionProps = {
  fees: FeeBreakdown;
  currency: CurrencyCode;
  exampleAmount?: number;
  isReducedFeeTier?: boolean;
  reducedFeePercent?: number;
  className?: string;
};

// ============================================================================
// Main Component
// ============================================================================

export function FeeTransparencySection({
  fees,
  currency,
  exampleAmount = 100_000,
  isReducedFeeTier = false,
  reducedFeePercent,
  className,
}: FeeTransparencySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const effectivePlatformFee =
    isReducedFeeTier && reducedFeePercent ? reducedFeePercent : fees.platformFeePercent;

  const totalFeePercent =
    effectivePlatformFee + (fees.processingFeePercent || 0) + (fees.taxWithholdingPercent || 0);

  const exampleFee = Math.round(exampleAmount * (totalFeePercent / 100));
  const exampleEarnings = exampleAmount - exampleFee;

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {/* Collapsed Header (Always Visible) */}
      <button
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-rausch-50 dark:bg-rausch-900/20">
            <HugeiconsIcon className="size-5 text-rausch-500" icon={PercentIcon} />
          </div>
          <div>
            <p className={cn("font-medium text-foreground text-sm", geistSans.className)}>
              Your Earnings
            </p>
            <p className={cn("text-muted-foreground text-xs", geistSans.className)}>
              You keep 100% of your rate – customers pay the service fee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isReducedFeeTier && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 font-medium text-green-700 text-xs dark:bg-green-900/20 dark:text-green-400">
              <HugeiconsIcon className="size-3" icon={CheckmarkCircle02Icon} />
              Reduced
            </span>
          )}
          <span
            className={cn(
              "font-semibold text-foreground text-lg tabular-nums",
              geistSans.className
            )}
          >
            {totalFeePercent}%
          </span>
          <HugeiconsIcon
            className={cn(
              "size-5 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
            icon={ArrowDown01Icon}
          />
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="border-border border-t px-4 pt-3 pb-4">
              {/* Fee Breakdown */}
              <div className="space-y-2.5">
                <FeeLineItem
                  icon={MoneyBag01Icon}
                  label="Service fee (paid by customer)"
                  originalPercent={isReducedFeeTier ? fees.platformFeePercent : undefined}
                  percent={effectivePlatformFee}
                  tooltip="This fee is paid by the customer, not deducted from your earnings"
                />

                {fees.processingFeePercent && fees.processingFeePercent > 0 && (
                  <FeeLineItem
                    icon={PercentIcon}
                    label="Payment processing"
                    percent={fees.processingFeePercent}
                    tooltip="Credit card and payment gateway fees"
                  />
                )}

                {fees.taxWithholdingPercent && fees.taxWithholdingPercent > 0 && (
                  <FeeLineItem
                    icon={PercentIcon}
                    label="Tax withholding"
                    percent={fees.taxWithholdingPercent}
                    tooltip="Required tax withholding based on local regulations"
                  />
                )}
              </div>

              {/* Example Calculation */}
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p
                  className={cn(
                    "mb-2 font-medium text-muted-foreground text-xs",
                    geistSans.className
                  )}
                >
                  Example: {formatCurrency(exampleAmount / 100, { currency })} booking
                </p>
                <div className="flex items-center justify-between">
                  <span className={cn("text-muted-foreground text-sm", geistSans.className)}>
                    After {totalFeePercent}% fees
                  </span>
                  <span
                    className={cn(
                      "font-semibold text-green-600 text-sm dark:text-green-400",
                      geistSans.className
                    )}
                  >
                    {formatCurrency(exampleEarnings / 100, { currency })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Fee Line Item
// ============================================================================

type FeeLineItemProps = {
  icon: HugeIcon;
  label: string;
  percent: number;
  originalPercent?: number;
  tooltip: string;
};

function FeeLineItem({ icon, label, percent, originalPercent, tooltip }: FeeLineItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <HugeiconsIcon className="size-4 text-muted-foreground" icon={icon} />
        <span className={cn("text-muted-foreground text-sm", geistSans.className)}>{label}</span>
        <Tooltip>
          <TooltipTrigger>
            <HugeiconsIcon
              className="size-3.5 text-muted-foreground"
              icon={InformationCircleIcon}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        {originalPercent && originalPercent !== percent && (
          <span className="text-muted-foreground/60 text-sm line-through">{originalPercent}%</span>
        )}
        <span
          className={cn(
            "font-medium text-sm tabular-nums",
            originalPercent && originalPercent !== percent
              ? "text-green-600 dark:text-green-400"
              : "text-foreground",
            geistSans.className
          )}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Compact Fee Badge (for use in cards)
// ============================================================================

export type FeeBadgeProps = {
  feePercent: number;
  className?: string;
};

function FeeBadge({ feePercent, className }: FeeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs",
        className
      )}
    >
      <HugeiconsIcon className="size-3" icon={PercentIcon} />
      {feePercent}% fee
    </span>
  );
}
