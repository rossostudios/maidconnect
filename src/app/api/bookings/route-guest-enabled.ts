/**
 * GUEST-ENABLED VERSION - Create a new booking
 * POST /api/bookings
 *
 * SUPPORTS: Authenticated users AND guest checkout (Sprint 1)
 * This is the new version with guest support - rename to route.ts when ready to deploy
 */

import { ok, withRateLimit } from "@/lib/api";
import { withAuthOrGuest } from "@/lib/api/with-auth-or-guest";
import { ValidationError } from "@/lib/errors";
import { notifyProfessionalNewBooking } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";
import { createBookingSchema } from "@/lib/validations/booking";

const handler = withAuthOrGuest(
  async ({ user, guestSession, isGuest, supabase }, request: Request) => {
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

    // Determine customer email and metadata
    const customerEmail = isGuest ? guestSession!.email : user!.email;
    const customerName = isGuest ? guestSession!.full_name : undefined;

    // Get or create Stripe customer
    let stripeCustomerId: string | undefined;

    if (!isGuest && user) {
      // Authenticated user: get/create from profile
      const { data: customerProfile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .maybeSingle();

      stripeCustomerId = customerProfile?.stripe_customer_id as string | undefined;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: customerEmail ?? undefined,
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
    } else {
      // Guest user: create temporary Stripe customer
      const customer = await stripe.customers.create({
        email: customerEmail ?? undefined,
        name: customerName,
        metadata: {
          guest_session_id: guestSession!.id,
          is_guest: "true",
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create booking with either customer_id or guest_session_id
    const { data: insertedBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: isGuest ? null : user!.id,
        guest_session_id: isGuest ? guestSession!.id : null,
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
          ...(isGuest
            ? {
                guest_session_id: guestSession!.id,
                guest_email: customerEmail,
              }
            : {
                supabase_profile_id: user!.id,
              }),
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

      // Notify professional about new booking request
      const notificationCustomerName = isGuest
        ? guestSession!.full_name
        : (await supabase.auth.admin
            .getUserById(user!.id)
            .then((r) => r.data?.user?.user_metadata?.full_name)) || "A customer";

      if (scheduledStart) {
        await notifyProfessionalNewBooking(professionalId, {
          id: insertedBooking.id,
          serviceName: serviceName || "Service",
          customerName: notificationCustomerName,
          scheduledStart,
        }).catch((error) => {
          // Don't fail booking creation if notification fails
          console.error("[bookings] Failed to send new booking notification:", error);
        });
      }

      return ok({
        bookingId: insertedBooking.id,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        isGuest,
      });
    } catch (_error) {
      await supabase.from("bookings").delete().eq("id", insertedBooking.id);
      throw new ValidationError("Unable to initialize payment");
    }
  }
);

// Apply rate limiting: 20 requests per minute
export const POST = withRateLimit(handler, "booking");
