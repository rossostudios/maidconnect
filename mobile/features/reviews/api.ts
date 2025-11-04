import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import type { CreateReviewParams, Review, ReviewRecord } from "./types";

/**
 * Create a new review for a completed booking
 */
export async function createReview(params: CreateReviewParams): Promise<Review> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create review");
  }

  const data = await response.json();

  return {
    id: data.id,
    bookingId: data.booking_id,
    professionalId: data.professional_id,
    customerId: data.customer_id,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date(data.created_at),
  };
}

/**
 * Fetch reviews for a specific professional
 */
export async function fetchProfessionalReviews(professionalId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      booking_id,
      professional_id,
      customer_id,
      rating,
      comment,
      created_at,
      customer:profiles!reviews_customer_id_fkey (
        full_name
      )
    `
    )
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const reviews = data as unknown as ReviewRecord[];

  return reviews.map((review) => ({
    id: review.id,
    bookingId: review.booking_id,
    professionalId: review.professional_id,
    customerId: review.customer_id,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date(review.created_at),
    customerName: (review as any).customer?.full_name || null,
  }));
}

/**
 * Check if user has already reviewed a booking
 */
export async function hasReviewedBooking(bookingId: string): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return false;
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("customer_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error checking review:", error);
    return false;
  }

  return !!data;
}
