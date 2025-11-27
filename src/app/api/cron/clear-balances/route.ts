/**
 * Balance Clearance Cron Job
 *
 * Runs daily to process 24-hour clearance period for professional earnings.
 * Moves pending balance to available balance after fraud protection hold.
 *
 * Schedule: Daily at 2:00 AM UTC (configured in vercel.json)
 * Trigger: GET /api/cron/clear-balances
 *
 * Security: Vercel Cron Secret header verification
 */

import { NextRequest, NextResponse } from "next/server";
import { withAdvisoryLock } from "@/lib/cron";
import { trackServerEvent } from "@/lib/integrations/posthog/server";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";
import { BalanceService } from "@/lib/services/balance/balance-service";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

/**
 * GET /api/cron/clear-balances
 * Process all pending balance clearances past their 24hr hold period
 */
async function handleClearBalances(request: NextRequest) {
  // ========================================
  // 1. Verify Cron Secret (Security)
  // ========================================

  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, require cron secret. In development, allow bypassing for testing.
  if (process.env.NODE_ENV === "production") {
    if (!cronSecret) {
      logger.error("[Cron] CRON_SECRET not configured");
      return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("[Cron] Unauthorized cron request", {
        hasAuthHeader: !!authHeader,
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ========================================
  // 2. Process Batch Clearances
  // ========================================

  const startTime = Date.now();
  logger.info("[Cron] Starting balance clearance job");

  try {
    const balanceService = new BalanceService(supabaseAdmin);
    const result = await balanceService.processBatchClearances();

    const duration = Date.now() - startTime;

    logger.info("[Cron] Balance clearance job completed", {
      processed: result.processed,
      failed: result.failed,
      durationMs: duration,
    });

    // ========================================
    // 3. Track Analytics
    // ========================================

    // Track successful clearances in PostHog
    if (result.processed > 0) {
      await trackServerEvent("balance_clearance_completed", {
        processed_count: result.processed,
        failed_count: result.failed,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      });
    }

    // ========================================
    // 4. Return Response
    // ========================================

    if (result.failed > 0) {
      logger.warn("[Cron] Some balance clearances failed", {
        failedCount: result.failed,
        errors: result.errors,
      });

      return NextResponse.json(
        {
          success: true,
          processed: result.processed,
          failed: result.failed,
          errors: result.errors,
          message: `Processed ${result.processed} clearances with ${result.failed} failures`,
        },
        { status: 200 }
      ); // Still 200 because job ran successfully
    }

    return NextResponse.json(
      {
        success: true,
        processed: result.processed,
        failed: result.failed,
        message:
          result.processed > 0
            ? `Successfully cleared ${result.processed} pending balances`
            : "No pending clearances to process",
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("[Cron] Balance clearance job failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    // Track failure in PostHog
    await trackServerEvent("balance_clearance_failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Balance clearance job failed",
      },
      { status: 500 }
    );
  }
}

// ========================================
// Runtime Configuration
// ========================================

// Vercel Edge Runtime for faster cold starts
export const runtime = "nodejs"; // Use Node.js runtime for Supabase compatibility

// Maximum execution time: 60 seconds
export const maxDuration = 60;

// Apply rate limiting + advisory lock for true single-instance execution
// Rate limit: Fast Redis check prevents retries within 5 minutes
// Advisory lock: Database-level lock prevents concurrent execution across serverless instances
export const GET = withRateLimit(withAdvisoryLock("clear-balances", handleClearBalances), "cron");
