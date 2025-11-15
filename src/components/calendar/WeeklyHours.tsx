"use client";

import { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
    <div className="border-2 border-[neutral-200] bg-[neutral-50] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HugeiconsIcon className="h-6 w-6 text-[neutral-500]" icon={Clock01Icon} />
          <h3 className="font-semibold text-[neutral-900] text-lg">{t("title")}</h3>
        </div>

        {editing ? (
          <div className="flex gap-2">
            <button
              className="border-2 border-[neutral-200] bg-[neutral-50] px-4 py-2 font-medium text-[neutral-900] text-sm transition hover:bg-[neutral-50]"
              onClick={handleCancel}
              type="button"
            >
              {t("cancel")}
            </button>
            <button
              className="bg-[neutral-500] px-4 py-2 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500] disabled:opacity-50"
              disabled={saving}
              onClick={handleSave}
              type="button"
            >
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        ) : (
          <button
            className="bg-[neutral-500] px-4 py-2 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
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
              className={`border-2 p-4 transition-all ${
                dayHours?.isAvailable
                  ? "border-[neutral-500]/40 bg-[neutral-500]/10"
                  : "border-[neutral-200] bg-[neutral-50]"
              }`}
              key={day.value}
            >
              <div className="flex items-center justify-between">
                {/* Day Name + Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    checked={dayHours?.isAvailable}
                    className="h-5 w-5 cursor-pointer rounded border-[neutral-200] text-[neutral-500] focus:ring-[neutral-500]"
                    disabled={!editing}
                    onChange={() => handleDayToggle(day.value)}
                    type="checkbox"
                  />
                  <span className="font-medium text-[neutral-900] text-sm">
                    {t(`days.${day.label.toLowerCase()}`)}
                  </span>
                </div>

                {/* Time Inputs */}
                {dayHours?.isAvailable && (
                  <div className="flex items-center gap-2">
                    <input
                      className="w-24 border-2 border-[neutral-200] px-3 py-1 text-sm disabled:bg-[neutral-50]"
                      disabled={!editing}
                      onChange={(e) => handleTimeChange(day.value, "startTime", e.target.value)}
                      type="time"
                      value={dayHours.startTime}
                    />
                    <span className="text-[neutral-400]">-</span>
                    <input
                      className="w-24 border-2 border-[neutral-200] px-3 py-1 text-sm disabled:bg-[neutral-50]"
                      disabled={!editing}
                      onChange={(e) => handleTimeChange(day.value, "endTime", e.target.value)}
                      type="time"
                      value={dayHours.endTime}
                    />
                  </div>
                )}

                {!dayHours?.isAvailable && (
                  <span className="text-[neutral-400] text-sm">{t("unavailable")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-[neutral-50] p-4 text-[neutral-500] text-sm">
        <p className="font-semibold">{t("helpTitle")}</p>
        <p className="mt-1 text-[neutral-500]">{t("helpDescription")}</p>
      </div>
    </div>
  );
}
