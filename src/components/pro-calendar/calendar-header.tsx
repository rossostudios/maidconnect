"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { memo } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { CalendarHeaderProps } from "./types";

/**
 * Calendar header with month/year label and navigation controls
 * Airbnb-style minimal design with clear touch targets
 */
export const CalendarHeader = memo(function CalendarHeader({
  monthLabel,
  onPrevious,
  onNext,
  onToday,
  className,
}: CalendarHeaderProps) {
  const t = useTranslations("datePicker");

  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      {/* Left: Previous month button */}
      <button
        aria-label={t("previousMonth")}
        className={cn(
          "flex items-center justify-center",
          "h-10 w-10 rounded-full",
          "border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800",
          "text-neutral-700 transition-all duration-150 dark:text-neutral-300",
          "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
          "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900",
          "active:scale-95"
        )}
        onClick={onPrevious}
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} strokeWidth={2} />
      </button>

      {/* Center: Month/Year label + Today button */}
      <div className="flex items-center gap-3">
        <h2
          className={cn(
            "font-semibold text-lg text-neutral-900 dark:text-neutral-100",
            geistSans.className
          )}
        >
          {monthLabel}
        </h2>
        <button
          className={cn(
            "rounded-full px-3 py-1.5",
            "font-medium text-xs",
            "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
            "transition-all duration-150",
            "hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
            "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900",
            "active:scale-95",
            geistSans.className
          )}
          onClick={onToday}
          type="button"
        >
          {t("today")}
        </button>
      </div>

      {/* Right: Next month button */}
      <button
        aria-label={t("nextMonth")}
        className={cn(
          "flex items-center justify-center",
          "h-10 w-10 rounded-full",
          "border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800",
          "text-neutral-700 transition-all duration-150 dark:text-neutral-300",
          "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
          "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900",
          "active:scale-95"
        )}
        onClick={onNext}
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} strokeWidth={2} />
      </button>
    </div>
  );
});
