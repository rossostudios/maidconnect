"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

type ReviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

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

    // SECURITY: Verify user has a completed booking with this professional
    // Prevent fake reviews from users who haven't worked with the professional
    const { data: completedBooking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("customer_id", user.id)
      .eq("professional_id", professionalId)
      .eq("status", "completed")
      .maybeSingle();

    if (bookingError) {
      console.error("[Review] Booking verification error:", bookingError);
      return { status: "error", message: "Unable to verify booking. Please try again." };
    }

    if (!completedBooking) {
      return {
        status: "error",
        message: "You can only review professionals you've worked with. Complete a booking first.",
      };
    }

    // Check if user has already reviewed this professional
    const { data: existingReview } = await supabase
      .from("professional_reviews")
      .select("id")
      .eq("customer_id", user.id)
      .eq("professional_id", professionalId)
      .maybeSingle();

    if (existingReview) {
      return {
        status: "error",
        message: "You've already reviewed this professional. Edit your existing review instead.",
      };
    }

    const reviewerName = user.email ? user.email.split("@")[0] : "Casaora member";

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

    revalidatePath(`/[locale]/professionals/${professionalId}`);
    return { status: "success", message: "Review submitted." };
  } catch (_error) {
    return { status: "error", message: "Unexpected error while submitting review." };
  }
}
