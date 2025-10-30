"use client";

import { useEffect, useState } from "react";

type DayAvailability = {
  date: string; // YYYY-MM-DD
  status: "available" | "limited" | "booked" | "blocked";
  availableSlots: string[];
  bookingCount: number;
  maxBookings: number;
};

type AvailabilityData = {
  professionalId: string;
  startDate: string;
  endDate: string;
  availability: DayAvailability[];
  instantBooking: {
    enabled: boolean;
    settings: Record<string, any>;
  };
};

type Props = {
  professionalId: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date | null) => void;
  onTimeSelect: (time: string | null) => void;
  durationHours?: number;
};

export function AvailabilityCalendar({
  professionalId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  durationHours = 2,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability when month changes
  useEffect(() => {
    fetchAvailability();
  }, [currentMonth, professionalId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get first and last day of month
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const startDate = formatDate(startOfMonth);
      const endDate = formatDate(endOfMonth);

      const response = await fetch(
        `/api/professionals/${professionalId}/availability?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to load availability");
      }

      const data = await response.json();
      setAvailabilityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get availability for a specific date
  const getDateAvailability = (date: Date): DayAvailability | null => {
    if (!availabilityData) return null;
    const dateStr = formatDate(date);
    return availabilityData.availability.find((a) => a.date === dateStr) || null;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const selectedDateAvailability = selectedDate ? getDateAvailability(selectedDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#211f1a]">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="rounded-md border border-[#e5dfd4] px-3 py-1 text-xs font-medium text-[#7a6d62] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          >
            Today
          </button>
          <button
            onClick={goToPreviousMonth}
            className="rounded-md border border-[#e5dfd4] px-2 py-1 text-sm text-[#7a6d62] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-md border border-[#e5dfd4] px-2 py-1 text-sm text-[#7a6d62] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-lg border border-[#f0ece5] bg-white/90 p-8 text-center">
          <p className="text-sm text-[#7a6d62]">Loading availability...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchAvailability}
            className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-7 gap-px rounded-lg border border-[#ebe5d8] bg-[#ebe5d8] overflow-hidden">
            {/* Day Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-[#f0ece5] px-2 py-2 text-center text-xs font-semibold text-[#7a6d62]"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div key={`empty-${index}`} className="bg-[#fbfafa] p-2 min-h-[60px]" />
                );
              }

              const availability = getDateAvailability(day);
              const isPast = day < today;
              const isToday = formatDate(day) === formatDate(today);
              const isSelected = selectedDate && formatDate(day) === formatDate(selectedDate);

              const statusColors = {
                available: "bg-green-50 border-green-200",
                limited: "bg-yellow-50 border-yellow-200",
                booked: "bg-red-50 border-red-200",
                blocked: "bg-gray-100 border-gray-200",
              };

              const statusIndicators = {
                available: "🟢",
                limited: "🟡",
                booked: "🔴",
                blocked: "⚫",
              };

              const bgColor = isPast
                ? "bg-gray-50"
                : availability
                  ? statusColors[availability.status]
                  : "bg-white";

              const canSelect = !isPast && availability && availability.status !== "blocked" && availability.availableSlots.length > 0;

              return (
                <button
                  key={formatDate(day)}
                  type="button"
                  onClick={() => {
                    if (canSelect) {
                      onDateSelect(day);
                      onTimeSelect(null); // Reset time when date changes
                    }
                  }}
                  disabled={!canSelect}
                  className={`
                    relative p-2 text-left transition min-h-[60px]
                    ${bgColor}
                    ${isSelected ? "ring-2 ring-[#ff5d46] ring-inset" : ""}
                    ${isToday ? "font-bold" : ""}
                    ${canSelect ? "hover:ring-2 hover:ring-[#ff5d4633] cursor-pointer" : "cursor-not-allowed opacity-60"}
                    ${isPast ? "text-gray-400" : "text-[#211f1a]"}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className="text-sm">{day.getDate()}</span>
                    {availability && !isPast && (
                      <span className="text-xs mt-auto">
                        {statusIndicators[availability.status]}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-[#7a6d62]">
            <div className="flex items-center gap-1">
              <span>🟢</span>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🟡</span>
              <span>Limited</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔴</span>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚫</span>
              <span>Unavailable</span>
            </div>
            {availabilityData?.instantBooking.enabled && (
              <div className="flex items-center gap-1">
                <span>⚡</span>
                <span>Instant booking available</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Time Slots for Selected Date */}
      {selectedDate && selectedDateAvailability && selectedDateAvailability.availableSlots.length > 0 && (
        <div className="rounded-lg border border-[#f0ece5] bg-white/90 p-4">
          <h4 className="mb-3 text-sm font-semibold text-[#211f1a]">
            Available times on {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {selectedDateAvailability.availableSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => onTimeSelect(time)}
                  className={`
                    rounded-md border px-3 py-2 text-sm font-medium transition
                    ${
                      isSelected
                        ? "border-[#ff5d46] bg-[#ff5d46] text-white"
                        : "border-[#e5dfd4] bg-white text-[#211f1a] hover:border-[#ff5d46] hover:text-[#ff5d46]"
                    }
                  `}
                >
                  {formatTime(time)}
                </button>
              );
            })}
          </div>
          {selectedDateAvailability.bookingCount > 0 && (
            <p className="mt-3 text-xs text-[#7a6d62]">
              {selectedDateAvailability.bookingCount} of {selectedDateAvailability.maxBookings} slots booked today
            </p>
          )}
        </div>
      )}

      {/* No Slots Message */}
      {selectedDate && selectedDateAvailability && selectedDateAvailability.availableSlots.length === 0 && (
        <div className="rounded-lg border border-[#f0ece5] bg-white/90 p-4 text-center">
          <p className="text-sm text-[#7a6d62]">
            No available time slots on this date. Please choose another day.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
