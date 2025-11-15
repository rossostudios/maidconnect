/**
 * Admin Analytics Report API
 *
 * POST /api/admin/analytics/report
 *
 * Generates comprehensive analytics reports with AI-powered insights.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { exportReport, generateAnalyticsReport } from "@/lib/services/admin/analytics-service";
import { withAuth } from "@/lib/shared/api/middleware";

const requestSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Start date (YYYY-MM-DD)"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("End date (YYYY-MM-DD)"),
  format: z.enum(["json", "markdown", "csv"]).optional().default("json"),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Validate date range
    const start = new Date(validated.startDate);
    const end = new Date(validated.endDate);

    if (start > end) {
      return NextResponse.json(
        { success: false, error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Generate report
    const report = await generateAnalyticsReport(validated.startDate, validated.endDate);

    // Format response based on requested format
    if (validated.format === "markdown") {
      const markdown = exportReport(report, "markdown");
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="casaora-report-${validated.startDate}-${validated.endDate}.md"`,
        },
      });
    }

    if (validated.format === "csv") {
      const csv = exportReport(report, "csv");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="casaora-report-${validated.startDate}-${validated.endDate}.csv"`,
        },
      });
    }

    // Default JSON response
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Analytics report error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate analytics report" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const POST = withAuth(handler, { requiredRole: "admin" });
