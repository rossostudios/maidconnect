"use client";

/**
 * Props for the booking availability calendar
 * This is a migration example showing how to use the new unified calendar
 */
type Props = {
  professionalId: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date | null) => void;
  onTimeSelect: (time: string | null) => void;
  durationHours?: number;
};

/**
 * Booking Availability Calendar (V2 - Unified)
 *
 * This component replaces the original availability-calendar.tsx
 * with a cleaner implementation using the unified calendar component.
 *
 * Migration: Replace imports of `AvailabilityCalendar` from
 * `@/components/booking/availability-calendar` with this component.
 *
 * @example
 * ```tsx
 * // Before:
 * import { AvailabilityCalendar } from "@/components/booking/availability-calendar";
 *
 * // After:
 * import { AvailabilityCalendar } from "@/components/booking/availability-calendar-v2";
 * ```
 */
export function AvailabilityCalendar({
  professionalId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  durationHours: _durationHours = 2,
}: Props) {
  return (
    <AvailabilityCalendar
      dataSource={{
        type: "api",
        professionalId,
      }}
      locale="en-US"
      onDateSelect={onDateSelect}
      onTimeSelect={onTimeSelect}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      showLegend={true}
      showTimeSlots={true}
      showTodayButton={true}
      size="medium"
      theme="default"
    />
  );
}
