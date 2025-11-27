import { NextResponse } from "next/server";
import { withAdvisoryLock } from "@/lib/cron";
import { withRateLimit } from "@/lib/rate-limit";

/**
 * Automatic Payout Processing Cron Job
 * Runs twice weekly: Tuesday and Friday at 10:00 AM Colombia time
 *
 * This endpoint should be called by Vercel Cron Jobs with the schedule:
 * "0 15 * * 2,5" (10 AM Colombia time = 3 PM UTC, on Tuesday and Friday)
 *
 * Protected by CRON_SECRET to ensure only Vercel can trigger it
 *
 * Rate Limit: 1 request per 5 minutes (cron tier - prevents concurrent execution)
 */
async function handleCronPayouts(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "Cron job not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 2 = Tuesday, 5 = Friday

    // Only process on Tuesday (2) or Friday (5)
    if (dayOfWeek !== 2 && dayOfWeek !== 5) {
      return NextResponse.json({
        message: `Skipped: Not a payout day (today is ${getDayName(dayOfWeek)})`,
        timestamp: now.toISOString(),
      });
    }

    // Call the internal payout processing endpoint
    // Use VERCEL_URL or fallback to localhost for local development
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const processUrl = `${baseUrl}/api/admin/payouts/process`;

    // RELIABILITY: Add 5-minute timeout to prevent cron job from hanging
    // Vercel has a 25-minute hard limit, but we want to fail fast and retry
    const controller = new AbortController();
    const timeoutMs = 5 * 60 * 1000; // 5 minutes
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    let result: Record<string, unknown>;

    try {
      response = await fetch(processUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass cron secret for authentication
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({
          // Process all professionals with pending earnings
          dryRun: false,
        }),
        signal: controller.signal,
      });

      result = await response.json();
    } catch (fetchError) {
      // Handle timeout specifically
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error(`Payout processing timed out after ${timeoutMs / 1000} seconds`);
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorMessage = typeof result.error === "string" ? result.error : "Failed to process payouts";
      throw new Error(errorMessage);
    }

    return NextResponse.json({
      success: true,
      message: `Payouts processed successfully on ${getDayName(dayOfWeek)}`,
      timestamp: now.toISOString(),
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process payouts",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek] || "Unknown";
}

// Apply rate limiting + advisory lock for true single-instance execution
// Rate limit: Fast Redis check prevents retries within 5 minutes
// Advisory lock: Database-level lock prevents concurrent execution across serverless instances
export const GET = withRateLimit(
  withAdvisoryLock("process-payouts", handleCronPayouts),
  "cron"
);
