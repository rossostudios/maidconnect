"use server";

import { revalidatePath } from "next/cache";
import {
  parseReviewRatings,
  validateBookingAuthorization,
  validateReviewInput,
} from "@/lib/reviews/review-validation-service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ReviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

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

    // Validate basic input using helper to reduce complexity
    const inputValidation = validateReviewInput({
      customerId,
      bookingId,
      rating: ratingValue,
      punctualityRating: punctualityRatingValue,
      communicationRating: communicationRatingValue,
      respectfulnessRating: respectfulnessRatingValue,
    });

    if (!inputValidation.success) {
      return { status: "error", message: inputValidation.error };
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

    // Verify booking authorization using helper to reduce complexity
    const authResult = await validateBookingAuthorization(
      supabase,
      bookingId!,
      customerId!,
      user.id
    );

    if (!authResult.success) {
      return { status: "error", message: authResult.error };
    }

    // Parse ratings using helper to reduce complexity
    const ratings = parseReviewRatings({
      customerId,
      bookingId,
      rating: ratingValue,
      punctualityRating: punctualityRatingValue,
      communicationRating: communicationRatingValue,
      respectfulnessRating: respectfulnessRatingValue,
    });

    // Insert the review
    const { error } = await supabase.from("customer_reviews").insert({
      customer_id: customerId!,
      professional_id: user.id,
      booking_id: bookingId!,
      rating: ratings.rating,
      title,
      comment,
      punctuality_rating: ratings.punctualityRating,
      communication_rating: ratings.communicationRating,
      respectfulness_rating: ratings.respectfulnessRating,
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

    revalidatePath("/[locale]/dashboard/pro");
    return { status: "success", message: "Customer review submitted successfully!" };
  } catch (_error) {
    return { status: "error", message: "Unexpected error while submitting review." };
  }
}
