"use client";

import {
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { BlockedDatesCalendar } from "./blocked-dates-calendar";
import { WeeklyHoursEditor } from "./weekly-hours-editor";

type DaySchedule = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

type Props = {
  initialWeeklyHours?: DaySchedule[];
  initialBlockedDates?: string[];
};

type Tab = "hours" | "blocked";

export function AvailabilityEditor({ initialWeeklyHours, initialBlockedDates }: Props) {
  const t = useTranslations("dashboard.pro.availabilityEditor");
  const [activeTab, setActiveTab] = useState<Tab>("hours");
  const [weeklyHours, setWeeklyHours] = useState<DaySchedule[]>(initialWeeklyHours || []);
  const [blockedDates, setBlockedDates] = useState<string[]>(initialBlockedDates || []);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    const savePromise = fetch("/api/professional/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weeklyHours,
        blockedDates,
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update availability");
      }
      return response;
    });

    try {
      await toast.promise(savePromise, {
        loading: "Saving availability...",
        success: "Availability updated successfully",
        error: (err) => err.message || "Failed to update availability",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update availability";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500 bg-green-50 p-4">
          <HugeiconsIcon className="h-5 w-5 text-green-600" icon={CheckmarkCircle01Icon} />
          <p className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
            {t("success")}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className={cn("font-semibold text-red-700 text-sm", geistSans.className)}>{error}</p>
        </div>
      )}

      {/* Tabs - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto border-neutral-200 border-b">
        <div className="flex w-max gap-1 md:w-full">
          <button
            className={cn(
              "flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-semibold text-sm transition",
              activeTab === "hours"
                ? "border-orange-500 text-neutral-900"
                : "border-transparent text-neutral-700 hover:text-neutral-900",
              geistSans.className
            )}
            onClick={() => setActiveTab("hours")}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            {t("tabs.workingHours")}
          </button>
          <button
            className={cn(
              "flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-semibold text-sm transition",
              activeTab === "blocked"
                ? "border-orange-500 text-neutral-900"
                : "border-transparent text-neutral-700 hover:text-neutral-900",
              geistSans.className
            )}
            onClick={() => setActiveTab("blocked")}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
            {t("tabs.blockedDates")}
            {blockedDates.length > 0 && (
              <span className="rounded-full border border-orange-500 bg-orange-50 px-2 py-0.5 font-semibold text-orange-600 text-xs">
                {blockedDates.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "hours" && (
          <div className="space-y-4">
            <div>
              <h3 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
                {t("workingHours.title")}
              </h3>
              <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
                {t("workingHours.description")}
              </p>
            </div>
            <WeeklyHoursEditor initialSchedule={weeklyHours} onChange={setWeeklyHours} />
          </div>
        )}

        {activeTab === "blocked" && (
          <div className="space-y-4">
            <div>
              <h3 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
                {t("blockedDates.title")}
              </h3>
              <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
                {t("blockedDates.description")}
              </p>
            </div>
            <BlockedDatesCalendar initialBlockedDates={blockedDates} onChange={setBlockedDates} />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 border-neutral-200 border-t pt-6">
        <div className={cn("flex-1 text-neutral-700 text-sm", geistSans.className)}>
          {t("infoText")}
        </div>
        <button
          className={cn(
            "rounded-lg border border-orange-500 bg-orange-500 px-8 py-3 font-semibold text-base text-white transition hover:border-orange-600 hover:bg-orange-600 disabled:cursor-not-allowed disabled:border-orange-200 disabled:bg-orange-200 disabled:text-neutral-700",
            geistSans.className
          )}
          disabled={loading}
          onClick={handleSave}
          type="button"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading03Icon} />
              {t("saving")}
            </span>
          ) : (
            t("save")
          )}
        </button>
      </div>
    </div>
  );
}
