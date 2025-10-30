"use client";

import { useState } from "react";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import { WeeklyHoursEditor } from "./weekly-hours-editor";
import { BlockedDatesCalendar } from "./blocked-dates-calendar";

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
      console.error("Failed to update availability:", err);
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
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm font-semibold">Availability updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-800">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#ebe5d8]">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("hours")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "hours"
                ? "border-[#ff5d46] text-[#ff5d46]"
                : "border-transparent text-[#7d7566] hover:text-[#211f1a]"
            }`}
          >
            <Clock className="h-4 w-4" />
            Working Hours
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === "blocked"
                ? "border-[#ff5d46] text-[#ff5d46]"
                : "border-transparent text-[#7d7566] hover:text-[#211f1a]"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Blocked Dates
            {blockedDates.length > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
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
              <h3 className="text-lg font-semibold text-[#211f1a]">Set Your Weekly Schedule</h3>
              <p className="mt-1 text-sm text-[#7d7566]">
                Define which days and hours you're available for bookings. Customers can only
                book during these times.
              </p>
            </div>
            <WeeklyHoursEditor initialSchedule={weeklyHours} onChange={setWeeklyHours} />
          </div>
        )}

        {activeTab === "blocked" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#211f1a]">Block Specific Dates</h3>
              <p className="mt-1 text-sm text-[#7d7566]">
                Mark dates when you're unavailable (vacations, holidays, personal time).
                These dates won't be bookable even if they fall within your working hours.
              </p>
            </div>
            <BlockedDatesCalendar
              initialBlockedDates={blockedDates}
              onChange={setBlockedDates}
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 border-t border-[#ebe5d8] pt-6">
        <div className="flex-1 text-sm text-[#7d7566]">
          Changes will be reflected immediately on your public profile
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-full bg-[#ff5d46] px-8 py-3 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            "Save Availability"
          )}
        </button>
      </div>
    </div>
  );
}
