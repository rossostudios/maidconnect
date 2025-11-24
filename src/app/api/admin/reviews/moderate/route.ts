import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

type ModerateAction = "approve" | "reject" | "clarify";

const ACTION_STATUS_MAP: Record<ModerateAction, "approved" | "rejected" | "pending"> = {
  approve: "approved",
  reject: "rejected",
  clarify: "pending",
};

type ModeratePayload = {
  reviewId: string;
  action: ModerateAction;
  reason?: string;
};

const parseModerationPayload = (body: Record<string, unknown> | null): { payload?: ModeratePayload; error?: NextResponse } => {
  const { reviewId, action, reason } = body ?? {};

  if (!reviewId || typeof reviewId !== "string") {
    return {
      error: NextResponse.json(
        { error: "reviewId is required and must be a string" },
        { status: 400 }
      ),
    };
  }

  if (!(action && (action === "approve" || action === "reject" || action === "clarify"))) {
    return {
      error: NextResponse.json(
        { error: 'action must be "approve", "reject", or "clarify"' },
        { status: 400 }
      ),
    };
  }

  return {
    payload: {
      reviewId,
      action,
      reason,
    },
  };
};

const recalculateProfessionalRating = async (
  supabase: ReturnType<typeof createSupabaseServerClient>,
  professionalId: string
) => {
  const { data: approvedReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("professional_id", professionalId)
    .eq("status", "approved");

  if (!approvedReviews || approvedReviews.length === 0) {
    return;
  }

  const avgRating =
    approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length;

  await supabase
    .from("professional_profiles")
    .update({
      average_rating: avgRating,
      total_reviews: approvedReviews.length,
    })
    .eq("id", professionalId);
};

const handleClarification = (reviewId: string) => {
  // TODO: Implement notification service
  console.log("Clarification requested for review:", reviewId);
};

const ADMIN_UNAUTHORIZED_RESPONSE = NextResponse.json({ error: "Unauthorized" }, { status: 403 });

const ensureAdmin = (user: { role?: string }) =>
  user.role === "admin" ? null : ADMIN_UNAUTHORIZED_RESPONSE;

const updateReviewRecord = async (
  supabase: ReturnType<typeof createSupabaseServerClient>,
  payload: ModeratePayload,
  userId: string
) => {
  const { data: review, error } = await supabase
    .from("reviews")
    .update({
      status: ACTION_STATUS_MAP[payload.action],
      moderated_by: userId,
      moderated_at: new Date().toISOString(),
      moderation_reason: payload.reason || null,
    })
    .eq("id", payload.reviewId)
    .select()
    .single();

  if (error || !review) {
    console.error("Failed to update review:", error);
    return { error: NextResponse.json({ error: "Failed to moderate review" }, { status: 500 }) };
  }

  return { review };
};

const handlePostModerationEffects = async (
  action: ModerateAction,
  supabase: ReturnType<typeof createSupabaseServerClient>,
  review: { professional_id: string },
  reviewId: string
) => {
  if (action === "clarify") {
    handleClarification(reviewId);
  }

  if (action === "approve") {
    await recalculateProfessionalRating(supabase, review.professional_id);
  }
};

const moderateReviewRequest = async (request: Request, user: { id: string; role?: string }) => {
  const adminError = ensureAdmin(user);
  if (adminError) {
    return adminError;
  }

  try {
    const body = await request.json();
    const { error, payload } = parseModerationPayload(body);
    if (error || !payload) {
      return error;
    }

    const supabase = createSupabaseServerClient();
    const { error: updateError, review } = await updateReviewRecord(supabase, payload, user.id);

    if (updateError || !review) {
      return updateError;
    }

    await handlePostModerationEffects(payload.action, supabase, review, payload.reviewId);

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
};

/**
 * POST /api/admin/reviews/moderate
 *
 * Moderate a review (approve, reject, or request clarification)
 *
 * @auth Admin only
 * @body { reviewId: string, action: "approve" | "reject" | "clarify", reason?: string }
 * @returns Updated review status
 */
export function POST(request: Request) {
  return withAuth(request, async (user) => moderateReviewRequest(request, user));
}
