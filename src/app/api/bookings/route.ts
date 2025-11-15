/**
 * Create a new booking
 * POST /api/bookings
 *
 * REFACTORED: Complexity 23 → <15
 * - Extracted business logic to booking-creation-service.ts
 * - Route now focuses on orchestration
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import type { BookingInsertInput } from "@/lib/bookings/booking-creation-service";
import {
  calculateBookingAmount,
  calculateScheduledEnd,
  cleanupFailedBooking,
  createBookingPaymentIntent,
  createPendingBooking,
  ensureStripeCustomer,
  linkPaymentIntentToBooking,
  sendNewBookingNotification,
} from "@/lib/bookings/booking-creation-service";
import { ValidationError } from "@/lib/errors";
import { trackBookingSubmittedServer } from "@/lib/integrations/posthog/server";
import type { CreateBookingInput } from "@/lib/validations/booking";
import { createBookingSchema } from "@/lib/validations/booking";

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  const validatedData = await parseBookingRequest(request);
  const derivedValues = deriveBookingValues(validatedData);

  const stripeCustomerId = await ensureStripeCustomer(supabase, user.id, user.email ?? null);
  const bookingPayload = buildBookingPayload(user.id, validatedData, derivedValues);
  const booking = await createBookingOrThrow(supabase, bookingPayload);

  const paymentIntent = await initializePaymentIntent({
    supabase,
    amount: derivedValues.amount,
    currency: validatedData.currency,
    stripeCustomerId,
    userId: user.id,
    bookingId: booking.id,
  });

  await linkPaymentIntentToBooking(
    supabase,
    booking.id,
    paymentIntent.id,
    paymentIntent.status,
    derivedValues.amount
  );

  await sendNewBookingNotification(
    supabase,
    validatedData.professionalId,
    booking.id,
    validatedData.serviceName ?? null,
    user.id,
    validatedData.scheduledStart ?? null
  );

  await trackBookingSubmittedServer(user.id, {
    bookingId: booking.id,
    professionalId: validatedData.professionalId,
    serviceType: validatedData.serviceName ?? "unknown",
    totalAmount: derivedValues.amount,
    currency: validatedData.currency,
    duration: validatedData.durationMinutes ?? 0,
  });

  return ok({
    bookingId: booking.id,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

// Apply rate limiting: 20 requests per minute
export const POST = withRateLimit(handler, "booking");

async function parseBookingRequest(request: Request): Promise<CreateBookingInput> {
  const body = await request.json();
  return createBookingSchema.parse(body);
}

type DerivedBookingValues = {
  scheduledEnd: string | null;
  amount: number;
};

function deriveBookingValues(data: CreateBookingInput): DerivedBookingValues {
  const scheduledEnd =
    data.scheduledEnd ??
    calculateScheduledEnd(data.scheduledStart ?? null, data.durationMinutes ?? null) ??
    null;

  const amount = calculateBookingAmount(
    data.amount,
    data.serviceHourlyRate ?? null,
    data.durationMinutes ?? null
  );

  return { scheduledEnd, amount };
}

function buildBookingPayload(
  customerId: string,
  data: CreateBookingInput,
  derived: DerivedBookingValues
): BookingInsertInput {
  return {
    customer_id: customerId,
    professional_id: data.professionalId,
    scheduled_start: data.scheduledStart ?? null,
    scheduled_end: derived.scheduledEnd,
    duration_minutes: data.durationMinutes ?? null,
    status: "pending_payment",
    amount_estimated: derived.amount,
    currency: data.currency,
    special_instructions: data.specialInstructions ?? null,
    address: data.address ? JSON.stringify(data.address) : null,
    service_name: data.serviceName ?? null,
    service_hourly_rate: data.serviceHourlyRate ?? null,
  };
}

async function createBookingOrThrow(supabase: SupabaseClient, payload: BookingInsertInput) {
  const bookingResult = await createPendingBooking(supabase, payload);
  if (!(bookingResult.success && bookingResult.booking)) {
    throw new ValidationError(bookingResult.error ?? "Unable to create booking");
  }
  return bookingResult.booking;
}

type PaymentInitializationInput = {
  supabase: SupabaseClient;
  amount: number;
  currency: string;
  stripeCustomerId: string;
  userId: string;
  bookingId: string;
};

async function initializePaymentIntent(input: PaymentInitializationInput) {
  const paymentResult = await createBookingPaymentIntent(
    input.amount,
    input.currency,
    input.stripeCustomerId,
    input.userId,
    input.bookingId
  );

  if (!(paymentResult.success && paymentResult.paymentIntent)) {
    await cleanupFailedBooking(input.supabase, input.bookingId);
    throw new ValidationError(paymentResult.error ?? "Unable to initialize payment");
  }

  return paymentResult.paymentIntent;
}
