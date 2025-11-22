import type { AvailabilityResponse, Booking, BookingCreateParams } from "@/types/api/booking";
import { supabase } from "../supabase";

/**
 * Create a new booking
 */
export async function createBooking(params: BookingCreateParams): Promise<Booking> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        ...params,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return data as Booking;
  } catch (error) {
    console.error("[createBooking] Error:", error);
    throw error;
  }
}

/**
 * Get bookings for current user
 */
export async function getMyBookings(status?: string): Promise<Booking[]> {
  try {
    let query = supabase.from("bookings").select("*").order("start_time", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as Booking[];
  } catch (error) {
    console.error("[getMyBookings] Error:", error);
    return [];
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();

    if (error) throw error;

    return data as Booking;
  } catch (error) {
    console.error("[getBookingById] Error:", error);
    throw error;
  }
}

/**
 * Get professional availability for a date
 */
export async function getProfessionalAvailability(
  professionalId: string,
  date: string // YYYY-MM-DD
): Promise<AvailabilityResponse> {
  try {
    // This would typically call an API endpoint that calculates availability
    // For now, we'll return mock data

    // Generate time slots for the day (8 AM to 8 PM)
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      const start = `${date}T${hour.toString().padStart(2, "0")}:00:00`;
      const end = `${date}T${(hour + 1).toString().padStart(2, "0")}:00:00`;

      slots.push({
        start,
        end,
        available: Math.random() > 0.3, // 70% availability (mock)
      });
    }

    return {
      date,
      slots,
    };
  } catch (error) {
    console.error("[getProfessionalAvailability] Error:", error);
    throw error;
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) throw error;
  } catch (error) {
    console.error("[cancelBooking] Error:", error);
    throw error;
  }
}
