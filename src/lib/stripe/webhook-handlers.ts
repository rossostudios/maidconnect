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
import { generateNextRecurringBooking } from "@/lib/recurring-plans/generate-next-booking";
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

      // Generate next recurring booking if this was a recurring booking (on-demand)
      try {
        const recurringResult = await generateNextRecurringBooking(supabaseAdmin, bookingId);
        if (recurringResult.bookingId) {
          logger.info("[Stripe Webhook] Generated next recurring booking", {
            completedBookingId: bookingId,
            nextBookingId: recurringResult.bookingId,
            nextBookingDate: recurringResult.nextBookingDate,
          });
        }
      } catch (error) {
        logger.error("[Stripe Webhook] Recurring booking generation error", {
          bookingId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        // Don't fail the webhook if recurring booking generation fails
        // The original payment succeeded and booking is valid
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
 * Handle customer.subscription.created event
 * Creates or updates local subscription record when subscription is created
 */
export async function handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.user_id;
  const planSlug = subscription.metadata?.plan_slug;

  if (!(userId && planSlug)) {
    logger.warn("[Stripe Webhook] Subscription created but missing metadata", {
      subscriptionId: subscription.id,
      hasUserId: !!userId,
      hasPlanSlug: !!planSlug,
    });
    return;
  }

  // Get plan ID from database
  const { data: plan, error: planError } = await supabaseAdmin
    .from("subscription_plans")
    .select("id")
    .eq("slug", planSlug)
    .single();

  if (planError || !plan) {
    logger.error("[Stripe Webhook] Failed to find plan for subscription", {
      subscriptionId: subscription.id,
      planSlug,
      error: planError?.message,
    });
    return;
  }

  // Upsert subscription record
  const { error } = await supabaseAdmin.from("user_subscriptions").upsert(
    {
      user_id: userId,
      plan_id: plan.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    {
      onConflict: "stripe_subscription_id",
    }
  );

  if (error) {
    logger.error("[Stripe Webhook] Failed to create subscription record", {
      subscriptionId: subscription.id,
      userId,
      error: error.message,
    });
  } else {
    logger.info("[Stripe Webhook] Subscription record created", {
      subscriptionId: subscription.id,
      userId,
      planSlug,
      status: subscription.status,
    });
  }
}

/**
 * Handle customer.subscription.updated event
 * Updates local subscription record when subscription changes
 */
export async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  const { error } = await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    logger.error("[Stripe Webhook] Failed to update subscription record", {
      subscriptionId: subscription.id,
      error: error.message,
    });
  } else {
    logger.info("[Stripe Webhook] Subscription record updated", {
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }
}

/**
 * Handle customer.subscription.deleted event
 * Updates local subscription record when subscription is canceled
 */
export async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  const { error } = await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    logger.error("[Stripe Webhook] Failed to update subscription record on deletion", {
      subscriptionId: subscription.id,
      error: error.message,
    });
  } else {
    logger.info("[Stripe Webhook] Subscription record marked as canceled", {
      subscriptionId: subscription.id,
    });
  }
}

/**
 * Handle invoice.payment_succeeded event for subscriptions
 * Updates subscription period and status
 */
export async function handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  // Only handle subscription invoices
  if (!invoice.subscription) {
    return;
  }

  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;

  const { error } = await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: "active",
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    logger.error("[Stripe Webhook] Failed to update subscription on invoice success", {
      invoiceId: invoice.id,
      subscriptionId,
      error: error.message,
    });
  } else {
    logger.info("[Stripe Webhook] Subscription payment succeeded", {
      invoiceId: invoice.id,
      subscriptionId,
      amount: invoice.amount_paid,
    });
  }
}

/**
 * Handle invoice.payment_failed event for subscriptions
 * Updates subscription status to past_due
 */
export async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  // Only handle subscription invoices
  if (!invoice.subscription) {
    return;
  }

  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;

  const { error } = await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: "past_due",
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    logger.error("[Stripe Webhook] Failed to update subscription on invoice failure", {
      invoiceId: invoice.id,
      subscriptionId,
      error: error.message,
    });
  } else {
    logger.info("[Stripe Webhook] Subscription payment failed, marked as past_due", {
      invoiceId: invoice.id,
      subscriptionId,
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
    // Subscription events
    case "customer.subscription.created":
      await handleSubscriptionCreated(event);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;
    default:
      logger.info("[Stripe Webhook] Unhandled event type", {
        eventId: event.id,
        eventType: event.type,
      });
  }
}
