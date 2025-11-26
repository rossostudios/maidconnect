"use client";

import { Clock01Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

type DaySchedule = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

type Props = {
  initialSchedule?: DaySchedule[];
  onChange?: (schedule: DaySchedule[]) => void;
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS_OF_WEEK.map((day) => ({
  day,
  enabled: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day),
  start: "09:00",
  end: "17:00",
}));

export function WeeklyHoursEditor({ initialSchedule, onChange }: Props) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    initialSchedule && initialSchedule.length > 0 ? initialSchedule : DEFAULT_SCHEDULE
  );

  // Notify parent of initial schedule on mount
  useEffect(() => {
    if (onChange) {
      onChange(schedule);
    }
  }, [onChange, schedule]);

  const handleChange = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    onChange?.(newSchedule);
  };

  const handleToggleDay = (index: number) => {
    const newSchedule = [...schedule];
    const day = newSchedule[index];
    if (day) {
      day.enabled = !day.enabled;
      handleChange(newSchedule);
    }
  };

  const handleTimeChange = (index: number, field: "start" | "end", value: string) => {
    const newSchedule = [...schedule];
    const day = newSchedule[index];
    if (day) {
      day[field] = value;
      handleChange(newSchedule);
    }
  };

  const handleCopyToAll = (index: number) => {
    const sourceDay = schedule[index];
    if (!sourceDay) {
      return;
    }

    const newSchedule = schedule.map((day) => ({
      ...day,
      start: sourceDay.start,
      end: sourceDay.end,
    }));
    handleChange(newSchedule);
  };

  const handlePreset = (preset: "weekdays" | "weekends" | "everyday") => {
    let newSchedule: DaySchedule[];

    if (preset === "weekdays") {
      newSchedule = schedule.map((day) => ({
        ...day,
        enabled: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day.day),
      }));
    } else if (preset === "weekends") {
      newSchedule = schedule.map((day) => ({
        ...day,
        enabled: ["Saturday", "Sunday"].includes(day.day),
      }));
    } else {
      newSchedule = schedule.map((day) => ({
        ...day,
        enabled: true,
      }));
    }

    handleChange(newSchedule);
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <h4 className="mb-3 font-semibold text-neutral-900 text-sm dark:text-neutral-100">
          Quick Presets
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg border-2 border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-900 text-sm transition hover:border-rausch-500 hover:bg-rausch-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-rausch-400 dark:hover:bg-rausch-900/30"
            onClick={() => handlePreset("weekdays")}
            type="button"
          >
            Weekdays (Mon-Fri)
          </button>
          <button
            className="rounded-lg border-2 border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-900 text-sm transition hover:border-rausch-500 hover:bg-rausch-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-rausch-400 dark:hover:bg-rausch-900/30"
            onClick={() => handlePreset("weekends")}
            type="button"
          >
            Weekends Only
          </button>
          <button
            className="rounded-lg border-2 border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-900 text-sm transition hover:border-rausch-500 hover:bg-rausch-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-rausch-400 dark:hover:bg-rausch-900/30"
            onClick={() => handlePreset("everyday")}
            type="button"
          >
            Every Day
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-3">
        {schedule.map((day, index) => (
          <div
            className={`rounded-lg border-2 p-4 transition ${
              day.enabled
                ? "border-rausch-200 bg-rausch-50/50 dark:border-rausch-700 dark:bg-rausch-900/20"
                : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50"
            }`}
            key={day.day}
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Day Toggle */}
              <label className="flex w-32 items-center gap-3">
                <input
                  checked={day.enabled}
                  className="h-5 w-5 rounded border-neutral-200 text-rausch-500 focus:ring-2 focus:ring-rausch-500/20 dark:border-neutral-600 dark:bg-neutral-700"
                  onChange={() => handleToggleDay(index)}
                  type="checkbox"
                />
                <span
                  className={`font-semibold text-sm ${
                    day.enabled
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {day.day}
                </span>
              </label>

              {/* Time Inputs */}
              {day.enabled && (
                <>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
                      icon={Clock01Icon}
                    />
                    <input
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm accent-rausch-500 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:[color-scheme:dark]"
                      onChange={(e) => handleTimeChange(index, "start", e.target.value)}
                      type="time"
                      value={day.start}
                    />
                    <span className="text-neutral-500 text-sm dark:text-neutral-400">to</span>
                    <input
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm accent-rausch-500 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:[color-scheme:dark]"
                      onChange={(e) => handleTimeChange(index, "end", e.target.value)}
                      type="time"
                      value={day.end}
                    />
                  </div>

                  {/* Copy Button */}
                  <button
                    className="ml-auto flex items-center gap-1 rounded-lg px-3 py-2 font-semibold text-neutral-500 text-xs transition hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                    onClick={() => handleCopyToAll(index)}
                    title="Copy these hours to all days"
                    type="button"
                  >
                    <HugeiconsIcon className="h-3 w-3" icon={Copy01Icon} />
                    Copy to all
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
        <p className="text-neutral-500 text-sm dark:text-neutral-400">
          <strong className="text-neutral-900 dark:text-neutral-100">
            {schedule.filter((d) => d.enabled).length} days
          </strong>{" "}
          available for bookings
        </p>
      </div>
    </div>
  );
}
