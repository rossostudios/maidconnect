"use client";

import { Clock, Copy } from "lucide-react";
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
  }, []);

  const handleChange = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    onChange?.(newSchedule);
  };

  const handleToggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].enabled = !newSchedule[index].enabled;
    handleChange(newSchedule);
  };

  const handleTimeChange = (index: number, field: "start" | "end", value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    handleChange(newSchedule);
  };

  const handleCopyToAll = (index: number) => {
    const sourceDay = schedule[index];
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
        <h4 className="mb-3 text-sm font-semibold text-[#211f1a]">Quick Presets</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePreset("weekdays")}
            className="rounded-full border-2 border-[#ebe5d8] bg-white px-4 py-2 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          >
            Weekdays (Mon-Fri)
          </button>
          <button
            onClick={() => handlePreset("weekends")}
            className="rounded-full border-2 border-[#ebe5d8] bg-white px-4 py-2 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          >
            Weekends Only
          </button>
          <button
            onClick={() => handlePreset("everyday")}
            className="rounded-full border-2 border-[#ebe5d8] bg-white px-4 py-2 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          >
            Every Day
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-3">
        {schedule.map((day, index) => (
          <div
            key={day.day}
            className={`rounded-xl border-2 p-4 transition ${
              day.enabled ? "border-[#ff5d46]/20 bg-white" : "border-[#ebe5d8] bg-[#fbfaf9]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Day Toggle */}
              <label className="flex w-32 items-center gap-3">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={() => handleToggleDay(index)}
                  className="h-5 w-5 rounded border-[#ebe5d8] text-[#ff5d46] focus:ring-2 focus:ring-[#ff5d46]/20"
                />
                <span
                  className={`text-sm font-semibold ${
                    day.enabled ? "text-[#211f1a]" : "text-[#7d7566]"
                  }`}
                >
                  {day.day}
                </span>
              </label>

              {/* Time Inputs */}
              {day.enabled && (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#7d7566]" />
                    <input
                      type="time"
                      value={day.start}
                      onChange={(e) => handleTimeChange(index, "start", e.target.value)}
                      className="rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20 [color-scheme:light] accent-[#ff5d46]"
                    />
                    <span className="text-sm text-[#7d7566]">to</span>
                    <input
                      type="time"
                      value={day.end}
                      onChange={(e) => handleTimeChange(index, "end", e.target.value)}
                      className="rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20 [color-scheme:light] accent-[#ff5d46]"
                    />
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyToAll(index)}
                    className="ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[#7d7566] transition hover:bg-[#ebe5d8] hover:text-[#211f1a]"
                    title="Copy these hours to all days"
                  >
                    <Copy className="h-3 w-3" />
                    Copy to all
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-[#fbfaf9] p-4">
        <p className="text-sm text-[#7d7566]">
          <strong className="text-[#211f1a]">
            {schedule.filter((d) => d.enabled).length} days
          </strong>{" "}
          available for bookings
        </p>
      </div>
    </div>
  );
}
