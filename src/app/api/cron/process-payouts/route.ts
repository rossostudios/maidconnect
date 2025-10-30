import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Automatic Payout Processing Cron Job
 * Runs twice weekly: Tuesday and Friday at 10:00 AM Colombia time
 *
 * This endpoint should be called by Vercel Cron Jobs with the schedule:
 * "0 15 * * 2,5" (10 AM Colombia time = 3 PM UTC, on Tuesday and Friday)
 *
 * Protected by CRON_SECRET to ensure only Vercel can trigger it
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return NextResponse.json({ error: "Cron job not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error("Unauthorized cron job attempt");
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
    const processUrl = new URL("/api/admin/payouts/process", request.url).toString();

    const response = await fetch(processUrl, {
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
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to process payouts");
    }

    console.log(`Payout cron completed on ${getDayName(dayOfWeek)}:`, result);

    return NextResponse.json({
      success: true,
      message: `Payouts processed successfully on ${getDayName(dayOfWeek)}`,
      timestamp: now.toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Payout cron job failed:", error);
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
