"use server";

/**
 * Amara Booking Creation Server Action
 *
 * Handles booking creation from Amara chat interface.
 * Marks bookings with source='amara' for analytics tracking.
 */

import { createBooking } from "@/app/actions/bookings";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { CreateBookingInput } from "@/types";

export type AmaraBookingInput = {
  professionalId: string;
  professionalName: string;
  serviceType: string;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:MM
  estimatedDuration: number; // hours
  estimatedPrice: number; // cents
  conversationId?: string;
  specialRequirements?: string[];
  customerNotes?: string;
};

export type CreateAmaraBookingResponse =
  | { success: true; bookingId: string; bookingNumber: string }
  | { success: false; error: string };

/**
 * Create a booking from Amara chat interface
 *
 * Maps Amara booking data to standard booking input format
 * and creates booking with 'amara' source tracking
 */
export async function createBookingFromAmara(
  input: AmaraBookingInput
): Promise<CreateAmaraBookingResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user (customer)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get professional's default service and profile info (including country)
    const { data: professionalService, error: serviceError } = await supabase
      .from("professional_services")
      .select("id, pricing_tiers(id)")
      .eq("professional_id", input.professionalId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (serviceError || !professionalService) {
      return {
        success: false,
        error: "Could not find active service for this professional",
      };
    }

    // Get professional's country for multi-country support
    const { data: professionalProfile } = await supabase
      .from("professional_profiles")
      .select("country_code")
      .eq("profile_id", input.professionalId)
      .maybeSingle();

    // Use professional's country or fallback to CO for backward compatibility
    const professionalCountry = professionalProfile?.country_code || "CO";

    // Calculate scheduled times
    const scheduledDateTime = new Date(`${input.selectedDate}T${input.selectedTime}:00`);
    const scheduledEndDateTime = new Date(
      scheduledDateTime.getTime() + input.estimatedDuration * 60 * 60 * 1000
    );

    const scheduledStartTime = scheduledDateTime.toTimeString().slice(0, 8); // HH:MM:SS
    const scheduledEndTime = scheduledEndDateTime.toTimeString().slice(0, 8); // HH:MM:SS

    // Prepare booking input
    const bookingInput: CreateBookingInput = {
      professionalId: input.professionalId,
      serviceId: professionalService.id,
      pricingTierId: professionalService.pricing_tiers?.[0]?.id,
      scheduledDate: input.selectedDate,
      scheduledStartTime,
      scheduledEndTime,
      customerNotes: input.customerNotes,
      specialRequirements: input.specialRequirements || [],
      // Address will be collected later in the booking flow
      // Country is derived from professional's country for multi-country support
      serviceAddressCountry: professionalCountry,
    };

    // Create the booking using existing booking creation logic
    const result = await createBooking(user.id, bookingInput);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Update booking with Amara source tracking
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        booking_source: "amara",
        source_details: {
          conversation_id: input.conversationId,
          professional_name: input.professionalName,
          service_type: input.serviceType,
          estimated_price_shown: input.estimatedPrice,
          estimated_duration_hours: input.estimatedDuration,
          created_via: "amara_v2_generative_ui",
        },
        first_touch_source: "amara",
        last_touch_source: "amara",
        touch_points: 1,
      })
      .eq("id", result.booking.id);

    if (updateError) {
      console.error("[amara-booking] Failed to update source tracking:", updateError);
      // Don't fail the booking creation if source tracking fails
    }

    return {
      success: true,
      bookingId: result.booking.id,
      bookingNumber: result.booking.bookingNumber,
    };
  } catch (error) {
    console.error("[amara-booking] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
