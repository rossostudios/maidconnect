"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ReviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const _INITIAL_STATE: ReviewActionState = { status: "idle" };

export async function submitProfessionalReviewAction(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  try {
    const professionalId = formData.get("professionalId") as string | null;
    const ratingValue = formData.get("rating") as string | null;
    const title = (formData.get("title") as string | null) ?? null;
    const comment = (formData.get("comment") as string | null) ?? null;

    if (!professionalId) {
      return { status: "error", message: "Missing professional." };
    }

    const rating = ratingValue ? Number.parseInt(ratingValue, 10) : Number.NaN;
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return { status: "error", message: "Please provide a rating between 1 and 5." };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return { status: "error", message: "Unable to verify your session. Please sign in again." };
    }

    if (!user) {
      return { status: "error", message: "Please sign in to leave a review." };
    }

    const reviewerName = user.email ? user.email.split("@")[0] : "MaidConnect member";

    const { error } = await supabase.from("professional_reviews").insert({
      professional_id: professionalId,
      customer_id: user.id,
      reviewer_name: reviewerName,
      rating,
      title,
      comment,
    });

    if (error) {
      return { status: "error", message: "We couldn’t save your review. Please try again." };
    }

    revalidatePath(`/professionals/${professionalId}`);
    return { status: "success", message: "Review submitted." };
  } catch (_error) {
    return { status: "error", message: "Unexpected error while submitting review." };
  }
}
