import { NextResponse } from "next/server";
import { sendNewBookingRequestEmail } from "@/lib/email/send";
import { notifyCustomerBookingConfirmed, notifyProfessionalNewBooking } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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

    if (!(bookingId && paymentIntentId)) {
      return NextResponse.json(
        { error: "bookingId and paymentIntentId are required" },
        { status: 400 }
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, customer_id, status")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.customer_id !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this booking" },
        { status: 403 }
      );
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

    // Send email notification to professional about new booking request
    try {
      const { data: fullBooking } = await supabase
        .from("bookings")
        .select(`
          id,
          professional_id,
          customer_id,
          service_name,
          scheduled_start,
          duration_minutes,
          amount_authorized,
          currency,
          address
        `)
        .eq("id", bookingId)
        .single();

      if (fullBooking) {
        // Get professional email
        const { data: professionalUser } = await supabase.auth.admin.getUserById(
          fullBooking.professional_id
        );
        const { data: professionalProfile } = await supabase
          .from("professional_profiles")
          .select("full_name")
          .eq("profile_id", fullBooking.professional_id)
          .single();

        // Get customer user data
        const { data: customerUser } = await supabase.auth.admin.getUserById(
          fullBooking.customer_id
        );

        if (professionalUser?.user?.email) {
          const scheduledDate = fullBooking.scheduled_start
            ? new Date(fullBooking.scheduled_start).toLocaleDateString()
            : "TBD";
          const scheduledTime = fullBooking.scheduled_start
            ? new Date(fullBooking.scheduled_start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "TBD";
          const duration = fullBooking.duration_minutes
            ? `${fullBooking.duration_minutes} minutes`
            : "TBD";
          const address = fullBooking.address
            ? typeof fullBooking.address === "object" && "formatted" in fullBooking.address
              ? String(fullBooking.address.formatted)
              : JSON.stringify(fullBooking.address)
            : "Not specified";
          const amount = fullBooking.amount_authorized
            ? `${new Intl.NumberFormat("es-CO", { style: "currency", currency: fullBooking.currency || "COP" }).format(fullBooking.amount_authorized / 100)}`
            : undefined;

          await sendNewBookingRequestEmail(professionalUser.user.email, {
            professionalName: professionalProfile?.full_name || "there",
            customerName: customerUser?.user?.user_metadata?.full_name || "A customer",
            serviceName: fullBooking.service_name || "Service",
            scheduledDate,
            scheduledTime,
            duration,
            address,
            bookingId: fullBooking.id,
            amount,
          });

          // Send push notification to professional
          await notifyProfessionalNewBooking(fullBooking.professional_id, {
            id: fullBooking.id,
            serviceName: fullBooking.service_name || "Service",
            customerName: customerUser?.user?.user_metadata?.full_name || "A customer",
            scheduledStart: fullBooking.scheduled_start || new Date().toISOString(),
          });
        }

        // Send push notification to customer confirming booking
        if (customerUser?.user) {
          await notifyCustomerBookingConfirmed(fullBooking.customer_id, {
            id: fullBooking.id,
            serviceName: fullBooking.service_name || "Service",
            scheduledStart: fullBooking.scheduled_start || new Date().toISOString(),
            professionalName: professionalProfile?.full_name || "Your professional",
          });
        }
      }
    } catch (_emailError) {}

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Unable to authorize booking" }, { status: 500 });
  }
}
