"use server";

import { insertBookingAddons } from "@/lib/bookings/addon-service";
import { mapBookingInputToUpdateData } from "@/lib/bookings/booking-field-mapper";
import { buildBookingInsertData } from "@/lib/bookings/booking-insert-builder";
import { calculateBookingPricing } from "@/lib/bookings/pricing-service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  Booking,
  BookingAddon,
  BookingStatusHistory,
  BookingWithDetails,
  CancelBookingInput,
  CancelBookingResponse,
  CheckBookingAvailabilityResponse,
  CreateBookingInput,
  CreateBookingResponse,
  CustomerBookingSummary,
  GetBookingResponse,
  GetBookingsResponse,
  GetCustomerBookingSummaryResponse,
  GetProfessionalBookingSummaryResponse,
  ProfessionalBookingSummary,
  RateBookingInput,
  RateBookingResponse,
  UpdateBookingInput,
  UpdateBookingResponse,
} from "@/types";

/**
 * Create a new booking
 */
export async function createBooking(
  customerId: string,
  input: CreateBookingInput
): Promise<CreateBookingResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // SECURITY: Calculate pricing from database (never trust client input)
    const pricingResult = await calculateBookingPricing(
      supabase,
      input.serviceId,
      input.pricingTierId,
      input.addonIds
    );

    if (!pricingResult.success) {
      return { success: false, error: pricingResult.error };
    }

    // Build insert data using helper to reduce complexity
    const insertData = buildBookingInsertData(customerId, input, pricingResult.pricing);

    // Create booking with server-calculated prices
    const { data, error } = await supabase.from("bookings").insert(insertData).select().single();

    if (error) {
      console.error("Error creating booking:", error);
      return { success: false, error: error.message };
    }

    // Insert booking addons using service
    await insertBookingAddons(supabase, data.id, input.addonIds);

    const booking: Booking = mapDatabaseBooking(data);
    return { success: true, booking };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing booking
 */
export async function updateBooking(
  bookingId: string,
  input: UpdateBookingInput
): Promise<UpdateBookingResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Map input fields to database format using helper to reduce complexity
    const updateData = mapBookingInputToUpdateData(input);

    const { data, error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      return { success: false, error: error.message };
    }

    const booking: Booking = mapDatabaseBooking(data);
    return { success: true, booking };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  bookingId: string,
  userId: string,
  input: CancelBookingInput
): Promise<CancelBookingResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: input.reason,
        cancelled_by: userId,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (error) {
      console.error("Error cancelling booking:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single booking with details
 */
export async function getBooking(bookingId: string): Promise<GetBookingResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        customer:profiles!bookings_customer_id_fkey(id, full_name, avatar_url, phone_number),
        professional:profiles!bookings_professional_id_fkey(id, full_name, avatar_url, phone_number),
        service:professional_services(id, name, description, service_categories(name))
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      console.error("Error fetching booking:", bookingError);
      return { success: false, error: bookingError.message };
    }

    // Get addons
    const { data: addonsData } = await supabase
      .from("booking_addons")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at");

    // Get status history
    const { data: historyData } = await supabase
      .from("booking_status_history")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });

    const booking: BookingWithDetails = {
      ...mapDatabaseBooking(bookingData),
      customer: bookingData.customer
        ? {
            id: bookingData.customer.id,
            fullName: bookingData.customer.full_name,
            avatarUrl: bookingData.customer.avatar_url,
            phoneNumber: bookingData.customer.phone_number,
          }
        : undefined,
      professional: bookingData.professional
        ? {
            id: bookingData.professional.id,
            fullName: bookingData.professional.full_name,
            avatarUrl: bookingData.professional.avatar_url,
            phoneNumber: bookingData.professional.phone_number,
          }
        : undefined,
      service: bookingData.service
        ? {
            id: bookingData.service.id,
            name: bookingData.service.name,
            description: bookingData.service.description,
            categoryName: bookingData.service.service_categories?.name || null,
          }
        : undefined,
      addons: (addonsData || []).map(mapDatabaseBookingAddon),
      statusHistory: (historyData || []).map(mapDatabaseStatusHistory),
    };

    return { success: true, booking };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get bookings for a user (as customer or professional)
 */
export async function getBookings(
  userId: string,
  role: "customer" | "professional",
  status?: string
): Promise<GetBookingsResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        customer:profiles!bookings_customer_id_fkey(id, full_name, avatar_url),
        professional:profiles!bookings_professional_id_fkey(id, full_name, avatar_url),
        service:professional_services(id, name, description)
      `
      )
      .order("scheduled_date", { ascending: false })
      .order("scheduled_start_time", { ascending: false });

    if (role === "customer") {
      query = query.eq("customer_id", userId);
    } else {
      query = query.eq("professional_id", userId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching bookings:", error);
      return { success: false, error: error.message };
    }

    const bookings: BookingWithDetails[] = data.map((booking) => ({
      ...mapDatabaseBooking(booking),
      customer: booking.customer
        ? {
            id: booking.customer.id,
            fullName: booking.customer.full_name,
            avatarUrl: booking.customer.avatar_url,
            phoneNumber: null,
          }
        : undefined,
      professional: booking.professional
        ? {
            id: booking.professional.id,
            fullName: booking.professional.full_name,
            avatarUrl: booking.professional.avatar_url,
            phoneNumber: null,
          }
        : undefined,
      service: booking.service
        ? {
            id: booking.service.id,
            name: booking.service.name,
            description: booking.service.description,
            categoryName: null,
          }
        : undefined,
    }));

    return { success: true, bookings };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Rate a booking (customer or professional)
 */
export async function rateBooking(
  bookingId: string,
  role: "customer" | "professional",
  input: RateBookingInput
): Promise<RateBookingResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const updateData: any = {};
    if (role === "customer") {
      updateData.customer_rating = input.rating;
      updateData.customer_review = input.review || null;
      updateData.customer_rated_at = new Date().toISOString();
    } else {
      updateData.professional_rating = input.rating;
      updateData.professional_review = input.review || null;
      updateData.professional_rated_at = new Date().toISOString();
    }

    const { error } = await supabase.from("bookings").update(updateData).eq("id", bookingId);

    if (error) {
      console.error("Error rating booking:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get customer booking summary
 */
export async function getCustomerBookingSummary(
  customerId: string
): Promise<GetCustomerBookingSummaryResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_customer_booking_summary", {
      customer_profile_id: customerId,
    });

    if (error) {
      console.error("Error fetching customer summary:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      const defaultSummary: CustomerBookingSummary = {
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalSpentCop: 0,
        pendingRatings: 0,
      };
      return { success: true, summary: defaultSummary };
    }

    const summary: CustomerBookingSummary = {
      totalBookings: data[0].total_bookings,
      pendingBookings: data[0].pending_bookings,
      completedBookings: data[0].completed_bookings,
      cancelledBookings: data[0].cancelled_bookings,
      totalSpentCop: data[0].total_spent_cop,
      pendingRatings: data[0].pending_ratings,
    };

    return { success: true, summary };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get professional booking summary
 */
export async function getProfessionalBookingSummary(
  professionalId: string
): Promise<GetProfessionalBookingSummaryResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_professional_booking_summary", {
      professional_profile_id: professionalId,
    });

    if (error) {
      console.error("Error fetching professional summary:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      const defaultSummary: ProfessionalBookingSummary = {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalEarnedCop: 0,
        averageRating: 0,
        totalRatings: 0,
      };
      return { success: true, summary: defaultSummary };
    }

    const summary: ProfessionalBookingSummary = {
      totalBookings: data[0].total_bookings,
      pendingBookings: data[0].pending_bookings,
      confirmedBookings: data[0].confirmed_bookings,
      completedBookings: data[0].completed_bookings,
      cancelledBookings: data[0].cancelled_bookings,
      totalEarnedCop: data[0].total_earned_cop,
      averageRating: data[0].average_rating || 0,
      totalRatings: data[0].total_ratings,
    };

    return { success: true, summary };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check booking availability
 */
export async function checkBookingAvailability(
  professionalId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<CheckBookingAvailabilityResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("check_booking_availability", {
      professional_profile_id: professionalId,
      booking_date: date,
      start_time: startTime,
      end_time: endTime,
      exclude_booking_id: excludeBookingId || null,
    });

    if (error) {
      console.error("Error checking availability:", error);
      return { success: false, error: error.message };
    }

    return { success: true, available: data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Helper Mapping Functions
// ============================================================================

function mapDatabaseBooking(data: any): Booking {
  return {
    id: data.id,
    customerId: data.customer_id,
    professionalId: data.professional_id,
    serviceId: data.service_id,
    pricingTierId: data.pricing_tier_id,
    bookingNumber: data.booking_number,
    status: data.status,
    scheduledDate: data.scheduled_date,
    scheduledStartTime: data.scheduled_start_time,
    scheduledEndTime: data.scheduled_end_time,
    actualStartTime: data.actual_start_time,
    actualEndTime: data.actual_end_time,
    serviceAddressId: data.service_address_id,
    serviceAddressLine1: data.service_address_line1,
    serviceAddressLine2: data.service_address_line2,
    serviceAddressCity: data.service_address_city,
    servicePostalCode: data.service_address_postal_code,
    serviceAddressCountry: data.service_address_country,
    locationLat: data.location_lat,
    locationLng: data.location_lng,
    basePriceCop: data.base_price_cop,
    tierPriceCop: data.tier_price_cop,
    addonsPriceCop: data.addons_price_cop,
    tipAmountCop: data.tip_amount_cop,
    totalPriceCop: data.total_price_cop,
    customerNotes: data.customer_notes,
    professionalNotes: data.professional_notes,
    specialRequirements: data.special_requirements || [],
    cancellationReason: data.cancellation_reason,
    cancelledBy: data.cancelled_by,
    cancelledAt: data.cancelled_at,
    customerRating: data.customer_rating,
    customerReview: data.customer_review,
    customerRatedAt: data.customer_rated_at,
    professionalRating: data.professional_rating,
    professionalReview: data.professional_review,
    professionalRatedAt: data.professional_rated_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapDatabaseStatusHistory(data: any): BookingStatusHistory {
  return {
    id: data.id,
    bookingId: data.booking_id,
    oldStatus: data.old_status,
    newStatus: data.new_status,
    changedBy: data.changed_by,
    reason: data.reason,
    createdAt: data.created_at,
  };
}

function mapDatabaseBookingAddon(data: any): BookingAddon {
  return {
    id: data.id,
    bookingId: data.booking_id,
    addonId: data.addon_id,
    addonName: data.addon_name,
    addonPriceCop: data.addon_price_cop,
    quantity: data.quantity,
    createdAt: data.created_at,
  };
}
