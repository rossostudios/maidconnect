"use client";

/**
 * AvailabilitySelector Client Actions
 *
 * Client component that handles interactive date/time selection
 * from the availability calendar displayed in Amara chat.
 *
 * Features:
 * - Calendar navigation (month/week view)
 * - Date selection with visual feedback
 * - Time slot selection
 * - PostHog analytics tracking
 * - Optimistic UI updates
 */

import { useState } from "react";
import { trackAmaraComponentClicked } from "@/lib/analytics/amara-events";
import { cn } from "@/lib/utils";
import type { DayAvailability } from "@/lib/utils/availability";

type AvailabilitySelectorClientProps = {
  professionalId: string;
  professionalName: string;
  availability: DayAvailability[];
  conversationId?: string;
  instantBooking?: boolean;
};

export function AvailabilitySelectorClient({
  professionalId,
  professionalName,
  availability,
  conversationId,
  instantBooking,
}: AvailabilitySelectorClientProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Get available time slots for selected date
  const selectedDayData = availability.find((day) => day.date === selectedDate);
  const timeSlots = selectedDayData?.availableSlots || [];

  // Handle date selection
  const handleDateSelect = (date: string, status: DayAvailability["status"]) => {
    if (status === "blocked" || status === "booked") {
      return; // Can't select blocked/booked dates
    }

    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection

    // Track analytics
    trackAmaraComponentClicked("availability_selector", "select_time", {
      professional_id: professionalId,
      conversation_id: conversationId,
      selected_date: date,
    });
  };

  // Handle time slot selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);

    // Track analytics
    trackAmaraComponentClicked("availability_selector", "select_time", {
      professional_id: professionalId,
      conversation_id: conversationId,
      selected_date: selectedDate,
      selected_time: time,
    });
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (!(selectedDate && selectedTime)) return;

    // Track analytics
    trackAmaraComponentClicked("availability_selector", "confirm_booking", {
      professional_id: professionalId,
      professional_name: professionalName,
      conversation_id: conversationId,
      selected_date: selectedDate,
      selected_time: selectedTime,
      instant_booking: instantBooking,
    });

    // TODO: Trigger booking draft creation (Week 2, Days 10-11)
    alert(
      `Booking confirmation:\n\nProfessional: ${professionalName}\nDate: ${selectedDate}\nTime: ${selectedTime}\n\n(Booking flow integration coming in Week 2, Days 10-11)`
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            className="py-2 text-center font-medium text-neutral-500 text-xs uppercase"
            key={day}
          >
            {day}
          </div>
        ))}

        {/* Date cells */}
        {availability.map((day) => {
          const date = new Date(day.date);
          const dayOfMonth = date.getDate();
          const isSelected = selectedDate === day.date;
          const isSelectable = day.status === "available" || day.status === "limited";

          return (
            <button
              aria-label={`Select ${day.date} - ${day.status}`}
              className={cn(
                "relative aspect-square rounded-lg border font-medium text-sm transition-all",
                // Base styling
                isSelectable
                  ? "cursor-pointer hover:border-orange-500 hover:shadow-sm"
                  : "cursor-not-allowed opacity-50",
                // Selected state
                isSelected
                  ? "border-orange-500 bg-orange-50 text-orange-900 shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-900",
                // Status colors (indicator dot)
                !isSelected && "hover:scale-105"
              )}
              disabled={!isSelectable}
              key={day.date}
              onClick={() => handleDateSelect(day.date, day.status)}
              type="button"
            >
              <span className="absolute inset-0 flex items-center justify-center">
                {dayOfMonth}
              </span>

              {/* Status indicator dot */}
              <span
                className={cn(
                  "-translate-x-1/2 absolute bottom-1 left-1/2 h-1.5 w-1.5 rounded-full",
                  day.status === "available" && "bg-green-500",
                  day.status === "limited" && "bg-orange-500",
                  day.status === "booked" && "bg-neutral-400",
                  day.status === "blocked" && "bg-neutral-200"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && timeSlots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-neutral-900 text-sm">
              Available Times on {new Date(selectedDate).toLocaleDateString()}
            </h4>
            <span className="text-neutral-600 text-xs">{timeSlots.length} slots</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;

              return (
                <button
                  className={cn(
                    "rounded-lg border px-3 py-2 font-medium text-sm transition-all",
                    isSelected
                      ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-orange-500 hover:shadow-sm"
                  )}
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  type="button"
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirm Button */}
      {selectedDate && selectedTime && (
        <div className="pt-4">
          <button
            className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-sm text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleConfirmBooking}
            type="button"
          >
            {instantBooking ? "Book Instantly" : "Request Booking"} - {selectedTime} on{" "}
            {new Date(selectedDate).toLocaleDateString()}
          </button>
        </div>
      )}

      {/* Empty state */}
      {selectedDate && timeSlots.length === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-8 text-center">
          <p className="text-neutral-600 text-sm">
            No available time slots on this date. Please select another date.
          </p>
        </div>
      )}
    </div>
  );
}
