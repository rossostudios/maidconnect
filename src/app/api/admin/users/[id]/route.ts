/**
 * Admin User Detail API
 * GET /api/admin/users/[id] - Get user details with suspension history
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type SuspensionHistoryItem = {
  id: string;
  suspension_type: string;
  reason: string | null;
  details: any;
  suspended_at: string;
  expires_at: string | null;
  lifted_at: string | null;
  lift_reason: string | null;
  suspended_by_profile: { id: string; full_name: string } | null;
  lifted_by_profile: { id: string; full_name: string } | null;
};

async function handleGetUser(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin access
    const { id } = await params;
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const userId = id;

    const profile = await fetchProfile(supabase, userId);
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = await fetchUserEmail(supabase, userId);
    const professionalProfile = await fetchProfessionalProfile(supabase, profile.role, userId);
    const suspensionHistory = await fetchSuspensionHistory(supabase, userId);
    const activeSuspension = findActiveSuspension(suspensionHistory);
    const bookingStats = await fetchBookingStats(supabase, profile.role, userId);
    const disputeCount = await fetchDisputeCount(supabase, userId);

    return NextResponse.json({
      user: {
        id: profile.id,
        email,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        postal_code: profile.postal_code,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
      professionalProfile,
      activeSuspension: activeSuspension
        ? {
            id: activeSuspension.id,
            type: activeSuspension.suspension_type,
            reason: activeSuspension.reason,
            suspended_at: activeSuspension.suspended_at,
            expires_at: activeSuspension.expires_at,
            suspended_by: activeSuspension.suspended_by_profile,
          }
        : null,
      suspensionHistory: suspensionHistory || [],
      stats: {
        bookings: bookingStats,
        disputes: disputeCount || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch user details" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

async function fetchProfile(supabase: SupabaseServerClient, userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) {
    return null;
  }
  return data;
}

async function fetchUserEmail(supabase: SupabaseServerClient, userId: string) {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  return authUser?.user?.email || null;
}

async function fetchProfessionalProfile(
  supabase: SupabaseServerClient,
  role: string,
  userId: string
) {
  if (role !== "professional") {
    return null;
  }
  const { data } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

async function fetchSuspensionHistory(
  supabase: SupabaseServerClient,
  userId: string
): Promise<SuspensionHistoryItem[]> {
  const { data } = await supabase
    .from("user_suspensions")
    .select(`
      id,
      suspension_type,
      reason,
      details,
      suspended_at,
      expires_at,
      lifted_at,
      lift_reason,
      suspended_by_profile:profiles!user_suspensions_suspended_by_fkey(id, full_name),
      lifted_by_profile:profiles!user_suspensions_lifted_by_fkey(id, full_name)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) {
    return [];
  }

  // Transform the data to extract single objects from foreign key arrays
  return data.map((item: any) => ({
    id: item.id,
    suspension_type: item.suspension_type,
    reason: item.reason,
    details: item.details,
    suspended_at: item.suspended_at,
    expires_at: item.expires_at,
    lifted_at: item.lifted_at,
    lift_reason: item.lift_reason,
    suspended_by_profile: Array.isArray(item.suspended_by_profile)
      ? item.suspended_by_profile[0] || null
      : item.suspended_by_profile,
    lifted_by_profile: Array.isArray(item.lifted_by_profile)
      ? item.lifted_by_profile[0] || null
      : item.lifted_by_profile,
  }));
}

function findActiveSuspension(
  suspensionHistory: SuspensionHistoryItem[]
): SuspensionHistoryItem | undefined {
  return suspensionHistory.find(
    (s) =>
      !s.lifted_at &&
      (s.suspension_type === "permanent" || (s.expires_at && new Date(s.expires_at) > new Date()))
  );
}

async function fetchBookingStats(
  supabase: SupabaseServerClient,
  role: string,
  userId: string
): Promise<{ total: number; completed: number } | null> {
  if (role !== "customer" && role !== "professional") {
    return null;
  }

  const idColumn = role === "customer" ? "customer_id" : "professional_id";

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq(idColumn, userId);

  const { count: completedBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq(idColumn, userId)
    .eq("status", "completed");

  return {
    total: totalBookings || 0,
    completed: completedBookings || 0,
  };
}

async function fetchDisputeCount(supabase: SupabaseServerClient, userId: string) {
  const { count } = await supabase
    .from("disputes")
    .select("id", { count: "exact", head: true })
    .eq("opened_by", userId);
  return count || 0;
}

// Apply rate limiting: 10 requests per minute
export const GET = withRateLimit(handleGetUser, "admin");
