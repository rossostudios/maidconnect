/**
 * Booking Creation Service - Business logic for creating new bookings
 *
 * Extracts booking creation workflow logic to reduce route complexity
 * Handles: Auto-calculations, Stripe customer management, payment intents, notifications
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/integrations/stripe";
import { notifyProfessionalNewBooking } from "@/lib/shared/notifications";

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

/** Booking record returned from database */
export type BookingRecord = {
  id: string;
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
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  amount_authorized: number | null;
  created_at: string;
  updated_at: string;
};

/** Stripe payment intent with fields we use */
export type StripePaymentIntent = {
  id: string;
  status: string;
  client_secret: string | null;
  amount: number;
  currency: string;
};

/** Address structure for booking location */
export type BookingAddress = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  apartment?: string;
  instructions?: string;
};

export type BookingCreationResult = {
  success: boolean;
  booking?: BookingRecord;
  error?: string;
};

export type PaymentIntentResult = {
  success: boolean;
  paymentIntent?: StripePaymentIntent;
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

/**
 * Complete booking creation orchestrator
 * Handles entire workflow: validation, calculations, payment setup, notifications
 *
 * @returns Success result with booking details or error
 */
export async function createCompleteBooking({
  supabase,
  userId,
  userEmail,
  validatedData,
}: {
  supabase: SupabaseClient;
  userId: string;
  userEmail: string | null;
  validatedData: {
    professionalId: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    durationMinutes?: number;
    amount?: number;
    currency: string;
    specialInstructions?: string;
    address?: BookingAddress;
    serviceName?: string;
    serviceHourlyRate?: number;
  };
}): Promise<
  | { success: true; bookingId: string; clientSecret: string; paymentIntentId: string }
  | { success: false; error: string }
> {
  const {
    professionalId,
    scheduledStart,
    durationMinutes,
    currency,
    specialInstructions,
    address,
    serviceName,
    serviceHourlyRate,
  } = validatedData;

  // Auto-calculate scheduledEnd if not provided
  const calculatedEnd =
    validatedData.scheduledEnd ||
    calculateScheduledEnd(scheduledStart ?? null, durationMinutes ?? null);

  // Auto-calculate amount
  const calculatedAmount = calculateBookingAmount(
    validatedData.amount,
    serviceHourlyRate ?? null,
    durationMinutes ?? null
  );

  // Ensure Stripe customer exists
  const stripeCustomerId = await ensureStripeCustomer(supabase, userId, userEmail);

  // Create pending booking record
  const bookingResult = await createPendingBooking(supabase, {
    customer_id: userId,
    professional_id: professionalId,
    scheduled_start: scheduledStart ?? null,
    scheduled_end: calculatedEnd ?? null,
    duration_minutes: durationMinutes ?? null,
    status: "pending_payment",
    amount_estimated: calculatedAmount,
    currency,
    special_instructions: specialInstructions ?? null,
    address: address ? JSON.stringify(address) : null,
    service_name: serviceName ?? null,
    service_hourly_rate: serviceHourlyRate ?? null,
  });

  if (!(bookingResult.success && bookingResult.booking)) {
    return { success: false, error: bookingResult.error ?? "Unable to create booking" };
  }

  const booking = bookingResult.booking;

  // Create payment intent
  const paymentResult = await createBookingPaymentIntent(
    calculatedAmount,
    currency,
    stripeCustomerId,
    userId,
    booking.id
  );

  if (!(paymentResult.success && paymentResult.paymentIntent)) {
    await cleanupFailedBooking(supabase, booking.id);
    return { success: false, error: paymentResult.error ?? "Unable to initialize payment" };
  }

  const paymentIntent = paymentResult.paymentIntent;

  // Link payment intent to booking
  await linkPaymentIntentToBooking(
    supabase,
    booking.id,
    paymentIntent.id,
    paymentIntent.status,
    calculatedAmount
  );

  // Send notification (fire-and-forget)
  sendNewBookingNotification(
    supabase,
    professionalId,
    booking.id,
    serviceName ?? null,
    userId,
    scheduledStart ?? null
  ).catch(console.error);

  return {
    success: true,
    bookingId: booking.id,
    clientSecret: paymentIntent.client_secret ?? "",
    paymentIntentId: paymentIntent.id,
  };
}
