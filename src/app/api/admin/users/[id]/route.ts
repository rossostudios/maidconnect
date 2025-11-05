/**
 * Admin User Detail API
 * GET /api/admin/users/[id] - Get user details with suspension history
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin access
    const { id } = await params;
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const userId = id;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const email = authUser?.user?.email || null;

    // Get professional profile if applicable
    let professionalProfile = null;
    if (profile.role === "professional") {
      const { data: proProfile } = await supabase
        .from("professional_profiles")
        .select("*")
        .eq("id", userId)
        .single();
      professionalProfile = proProfile;
    }

    // Get suspension history
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

    // Get active suspension
    const activeSuspension = suspensionHistory?.find(
      (s) =>
        !s.lifted_at &&
        (s.suspension_type === "permanent" || (s.expires_at && new Date(s.expires_at) > new Date()))
    );

    // Get booking stats
    let bookingStats = null;
    if (profile.role === "customer") {
      const { count: totalBookings } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", userId);

      const { count: completedBookings } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", userId)
        .eq("status", "completed");

      bookingStats = {
        total: totalBookings || 0,
        completed: completedBookings || 0,
      };
    } else if (profile.role === "professional") {
      const { count: totalBookings } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", userId);

      const { count: completedBookings } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", userId)
        .eq("status", "completed");

      bookingStats = {
        total: totalBookings || 0,
        completed: completedBookings || 0,
      };
    }

    // Get dispute count
    const { count: disputeCount } = await supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("opened_by", userId);

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
