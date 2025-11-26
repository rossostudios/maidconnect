import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

type RawReviewData = {
  id: string;
  booking_id: string;
  professional_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  status: string;
  bookings: { id: string; customer_id: string } | { id: string; customer_id: string }[] | null;
  professional_profiles:
    | { id: string; full_name: string | null }
    | { id: string; full_name: string | null }[]
    | null;
  users: { id: string; email: string } | { id: string; email: string }[] | null;
};

/**
 * GET /api/admin/reviews/pending
 *
 * Fetches all pending reviews awaiting moderation
 *
 * @auth Admin only
 * @returns Array of pending reviews with professional and customer info
 */
export function GET(request: Request) {
  return withAuth(request, async (user) => {
    // Verify admin role
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createSupabaseServerClient();

    // Fetch pending reviews with related data
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        booking_id,
        professional_id,
        rating,
        comment,
        created_at,
        status,
        bookings (
          id,
          customer_id
        ),
        professional_profiles!reviews_professional_id_fkey (
          id,
          full_name
        ),
        users!reviews_customer_id_fkey (
          id,
          email
        )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Failed to fetch pending reviews:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    // Transform to expected format
    const transformedReviews = ((reviews || []) as RawReviewData[]).map((review) => {
      const profile = Array.isArray(review.professional_profiles)
        ? review.professional_profiles[0]
        : review.professional_profiles;
      const user = Array.isArray(review.users) ? review.users[0] : review.users;
      return {
        id: review.id,
        bookingId: review.booking_id,
        professionalId: review.professional_id,
        professionalName: profile?.full_name || "Unknown Professional",
        customerName: user?.email?.split("@")[0] || "Unknown Customer",
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        status: review.status,
      };
    });

    return NextResponse.json({
      reviews: transformedReviews,
      count: transformedReviews.length,
    });
  });
}
