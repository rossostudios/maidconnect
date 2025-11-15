/**
 * Payout Processing API Route
 *
 * Epic C – Payout Idempotency & Financial Safety (P0)
 *
 * This endpoint processes payouts using the new batch model with:
 * - C-1: payout_batches / payout_transfers tables
 * - C-2: Idempotent processing (safe to re-run)
 * - C-3: Structured Better Stack logging
 *
 * Authentication:
 * - Cron job via Bearer token with CRON_SECRET
 * - OR admin user (for manual triggers)
 *
 * Request Body:
 * - dryRun (boolean, optional): Calculate but don't process transfers
 * - batchDate (string, optional): ISO date for batch processing
 *
 * POST /api/admin/payouts/process
 *
 * Rate Limit: 1 request per minute (financial tier)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { processPayoutBatch } from "@/lib/services/payouts/payout-batch-service";
import { logger } from "@/lib/shared/logger";

/**
 * Verify authentication - cron secret OR admin user
 */
async function verifyPayoutAuth(
  request: Request
): Promise<{ adminId: string; isCronJob: boolean }> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Check if request is from cron job
  const isCronJob = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (isCronJob) {
    return { adminId: "system", isCronJob: true };
  }

  // Otherwise require admin authentication
  try {
    const admin = await requireAdmin();
    return { adminId: admin.id, isCronJob: false };
  } catch (error) {
    throw new Error("Unauthorized - admin access or cron secret required");
  }
}

/**
 * Process payouts for eligible bookings
 *
 * This endpoint delegates to the payout batch service which:
 * 1. Generates unique batch ID for idempotency
 * 2. Checks if batch already processed
 * 3. Fetches eligible bookings (completed, not yet paid)
 * 4. Creates payout_transfers records with UNIQUE constraint
 * 5. Processes Stripe transfers with idempotency keys
 * 6. Logs structured JSON to Better Stack
 */
async function handlePayoutProcessing(request: Request) {
  const requestStartTime = Date.now();

  try {
    // Verify authentication
    const { adminId, isCronJob } = await verifyPayoutAuth(request);

    // Parse request body
    const body = (await request.json().catch(() => ({}))) as {
      dryRun?: boolean;
      batchDate?: string;
    };

    const dryRun = body.dryRun ?? false;
    const batchDate = body.batchDate ? new Date(body.batchDate) : new Date();

    // Log API call
    await logger.info("Payout processing API called", {
      dryRun,
      batchDate: batchDate.toISOString(),
      triggeredBy: isCronJob ? "cron" : "admin",
      adminId,
      userAgent: request.headers.get("user-agent"),
    });

    // Process payout batch (idempotent operation)
    const result = await processPayoutBatch({ dryRun, batchDate });

    // Log successful completion
    await logger.info("Payout processing API completed", {
      batchId: result.batchId,
      status: result.status,
      totalAmountCop: result.totalAmountCop,
      totalTransfers: result.totalTransfers,
      successfulTransfers: result.successfulTransfers,
      failedTransfers: result.failedTransfers,
      duration: result.duration,
      dryRun,
    });

    await logger.flush();

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Payout batch processed successfully",
      batch: {
        id: result.batchId,
        status: result.status,
        totalAmountCop: result.totalAmountCop,
        totalTransfers: result.totalTransfers,
        successfulTransfers: result.successfulTransfers,
        failedTransfers: result.failedTransfers,
        duration: result.duration,
        dryRun,
      },
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - requestStartTime;

    // Log error to Better Stack
    await logger.error("Payout processing API failed", error as Error, {
      duration,
      timestamp: new Date().toISOString(),
    });

    await logger.flush();

    // Determine error status
    const getErrorStatus = () => {
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) return 401;
        if (error.message.includes("admin access")) return 403;
      }
      return 500;
    };

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process payouts",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: getErrorStatus() }
    );
  }
}

// Apply rate limiting: 1 request per minute (prevents abuse of financial operations)
export const POST = withRateLimit(handlePayoutProcessing, "financial");
