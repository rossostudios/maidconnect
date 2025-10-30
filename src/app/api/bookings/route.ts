import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type CreateBookingRequest = {
  professionalId: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  durationMinutes?: number;
  amount: number;
  currency?: string;
  specialInstructions?: string;
  address?: Record<string, unknown>;
  serviceName?: string;
  serviceHourlyRate?: number;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateBookingRequest;
    const {
      professionalId,
      scheduledStart,
      durationMinutes,
      currency = "cop",
      specialInstructions,
      address,
      serviceName,
      serviceHourlyRate,
    } = body;
    let { scheduledEnd, amount } = body;

    if (!professionalId) {
      return NextResponse.json({ error: "professionalId is required" }, { status: 400 });
    }

    if (scheduledStart && durationMinutes && !scheduledEnd) {
      const startDate = new Date(scheduledStart);
      if (!Number.isNaN(startDate.getTime())) {
        const computedEnd = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
        scheduledEnd = computedEnd.toISOString();
      }
    }

    if ((!amount || amount <= 0) && serviceHourlyRate && durationMinutes) {
      amount = Math.max(20_000, Math.round(serviceHourlyRate * (durationMinutes / 60)));
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "amount must be greater than zero" }, { status: 400 });
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
      return NextResponse.json(
        { error: bookingError?.message ?? "Unable to create booking" },
        { status: 500 }
      );
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

      return NextResponse.json({
        bookingId: insertedBooking.id,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Stripe intent creation failed", error);
      await supabase.from("bookings").delete().eq("id", insertedBooking.id);
      return NextResponse.json({ error: "Unable to initialize payment" }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected error creating booking" }, { status: 500 });
  }
}
