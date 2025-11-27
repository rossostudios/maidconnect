/**
 * Unified Background Check Webhook Handler
 *
 * Handles webhooks from both Checkr and Truora providers.
 * Route: POST /api/webhooks/background-checks
 *
 * SECURITY (Epic H-2.3):
 * - Signature verification (provider-specific)
 * - Idempotency checks (prevent duplicate processing)
 */

import { NextRequest, NextResponse } from "next/server";
import { getBackgroundCheckProvider } from "@/lib/background-checks";
import type { WebhookEvent } from "@/lib/background-checks/types";
import { sendBackgroundCheckCompletedEmail } from "@/lib/email/send";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // Get signature from headers (works for both providers)
    const checkrSignature = request.headers.get("x-checkr-signature");
    const truoraSignature = request.headers.get("x-truora-signature");

    const signature = checkrSignature || truoraSignature;

    if (!signature) {
      logger.error("[BackgroundCheckWebhook] Missing webhook signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Convert headers to plain object
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Get active provider and verify webhook
    const provider = getBackgroundCheckProvider();
    const event: WebhookEvent = await provider.verifyWebhook(rawBody, signature, headers);

    // Epic H-2.3: Idempotency - Store event BEFORE processing to prevent race conditions
    // Use providerCheckId + type as unique key (same check can have multiple event types)
    const eventKey = `${event.providerCheckId}:${event.type}`;
    const { error: insertError } = await supabaseAdmin.from("webhook_events").insert({
      event_id: eventKey,
      event_type: event.type,
      provider: event.provider, // "checkr" or "truora"
      status: "processing",
      payload: event.data,
    });

    if (insertError) {
      // Unique constraint violation = duplicate event (already processing or completed)
      if (insertError.code === "23505") {
        logger.info("[BackgroundCheckWebhook] Duplicate event ignored (idempotency)", {
          providerCheckId: event.providerCheckId,
          eventType: event.type,
          provider: event.provider,
        });
        // Return 200 OK to prevent provider from retrying
        return NextResponse.json({ received: true, duplicate: true });
      }

      // Other database errors - log but continue (don't block webhook processing)
      logger.error("[BackgroundCheckWebhook] Failed to store event for idempotency", {
        providerCheckId: event.providerCheckId,
        error: insertError.message,
        code: insertError.code,
      });
    }

    logger.info("[BackgroundCheckWebhook] Processing event", {
      type: event.type,
      provider: event.provider,
      providerCheckId: event.providerCheckId,
    });

    // Handle the webhook event
    let processingError: Error | null = null;
    try {
      await handleWebhookEvent(event);
    } catch (err) {
      processingError = err instanceof Error ? err : new Error(String(err));
      logger.error("[BackgroundCheckWebhook] Event processing failed", {
        providerCheckId: event.providerCheckId,
        eventType: event.type,
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
      .eq("event_id", eventKey)
      .eq("provider", event.provider);

    if (updateError) {
      logger.error("[BackgroundCheckWebhook] Failed to update event status", {
        providerCheckId: event.providerCheckId,
        error: updateError.message,
      });
    }

    // Re-throw processing error after updating status
    if (processingError) {
      throw processingError;
    }

    logger.info("[BackgroundCheckWebhook] Event processed successfully", {
      type: event.type,
      provider: event.provider,
      providerCheckId: event.providerCheckId,
    });

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("[BackgroundCheckWebhook] Error:", { error });

    // Return 400 for verification failures, 500 for processing errors
    const status = error instanceof Error && error.message.includes("verification") ? 400 : 500;

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status }
    );
  }
}

/**
 * Handle different webhook event types
 */
async function handleWebhookEvent(event: WebhookEvent): Promise<void> {
  const supabase = await createSupabaseServerClient();

  switch (event.type) {
    case "check.created":
      await handleCheckCreated(event, supabase);
      break;

    case "check.completed":
      await handleCheckCompleted(event, supabase);
      break;

    case "check.updated":
      await handleCheckUpdated(event, supabase);
      break;

    case "check.failed":
      await handleCheckFailed(event, supabase);
      break;

    default:
      console.warn(`[BackgroundCheckWebhook] Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle check.created event
 */
async function handleCheckCreated(
  event: WebhookEvent,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<void> {
  console.log(`[BackgroundCheckWebhook] Check created: ${event.checkId}`);

  // Update background_checks table
  const { error } = await supabase
    .from("background_checks")
    .update({
      status: event.status,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_check_id", event.providerCheckId);

  if (error) {
    console.error("[BackgroundCheckWebhook] Failed to update check:", error);
    throw error;
  }
}

/**
 * Handle check.completed event (most important)
 */
async function handleCheckCompleted(
  event: WebhookEvent,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<void> {
  console.log(
    `[BackgroundCheckWebhook] Check completed: ${event.checkId}, status: ${event.status}`
  );

  // Get full check results from provider
  const provider = getBackgroundCheckProvider();
  const response = await provider.getCheckStatus(event.providerCheckId);

  if (!(response.success && response.check)) {
    throw new Error("Failed to fetch completed check results");
  }

  const check = response.check;

  // Update background_checks table
  const { data: updatedCheck, error: updateError } = await supabase
    .from("background_checks")
    .update({
      status: check.status,
      result_data: check.rawData,
      completed_at: check.completedAt?.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("provider_check_id", event.providerCheckId)
    .select("professional_id")
    .single();

  if (updateError) {
    console.error("[BackgroundCheckWebhook] Failed to update check:", updateError);
    throw updateError;
  }

  // Update professional_profiles with background check status
  const { error: profileError } = await supabase
    .from("professional_profiles")
    .update({
      background_check_status: check.status,
      latest_background_check_id: check.id,
    })
    .eq("profile_id", updatedCheck.professional_id);

  if (profileError) {
    console.error("[BackgroundCheckWebhook] Failed to update professional profile:", profileError);
  }

  // Get professional's email for notification
  const { data: professional } = await supabase
    .from("profiles")
    .select("email, name")
    .eq("id", updatedCheck.professional_id)
    .single();

  if (professional) {
    // Send email notification
    await sendBackgroundCheckCompletedEmail(
      professional.email,
      professional.name,
      check.status as "clear" | "consider" | "suspended",
      check.recommendation
    );
  }

  // Auto-approve if check is clear
  if (check.status === "clear" && check.recommendation === "approved") {
    await autoApproveOnboarding(updatedCheck.professional_id, supabase);
  }

  // Flag for manual review if needed
  if (check.status === "consider" || check.recommendation === "review_required") {
    await flagForManualReview(updatedCheck.professional_id, check, supabase);
  }

  // Auto-reject if suspended
  if (check.status === "suspended" || check.recommendation === "rejected") {
    await rejectOnboarding(updatedCheck.professional_id, check, supabase);
  }
}

/**
 * Handle check.updated event
 */
async function handleCheckUpdated(
  event: WebhookEvent,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<void> {
  console.log(`[BackgroundCheckWebhook] Check updated: ${event.checkId}`);

  // Get latest status
  const provider = getBackgroundCheckProvider();
  const response = await provider.getCheckStatus(event.providerCheckId);

  if (!(response.success && response.check)) {
    return; // Silently skip if we can't fetch status
  }

  // Update background_checks table
  const { error } = await supabase
    .from("background_checks")
    .update({
      status: response.check.status,
      result_data: response.check.rawData,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_check_id", event.providerCheckId);

  if (error) {
    console.error("[BackgroundCheckWebhook] Failed to update check:", error);
  }
}

/**
 * Handle check.failed event
 */
async function handleCheckFailed(
  event: WebhookEvent,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<void> {
  console.error(`[BackgroundCheckWebhook] Check failed: ${event.checkId}`);

  // Update background_checks table
  const { error } = await supabase
    .from("background_checks")
    .update({
      status: "suspended",
      result_data: event.data,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_check_id", event.providerCheckId);

  if (error) {
    console.error("[BackgroundCheckWebhook] Failed to update check:", error);
  }

  // TODO: Send notification to admin about failed check
}

/**
 * Auto-approve professional onboarding if all checks pass
 */
async function autoApproveOnboarding(
  professionalId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<void> {
  // Check if professional has completed all required steps
  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("onboarding_status, interview_completed, documents_verified")
    .eq("profile_id", professionalId)
    .single();

  if (!professional) {
    return;
  }

  // Only auto-approve if documents verified and interview completed
  if (professional.documents_verified && professional.interview_completed) {
    await supabase
      .from("professional_profiles")
      .update({
        onboarding_status: "approved",
        status: "active",
      })
      .eq("profile_id", professionalId);

    console.log(`[BackgroundCheckWebhook] Auto-approved professional: ${professionalId}`);

    // TODO: Send approval email
  }
}

/**
 * Flag professional for manual review
 */
async function flagForManualReview(
  professionalId: string,
  _check: { status: string; recommendation?: string; rawData?: unknown },
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<void> {
  await supabase
    .from("professional_profiles")
    .update({
      onboarding_status: "application_in_review",
    })
    .eq("profile_id", professionalId);

  console.log(`[BackgroundCheckWebhook] Flagged for review: ${professionalId}`);

  // TODO: Send notification to admin team
  // TODO: Send email to professional about review
}

/**
 * Reject professional onboarding
 */
async function rejectOnboarding(
  professionalId: string,
  _check: { status: string; recommendation?: string; rawData?: unknown },
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<void> {
  await supabase
    .from("professional_profiles")
    .update({
      onboarding_status: "rejected",
      status: "suspended",
    })
    .eq("profile_id", professionalId);

  console.log(`[BackgroundCheckWebhook] Rejected professional: ${professionalId}`);

  // TODO: Send rejection email with appeal process
}
