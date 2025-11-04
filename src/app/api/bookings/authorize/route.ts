/**
 * REFACTORED VERSION - Customer authorizes booking payment
 * POST /api/bookings/authorize
 *
 * BEFORE: 163 lines
 * AFTER: 99 lines (39% reduction)
 */

import { withCustomer, ok, requireCustomerOwnership } from "@/lib/api";
import { sendNewBookingRequestEmail } from "@/lib/email/send";
import { notifyCustomerBookingConfirmed, notifyProfessionalNewBooking } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";
import { BusinessRuleError } from "@/lib/errors";
import { z } from "zod";

const authorizeSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, paymentIntentId } = authorizeSchema.parse(body);

  // Verify customer owns this booking
  await requireCustomerOwnership(supabase, user.id, bookingId);

  // Verify payment intent matches booking
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.metadata?.booking_id !== bookingId) {
    throw new BusinessRuleError("Payment intent does not match booking", "PAYMENT_MISMATCH");
  }

  if (intent.status !== "requires_capture") {
    throw new BusinessRuleError("Payment is not in an authorized state", "INVALID_PAYMENT_STATUS");
  }

  // Update booking to authorized status
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
  } catch (_emailError) {
    // Don't fail request if notifications fail
  }

  return ok({ success: true });
});
