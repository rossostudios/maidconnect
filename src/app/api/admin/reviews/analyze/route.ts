import { NextResponse } from "next/server";
import { analyzeReview } from "@/lib/services/reviews/review-analysis-service";
import { withAuth } from "@/lib/shared/api/middleware";

type ReviewAnalysisPayload = {
  reviewText: string;
  rating?: number;
  locale: "en" | "es";
};

const validationError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const validatePayload = (body: any): { payload?: ReviewAnalysisPayload; error?: NextResponse } => {
  const { reviewText, rating, locale = "en" } = body ?? {};

  if (!reviewText || typeof reviewText !== "string") {
    return { error: validationError("reviewText is required and must be a string") };
  }

  if (reviewText.length > 5000) {
    return { error: validationError("reviewText must be 5000 characters or less") };
  }

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return { error: validationError("rating must be between 1 and 5") };
  }

  return {
    payload: {
      reviewText,
      rating,
      locale: locale === "es" ? "es" : "en",
    },
  };
};

/**
 * POST /api/admin/reviews/analyze
 *
 * Analyzes a review using Claude AI for sentiment, safety flags, and moderation decisions
 *
 * @auth Admin only
 * @body { reviewText: string, rating?: number, locale?: "en" | "es" }
 * @returns ReviewAnalysis with sentiment, categories, flags, severity, and recommendations
 */
export function POST(request: Request) {
  return withAuth(request, async (user) => {
    // Verify admin role
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { error, payload } = validatePayload(body);
      if (error || !payload) {
        return error;
      }

      // Analyze review using Claude
      const analysis = await analyzeReview(payload.reviewText, payload.rating, payload.locale);

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
