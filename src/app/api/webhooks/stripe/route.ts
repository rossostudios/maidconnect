/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * REFACTORED: Complexity 31 → <15
 * - Extracted event handlers to webhook-handlers.ts
 * - Route now focuses on signature validation and event routing
 *
 * SECURITY (Epic H-2):
 * - Signature verification (HMAC-SHA256)
 * - Timestamp validation (5-minute window)
 * - Idempotency checks (prevent duplicate processing)
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { logger } from "@/lib/logger";
import { assertStripeSignature, stripe } from "@/lib/stripe";
import { processWebhookEvent } from "@/lib/stripe/webhook-handlers";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

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

  // Epic H-2.3: Idempotency - Store event BEFORE processing to prevent race conditions
  // If Stripe retries during processing, the INSERT will fail due to unique constraint
  const { error: insertError } = await supabaseAdmin.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    status: "processing",
    payload: event as unknown as Record<string, unknown>,
  });

  if (insertError) {
    // Unique constraint violation = duplicate event (already processing or completed)
    if (insertError.code === "23505") {
      logger.info("[Stripe Webhook] Duplicate event ignored (idempotency)", {
        eventId: event.id,
        eventType: event.type,
      });
      // Return 200 OK to prevent Stripe from retrying
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Other database errors - log but continue (don't block webhook processing)
    logger.error("[Stripe Webhook] Failed to store event for idempotency", {
      eventId: event.id,
      error: insertError.message,
      code: insertError.code,
    });
  }

  // Log webhook event
  logger.info("[Stripe Webhook] Processing event", {
    eventId: event.id,
    eventType: event.type,
    created: new Date(event.created * 1000).toISOString(),
  });

  // Process event using handler service
  let processingError: Error | null = null;
  try {
    await processWebhookEvent(event);
  } catch (err) {
    processingError = err instanceof Error ? err : new Error(String(err));
    logger.error("[Stripe Webhook] Event processing failed", {
      eventId: event.id,
      eventType: event.type,
      error: processingError.message,
    });
  }

  // Update event status to completed or failed
  const { error: updateError } = await supabaseAdmin
    .from("stripe_webhook_events")
    .update({
      status: processingError ? "failed" : "completed",
      error_message: processingError?.message || null,
      processed_at: new Date().toISOString(),
    })
    .eq("event_id", event.id);

  if (updateError) {
    logger.error("[Stripe Webhook] Failed to update event status", {
      eventId: event.id,
      error: updateError.message,
    });
  }

  // Re-throw processing error after updating status
  if (processingError) {
    throw processingError;
  }

  logger.info("[Stripe Webhook] Event processed successfully", {
    eventId: event.id,
    eventType: event.type,
  });

  return NextResponse.json({ received: true });
}
