/**
 * Booking types for mobile app
 * Based on web app bookings table
 */

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type BookingType = "marketplace" | "direct_hire";

export interface Booking {
  id: string;
  customer_id: string;
  professional_id: string;
  service_type: string;
  booking_type: BookingType;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: BookingStatus;
  address: {
    street: string;
    city: string;
    neighborhood?: string;
    notes?: string;
  };
  total_amount_cents: number;
  currency_code: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingCreateParams {
  professional_id: string;
  service_type: string;
  booking_type: BookingType;
  start_time: string;
  duration_hours: number;
  address: {
    street: string;
    city: string;
    neighborhood?: string;
    notes?: string;
  };
  special_instructions?: string;
}

export interface TimeSlot {
  start: string; // ISO 8601 datetime
  end: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}
