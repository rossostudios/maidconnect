/**
 * Stripe Webhook Event Handlers
 *
 * Extracts webhook event processing logic to reduce route complexity
 * Each handler is responsible for processing a specific Stripe event type
 */

import type Stripe from "stripe";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

/**
 * Handle payment_intent.succeeded event
 * Updates booking to completed status when payment is captured
 */
export async function handlePaymentSuccess(event: Stripe.Event): Promise<void> {
  const intent = event.data.object as Stripe.PaymentIntent;
  const bookingId = intent.metadata?.booking_id;

  if (!bookingId) {
    logger.warn("[Stripe Webhook] Payment succeeded but no booking_id in metadata", {
      intentId: intent.id,
    });
    return;
  }

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "completed",
      amount_captured: intent.amount_received ?? intent.amount,
      stripe_payment_status: intent.status,
    })
    .eq("id", bookingId);

  if (error) {
    logger.error("[Stripe Webhook] Failed to update booking on payment success", {
      eventId: event.id,
      bookingId,
      intentId: intent.id,
      error: error.message,
      code: error.code,
    });
  } else {
    logger.info("[Stripe Webhook] Booking updated on payment success", {
      bookingId,
      intentId: intent.id,
      amountCaptured: intent.amount_received ?? intent.amount,
    });
  }
}

/**
 * Handle payment_intent.canceled event
 * Updates booking to canceled status when payment is canceled
 */
export async function handlePaymentCancellation(event: Stripe.Event): Promise<void> {
  const intent = event.data.object as Stripe.PaymentIntent;
  const bookingId = intent.metadata?.booking_id;

  if (!bookingId) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "canceled",
      stripe_payment_status: intent.status,
    })
    .eq("id", bookingId);

  if (error) {
    logger.error("[Stripe Webhook] Failed to update booking on payment cancellation", {
      eventId: event.id,
      bookingId,
      intentId: intent.id,
      error: error.message,
    });
  } else {
    logger.info("[Stripe Webhook] Booking updated on payment cancellation", {
      bookingId,
      intentId: intent.id,
    });
  }
}

/**
 * Handle payment_intent.payment_failed event
 * Updates booking to payment_failed status when payment fails
 */
export async function handlePaymentFailure(event: Stripe.Event): Promise<void> {
  const intent = event.data.object as Stripe.PaymentIntent;
  const bookingId = intent.metadata?.booking_id;

  if (!bookingId) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "payment_failed",
      stripe_payment_status: intent.status,
    })
    .eq("id", bookingId);

  if (error) {
    logger.error("[Stripe Webhook] Failed to update booking on payment failure", {
      eventId: event.id,
      bookingId,
      intentId: intent.id,
      error: error.message,
    });
  } else {
    logger.info("[Stripe Webhook] Booking updated on payment failure", {
      bookingId,
      intentId: intent.id,
    });
  }
}

/**
 * Handle charge.refunded event
 * Updates booking payment status to refunded
 */
export async function handleChargeRefund(event: Stripe.Event): Promise<void> {
  const charge = event.data.object as Stripe.Charge;
  const bookingId = charge.metadata?.booking_id;

  // Try to update by payment_intent_id first
  if (charge.payment_intent) {
    const intentId =
      typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent.id;

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        stripe_payment_status: charge.status ?? "refunded",
      })
      .eq("stripe_payment_intent_id", intentId);

    if (error) {
      logger.error("[Stripe Webhook] Failed to update booking on refund", {
        eventId: event.id,
        intentId,
        error: error.message,
      });
    } else {
      logger.info("[Stripe Webhook] Booking updated on refund", {
        intentId,
      });
    }
    return;
  }

  // Fallback to booking_id if payment_intent not available
  if (bookingId) {
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ stripe_payment_status: "refunded" })
      .eq("id", bookingId);

    if (error) {
      logger.error("[Stripe Webhook] Failed to update booking on refund (by bookingId)", {
        eventId: event.id,
        bookingId,
        error: error.message,
      });
    } else {
      logger.info("[Stripe Webhook] Booking updated on refund (by bookingId)", {
        bookingId,
      });
    }
  }
}

/**
 * Route webhook event to appropriate handler
 */
export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSuccess(event);
      break;
    case "payment_intent.canceled":
      await handlePaymentCancellation(event);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailure(event);
      break;
    case "charge.refunded":
      await handleChargeRefund(event);
      break;
    default:
      logger.info("[Stripe Webhook] Unhandled event type", {
        eventId: event.id,
        eventType: event.type,
      });
  }
}
