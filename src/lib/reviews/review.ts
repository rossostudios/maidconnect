// Review validation service - Extract validation logic from submit-customer-review action

import type { SupabaseClient } from "@supabase/supabase-js";

export type ValidationResult = {
  success: boolean;
  error?: string;
};

export type ReviewInput = {
  customerId: string | null;
  bookingId: string | null;
  rating: string | null;
  punctualityRating: string | null;
  communicationRating: string | null;
  respectfulnessRating: string | null;
};

export type ParsedRatings = {
  rating: number;
  punctualityRating: number | null;
  communicationRating: number | null;
  respectfulnessRating: number | null;
};

export type BookingAuthResult = {
  success: boolean;
  error?: string;
  booking?: {
    id: string;
    professional_id: string;
    customer_id: string;
    status: string;
  };
};

/**
 * Validate basic review input fields
 */
export function validateReviewInput(input: ReviewInput): ValidationResult {
  if (!input.customerId) {
    return { success: false, error: "Missing customer information." };
  }

  if (!input.bookingId) {
    return { success: false, error: "Missing booking information." };
  }

  const rating = input.rating ? Number.parseInt(input.rating, 10) : Number.NaN;
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Please provide a rating between 1 and 5." };
  }

  return { success: true };
}

/**
 * Verify booking exists and professional is authorized to review this customer
 */
export async function validateBookingAuthorization(
  supabase: SupabaseClient,
  bookingId: string,
  customerId: string,
  professionalId: string
): Promise<BookingAuthResult> {
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, professional_id, customer_id, status")
    .eq("id", bookingId)
    .eq("professional_id", professionalId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (bookingError || !booking) {
    return { success: false, error: "Booking not found or you're not authorized." };
  }

  if (booking.status !== "completed") {
    return { success: false, error: "Can only review completed bookings." };
  }

  return { success: true, booking };
}

/**
 * Parse rating values including optional category ratings
 */
export function parseReviewRatings(input: ReviewInput): ParsedRatings {
  const rating = input.rating ? Number.parseInt(input.rating, 10) : 0;

  const punctualityRating = input.punctualityRating
    ? Number.parseInt(input.punctualityRating, 10)
    : null;

  const communicationRating = input.communicationRating
    ? Number.parseInt(input.communicationRating, 10)
    : null;

  const respectfulnessRating = input.respectfulnessRating
    ? Number.parseInt(input.respectfulnessRating, 10)
    : null;

  return {
    rating,
    punctualityRating,
    communicationRating,
    respectfulnessRating,
  };
}
