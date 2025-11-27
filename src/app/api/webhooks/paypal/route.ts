/**
 * PayPal Webhook Handler
 * POST /api/webhooks/paypal
 *
 * SECURITY:
 * - Signature verification (PayPal webhook signature)
 * - Timestamp validation (5-minute window)
 * - Idempotency checks (prevent duplicate processing)
 *
 * SUPPORTED EVENTS:
 * - PAYMENT.PAYOUTS-ITEM.SUCCEEDED - Payout completed successfully
 * - PAYMENT.PAYOUTS-ITEM.FAILED - Payout failed
 * - PAYMENT.PAYOUTS-ITEM.BLOCKED - Payout blocked
 * - PAYMENT.PAYOUTS-ITEM.RETURNED - Payout returned/refunded
 * - PAYMENT.PAYOUTS-ITEM.UNCLAIMED - Payout unclaimed (recipient needs to claim)
 */

import { NextResponse } from "next/server";
import { type PayPalWebhookEvent, paypal } from "@/lib/integrations/paypal";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function POST(request: Request) {
  try {
    // Get webhook signature headers
    const transmissionId = request.headers.get("paypal-transmission-id");
    const transmissionTime = request.headers.get("paypal-transmission-time");
    const certUrl = request.headers.get("paypal-cert-url");
    const authAlgo = request.headers.get("paypal-auth-algo");
    const transmissionSig = request.headers.get("paypal-transmission-sig");

    if (!(transmissionId && transmissionTime && certUrl && authAlgo && transmissionSig)) {
      logger.error("[PayPal Webhook] Missing required headers");
      return NextResponse.json({ error: "Missing required headers" }, { status: 400 });
    }

    const payload = await request.text();
    const webhookEvent: PayPalWebhookEvent = JSON.parse(payload);

    // Verify webhook signature
    const isValid = await paypal.verifyWebhookSignature({
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      webhookId: process.env.PAYPAL_WEBHOOK_ID || "",
      webhookEvent,
    });

    if (!isValid) {
      logger.error("[PayPal Webhook] Invalid signature", {
        eventId: webhookEvent.id,
        eventType: webhookEvent.event_type,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Validate webhook timestamp (reject events older than 5 minutes)
    const MAX_WEBHOOK_AGE_SECONDS = 300; // 5 minutes
    const eventTime = new Date(webhookEvent.create_time).getTime();
    const eventAge = Math.floor((Date.now() - eventTime) / 1000);

    if (eventAge > MAX_WEBHOOK_AGE_SECONDS) {
      logger.warn("[PayPal Webhook] Rejected old event", {
        eventId: webhookEvent.id,
        eventType: webhookEvent.event_type,
        ageSeconds: eventAge,
      });
      return NextResponse.json(
        { error: "Webhook event too old", ageSeconds: eventAge },
        { status: 400 }
      );
    }

    // Epic H-2.3: Idempotency - Store event BEFORE processing to prevent race conditions
    // If PayPal retries during processing, the INSERT will fail due to unique constraint
    const { error: insertError } = await supabaseAdmin.from("webhook_events").insert({
      event_id: webhookEvent.id,
      event_type: webhookEvent.event_type,
      provider: "paypal",
      status: "processing",
      payload: webhookEvent as unknown as Record<string, unknown>,
    });

    if (insertError) {
      // Unique constraint violation = duplicate event (already processing or completed)
      if (insertError.code === "23505") {
        logger.info("[PayPal Webhook] Duplicate event ignored (idempotency)", {
          eventId: webhookEvent.id,
          eventType: webhookEvent.event_type,
        });
        // Return 200 OK to prevent PayPal from retrying
        return NextResponse.json({ received: true, duplicate: true });
      }

      // Other database errors - log but continue (don't block webhook processing)
      logger.error("[PayPal Webhook] Failed to store event for idempotency", {
        eventId: webhookEvent.id,
        error: insertError.message,
        code: insertError.code,
      });
    }

    // Log webhook event
    logger.info("[PayPal Webhook] Processing event", {
      eventId: webhookEvent.id,
      eventType: webhookEvent.event_type,
      created: webhookEvent.create_time,
    });

    // Process event based on type
    let processingError: Error | null = null;
    try {
      await processPayPalWebhookEvent(webhookEvent);
    } catch (err) {
      processingError = err instanceof Error ? err : new Error(String(err));
      logger.error("[PayPal Webhook] Event processing failed", {
        eventId: webhookEvent.id,
        eventType: webhookEvent.event_type,
        error: processingError.message,
      });
    }

    // Update event status to completed or failed
    const { error: updateError } = await supabaseAdmin
      .from("webhook_events")
      .update({
        status: processingError ? "failed" : "completed",
        error_message: processingError?.message || null,
        processed_at: new Date().toISOString(),
      })
      .eq("event_id", webhookEvent.id)
      .eq("provider", "paypal");

    if (updateError) {
      logger.error("[PayPal Webhook] Failed to update event status", {
        eventId: webhookEvent.id,
        error: updateError.message,
      });
    }

    // Re-throw processing error after updating status
    if (processingError) {
      throw processingError;
    }

    logger.info("[PayPal Webhook] Event processed successfully", {
      eventId: webhookEvent.id,
      eventType: webhookEvent.event_type,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("[PayPal Webhook] Error processing webhook", { error });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Process PayPal webhook events
 */
async function processPayPalWebhookEvent(event: PayPalWebhookEvent): Promise<void> {
  const eventType = event.event_type;

  switch (eventType) {
    case "PAYMENT.PAYOUTS-ITEM.SUCCEEDED":
      await handlePayoutSucceeded(event);
      break;

    case "PAYMENT.PAYOUTS-ITEM.FAILED":
      await handlePayoutFailed(event);
      break;

    case "PAYMENT.PAYOUTS-ITEM.BLOCKED":
      await handlePayoutBlocked(event);
      break;

    case "PAYMENT.PAYOUTS-ITEM.RETURNED":
      await handlePayoutReturned(event);
      break;

    case "PAYMENT.PAYOUTS-ITEM.UNCLAIMED":
      await handlePayoutUnclaimed(event);
      break;

    default:
      logger.info("[PayPal Webhook] Unhandled event type", { eventType });
  }
}

/**
 * Handle successful payout
 */
async function handlePayoutSucceeded(event: PayPalWebhookEvent): Promise<void> {
  const payoutItemId = event.resource?.payout_item_id;
  const transactionId = event.resource?.transaction_id;

  logger.info("[PayPal Webhook] Payout succeeded", {
    payoutItemId,
    transactionId,
    recipientEmail: event.resource?.payout_item?.receiver,
    amount: event.resource?.payout_item?.amount,
  });

  // TODO: Update payout_batches table with success status
  // This will be implemented when we create the payout_batches table
}

/**
 * Handle failed payout
 */
async function handlePayoutFailed(event: PayPalWebhookEvent): Promise<void> {
  const payoutItemId = event.resource?.payout_item_id;
  const errors = event.resource?.errors;

  logger.error("[PayPal Webhook] Payout failed", {
    payoutItemId,
    recipientEmail: event.resource?.payout_item?.receiver,
    amount: event.resource?.payout_item?.amount,
    errors,
  });

  // TODO: Update payout_batches table with failure status
  // Mark payout as failed and notify professional
}

/**
 * Handle blocked payout
 */
async function handlePayoutBlocked(event: PayPalWebhookEvent): Promise<void> {
  const payoutItemId = event.resource?.payout_item_id;

  logger.warn("[PayPal Webhook] Payout blocked", {
    payoutItemId,
    recipientEmail: event.resource?.payout_item?.receiver,
    amount: event.resource?.payout_item?.amount,
  });

  // TODO: Update payout_batches table with blocked status
  // Notify admin for review
}

/**
 * Handle returned payout
 */
async function handlePayoutReturned(event: PayPalWebhookEvent): Promise<void> {
  const payoutItemId = event.resource?.payout_item_id;

  logger.warn("[PayPal Webhook] Payout returned", {
    payoutItemId,
    recipientEmail: event.resource?.payout_item?.receiver,
    amount: event.resource?.payout_item?.amount,
  });

  // TODO: Update payout_batches table with returned status
  // Credit back the amount, notify professional
}

/**
 * Handle unclaimed payout
 */
async function handlePayoutUnclaimed(event: PayPalWebhookEvent): Promise<void> {
  const payoutItemId = event.resource?.payout_item_id;

  logger.info("[PayPal Webhook] Payout unclaimed", {
    payoutItemId,
    recipientEmail: event.resource?.payout_item?.receiver,
    amount: event.resource?.payout_item?.amount,
  });

  // TODO: Update payout_batches table with unclaimed status
  // Send reminder to professional to claim the payment
}
