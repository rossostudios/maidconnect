"use client";

import { useEffect, useState } from "react";
import { useAdminCountryFilter } from "@/lib/contexts/AdminCountryFilterContext";
import type { CombinedBooking } from "@/lib/admin/booking-management-service";
import { BookingManagementTable } from "./booking-management-table";

/**
 * BookingManagementDashboard - Main booking management interface with Lia design
 *
 * Features:
 * - Fetches all bookings with country filtering
 * - Real-time country filter updates from AdminCountryFilterContext
 * - Client-side table with search, sorting, and pagination
 * - Status filtering (pending, confirmed, completed, etc.)
 *
 * Performance: Fetches up to 10k bookings for instant client-side filtering.
 * For larger datasets, implement server-side pagination.
 */
export function BookingManagementDashboard() {
  const [bookings, setBookings] = useState<CombinedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCountry } = useAdminCountryFilter();

  useEffect(() => {
    async function loadBookings() {
      setIsLoading(true);
      try {
        // Fetch bookings with country filter
        const params = new URLSearchParams({
          limit: "10000",
          country: selectedCountry,
        });

        const response = await fetch(`/api/admin/bookings?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error("Error loading bookings:", error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadBookings();
  }, [selectedCountry]); // Reload when country filter changes

  return <BookingManagementTable isLoading={isLoading} bookings={bookings} />;
}
