"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { calendarUtils } from "@/hooks/use-calendar-grid";
import type { BlockedDatesSet, CalendarBooking, UseCalendarAvailabilityReturn } from "../types";

type UseCalendarAvailabilityOptions = {
  professionalId: string;
  startDate: Date;
  endDate: Date;
};

/**
 * Hook for managing calendar availability data
 * Fetches blocked dates, bookings, and provides update functionality
 */
export function useCalendarAvailability({
  professionalId: _professionalId,
  startDate,
  endDate,
}: UseCalendarAvailabilityOptions): UseCalendarAvailabilityReturn {
  const [blockedDates, setBlockedDates] = useState<BlockedDatesSet>(new Set());
  const [bookingsByDate, setBookingsByDate] = useState<Map<string, CalendarBooking[]>>(new Map());
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability data
  const fetchAvailability = useCallback(async () => {
    try {
      const startDateKey = calendarUtils.formatDateKey(startDate);
      const endDateKey = calendarUtils.formatDateKey(endDate);

      // Fetch blocked dates and bookings in parallel
      const [blockedResponse, bookingsResponse] = await Promise.all([
        fetch(
          `/api/pro/availability/blocked-dates?startDate=${startDateKey}&endDate=${endDateKey}`
        ),
        fetch(`/api/pro/bookings/calendar?startDate=${startDateKey}&endDate=${endDateKey}`),
      ]);

      // Parse blocked dates
      if (blockedResponse.ok) {
        const blockedData = await blockedResponse.json();
        setBlockedDates(new Set(blockedData.blockedDates || []));
      }

      // Parse bookings
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const bookingsMap = new Map<string, CalendarBooking[]>();

        for (const booking of bookingsData.bookings || []) {
          const dateKey = booking.date; // Already in YYYY-MM-DD format from API
          const existing = bookingsMap.get(dateKey) || [];
          existing.push({
            id: booking.id,
            title: booking.title || booking.service_name,
            startTime: booking.start_time,
            endTime: booking.end_time,
            status: booking.status,
            customerName: booking.customer_name,
            serviceName: booking.service_name,
            amountCents: booking.amount || 0,
            currency: booking.currency || "COP",
          });
          bookingsMap.set(dateKey, existing);
        }

        setBookingsByDate(bookingsMap);
      }

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch availability";
      setError(message);
      console.error("Error fetching availability:", err);
    }
  }, [startDate, endDate]);

  // Fetch on mount and when date range changes
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Update blocked dates
  const updateBlockedDates = useCallback(async (dates: string[], action: "block" | "unblock") => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/pro/availability/blocked-dates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates, action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update blocked dates");
      }

      // Optimistically update local state
      setBlockedDates((prev) => {
        const updated = new Set(prev);
        for (const date of dates) {
          if (action === "block") {
            updated.add(date);
          } else {
            updated.delete(date);
          }
        }
        return updated;
      });

      const actionLabel = action === "block" ? "blocked" : "opened";
      toast.success(`${dates.length} date${dates.length > 1 ? "s" : ""} ${actionLabel}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update blocked dates";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchAvailability();
  }, [fetchAvailability]);

  return {
    blockedDates,
    bookingsByDate,
    updateBlockedDates,
    isUpdating,
    error,
    refetch,
  };
}
