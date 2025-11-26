"use client";

import { Cancel01Icon, Money01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { memo, useCallback, useState } from "react";
import { geistSans } from "@/app/fonts";
import { formatFromMinorUnits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PriceEditorModalProps } from "./types";

/**
 * Modal for editing hourly rate on selected dates
 * Airbnb-style centered modal with backdrop
 */
export const PriceEditorModal = memo(function PriceEditorModal({
  isOpen,
  onClose,
  selectedDates,
  currentRateCents,
  currency,
  onSave,
}: PriceEditorModalProps) {
  const t = useTranslations("proCalendar.priceEditor");
  const [rateCents, setRateCents] = useState(currentRateCents);
  const [isSaving, setIsSaving] = useState(false);

  // Convert cents to display value (dollars/major units)
  const displayValue = (rateCents / 100).toFixed(2);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    const numericValue = Number.parseFloat(value) || 0;
    setRateCents(Math.round(numericValue * 100));
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(rateCents);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }, [rateCents, onSave, onClose]);

  // Format date range for display
  const dateRangeLabel =
    selectedDates.length === 1 && selectedDates[0]
      ? new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(selectedDates[0]))
      : `${selectedDates.length} ${t("days")}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-neutral-900/60"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "fixed top-1/2 left-1/2 z-50",
              "-translate-x-1/2 -translate-y-1/2 w-full max-w-md",
              "rounded-2xl bg-white shadow-2xl dark:bg-neutral-900",
              "overflow-hidden"
            )}
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-neutral-200 border-b px-6 py-4 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rausch-50">
                  <HugeiconsIcon
                    className="h-5 w-5 text-rausch-500"
                    icon={Money01Icon}
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h2
                    className={cn(
                      "font-semibold text-lg text-neutral-900 dark:text-neutral-100",
                      geistSans.className
                    )}
                  >
                    {t("title")}
                  </h2>
                  <p
                    className={cn(
                      "text-neutral-500 text-sm dark:text-neutral-400",
                      geistSans.className
                    )}
                  >
                    {dateRangeLabel}
                  </p>
                </div>
              </div>
              <button
                aria-label={t("close")}
                className={cn(
                  "flex items-center justify-center",
                  "h-8 w-8 rounded-full",
                  "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                  "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  "transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900"
                )}
                onClick={onClose}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <label
                className={cn(
                  "mb-2 block font-medium text-neutral-700 text-sm dark:text-neutral-300",
                  geistSans.className
                )}
                htmlFor="hourly-rate"
              >
                {t("hourlyRate")}
              </label>
              <div className="relative">
                <span
                  className={cn(
                    "-translate-y-1/2 absolute top-1/2 left-4",
                    "font-medium text-lg text-neutral-500 dark:text-neutral-400",
                    geistSans.className
                  )}
                >
                  {currency === "COP" ? "$" : currency === "USD" ? "$" : "€"}
                </span>
                <input
                  autoFocus
                  className={cn(
                    "h-14 w-full rounded-lg pr-20 pl-10",
                    "border-2 border-neutral-200 dark:border-neutral-700",
                    "bg-white dark:bg-neutral-800",
                    "text-right font-semibold text-2xl text-neutral-900 dark:text-neutral-100",
                    "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                    "focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20 dark:focus:border-rausch-400 dark:focus:ring-rausch-400/20",
                    "transition-all duration-150",
                    geistSans.className
                  )}
                  id="hourly-rate"
                  inputMode="decimal"
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="text"
                  value={displayValue}
                />
                <span
                  className={cn(
                    "-translate-y-1/2 absolute top-1/2 right-4",
                    "font-medium text-neutral-500 text-sm dark:text-neutral-400",
                    geistSans.className
                  )}
                >
                  /{t("hour")}
                </span>
              </div>

              {/* Preview */}
              <div className="mt-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p
                  className={cn(
                    "text-neutral-600 text-sm dark:text-neutral-400",
                    geistSans.className
                  )}
                >
                  {t("preview")}:{" "}
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatFromMinorUnits(rateCents, currency)}
                  </span>{" "}
                  {t("perHour")}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-neutral-200 border-t bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
              <button
                className={cn(
                  "h-12 flex-1 rounded-lg",
                  "border-2 border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800",
                  "font-semibold text-neutral-700 dark:text-neutral-300",
                  "transition-all duration-150",
                  "hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-600 dark:hover:bg-neutral-700",
                  "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900",
                  geistSans.className
                )}
                onClick={onClose}
                type="button"
              >
                {t("cancel")}
              </button>
              <button
                className={cn(
                  "h-12 flex-1 rounded-lg",
                  "bg-rausch-500 text-white",
                  "font-semibold",
                  "transition-all duration-150",
                  "hover:bg-rausch-600",
                  "focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 dark:focus:ring-rausch-400 dark:focus:ring-offset-neutral-900",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  geistSans.className
                )}
                disabled={isSaving || rateCents <= 0}
                onClick={handleSave}
                type="button"
              >
                {isSaving ? t("saving") : t("save")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
