import { useState, useEffect, useCallback } from "react";

/**
 * Day availability status type
 */
export type DayAvailability = {
  date: string; // YYYY-MM-DD format
  status: "available" | "limited" | "booked" | "blocked";
  availableSlots: string[];
  bookingCount: number;
  maxBookings: number;
};

/**
 * Availability data structure from API
 */
export type AvailabilityData = {
  professionalId: string;
  startDate: string;
  endDate: string;
  availability: DayAvailability[];
  instantBooking?: {
    enabled: boolean;
    settings: Record<string, any>;
  };
};

/**
 * Configuration options for the availability data hook
 */
export type UseAvailabilityDataOptions = {
  professionalId?: string;
  startDate: string;
  endDate: string;
  enabled?: boolean;
  onSuccess?: (data: AvailabilityData) => void;
  onError?: (error: Error) => void;
};

/**
 * Custom hook for fetching and managing availability data from API
 *
 * @param options - Configuration options for fetching availability data
 * @returns Object containing availability data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useAvailabilityData({
 *   professionalId: "123",
 *   startDate: "2025-01-01",
 *   endDate: "2025-01-31",
 * });
 * ```
 */
export function useAvailabilityData({
  professionalId,
  startDate,
  endDate,
  enabled = true,
  onSuccess,
  onError,
}: UseAvailabilityDataOptions) {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!(enabled && professionalId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `/api/professionals/${professionalId}/availability?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load availability: ${response.statusText}`);
      }

      const responseData = await response.json();
      setData(responseData);
      onSuccess?.(responseData);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to load availability");
      setError(errorObj);
      onError?.(errorObj);
    } finally {
      setLoading(false);
    }
  }, [professionalId, startDate, endDate, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const getDateAvailability = useCallback(
    (date: Date): DayAvailability | null => {
      if (!data) {
        return null;
      }
      const dateStr = formatDate(date);
      return data.availability.find((a) => a.date === dateStr) || null;
    },
    [data]
  );

  return {
    data,
    loading,
    error,
    refetch: fetchAvailability,
    getDateAvailability,
  };
}

/**
 * Helper function to format Date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
