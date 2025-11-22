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

/** Admin profile reference for suspension records */
interface AdminProfile {
  id: string;
  full_name: string | null;
}

/** Professional profile data */
interface ProfessionalProfile {
  id: string;
  bio: string | null;
  hourly_rate_cents: number;
  services: string[];
  is_verified: boolean;
  rating: number | null;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

/** Suspension history record from database */
interface SuspensionRecord {
  id: string;
  suspension_type: string;
  reason: string;
  details: string | null;
  suspended_at: string;
  expires_at: string | null;
  lifted_at: string | null;
  lift_reason: string | null;
  suspended_by_profile: AdminProfile | null;
  lifted_by_profile: AdminProfile | null;
}

type ActiveSuspension = {
  id: string;
  type: string;
  reason: string;
  suspended_at: string;
  expires_at: string | null;
  suspended_by: AdminProfile | null;
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
): Promise<ProfessionalProfile | null> {
  if (role !== "professional") {
    return null;
  }

  const { data: proProfile } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return proProfile as ProfessionalProfile | null;
}

/**
 * Fetch suspension history with admin details
 */
async function fetchSuspensionHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<SuspensionRecord[]> {
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

  return (suspensionHistory as SuspensionRecord[] | null) || [];
}

/**
 * Find active suspension from history
 */
function findActiveSuspension(suspensionHistory: SuspensionRecord[]): ActiveSuspension {
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
