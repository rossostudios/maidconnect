/**
 * Admin User Reviews Tab API
 * GET /api/admin/users/[id]/reviews - Get reviews tab data (lazy loaded)
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function handleGetReviews(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const userId = id;

    // Parse query params for pagination
    const url = new URL(request.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = Number.parseInt(url.searchParams.get("offset") || "0", 10);

    // Fetch profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isProfessional = profile.role === "professional";
    const isCustomer = profile.role === "customer";

    // Fetch professional reviews
    let professionalReviews = null;
    if (isProfessional) {
      professionalReviews = await fetchProfessionalReviews(supabase, userId, limit, offset);
    }

    // Fetch customer reviews
    let customerReviews = null;
    if (isCustomer) {
      customerReviews = await fetchCustomerReviews(supabase, userId, limit, offset);
    }

    return NextResponse.json({
      professional: professionalReviews,
      customer: customerReviews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews data" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

async function fetchProfessionalReviews(
  supabase: SupabaseServerClient,
  userId: string,
  limit: number,
  offset: number
) {
  // Fetch all reviews for stats
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("rating, professional_response")
    .eq("professional_id", userId);

  const totalReviews = allReviews?.length || 0;
  const averageRating =
    totalReviews > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
  const responseRate =
    totalReviews > 0
      ? (allReviews.filter((r) => r.professional_response).length / totalReviews) * 100
      : 0;

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: allReviews?.filter((r) => r.rating === stars).length || 0,
  }));

  // Fetch paginated reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      professional_response,
      customer:profiles!reviews_customer_id_fkey(id, full_name),
      booking:bookings(service_type)
    `
    )
    .eq("professional_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Transform reviews data
  const transformedReviews = reviews?.map((review: any) => ({
    id: review.id,
    customer_name: review.customer?.full_name || "Anonymous",
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
    service: review.booking?.service_type || "Service",
    response: review.professional_response,
  }));

  return {
    stats: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      responseRate: Math.round(responseRate),
    },
    ratingBreakdown,
    reviews: transformedReviews || [],
  };
}

async function fetchCustomerReviews(
  supabase: SupabaseServerClient,
  userId: string,
  limit: number,
  offset: number
) {
  // Fetch all reviews for stats
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("customer_id", userId);

  const totalReviews = allReviews?.length || 0;
  const averageRating =
    totalReviews > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

  // Fetch paginated reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      professional_response,
      professional:profiles!reviews_professional_id_fkey(id, full_name),
      booking:bookings(service_type)
    `
    )
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Transform reviews data
  const transformedReviews = reviews?.map((review: any) => ({
    id: review.id,
    professional_name: review.professional?.full_name || "Unknown",
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
    service: review.booking?.service_type || "Service",
    response: review.professional_response,
  }));

  return {
    stats: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    },
    reviews: transformedReviews || [],
  };
}

// Apply rate limiting: 10 requests per minute
export const GET = withRateLimit(handleGetReviews, "admin");
