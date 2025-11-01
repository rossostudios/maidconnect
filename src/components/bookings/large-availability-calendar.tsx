"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
  onDateSelect: (date: Date, availableSlots: string[]) => void;
};

export function LargeAvailabilityCalendar({ professionalId, onDateSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  // Fetch availability when month changes
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

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
    if (!availabilityData) {
      return null;
    }
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateClick = (day: Date, availability: DayAvailability) => {
    setSelectedDate(day);
    onDateSelect(day, availability.availableSlots);
  };

  return (
    <div className="space-y-8">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-4xl text-[#211f1a]">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-3">
          <button
            className="rounded-xl border-2 border-[#e5dfd4] px-5 py-2.5 font-semibold text-[#7d7566] text-base transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            onClick={goToToday}
            type="button"
          >
            Today
          </button>
          <button
            aria-label="Previous month"
            className="rounded-xl border-2 border-[#e5dfd4] p-2.5 text-[#7d7566] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            onClick={goToPreviousMonth}
            type="button"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="Next month"
            className="rounded-xl border-2 border-[#e5dfd4] p-2.5 text-[#7d7566] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            onClick={goToNextMonth}
            type="button"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-[32px] border border-[#ebe5d8] bg-white p-16 text-center shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <p className="text-[#7d7566] text-lg">Loading availability...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-base text-red-800">{error}</p>
          <button
            className="mt-4 rounded-xl bg-red-600 px-6 py-3 font-semibold text-base text-white hover:bg-red-700"
            onClick={fetchAvailability}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      {!(loading || error) && (
        <>
          <div className="rounded-[32px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
            <div className="grid grid-cols-7 gap-4">
              {/* Day Headers */}
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                (day) => (
                  <div
                    className="pb-4 text-center font-semibold text-[#7d7566] text-base"
                    key={day}
                  >
                    {day}
                  </div>
                )
              )}

              {/* Calendar Days */}
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div className="min-h-[120px] rounded-2xl" key={`empty-${index}`} />;
                }

                const availability = getDateAvailability(day);
                const isPast = day < today;
                const isToday = formatDate(day) === formatDate(today);
                const isSelected = selectedDate && formatDate(day) === formatDate(selectedDate);

                const statusColors = {
                  available: "bg-green-50 border-green-200 hover:border-green-400",
                  limited: "bg-yellow-50 border-yellow-200 hover:border-yellow-400",
                  booked: "bg-red-50 border-red-200",
                  blocked: "bg-gray-100 border-gray-200",
                };

                const statusText = {
                  available: "Open",
                  limited: "Limited",
                  booked: "Booked",
                  blocked: "Closed",
                };

                const statusTextColors = {
                  available: "text-green-700",
                  limited: "text-yellow-700",
                  booked: "text-red-700",
                  blocked: "text-gray-600",
                };

                const bgColor = isPast
                  ? "bg-gray-50 border-gray-200"
                  : availability
                    ? statusColors[availability.status]
                    : "bg-white border-[#ebe5d8]";

                const canSelect =
                  !isPast &&
                  availability &&
                  availability.status !== "blocked" &&
                  availability.availableSlots.length > 0;

                return (
                  <button
                    className={`group relative flex min-h-[120px] flex-col rounded-2xl border-2 p-4 text-left transition-all duration-300 ${bgColor}
                      ${isSelected ? "scale-105 ring-4 ring-[#ff5d46] ring-offset-2" : ""}
                      ${isToday ? "border-[#ff5d46]" : ""}
                      ${canSelect ? "hover:-translate-y-1 cursor-pointer hover:scale-105 hover:shadow-lg active:scale-100" : "cursor-not-allowed opacity-60"}
                      ${isPast ? "text-gray-400" : "text-[#211f1a]"}
                    `}
                    disabled={!canSelect}
                    key={formatDate(day)}
                    onClick={() => {
                      if (canSelect && availability) {
                        handleDateClick(day, availability);
                      }
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between">
                      <span className={`font-semibold text-2xl ${isToday ? "text-[#ff5d46]" : ""}`}>
                        {day.getDate()}
                      </span>
                      {availability && !isPast && (
                        <span
                          className={`font-semibold text-xs uppercase tracking-wider ${statusTextColors[availability.status]}`}
                        >
                          {statusText[availability.status]}
                        </span>
                      )}
                    </div>
                    {availability && !isPast && availability.availableSlots.length > 0 && (
                      <div className="mt-auto">
                        <p className="text-[#7d7566] text-sm">
                          {availability.availableSlots.length}{" "}
                          {availability.availableSlots.length === 1 ? "slot" : "slots"} available
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-[32px] border border-[#ebe5d8] bg-gradient-to-br from-[#fbfafa] to-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
            <h3 className="mb-6 font-semibold text-[#211f1a] text-xl">Calendar guide</h3>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="group flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50/50 p-5 transition hover:border-green-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg border-2 border-green-200 bg-green-50 shadow-sm" />
                  <span className="font-semibold text-base text-green-800">Available</span>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">
                  Multiple time slots open for booking
                </p>
              </div>

              <div className="group flex flex-col gap-3 rounded-2xl border border-yellow-200 bg-yellow-50/50 p-5 transition hover:border-yellow-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 shadow-sm" />
                  <span className="font-semibold text-base text-yellow-800">Limited</span>
                </div>
                <p className="text-sm text-yellow-700 leading-relaxed">
                  Only a few slots remaining
                </p>
              </div>

              <div className="group flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-5 transition hover:border-red-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg border-2 border-red-200 bg-red-50 shadow-sm" />
                  <span className="font-semibold text-base text-red-800">Booked</span>
                </div>
                <p className="text-red-700 text-sm leading-relaxed">No availability for this day</p>
              </div>

              <div className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-5 transition hover:border-gray-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg border-2 border-gray-200 bg-gray-100 shadow-sm" />
                  <span className="font-semibold text-base text-gray-800">Unavailable</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">Professional not working</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
