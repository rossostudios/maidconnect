/**
 * Realtime Booking Hook
 * Subscribes to booking updates using Supabase Realtime for instant status changes
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useRealtimeBooking(bookingId: string | null) {
  const queryClient = useQueryClient();

  const handleBookingUpdate = useCallback(() => {
    if (!bookingId) {
      return;
    }

    // Invalidate booking detail query to refetch with updated data
    queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });

    // Also invalidate bookings list
    queryClient.invalidateQueries({ queryKey: ["bookings"] });

    console.log("[realtime] Booking updated:", bookingId);
  }, [bookingId, queryClient]);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    console.log(`[realtime] Subscribing to booking updates for: ${bookingId}`);

    // Subscribe to UPDATE events on the bookings table for this specific booking
    const channel = supabase
      .channel(`booking:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          console.log("[realtime] Booking status changed:", payload.new);
          handleBookingUpdate();
        }
      )
      .subscribe((status) => {
        console.log("[realtime] Booking subscription status:", status);
      });

    return () => {
      console.log(`[realtime] Unsubscribing from booking: ${bookingId}`);
      supabase.removeChannel(channel);
    };
  }, [bookingId, handleBookingUpdate]);
}
