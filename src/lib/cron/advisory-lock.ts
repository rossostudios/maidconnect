/**
 * PostgreSQL Advisory Lock Utility for Cron Jobs
 *
 * Prevents concurrent execution of cron jobs across multiple serverless instances.
 * Uses database-level locks that automatically release on connection close.
 *
 * SECURITY: Prevents race conditions when multiple Vercel instances trigger
 * the same cron job simultaneously.
 *
 * Usage:
 * ```typescript
 * import { withAdvisoryLock } from '@/lib/cron/advisory-lock';
 *
 * async function handleCronJob(request: Request) {
 *   // Your cron job logic
 * }
 *
 * export const GET = withAdvisoryLock('my-cron-job', handleCronJob);
 * ```
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

/**
 * Acquires a named advisory lock using PostgreSQL
 * Returns true if lock acquired, false if already held by another session
 */
async function acquireLock(lockName: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc("try_acquire_cron_lock", {
      lock_name: lockName,
    });

    if (error) {
      logger.error("[AdvisoryLock] Failed to acquire lock", {
        lockName,
        error: error.message,
      });
      return false;
    }

    return data === true;
  } catch (err) {
    logger.error("[AdvisoryLock] Exception acquiring lock", {
      lockName,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Releases a named advisory lock
 */
async function releaseLock(lockName: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.rpc("release_cron_lock", {
      lock_name: lockName,
    });

    if (error) {
      logger.error("[AdvisoryLock] Failed to release lock", {
        lockName,
        error: error.message,
      });
    }
  } catch (err) {
    logger.error("[AdvisoryLock] Exception releasing lock", {
      lockName,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

type CronHandler = (request: Request) => Promise<NextResponse>;

/**
 * Wraps a cron handler with advisory lock protection
 *
 * @param lockName Unique name for this cron job (e.g., 'process-payouts', 'clear-balances')
 * @param handler The cron handler function to wrap
 * @returns Wrapped handler that acquires lock before execution
 */
export function withAdvisoryLock(lockName: string, handler: CronHandler): CronHandler {
  return async (request: Request): Promise<NextResponse> => {
    const lockKey = `cron:${lockName}`;

    // Try to acquire the lock
    const lockAcquired = await acquireLock(lockKey);

    if (!lockAcquired) {
      logger.info("[AdvisoryLock] Lock not acquired - another instance is running", {
        lockName,
        lockKey,
      });

      // Return 200 OK so Vercel doesn't retry - another instance is handling it
      return NextResponse.json(
        {
          success: true,
          skipped: true,
          message: `Cron job '${lockName}' is already running in another instance`,
        },
        { status: 200 }
      );
    }

    logger.info("[AdvisoryLock] Lock acquired", { lockName, lockKey });

    try {
      // Execute the handler
      return await handler(request);
    } finally {
      // Always release the lock
      await releaseLock(lockKey);
      logger.info("[AdvisoryLock] Lock released", { lockName, lockKey });
    }
  };
}
