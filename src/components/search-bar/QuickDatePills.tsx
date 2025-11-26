"use client";

import {
  addDays,
  endOfWeek,
  format,
  isToday,
  isTomorrow,
  isWithinInterval,
  nextSaturday,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";

export type QuickDateOption = {
  id: string;
  label: string;
  sublabel?: string;
  getDate: () => Date;
  isSelected: (date: Date | null) => boolean;
};

const createQuickDateOptions = (): QuickDateOption[] => {
  const today = new Date();

  return [
    {
      id: "today",
      label: "Today",
      sublabel: format(today, "MMM d"),
      getDate: () => today,
      isSelected: (date) => date !== null && isToday(date),
    },
    {
      id: "tomorrow",
      label: "Tomorrow",
      sublabel: format(addDays(today, 1), "MMM d"),
      getDate: () => addDays(today, 1),
      isSelected: (date) => date !== null && isTomorrow(date),
    },
    {
      id: "this-weekend",
      label: "This weekend",
      sublabel: `${format(nextSaturday(today), "MMM d")} – ${format(addDays(nextSaturday(today), 1), "d")}`,
      getDate: () => nextSaturday(today),
      isSelected: (date) => {
        if (!date) {
          return false;
        }
        const saturday = nextSaturday(today);
        const sunday = addDays(saturday, 1);
        return isWithinInterval(date, { start: saturday, end: sunday });
      },
    },
    {
      id: "next-week",
      label: "Next week",
      sublabel: (() => {
        const nextWeekStart = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        const nextWeekEnd = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        return `${format(nextWeekStart, "MMM d")} – ${format(nextWeekEnd, "d")}`;
      })(),
      getDate: () => startOfWeek(addDays(today, 7), { weekStartsOn: 1 }),
      isSelected: (date) => {
        if (!date) {
          return false;
        }
        const nextWeekStart = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        const nextWeekEnd = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });
        return isWithinInterval(date, { start: nextWeekStart, end: nextWeekEnd });
      },
    },
  ];
};

export type QuickDatePillsProps = {
  /** Currently selected date */
  selectedDate: Date | null;
  /** Callback when a quick date is selected */
  onDateSelect: (date: Date) => void;
  /** Additional class names */
  className?: string;
};

/**
 * Quick date selection pills for the Airbnb-style search bar.
 * Displays options like "Today", "Tomorrow", "This weekend".
 */
export function QuickDatePills({ selectedDate, onDateSelect, className }: QuickDatePillsProps) {
  const options = createQuickDateOptions();

  return (
    <div className={cn("space-y-1", className)}>
      {options.map((option) => {
        const isSelected = option.isSelected(selectedDate);

        return (
          <button
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-left transition-all",
              "hover:bg-neutral-100 dark:hover:bg-muted",
              isSelected && "bg-rausch-50 dark:bg-rausch-500/20"
            )}
            key={option.id}
            onClick={() => onDateSelect(option.getDate())}
            type="button"
          >
            <div
              className={cn(
                "font-medium text-sm",
                isSelected
                  ? "text-rausch-600 dark:text-rausch-400"
                  : "text-neutral-900 dark:text-neutral-50"
              )}
            >
              {option.label}
            </div>
            {option.sublabel && (
              <div
                className={cn(
                  "text-xs",
                  isSelected
                    ? "text-rausch-500 dark:text-rausch-400"
                    : "text-neutral-500 dark:text-neutral-400"
                )}
              >
                {option.sublabel}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
