import { NextResponse } from "next/server";
import { analyzeReview } from "@/lib/services/reviews/review-analysis-service";
import { withAuth } from "@/lib/shared/api/middleware";

/**
 * POST /api/admin/reviews/analyze
 *
 * Analyzes a review using Claude AI for sentiment, safety flags, and moderation decisions
 *
 * @auth Admin only
 * @body { reviewText: string, rating?: number, locale?: "en" | "es" }
 * @returns ReviewAnalysis with sentiment, categories, flags, severity, and recommendations
 */
export async function POST(request: Request) {
  return withAuth(request, async (user) => {
    // Verify admin role
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { reviewText, rating, locale = "en" } = body;

      // Validate input
      if (!reviewText || typeof reviewText !== "string") {
        return NextResponse.json(
          { error: "reviewText is required and must be a string" },
          { status: 400 }
        );
      }

      if (reviewText.length > 5000) {
        return NextResponse.json(
          { error: "reviewText must be 5000 characters or less" },
          { status: 400 }
        );
      }

      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return NextResponse.json(
          { error: "rating must be between 1 and 5" },
          { status: 400 }
        );
      }

      // Analyze review using Claude
      const analysis = await analyzeReview(
        reviewText,
        rating,
        locale as "en" | "es"
      );

      return NextResponse.json(analysis);
    } catch (error) {
      console.error("Review analysis failed:", error);
      return NextResponse.json(
        {
          error: "Failed to analyze review",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  });
}
