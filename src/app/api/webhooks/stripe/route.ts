/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * REFACTORED: Complexity 31 → <15
 * - Extracted event handlers to webhook-handlers.ts
 * - Route now focuses on signature validation and event routing
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { logger } from "@/lib/logger";
import { assertStripeSignature, stripe } from "@/lib/stripe";
import { processWebhookEvent } from "@/lib/stripe/webhook-handlers";

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

  // Process event using handler service
  await processWebhookEvent(event);

  logger.info("[Stripe Webhook] Event processed successfully", {
    eventId: event.id,
    eventType: event.type,
  });

  return NextResponse.json({ received: true });
}
