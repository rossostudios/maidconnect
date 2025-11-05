"use client";

import { Calendar01Icon, CheckmarkCircle01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
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

    try {
      const response = await fetch("/api/professional/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyHours,
          blockedDates,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update availability");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-800">
          <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />
          <p className="font-semibold text-sm">{t("success")}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-800">
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Tabs - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto border-[#ebe5d8] border-b">
        <div className="flex w-max gap-1 md:w-full">
          <button
            className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-semibold text-sm transition ${
              activeTab === "hours"
                ? "border-[var(--red)] text-[var(--red)]"
                : "border-transparent text-[#7d7566] hover:text-[var(--foreground)]"
            }`}
            onClick={() => setActiveTab("hours")}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            {t("tabs.workingHours")}
          </button>
          <button
            className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-semibold text-sm transition ${
              activeTab === "blocked"
                ? "border-[var(--red)] text-[var(--red)]"
                : "border-transparent text-[#7d7566] hover:text-[var(--foreground)]"
            }`}
            onClick={() => setActiveTab("blocked")}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
            {t("tabs.blockedDates")}
            {blockedDates.length > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 font-bold text-white text-xs">
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
              <h3 className="font-semibold text-[var(--foreground)] text-lg">
                {t("workingHours.title")}
              </h3>
              <p className="mt-1 text-[#7d7566] text-sm">{t("workingHours.description")}</p>
            </div>
            <WeeklyHoursEditor initialSchedule={weeklyHours} onChange={setWeeklyHours} />
          </div>
        )}

        {activeTab === "blocked" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-[var(--foreground)] text-lg">
                {t("blockedDates.title")}
              </h3>
              <p className="mt-1 text-[#7d7566] text-sm">{t("blockedDates.description")}</p>
            </div>
            <BlockedDatesCalendar initialBlockedDates={blockedDates} onChange={setBlockedDates} />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 border-[#ebe5d8] border-t pt-6">
        <div className="flex-1 text-[#7d7566] text-sm">{t("infoText")}</div>
        <button
          className="rounded-full bg-[var(--red)] px-8 py-3 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[var(--red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={handleSave}
          type="button"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <title>Loading</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  fill="none"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                />
              </svg>
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
