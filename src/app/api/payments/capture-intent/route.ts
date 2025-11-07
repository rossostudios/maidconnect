/**
 * REFACTORED VERSION - Capture a Stripe payment intent
 * POST /api/payments/capture-intent
 *
 * BEFORE: 83 lines
 * AFTER: 56 lines (33% reduction)
 */

import { z } from "zod";
import { ok, withAuth } from "@/lib/api";
import { BusinessRuleError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";

const captureIntentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  amountToCapture: z.number().int().positive().optional(),
});

export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // Rate limiting: 20 payment captures per hour per user
  const rateLimitResult = await rateLimit(request, "booking");
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  // Parse and validate request body
  const body = await request.json();
  const { paymentIntentId, amountToCapture } = captureIntentSchema.parse(body);

  const retrievedIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, customer_id, professional_id, status, amount_authorized")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (bookingError || !booking) {
    throw new NotFoundError("Booking not found for payment intent");
  }

  const isCustomer = booking.customer_id === user.id;
  const isProfessional = booking.professional_id === user.id;

  if (!(isCustomer || isProfessional)) {
    throw new UnauthorizedError("You are not authorized to capture this payment");
  }

  if (retrievedIntent.metadata?.booking_id !== booking.id) {
    throw new BusinessRuleError(
      "Payment intent does not belong to this booking",
      "PAYMENT_MISMATCH"
    );
  }

  if (retrievedIntent.status !== "requires_capture") {
    throw new BusinessRuleError(
      "This payment cannot be captured in its current state",
      "INVALID_PAYMENT_STATUS"
    );
  }

  const intent = await stripe.paymentIntents.capture(paymentIntentId, {
    amount_to_capture: amountToCapture,
  });

  await supabase
    .from("bookings")
    .update({
      status: "completed",
      amount_captured: intent.amount_received ?? intent.amount ?? booking.amount_authorized,
      stripe_payment_status: intent.status,
    })
    .eq("id", booking.id);

  return ok({ paymentIntent: intent });
});
