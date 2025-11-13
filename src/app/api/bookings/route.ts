/**
 * Create a new booking
 * POST /api/bookings
 *
 * REFACTORED: Complexity 23 → <15
 * - Extracted business logic to booking-creation-service.ts
 * - Route now focuses on orchestration
 */

import { ok, withAuth, withRateLimit } from "@/lib/api";
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
import { createBookingSchema } from "@/lib/validations/booking";

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  // Validate request body with Zod schema
  const body = await request.json();
  const validatedData = createBookingSchema.parse(body);

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
  let { scheduledEnd, amount } = validatedData;

  // Auto-calculate scheduledEnd if not provided using service
  if (!scheduledEnd) {
    scheduledEnd =
      calculateScheduledEnd(scheduledStart ?? null, durationMinutes ?? null) || undefined;
  }

  // Auto-calculate amount if not provided using service
  amount = calculateBookingAmount(
    amount ?? null,
    serviceHourlyRate ?? null,
    durationMinutes ?? null
  );

  // Ensure Stripe customer exists using service
  const stripeCustomerId = await ensureStripeCustomer(supabase, user.id, user.email ?? null);

  // Create pending booking record using service
  const bookingResult = await createPendingBooking(supabase, {
    customer_id: user.id,
    professional_id: professionalId,
    scheduled_start: scheduledStart ?? null,
    scheduled_end: scheduledEnd ?? null,
    duration_minutes: durationMinutes ?? null,
    status: "pending_payment",
    amount_estimated: amount,
    currency,
    special_instructions: specialInstructions ?? null,
    address: address ? JSON.stringify(address) : null,
    service_name: serviceName ?? null,
    service_hourly_rate: serviceHourlyRate ?? null,
  });

  if (!(bookingResult.success && bookingResult.booking)) {
    throw new ValidationError(bookingResult.error ?? "Unable to create booking");
  }

  const insertedBooking = bookingResult.booking;

  // Create payment intent using service
  const paymentResult = await createBookingPaymentIntent(
    amount,
    currency,
    stripeCustomerId,
    user.id,
    insertedBooking.id
  );

  if (!(paymentResult.success && paymentResult.paymentIntent)) {
    // Clean up booking if payment intent creation fails
    await cleanupFailedBooking(supabase, insertedBooking.id);
    throw new ValidationError(paymentResult.error ?? "Unable to initialize payment");
  }

  const paymentIntent = paymentResult.paymentIntent;

  // Link payment intent to booking using service
  await linkPaymentIntentToBooking(
    supabase,
    insertedBooking.id,
    paymentIntent.id,
    paymentIntent.status,
    amount
  );

  // Send notification to professional using service (fire-and-forget)
  await sendNewBookingNotification(
    supabase,
    professionalId,
    insertedBooking.id,
    serviceName ?? null,
    user.id,
    scheduledStart ?? null
  );

  // Track booking submission
  await trackBookingSubmittedServer(user.id, {
    bookingId: insertedBooking.id,
    professionalId,
    serviceType: serviceName ?? "unknown",
    totalAmount: amount,
    currency,
    duration: durationMinutes ?? 0,
  });

  return ok({
    bookingId: insertedBooking.id,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

// Apply rate limiting: 20 requests per minute
export const POST = withRateLimit(handler, "booking");
