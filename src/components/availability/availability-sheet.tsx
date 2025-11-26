"use client";

/**
 * Availability Sheet Component
 *
 * Right-side sheet containing the AvailabilityEditor for managing
 * weekly hours and blocked dates. Fetches data on open and
 * closes automatically on successful save.
 */

import { AlertCircleIcon, Clock01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AvailabilityEditor } from "./availability-editor";

type DaySchedule = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

type AvailabilityData = {
  availability_settings?: {
    weeklyHours?: DaySchedule[];
  };
  blocked_dates?: string[];
};

export type AvailabilitySheetProps = {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Callback when availability is saved successfully */
  onSaveSuccess?: () => void;
};

export function AvailabilitySheet({ isOpen, onClose, onSaveSuccess }: AvailabilitySheetProps) {
  const t = useTranslations("dashboard.pro.availabilitySheet");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AvailabilityData | null>(null);

  // Fetch availability data when sheet opens
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/professional/availability");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load availability");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load availability";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailability();
    }
  }, [isOpen, fetchAvailability]);

  // Handle successful save - close sheet and trigger refresh
  const handleSaveSuccess = useCallback(() => {
    onSaveSuccess?.();
    // Small delay to let the toast appear before closing
    setTimeout(() => {
      onClose();
    }, 500);
  }, [onClose, onSaveSuccess]);

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <SheetContent side="right" size="lg">
        <SheetHeader className="border-neutral-200 border-b pb-6 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rausch-50 dark:bg-rausch-900/30">
              <HugeiconsIcon
                className="h-5 w-5 text-rausch-500 dark:text-rausch-400"
                icon={Clock01Icon}
                strokeWidth={2}
              />
            </div>
            <div>
              <SheetTitle>{t("title")}</SheetTitle>
              <SheetDescription>{t("description")}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <HugeiconsIcon
                className="h-8 w-8 animate-spin text-rausch-500 dark:text-rausch-400"
                icon={Loading03Icon}
              />
              <p
                className={cn(
                  "mt-4 text-neutral-500 text-sm dark:text-neutral-400",
                  geistSans.className
                )}
              >
                {t("loading")}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400"
                  icon={AlertCircleIcon}
                />
                <div>
                  <p
                    className={cn(
                      "font-semibold text-red-700 text-sm dark:text-red-300",
                      geistSans.className
                    )}
                  >
                    {t("errorTitle")}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-red-600 text-sm dark:text-red-400",
                      geistSans.className
                    )}
                  >
                    {error}
                  </p>
                  <button
                    className={cn(
                      "mt-3 font-medium text-red-700 text-sm underline underline-offset-2 hover:no-underline dark:text-red-300",
                      geistSans.className
                    )}
                    onClick={fetchAvailability}
                    type="button"
                  >
                    {t("retry")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Editor Content */}
          {!(loading || error) && data && (
            <AvailabilityEditor
              initialBlockedDates={data.blocked_dates}
              initialWeeklyHours={data.availability_settings?.weeklyHours}
              onSaveSuccess={handleSaveSuccess}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
