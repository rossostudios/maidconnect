import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      amount,
      currency = "cop",
      bookingId,
      customerName,
      customerEmail,
    }: {
      amount: number;
      currency?: string;
      bookingId?: string;
      customerName?: string;
      customerEmail?: string;
    } = body ?? {};

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }

    const { data: customerRow } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let stripeCustomerId = customerRow?.stripe_customer_id as string | undefined;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: customerName,
        email: customerEmail ?? user.email ?? undefined,
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      capture_method: "manual",
      customer: stripeCustomerId,
      metadata: {
        supabase_profile_id: user.id,
        ...(bookingId ? { booking_id: bookingId } : {}),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe create-intent error", error);
    return NextResponse.json({ error: "Unable to create payment intent" }, { status: 500 });
  }
}
