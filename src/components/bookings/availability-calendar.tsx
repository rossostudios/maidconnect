"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type DayAvailability = "available" | "limited" | "booked" | "past";

type AvailabilityData = {
  [dateString: string]: {
    status: DayAvailability;
    slotsAvailable?: number;
    totalSlots?: number;
  };
};

type AvailabilityCalendarProps = {
  availability: AvailabilityData;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

/**
 * AvailabilityCalendar - Visual calendar showing real-time availability
 * Color-coded: Green (available), Yellow (limited), Red (booked), Gray (past)
 * Research: Visual calendars reduce booking time, increase conversions
 */
export function AvailabilityCalendar({
  availability,
  selectedDate,
  onSelectDate,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDayStatus = (day: number): DayAvailability => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split("T")[0] as string;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return "past";
    }

    if (availability[dateString]) {
      return availability[dateString]!.status;
    }

    // Default: available if no data
    return "available";
  };

  const getDayStyles = (status: DayAvailability, isSelected: boolean) => {
    if (isSelected) {
      return "bg-[#8B7355] text-white border-[#8B7355] ring-2 ring-[#8B7355] ring-offset-2";
    }

    switch (status) {
      case "available":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300";
      case "limited":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300";
      case "booked":
        return "bg-red-50 text-red-400 border-red-200 cursor-not-allowed";
      case "past":
        return "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed";
      default:
        return "bg-white text-[#211f1a] border-[#ebe5d8] hover:border-[#211f1a]";
    }
  };

  const getDayIndicator = (day: number): React.ReactElement | null => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split("T")[0] as string;
    const dayData = availability[dateString];

    if (!dayData) return null;

    const { status, slotsAvailable, totalSlots } = dayData;

    if (status === "limited" && slotsAvailable && totalSlots) {
      return (
        <span className="text-[10px] leading-none">
          {slotsAvailable}/{totalSlots}
        </span>
      );
    }

    return null;
  };

  const canSelectDay = (day: number): boolean => {
    const status = getDayStatus(day);
    return status !== "booked" && status !== "past";
  };

  const handleDayClick = (day: number) => {
    if (!canSelectDay(day)) return;

    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(date);
  };

  const isSelectedDay = (day: number): boolean => {
    if (!selectedDate) return false;

    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Generate calendar days including empty slots for alignment
  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#211f1a] text-lg">{monthName}</h3>
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ebe5d8] transition hover:bg-[#f5f2ed]"
            onClick={goToPreviousMonth}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ebe5d8] transition hover:bg-[#f5f2ed]"
            onClick={goToNextMonth}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-[#7d7566]">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-[#7d7566]">Limited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-[#7d7566]">Booked</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            className="flex h-8 items-center justify-center font-medium text-[#7d7566] text-xs"
            key={day}
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const status = getDayStatus(day);
          const isSelected = isSelectedDay(day);
          const indicator = getDayIndicator(day);

          return (
            <button
              className={`flex h-14 flex-col items-center justify-center rounded-lg border-2 font-medium text-sm transition ${getDayStyles(status, isSelected)}`}
              disabled={!canSelectDay(day)}
              key={day}
              onClick={() => handleDayClick(day)}
              type="button"
            >
              <span>{day}</span>
              {indicator}
            </button>
          );
        })}
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="rounded-xl bg-[#f5f2ed] p-4">
          <p className="text-[#7d7566] text-sm">Selected Date</p>
          <p className="mt-1 font-semibold text-[#211f1a]">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
