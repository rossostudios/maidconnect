"use client";

import { Cancel01Icon, Edit02Icon, LockIcon, SquareUnlock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";
import { geistSans } from "@/app/fonts";
import { formatFromMinorUnits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SelectionActionPanelProps } from "./types";

/**
 * Bottom action panel that slides up when dates are selected
 * Airbnb-style floating panel with Block/Open actions
 */
export const SelectionActionPanel = memo(function SelectionActionPanel({
  selectedDates,
  hourlyRateCents,
  currency,
  onBlock,
  onOpen,
  onEditRate,
  onClear,
  isVisible,
  isLoading = false,
  className,
}: SelectionActionPanelProps) {
  const t = useTranslations("proCalendar.actionPanel");

  // Format selected date range for display
  const dateRangeSummary = useMemo(() => {
    if (selectedDates.length === 0) {
      return "";
    }
    const firstDate = selectedDates[0];
    if (selectedDates.length === 1 && firstDate) {
      const date = new Date(firstDate);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    }

    // Sort dates to get range
    const sortedDates = [...selectedDates].sort();
    const firstSorted = sortedDates[0];
    const lastSorted = sortedDates.at(-1);
    if (!(firstSorted && lastSorted)) {
      return "";
    }

    const startDate = new Date(firstSorted);
    const endDate = new Date(lastSorted);

    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    });

    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  }, [selectedDates]);

  // Format hourly rate
  const formattedRate = useMemo(
    () => formatFromMinorUnits(hourlyRateCents, currency),
    [hourlyRateCents, currency]
  );

  // Count label
  const countLabel =
    selectedDates.length === 1 ? t("oneDay") : t("multipleDays", { count: selectedDates.length });

  return (
    <AnimatePresence>
      {isVisible && selectedDates.length > 0 && (
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50",
            "border-neutral-200 border-t bg-white dark:border-neutral-800 dark:bg-neutral-900",
            "shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]",
            "pb-safe", // Safe area for iOS home indicator
            className
          )}
          exit={{ y: 100, opacity: 0 }}
          initial={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="mx-auto max-w-2xl px-4 py-4">
            {/* Top row: Date summary + Rate */}
            <div className="mb-4 flex items-center justify-between">
              {/* Date range summary */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-semibold text-base text-neutral-900 dark:text-neutral-100",
                    geistSans.className
                  )}
                >
                  {dateRangeSummary}
                </span>
                <span
                  className={cn(
                    "text-neutral-500 text-sm dark:text-neutral-400",
                    geistSans.className
                  )}
                >
                  {countLabel}
                </span>
              </div>

              {/* Rate display with edit button */}
              <button
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2",
                  "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700",
                  "transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900"
                )}
                onClick={onEditRate}
                type="button"
              >
                <span
                  className={cn(
                    "font-semibold text-base text-neutral-900 dark:text-neutral-100",
                    geistSans.className
                  )}
                >
                  {formattedRate}
                </span>
                <HugeiconsIcon
                  className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
                  icon={Edit02Icon}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* Bottom row: Action buttons */}
            <div className="flex items-center gap-3">
              {/* Block nights button */}
              <button
                className={cn(
                  "flex flex-1 items-center justify-center gap-2",
                  "h-12 rounded-lg",
                  "border-2 border-neutral-900 bg-white dark:border-white dark:bg-neutral-900",
                  "font-semibold text-neutral-900 text-sm dark:text-white",
                  "transition-all duration-150",
                  "hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900",
                  "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  geistSans.className
                )}
                disabled={isLoading}
                onClick={onBlock}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={LockIcon} strokeWidth={2} />
                {t("blockNights")}
              </button>

              {/* Open button */}
              <button
                className={cn(
                  "flex flex-1 items-center justify-center gap-2",
                  "h-12 rounded-lg",
                  "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
                  "font-semibold text-sm",
                  "transition-all duration-150",
                  "hover:bg-neutral-800 dark:hover:bg-neutral-100",
                  "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  geistSans.className
                )}
                disabled={isLoading}
                onClick={onOpen}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={SquareUnlock01Icon} strokeWidth={2} />
                {t("open")}
              </button>

              {/* Clear selection button */}
              <button
                aria-label={t("clearSelection")}
                className={cn(
                  "flex items-center justify-center",
                  "h-12 w-12 rounded-lg",
                  "border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800",
                  "text-neutral-500 dark:text-neutral-400",
                  "transition-all duration-150",
                  "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200",
                  "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900"
                )}
                onClick={onClear}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} strokeWidth={2} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
