/**
 * Client Error Reporting API
 *
 * Receives error reports from client-side error boundaries and logs them
 * on the server for correlation with server-side errors via error digest.
 *
 * This enables full-stack error tracking:
 * - Client errors logged via browser console
 * - Same errors reported to server for Better Stack correlation
 * - Error digest allows linking client and server errors
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/shared/logger";

// Validation schema for client error reports
const clientErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  digest: z.string().optional(), // Next.js 16 error digest
  stack: z.string().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const errorData = clientErrorSchema.parse(body);

    // Log to server-side logger (Better Stack)
    // This allows correlation with server errors via digest
    await logger.error("Client-side error reported", {
      ...errorData,
      source: "client",
      timestamp: new Date().toISOString(),
      // Automatically includes request context (requestId, etc.) via AsyncLocalStorage
    });

    await logger.flush();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Don't throw errors - failing to log shouldn't break the app
    console.error("Failed to process client error report:", error);
    return NextResponse.json({ success: false, error: "Invalid error data" }, { status: 400 });
  }
}

// Disable caching for error reporting
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
