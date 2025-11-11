/**
 * Booking Creation Service - Business logic for creating new bookings
 *
 * Extracts booking creation workflow logic to reduce route complexity
 * Handles: Auto-calculations, Stripe customer management, payment intents, notifications
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyProfessionalNewBooking } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";

export type BookingInsertInput = {
  customer_id: string;
  professional_id: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  status: string;
  amount_estimated: number;
  currency: string;
  special_instructions: string | null;
  address: string | null;
  service_name: string | null;
  service_hourly_rate: number | null;
};

export type BookingCreationResult = {
  success: boolean;
  booking?: any;
  error?: string;
};

export type PaymentIntentResult = {
  success: boolean;
  paymentIntent?: any;
  error?: string;
};

/**
 * Calculate scheduled end time from start time and duration
 * Returns null if inputs are invalid
 */
export function calculateScheduledEnd(
  scheduledStart: string | null,
  durationMinutes: number | null
): string | null {
  if (!(scheduledStart && durationMinutes)) {
    return null;
  }

  const startDate = new Date(scheduledStart);
  if (Number.isNaN(startDate.getTime())) {
    return null;
  }

  const computedEnd = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  return computedEnd.toISOString();
}

/**
 * Calculate booking amount from hourly rate and duration
 * Applies minimum amount floor (20,000 = $20.00)
 */
export function calculateBookingAmount(
  amount: number | undefined,
  serviceHourlyRate: number | null,
  durationMinutes: number | null
): number {
  // If amount already provided and valid, use it
  if (amount && amount > 0) {
    return amount;
  }

  // Calculate from hourly rate if available
  if (serviceHourlyRate && durationMinutes) {
    const calculatedAmount = Math.round(serviceHourlyRate * (durationMinutes / 60));
    // Apply minimum floor of 20,000 cents ($20.00)
    return Math.max(20_000, calculatedAmount);
  }

  // Default to minimum if no calculation possible
  return 20_000;
}

/**
 * Get existing Stripe customer ID or create new customer
 * Updates profile with new customer ID if created
 */
export async function ensureStripeCustomer(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | null
): Promise<string> {
  // Check if customer already has Stripe customer ID
  const { data: customerProfile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  let stripeCustomerId = customerProfile?.stripe_customer_id as string | undefined;

  // Create new Stripe customer if doesn't exist
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: userEmail ?? undefined,
      metadata: {
        supabase_profile_id: userId,
      },
    });
    stripeCustomerId = customer.id;

    // Update profile with new Stripe customer ID
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", userId);
  }

  return stripeCustomerId;
}

/**
 * Create pending booking record in database
 */
export async function createPendingBooking(
  supabase: SupabaseClient,
  insertData: BookingInsertInput
): Promise<BookingCreationResult> {
  const { data: insertedBooking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      customer_id: insertData.customer_id,
      professional_id: insertData.professional_id,
      scheduled_start: insertData.scheduled_start
        ? new Date(insertData.scheduled_start).toISOString()
        : null,
      scheduled_end: insertData.scheduled_end
        ? new Date(insertData.scheduled_end).toISOString()
        : null,
      duration_minutes: insertData.duration_minutes ?? null,
      status: insertData.status,
      amount_estimated: insertData.amount_estimated,
      currency: insertData.currency,
      special_instructions: insertData.special_instructions ?? null,
      address: insertData.address ?? null,
      service_name: insertData.service_name ?? null,
      service_hourly_rate: insertData.service_hourly_rate ?? null,
    })
    .select()
    .single();

  if (bookingError || !insertedBooking) {
    return {
      success: false,
      error: bookingError?.message ?? "Unable to create booking",
    };
  }

  return {
    success: true,
    booking: insertedBooking,
  };
}

/**
 * Create Stripe payment intent for booking
 * Uses manual capture to authorize funds without charging
 */
export async function createBookingPaymentIntent(
  amount: number,
  currency: string,
  stripeCustomerId: string,
  userId: string,
  bookingId: string
): Promise<PaymentIntentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: stripeCustomerId,
      capture_method: "manual", // Authorize but don't capture yet
      metadata: {
        supabase_profile_id: userId,
        booking_id: bookingId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment intent",
    };
  }
}

/**
 * Link payment intent to booking record
 * Updates booking with payment intent ID and authorization amount
 */
export async function linkPaymentIntentToBooking(
  supabase: SupabaseClient,
  bookingId: string,
  paymentIntentId: string,
  paymentStatus: string,
  amount: number
): Promise<void> {
  await supabase
    .from("bookings")
    .update({
      stripe_payment_intent_id: paymentIntentId,
      stripe_payment_status: paymentStatus,
      amount_authorized: amount,
    })
    .eq("id", bookingId);
}

/**
 * Send new booking notification to professional
 * Fire-and-forget - doesn't fail booking creation if notification fails
 */
export async function sendNewBookingNotification(
  supabase: SupabaseClient,
  professionalId: string,
  bookingId: string,
  serviceName: string | null,
  customerId: string,
  scheduledStart: string | null
): Promise<void> {
  if (!scheduledStart) {
    return; // Skip notification if no scheduled time
  }

  // Get customer name
  const { data: customerData } = await supabase.auth.admin.getUserById(customerId);

  await notifyProfessionalNewBooking(professionalId, {
    id: bookingId,
    serviceName: serviceName || "Service",
    customerName: customerData?.user?.user_metadata?.full_name || "A customer",
    scheduledStart,
  }).catch((error) => {
    // Don't fail booking creation if notification fails
    console.error("[booking-creation] Failed to send new booking notification:", error);
  });
}

/**
 * Clean up failed booking
 * Deletes booking record if payment intent creation fails
 */
export async function cleanupFailedBooking(
  supabase: SupabaseClient,
  bookingId: string
): Promise<void> {
  await supabase.from("bookings").delete().eq("id", bookingId);
}
