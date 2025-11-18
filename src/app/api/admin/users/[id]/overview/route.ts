/**
 * Admin User Overview Tab API
 * GET /api/admin/users/[id]/overview - Get overview tab data (lazy loaded)
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function handleGetOverview(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const userId = id;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isProfessional = profile.role === "professional";
    const isCustomer = profile.role === "customer";

    // Fetch professional-specific data
    let professionalData = null;
    if (isProfessional) {
      professionalData = await fetchProfessionalOverview(supabase, userId);
    }

    // Fetch customer-specific data
    let customerData = null;
    if (isCustomer) {
      customerData = await fetchCustomerOverview(supabase, userId);
    }

    return NextResponse.json({
      profile: {
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        postal_code: profile.postal_code,
        created_at: profile.created_at,
      },
      professional: professionalData,
      customer: customerData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch overview data" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

async function fetchProfessionalOverview(supabase: SupabaseServerClient, userId: string) {
  // Fetch professional profile
  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // Fetch verification status
  const { data: verification } = await supabase
    .from("professional_verifications")
    .select("*")
    .eq("professional_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch metrics
  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", userId);

  const { count: completedBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", userId)
    .eq("status", "completed");

  const { data: avgRatingData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("professional_id", userId);

  const avgRating =
    avgRatingData && avgRatingData.length > 0
      ? avgRatingData.reduce((sum, r) => sum + r.rating, 0) / avgRatingData.length
      : 0;

  // Fetch services
  const { data: services } = await supabase
    .from("professional_services")
    .select("*")
    .eq("professional_id", userId)
    .eq("is_active", true);

  return {
    profile: professionalProfile,
    verification: verification || null,
    metrics: {
      totalBookings: totalBookings || 0,
      completedBookings: completedBookings || 0,
      completionRate:
        totalBookings && totalBookings > 0
          ? Math.round(((completedBookings || 0) / totalBookings) * 100)
          : 0,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: avgRatingData?.length || 0,
    },
    services: services || [],
  };
}

async function fetchCustomerOverview(supabase: SupabaseServerClient, userId: string) {
  // Fetch booking stats
  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", userId);

  const { count: completedBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", userId)
    .eq("status", "completed");

  // Fetch total spending
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("customer_id", userId)
    .eq("status", "succeeded");

  const totalSpent = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  // Fetch saved addresses count
  const { count: addressCount } = await supabase
    .from("customer_addresses")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", userId)
    .eq("is_deleted", false);

  // Fetch favorite professionals count
  const { count: favoritesCount } = await supabase
    .from("favorite_professionals")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", userId);

  return {
    metrics: {
      totalBookings: totalBookings || 0,
      completedBookings: completedBookings || 0,
      totalSpent,
      addressCount: addressCount || 0,
      favoritesCount: favoritesCount || 0,
    },
  };
}

// Apply rate limiting: 10 requests per minute
export const GET = withRateLimit(handleGetOverview, "admin");
