/**
 * REFACTORED VERSION - Cancel/void a Stripe payment intent
 * POST /api/payments/void-intent
 *
 * BEFORE: 71 lines
 * AFTER: 50 lines (30% reduction)
 */

import { z } from "zod";
import { ok, withAuth } from "@/lib/api";
import { BusinessRuleError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { stripe } from "@/lib/stripe";

const voidIntentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { paymentIntentId } = voidIntentSchema.parse(body);

  const retrievedIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, customer_id, professional_id, status")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (bookingError || !booking) {
    throw new NotFoundError("Booking not found for payment intent");
  }

  const isCustomer = booking.customer_id === user.id;
  const isProfessional = booking.professional_id === user.id;

  if (!(isCustomer || isProfessional)) {
    throw new UnauthorizedError("You are not authorized to cancel this payment");
  }

  if (retrievedIntent.metadata?.booking_id !== booking.id) {
    throw new BusinessRuleError(
      "Payment intent does not belong to this booking",
      "PAYMENT_MISMATCH"
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

  return ok({ paymentIntent: canceledIntent });
});
