"use client";

import { Clock01Icon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { DayOfWeek, WorkingHours } from "@/types";

type WeeklyHoursEditorProps = {
  workingHours: WorkingHours[];
  onUpdate: (hours: WorkingHours[]) => Promise<void>;
};

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

/**
 * Weekly Hours Editor Component
 *
 * Allows professionals to set their availability for each day of the week.
 * Supports multiple time slots per day and availability toggling.
 */
export function WeeklyHoursEditor({ workingHours, onUpdate }: WeeklyHoursEditorProps) {
  const t = useTranslations("components.weeklyHoursEditor");
  const [editing, setEditing] = useState(false);
  const [localHours, setLocalHours] = useState<WorkingHours[]>(workingHours);
  const [saving, setSaving] = useState(false);

  const handleDayToggle = (dayOfWeek: DayOfWeek) => {
    const existingDay = localHours.find((h) => h.dayOfWeek === dayOfWeek);

    if (existingDay) {
      // Toggle existing day
      setLocalHours(
        localHours.map((h) =>
          h.dayOfWeek === dayOfWeek ? { ...h, isAvailable: !h.isAvailable } : h
        )
      );
    } else {
      // Add new day with default hours (9 AM - 5 PM)
      const newHour: WorkingHours = {
        id: crypto.randomUUID(),
        profileId: workingHours[0]?.profileId || "",
        dayOfWeek,
        isAvailable: true,
        startTime: "09:00",
        endTime: "17:00",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalHours([...localHours, newHour]);
    }
  };

  const handleTimeChange = (
    dayOfWeek: DayOfWeek,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setLocalHours(
      localHours.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(localHours);
      setEditing(false);
    } catch (error) {
      console.error("Failed to save working hours:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalHours(workingHours);
    setEditing(false);
  };

  return (
    <div className="rounded-[24px] border-2 border-[#e5e7eb] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock01Icon className="h-6 w-6 text-[var(--red)]" />
          <h3 className="font-semibold text-[var(--foreground)] text-lg">{t("title")}</h3>
        </div>

        {editing ? (
          <div className="flex gap-2">
            <button
              className="rounded-xl border-2 border-[#e5e7eb] bg-white px-4 py-2 font-medium text-[var(--foreground)] text-sm transition hover:bg-[#f9fafb]"
              onClick={handleCancel}
              type="button"
            >
              {t("cancel")}
            </button>
            <button
              className="rounded-xl bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#cc3333] disabled:opacity-50"
              disabled={saving}
              onClick={handleSave}
              type="button"
            >
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        ) : (
          <button
            className="rounded-xl bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#cc3333]"
            onClick={() => setEditing(true)}
            type="button"
          >
            {t("edit")}
          </button>
        )}
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayHours = localHours.find((h) => h.dayOfWeek === day.value);

          return (
            <div
              className={`rounded-xl border-2 p-4 transition-all ${
                dayHours?.isAvailable
                  ? "border-green-200 bg-green-50"
                  : "border-[#e5e7eb] bg-[#f9fafb]"
              }`}
              key={day.value}
            >
              <div className="flex items-center justify-between">
                {/* Day Name + Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    checked={dayHours?.isAvailable}
                    className="h-5 w-5 cursor-pointer rounded border-[#d1d5db] text-[var(--red)] focus:ring-[var(--red)]"
                    disabled={!editing}
                    onChange={() => handleDayToggle(day.value)}
                    type="checkbox"
                  />
                  <span className="font-medium text-[var(--foreground)] text-sm">
                    {t(`days.${day.label.toLowerCase()}`)}
                  </span>
                </div>

                {/* Time Inputs */}
                {dayHours?.isAvailable && (
                  <div className="flex items-center gap-2">
                    <input
                      className="w-24 rounded-lg border-2 border-[#d1d5db] px-3 py-1 text-sm disabled:bg-[#f3f4f6]"
                      disabled={!editing}
                      onChange={(e) => handleTimeChange(day.value, "startTime", e.target.value)}
                      type="time"
                      value={dayHours.startTime}
                    />
                    <span className="text-[#6b7280]">-</span>
                    <input
                      className="w-24 rounded-lg border-2 border-[#d1d5db] px-3 py-1 text-sm disabled:bg-[#f3f4f6]"
                      disabled={!editing}
                      onChange={(e) => handleTimeChange(day.value, "endTime", e.target.value)}
                      type="time"
                      value={dayHours.endTime}
                    />
                  </div>
                )}

                {!dayHours?.isAvailable && (
                  <span className="text-[#9ca3af] text-sm">{t("unavailable")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-6 rounded-xl bg-blue-50 p-4 text-blue-900 text-sm">
        <p className="font-semibold">{t("helpTitle")}</p>
        <p className="mt-1 text-blue-800">{t("helpDescription")}</p>
      </div>
    </div>
  );
}
