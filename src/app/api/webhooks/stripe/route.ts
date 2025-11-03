import { NextResponse } from "next/server";
import Stripe from "stripe";
import { assertStripeSignature, stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const { signature, secret } = assertStripeSignature(
    request as unknown as import("next/server").NextRequest
  );
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    logger.error("[Stripe Webhook] Invalid signature", { error: err });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Validate webhook timestamp (reject events older than 5 minutes)
  const MAX_WEBHOOK_AGE_SECONDS = 300; // 5 minutes
  const eventAge = Math.floor(Date.now() / 1000) - event.created;
  if (eventAge > MAX_WEBHOOK_AGE_SECONDS) {
    logger.warn("[Stripe Webhook] Rejected old event", {
      eventId: event.id,
      eventType: event.type,
      ageSeconds: eventAge,
    });
    return NextResponse.json(
      { error: "Webhook event too old", ageSeconds: eventAge },
      { status: 400 }
    );
  }

  // Log webhook event
  logger.info("[Stripe Webhook] Processing event", {
    eventId: event.id,
    eventType: event.type,
    created: new Date(event.created * 1000).toISOString(),
  });

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;

      if (bookingId) {
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
          // Don't return error - acknowledge receipt to Stripe
          // but log for manual review
        } else {
          logger.info("[Stripe Webhook] Booking updated on payment success", {
            bookingId,
            intentId: intent.id,
            amountCaptured: intent.amount_received ?? intent.amount,
          });
        }
      } else {
        logger.warn("[Stripe Webhook] Payment succeeded but no booking_id in metadata", {
          intentId: intent.id,
        });
      }
      break;
    }
    case "payment_intent.canceled": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;

      if (bookingId) {
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
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;

      if (bookingId) {
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
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const bookingId = charge.metadata?.booking_id;

      if (charge.payment_intent) {
        const intentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent.id;

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
      } else if (bookingId) {
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
      break;
    }

    default:
      logger.info("[Stripe Webhook] Unhandled event type", {
        eventId: event.id,
        eventType: event.type,
      });
  }

  logger.info("[Stripe Webhook] Event processed successfully", {
    eventId: event.id,
    eventType: event.type,
  });

  return NextResponse.json({ received: true });
}
