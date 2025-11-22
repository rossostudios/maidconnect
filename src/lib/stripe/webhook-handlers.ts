/**
 * Stripe Webhook Event Handlers
 *
 * Extracts webhook event processing logic to reduce route complexity
 * Each handler is responsible for processing a specific Stripe event type
 */

import type Stripe from "stripe";
import {
  trackBookingCancelledServer,
  trackBookingCompletedServer,
} from "@/lib/integrations/posthog/server";
import { logger } from "@/lib/logger";
import { BalanceService } from "@/lib/services/balance/balance-service";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

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

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "completed",
      amount_captured: intent.amount_received ?? intent.amount,
      stripe_payment_status: intent.status,
    })
    .eq("id", bookingId)
    .select("customer_id, professional_id, service_name, currency")
    .single();

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

    // Track booking completion in PostHog
    if (booking) {
      await trackBookingCompletedServer(booking.customer_id, {
        bookingId,
        professionalId: booking.professional_id,
        totalAmount: (intent.amount_received ?? intent.amount) / 100, // Convert from cents
        currency: booking.currency,
      });

      // Add earnings to professional's pending balance (24hr clearance period)
      try {
        const balanceService = new BalanceService(supabaseAdmin);
        const bookingAmountCop = intent.amount_received ?? intent.amount; // Amount in COP cents
        const balanceUpdate = await balanceService.addToPendingBalance(
          booking.professional_id,
          bookingId,
          bookingAmountCop
        );

        if (balanceUpdate.success) {
          logger.info("[Stripe Webhook] Professional balance updated", {
            bookingId,
            professionalId: booking.professional_id,
            amountCop: bookingAmountCop,
            newPendingBalance: balanceUpdate.newPendingBalance,
            message: balanceUpdate.message,
          });
        } else {
          logger.error("[Stripe Webhook] Failed to update professional balance", {
            bookingId,
            professionalId: booking.professional_id,
            amountCop: bookingAmountCop,
            error: balanceUpdate.message,
          });
        }
      } catch (error) {
        logger.error("[Stripe Webhook] Balance tracking error", {
          bookingId,
          professionalId: booking.professional_id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        // Don't fail the webhook if balance tracking fails
        // The payment succeeded and booking is valid
      }

      // Update professional's career stats (total earnings and bookings count)
      try {
        const bookingAmountCop = intent.amount_received ?? intent.amount; // Amount in COP cents

        const { error: statsError } = await supabaseAdmin.rpc("increment_professional_stats", {
          p_professional_id: booking.professional_id,
          p_earnings_cop: bookingAmountCop,
        });

        if (statsError) {
          logger.error("[Stripe Webhook] Failed to update professional stats", {
            bookingId,
            professionalId: booking.professional_id,
            amountCop: bookingAmountCop,
            error: statsError.message,
            code: statsError.code,
          });
        } else {
          logger.info("[Stripe Webhook] Professional stats updated", {
            bookingId,
            professionalId: booking.professional_id,
            earningsAdded: bookingAmountCop,
          });
        }
      } catch (error) {
        logger.error("[Stripe Webhook] Stats update error", {
          bookingId,
          professionalId: booking.professional_id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        // Don't fail the webhook if stats update fails
        // The payment succeeded and booking is valid
      }
    }
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

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "canceled",
      stripe_payment_status: intent.status,
    })
    .eq("id", bookingId)
    .select("customer_id")
    .single();

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

    // Track booking cancellation in PostHog
    if (booking) {
      await trackBookingCancelledServer(booking.customer_id, {
        bookingId,
        cancelledBy: "customer",
        reason: intent.cancellation_reason || "Payment canceled",
      });
    }
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
 * Handle payout.paid event (instant payout succeeded)
 * Updates payout_transfers status to completed
 */
export async function handlePayoutPaid(event: Stripe.Event): Promise<void> {
  const payout = event.data.object as Stripe.Payout;
  const transferId = payout.metadata?.transfer_id;

  if (!transferId) {
    logger.warn("[Stripe Webhook] Payout paid but no transfer_id in metadata", {
      payoutId: payout.id,
    });
    return;
  }

  const { error } = await supabaseAdmin
    .from("payout_transfers")
    .update({
      status: "completed",
      stripe_payout_id: payout.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transferId);

  if (error) {
    logger.error("[Stripe Webhook] Failed to update payout transfer on success", {
      eventId: event.id,
      transferId,
      payoutId: payout.id,
      error: error.message,
    });
  } else {
    logger.info("[Stripe Webhook] Payout transfer marked as completed", {
      transferId,
      payoutId: payout.id,
      amount: payout.amount,
      arrivalDate: payout.arrival_date,
    });
  }
}

/**
 * Handle payout.failed event (instant payout failed)
 * Updates payout_transfers status to failed and refunds balance
 */
export async function handlePayoutFailed(event: Stripe.Event): Promise<void> {
  const payout = event.data.object as Stripe.Payout;
  const transferId = payout.metadata?.transfer_id;
  const professionalId = payout.metadata?.professional_id;
  const amountCop = payout.amount; // Stripe amount is already in cents

  if (!(transferId && professionalId)) {
    logger.warn("[Stripe Webhook] Payout failed but missing metadata", {
      payoutId: payout.id,
      hasTransferId: !!transferId,
      hasProfessionalId: !!professionalId,
    });
    return;
  }

  // Update payout transfer status
  const { error: updateError } = await supabaseAdmin
    .from("payout_transfers")
    .update({
      status: "failed",
      stripe_payout_id: payout.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transferId);

  if (updateError) {
    logger.error("[Stripe Webhook] Failed to update payout transfer on failure", {
      eventId: event.id,
      transferId,
      payoutId: payout.id,
      error: updateError.message,
    });
  }

  // Refund balance to professional's available balance
  try {
    const balanceService = new BalanceService(supabaseAdmin);
    const refundResult = await balanceService.refundFailedPayout(professionalId, amountCop);

    if (refundResult.success) {
      logger.info("[Stripe Webhook] Balance refunded after failed payout", {
        transferId,
        payoutId: payout.id,
        professionalId,
        refundedAmount: amountCop,
        newAvailableBalance: refundResult.newAvailableBalance,
      });
    } else {
      logger.error("[Stripe Webhook] Failed to refund balance after payout failure", {
        transferId,
        payoutId: payout.id,
        professionalId,
        amountCop,
        error: refundResult.message,
      });
    }
  } catch (error) {
    logger.error("[Stripe Webhook] Exception while refunding failed payout", {
      transferId,
      payoutId: payout.id,
      professionalId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
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
    case "payout.paid":
      await handlePayoutPaid(event);
      break;
    case "payout.failed":
      await handlePayoutFailed(event);
      break;
    default:
      logger.info("[Stripe Webhook] Unhandled event type", {
        eventId: event.id,
        eventType: event.type,
      });
  }
}
