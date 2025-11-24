/**
 * Admin User Activity Tab API
 * GET /api/admin/users/[id]/activity - Get activity tab data (lazy loaded)
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

// Raw booking data from Supabase query with foreign key joins
type RawProfessionalBooking = {
  id: string;
  service_type: string | null;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  final_price: number;
  customer: { id: string; full_name: string | null } | null;
  address: { street_address: string; city: string } | null;
};

type RawCustomerBooking = {
  id: string;
  service_type: string | null;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  final_price: number;
  professional: { id: string; full_name: string | null } | null;
  address: { street_address: string; city: string } | null;
};

type RawFavorite = {
  id: string;
  professional: { id: string; full_name: string | null; avatar_url: string | null } | null;
  professional_profile: { specialties: string[] | null } | null;
  created_at: string;
};

async function handleGetActivity(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Fetch professional activity
    let professionalActivity = null;
    if (isProfessional) {
      professionalActivity = await fetchProfessionalActivity(supabase, userId, limit, offset);
    }

    // Fetch customer activity
    let customerActivity = null;
    if (isCustomer) {
      customerActivity = await fetchCustomerActivity(supabase, userId, limit, offset);
    }

    return NextResponse.json({
      professional: professionalActivity,
      customer: customerActivity,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch activity data";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

async function fetchProfessionalActivity(
  supabase: SupabaseServerClient,
  userId: string,
  limit: number,
  offset: number
) {
  // Fetch bookings
  const { data: bookings, count: bookingsCount } = await supabase
    .from("bookings")
    .select(
      `
      id,
      service_type,
      status,
      scheduled_date,
      scheduled_time,
      final_price,
      customer:profiles!bookings_customer_id_fkey(id, full_name),
      address:customer_addresses(street_address, city)
    `,
      { count: "exact" }
    )
    .eq("professional_id", userId)
    .order("scheduled_date", { ascending: false })
    .range(offset, offset + limit - 1);

  // Transform bookings data
  const transformedBookings = (bookings as RawProfessionalBooking[] | null)?.map((booking) => ({
    id: booking.id,
    customer_name: booking.customer?.full_name || "Unknown",
    service: booking.service_type,
    status: booking.status,
    date: booking.scheduled_date,
    time: booking.scheduled_time,
    amount: booking.final_price,
    address: booking.address
      ? `${booking.address.street_address}, ${booking.address.city}`
      : "Address not specified",
  }));

  // Fetch portfolio items
  const { data: portfolio } = await supabase
    .from("portfolio_items")
    .select("id, image_url, title, description")
    .eq("professional_id", userId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(12);

  return {
    bookings: transformedBookings || [],
    bookingsTotal: bookingsCount || 0,
    portfolio: portfolio || [],
  };
}

async function fetchCustomerActivity(
  supabase: SupabaseServerClient,
  userId: string,
  limit: number,
  offset: number
) {
  // Fetch bookings
  const { data: bookings, count: bookingsCount } = await supabase
    .from("bookings")
    .select(
      `
      id,
      service_type,
      status,
      scheduled_date,
      scheduled_time,
      final_price,
      professional:profiles!bookings_professional_id_fkey(id, full_name),
      address:customer_addresses(street_address, city)
    `,
      { count: "exact" }
    )
    .eq("customer_id", userId)
    .order("scheduled_date", { ascending: false })
    .range(offset, offset + limit - 1);

  // Transform bookings data
  const transformedBookings = (bookings as RawCustomerBooking[] | null)?.map((booking) => ({
    id: booking.id,
    professional_name: booking.professional?.full_name || "Unknown",
    service: booking.service_type,
    status: booking.status,
    date: booking.scheduled_date,
    time: booking.scheduled_time,
    amount: booking.final_price,
    address: booking.address
      ? `${booking.address.street_address}, ${booking.address.city}`
      : "Address not specified",
  }));

  // Fetch saved addresses
  const { data: addresses } = await supabase
    .from("customer_addresses")
    .select("id, address_type, street_address, city, postal_code, is_default")
    .eq("customer_id", userId)
    .eq("is_deleted", false)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch favorite professionals
  const { data: favorites } = await supabase
    .from("favorite_professionals")
    .select(
      `
      id,
      professional:profiles!favorite_professionals_professional_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      professional_profile:professional_profiles!favorite_professionals_professional_id_fkey(
        specialties
      ),
      created_at
    `
    )
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Transform favorites data
  const transformedFavorites = (favorites as RawFavorite[] | null)?.map((fav) => ({
    id: fav.id,
    professional_id: fav.professional?.id,
    name: fav.professional?.full_name || "Unknown",
    avatar_url: fav.professional?.avatar_url,
    specialties: fav.professional_profile?.specialties || [],
    added_date: fav.created_at,
  }));

  return {
    bookings: transformedBookings || [],
    bookingsTotal: bookingsCount || 0,
    addresses: addresses || [],
    favorites: transformedFavorites || [],
  };
}

// Apply rate limiting: 10 requests per minute
export const GET = withRateLimit(handleGetActivity, "admin");
