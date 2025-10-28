import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type AuthorizeBody = {
  bookingId: string;
  paymentIntentId: string;
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
    const body = (await request.json()) as AuthorizeBody;
    const { bookingId, paymentIntentId } = body ?? {};

    if (!bookingId || !paymentIntentId) {
      return NextResponse.json({ error: "bookingId and paymentIntentId are required" }, { status: 400 });
    }

    const {
      data: booking,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .select("id, customer_id, status")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.customer_id !== user.id) {
      return NextResponse.json({ error: "You are not authorized to update this booking" }, { status: 403 });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata?.booking_id !== bookingId) {
      return NextResponse.json({ error: "Payment intent does not match booking" }, { status: 400 });
    }

    if (intent.status !== "requires_capture") {
      return NextResponse.json({ error: "Payment is not in an authorized state" }, { status: 400 });
    }

    await supabase
      .from("bookings")
      .update({
        status: "authorized",
        stripe_payment_status: intent.status,
        amount_authorized: intent.amount ?? intent.amount_received ?? null,
      })
      .eq("id", bookingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Authorize booking error", error);
    return NextResponse.json({ error: "Unable to authorize booking" }, { status: 500 });
  }
}
