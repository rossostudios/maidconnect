import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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
      paymentIntentId,
    }: {
      paymentIntentId: string;
    } = body ?? {};

    if (!paymentIntentId) {
      return NextResponse.json({ error: "paymentIntentId is required" }, { status: 400 });
    }

    const retrievedIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, customer_id, professional_id, status")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found for payment intent" }, { status: 404 });
    }

    const isCustomer = booking.customer_id === user.id;
    const isProfessional = booking.professional_id === user.id;

    if (!(isCustomer || isProfessional)) {
      return NextResponse.json(
        { error: "You are not authorized to cancel this payment" },
        { status: 403 }
      );
    }

    if (retrievedIntent.metadata?.booking_id !== booking.id) {
      return NextResponse.json(
        { error: "Payment intent does not belong to this booking" },
        { status: 400 }
      );
    }

    const canceledIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    await supabase
      .from("bookings")
      .update({
        status: "canceled",
        stripe_payment_status: canceledIntent.status,
      })
      .eq("id", booking.id);

    return NextResponse.json({ success: true, paymentIntent: canceledIntent });
  } catch (_error) {
    return NextResponse.json({ error: "Unable to cancel payment intent" }, { status: 500 });
  }
}
