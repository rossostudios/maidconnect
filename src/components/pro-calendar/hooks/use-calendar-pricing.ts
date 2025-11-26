"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { calendarUtils } from "@/hooks/use-calendar-grid";
import type { PricingByDate, UseCalendarPricingReturn } from "../types";

type UseCalendarPricingOptions = {
  professionalId: string;
  startDate: Date;
  endDate: Date;
  initialDefaultRate?: number;
};

/**
 * Hook for managing calendar pricing data
 * Fetches per-date pricing and provides update functionality
 */
export function useCalendarPricing({
  professionalId: _professionalId,
  startDate,
  endDate,
  initialDefaultRate = 0,
}: UseCalendarPricingOptions): UseCalendarPricingReturn {
  const [pricingByDate, setPricingByDate] = useState<PricingByDate>({});
  const [defaultRateCents, setDefaultRateCents] = useState(initialDefaultRate);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pricing data for the date range
  const fetchPricing = useCallback(async () => {
    try {
      const startDateKey = calendarUtils.formatDateKey(startDate);
      const endDateKey = calendarUtils.formatDateKey(endDate);

      const response = await fetch(
        `/api/pro/availability/pricing?startDate=${startDateKey}&endDate=${endDateKey}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch pricing");
      }

      const data = await response.json();
      setPricingByDate(data.pricingByDate || {});
      setDefaultRateCents(data.defaultRateCents || initialDefaultRate);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch pricing";
      setError(message);
      console.error("Error fetching pricing:", err);
    }
  }, [startDate, endDate, initialDefaultRate]);

  // Fetch on mount and when date range changes
  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // Update pricing for selected dates
  const updatePricing = useCallback(async (dates: string[], rateCents: number) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/pro/availability/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates,
          hourlyRateCents: rateCents,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update pricing");
      }

      // Optimistically update local state
      setPricingByDate((prev) => {
        const updated = { ...prev };
        for (const date of dates) {
          updated[date] = rateCents;
        }
        return updated;
      });

      toast.success(`Pricing updated for ${dates.length} date${dates.length > 1 ? "s" : ""}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update pricing";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    pricingByDate,
    defaultRateCents,
    updatePricing,
    isUpdating,
    error,
  };
}
