/**
 * Admin User Details Service
 * Handles fetching comprehensive user information for admin views
 */

import type { SupabaseClient } from "@supabase/supabase-js";

type UserRole = "customer" | "professional" | "admin";

type BookingStats = {
  total: number;
  completed: number;
};

type ActiveSuspension = {
  id: string;
  type: string;
  reason: string;
  suspended_at: string;
  expires_at: string | null;
  suspended_by: any;
} | null;

/**
 * Fetch user profile from database
 */
async function fetchUserProfile(supabase: SupabaseClient, userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { success: false as const, error: "User not found" };
  }

  return { success: true as const, profile };
}

/**
 * Fetch user email from auth system
 */
async function fetchUserEmail(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  return authUser?.user?.email || null;
}

/**
 * Fetch professional profile if user is a professional
 */
async function fetchProfessionalProfile(
  supabase: SupabaseClient,
  userId: string,
  role: UserRole
): Promise<any> {
  if (role !== "professional") {
    return null;
  }

  const { data: proProfile } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return proProfile;
}

/**
 * Fetch suspension history with admin details
 */
async function fetchSuspensionHistory(supabase: SupabaseClient, userId: string) {
  const { data: suspensionHistory } = await supabase
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

  return suspensionHistory || [];
}

/**
 * Find active suspension from history
 */
function findActiveSuspension(suspensionHistory: any[]): ActiveSuspension {
  const active = suspensionHistory.find(
    (s) =>
      !s.lifted_at &&
      (s.suspension_type === "permanent" || (s.expires_at && new Date(s.expires_at) > new Date()))
  );

  if (!active) {
    return null;
  }

  return {
    id: active.id,
    type: active.suspension_type,
    reason: active.reason,
    suspended_at: active.suspended_at,
    expires_at: active.expires_at,
    suspended_by: active.suspended_by_profile,
  };
}

/**
 * Fetch booking statistics for customers
 */
async function fetchCustomerBookingStats(
  supabase: SupabaseClient,
  userId: string
): Promise<BookingStats> {
  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", userId);

  const { count: completedBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", userId)
    .eq("status", "completed");

  return {
    total: totalBookings || 0,
    completed: completedBookings || 0,
  };
}

/**
 * Fetch booking statistics for professionals
 */
async function fetchProfessionalBookingStats(
  supabase: SupabaseClient,
  userId: string
): Promise<BookingStats> {
  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", userId);

  const { count: completedBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", userId)
    .eq("status", "completed");

  return {
    total: totalBookings || 0,
    completed: completedBookings || 0,
  };
}

/**
 * Fetch booking statistics based on user role
 */
async function fetchBookingStats(
  supabase: SupabaseClient,
  userId: string,
  role: UserRole
): Promise<BookingStats | null> {
  if (role === "customer") {
    return fetchCustomerBookingStats(supabase, userId);
  }

  if (role === "professional") {
    return fetchProfessionalBookingStats(supabase, userId);
  }

  return null;
}

/**
 * Fetch dispute count for user
 */
async function fetchDisputeCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase
    .from("disputes")
    .select("id", { count: "exact", head: true })
    .eq("opened_by", userId);

  return count || 0;
}

/**
 * Complete user details orchestrator
 * Fetches all user-related data in parallel where possible
 */
export async function fetchCompleteUserDetails(supabase: SupabaseClient, userId: string) {
  // Fetch profile first (needed for role)
  const profileResult = await fetchUserProfile(supabase, userId);

  if (!profileResult.success) {
    return { success: false as const, error: profileResult.error, status: 404 };
  }

  const { profile } = profileResult;

  // Fetch all other data in parallel
  const [email, professionalProfile, suspensionHistory, bookingStats, disputeCount] =
    await Promise.all([
      fetchUserEmail(supabase, userId),
      fetchProfessionalProfile(supabase, userId, profile.role),
      fetchSuspensionHistory(supabase, userId),
      fetchBookingStats(supabase, userId, profile.role),
      fetchDisputeCount(supabase, userId),
    ]);

  // Find active suspension
  const activeSuspension = findActiveSuspension(suspensionHistory);

  return {
    success: true as const,
    data: {
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
      activeSuspension,
      suspensionHistory,
      stats: {
        bookings: bookingStats,
        disputes: disputeCount,
      },
    },
  };
}
