"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ReviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const _INITIAL_STATE: ReviewActionState = { status: "idle" };

export async function submitCustomerReviewAction(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  try {
    const customerId = formData.get("customerId") as string | null;
    const bookingId = formData.get("bookingId") as string | null;
    const ratingValue = formData.get("rating") as string | null;
    const title = (formData.get("title") as string | null) ?? null;
    const comment = (formData.get("comment") as string | null) ?? null;

    // Optional category ratings
    const punctualityRatingValue = formData.get("punctualityRating") as string | null;
    const communicationRatingValue = formData.get("communicationRating") as string | null;
    const respectfulnessRatingValue = formData.get("respectfulnessRating") as string | null;

    if (!customerId) {
      return { status: "error", message: "Missing customer information." };
    }

    if (!bookingId) {
      return { status: "error", message: "Missing booking information." };
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

    // Verify this is a professional rating their customer
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, professional_id, customer_id, status")
      .eq("id", bookingId)
      .eq("professional_id", user.id)
      .eq("customer_id", customerId)
      .maybeSingle();

    if (bookingError || !booking) {
      return { status: "error", message: "Booking not found or you're not authorized." };
    }

    if (booking.status !== "completed") {
      return { status: "error", message: "Can only review completed bookings." };
    }

    // Parse optional category ratings
    const punctualityRating = punctualityRatingValue
      ? Number.parseInt(punctualityRatingValue, 10)
      : null;
    const communicationRating = communicationRatingValue
      ? Number.parseInt(communicationRatingValue, 10)
      : null;
    const respectfulnessRating = respectfulnessRatingValue
      ? Number.parseInt(respectfulnessRatingValue, 10)
      : null;

    // Insert the review
    const { error } = await supabase.from("customer_reviews").insert({
      customer_id: customerId,
      professional_id: user.id,
      booking_id: bookingId,
      rating,
      title,
      comment,
      punctuality_rating: punctualityRating,
      communication_rating: communicationRating,
      respectfulness_rating: respectfulnessRating,
    });

    if (error) {
      // Check for duplicate review
      if (error.code === "23505") {
        return {
          status: "error",
          message: "You've already reviewed this customer for this booking.",
        };
      }

      return { status: "error", message: "We couldn't save your review. Please try again." };
    }

    revalidatePath("/dashboard/pro");
    return { status: "success", message: "Customer review submitted successfully!" };
  } catch (_error) {
    return { status: "error", message: "Unexpected error while submitting review." };
  }
}
