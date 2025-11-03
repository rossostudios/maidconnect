import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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

    // Comprehensive amount validation to prevent fraud
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }

    // Maximum amount: 1M COP (1,000,000,000 centavos)
    // This prevents accidental or malicious billion-dollar charges
    const MAX_AMOUNT_COP = 1_000_000_000; // 1M COP in centavos
    if (amount > MAX_AMOUNT_COP) {
      return NextResponse.json(
        {
          error: "Amount exceeds maximum allowed",
          maxAmount: MAX_AMOUNT_COP,
        },
        { status: 400 }
      );
    }

    // Stripe requires amounts in smallest currency unit (integers)
    if (!Number.isInteger(amount)) {
      return NextResponse.json({ error: "Amount must be an integer (smallest currency unit)" }, { status: 400 });
    }

    // Currency whitelist - only allow supported currencies
    const SUPPORTED_CURRENCIES = ["cop", "usd", "eur"];
    if (!SUPPORTED_CURRENCIES.includes(currency.toLowerCase())) {
      return NextResponse.json(
        {
          error: "Unsupported currency",
          supportedCurrencies: SUPPORTED_CURRENCIES,
        },
        { status: 400 }
      );
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
  } catch (_error) {
    return NextResponse.json({ error: "Unable to create payment intent" }, { status: 500 });
  }
}
