import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

/**
 * POST /api/admin/reviews/moderate
 *
 * Moderate a review (approve, reject, or request clarification)
 *
 * @auth Admin only
 * @body { reviewId: string, action: "approve" | "reject" | "clarify", reason?: string }
 * @returns Updated review status
 */
export async function POST(request: Request) {
  return withAuth(request, async (user) => {
    // Verify admin role
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { reviewId, action, reason } = body;

      // Validate input
      if (!reviewId || typeof reviewId !== "string") {
        return NextResponse.json(
          { error: "reviewId is required and must be a string" },
          { status: 400 }
        );
      }

      if (!(action && ["approve", "reject", "clarify"].includes(action))) {
        return NextResponse.json(
          { error: 'action must be "approve", "reject", or "clarify"' },
          { status: 400 }
        );
      }

      const supabase = createSupabaseServerClient();

      // Map action to database status
      const statusMap = {
        approve: "approved",
        reject: "rejected",
        clarify: "pending", // Keep as pending but add admin note
      };

      // Update review status
      const { data: review, error: updateError } = await supabase
        .from("reviews")
        .update({
          status: statusMap[action as keyof typeof statusMap],
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
          moderation_reason: reason || null,
        })
        .eq("id", reviewId)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update review:", updateError);
        return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 });
      }

      // If clarification requested, send notification to customer
      if (action === "clarify") {
        // TODO: Implement notification service
        console.log("Clarification requested for review:", reviewId);
      }

      // If approved, update professional's average rating
      if (action === "approve") {
        // Recalculate professional's average rating
        const { data: approvedReviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("professional_id", review.professional_id)
          .eq("status", "approved");

        if (approvedReviews && approvedReviews.length > 0) {
          const avgRating =
            approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;

          await supabase
            .from("professional_profiles")
            .update({
              average_rating: avgRating,
              total_reviews: approvedReviews.length,
            })
            .eq("id", review.professional_id);
        }
      }

      return NextResponse.json({
        success: true,
        review: {
          id: review.id,
          status: review.status,
          moderatedBy: review.moderated_by,
          moderatedAt: review.moderated_at,
        },
      });
    } catch (error) {
      console.error("Review moderation failed:", error);
      return NextResponse.json(
        {
          error: "Failed to moderate review",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  });
}
