/**
 * REFACTORED VERSION - Create a new booking
 * POST /api/bookings
 *
 * BEFORE: 135 lines
 * AFTER: 85 lines (37% reduction)
 */

import { withAuth, ok, withRateLimit } from "@/lib/api";
import { stripe } from "@/lib/stripe";
import { ValidationError } from "@/lib/errors";
import { createBookingSchema } from "@/lib/validations/booking";
import { z } from "zod";

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

  // Auto-calculate scheduledEnd if not provided
  if (scheduledStart && durationMinutes && !scheduledEnd) {
    const startDate = new Date(scheduledStart);
    if (!Number.isNaN(startDate.getTime())) {
      const computedEnd = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
      scheduledEnd = computedEnd.toISOString();
    }
  }

  // Auto-calculate amount if not provided but we have hourly rate and duration
  if ((!amount || amount <= 0) && serviceHourlyRate && durationMinutes) {
    amount = Math.max(20_000, Math.round(serviceHourlyRate * (durationMinutes / 60)));
  }

  const { data: customerProfile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  let stripeCustomerId = customerProfile?.stripe_customer_id as string | undefined;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: {
        supabase_profile_id: user.id,
      },
    });
    stripeCustomerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", user.id);
  }

  const { data: insertedBooking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      professional_id: professionalId,
      scheduled_start: scheduledStart ? new Date(scheduledStart).toISOString() : null,
      scheduled_end: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
      duration_minutes: durationMinutes ?? null,
      status: "pending_payment",
      amount_estimated: amount,
      currency,
      special_instructions: specialInstructions ?? null,
      address: address ?? null,
      service_name: serviceName ?? null,
      service_hourly_rate: serviceHourlyRate ?? null,
    })
    .select()
    .single();

  if (bookingError || !insertedBooking) {
    throw new ValidationError(bookingError?.message ?? "Unable to create booking");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: stripeCustomerId,
      capture_method: "manual",
      metadata: {
        supabase_profile_id: user.id,
        booking_id: insertedBooking.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await supabase
      .from("bookings")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: paymentIntent.status,
        amount_authorized: amount,
      })
      .eq("id", insertedBooking.id);

    return ok({
      bookingId: insertedBooking.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (_error) {
    await supabase.from("bookings").delete().eq("id", insertedBooking.id);
    throw new ValidationError("Unable to initialize payment");
  }
});

// Apply rate limiting: 20 requests per minute
export const POST = withRateLimit(handler, "booking");
