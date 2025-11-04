import { supabase } from "@/lib/supabase";
import type { ProfessionalSummary } from "@/features/professionals/types";

export type DashboardStats = {
  upcomingBookingsCount: number;
  completedBookingsCount: number;
  favoritesCount: number;
};

export type UpcomingBooking = {
  id: string;
  customerId: string;
  professionalId: string;
  professionalName: string;
  professionalPhoto: string | null;
  serviceName: string;
  scheduledFor: Date;
  durationHours: number;
  totalAmount: number;
  status: string;
  address: string;
  createdAt: Date;
};

/**
 * Fetch dashboard statistics for the current user
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      upcomingBookingsCount: 0,
      completedBookingsCount: 0,
      favoritesCount: 0,
    };
  }

  const now = new Date().toISOString();

  // Get upcoming bookings count
  const { count: upcomingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", session.user.id)
    .gte("scheduled_for", now)
    .in("status", ["pending", "confirmed", "in_progress"]);

  // Get completed bookings count
  const { count: completedCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", session.user.id)
    .eq("status", "completed");

  // Get favorites count
  const { count: favoritesCount } = await supabase
    .from("customer_favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id);

  return {
    upcomingBookingsCount: upcomingCount || 0,
    completedBookingsCount: completedCount || 0,
    favoritesCount: favoritesCount || 0,
  };
}

/**
 * Fetch upcoming bookings for the current user (next 3)
 */
export async function fetchUpcomingBookings(): Promise<UpcomingBooking[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return [];
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      professional:professional_id (
        id,
        full_name,
        profile_picture_url
      )
    `)
    .eq("customer_id", session.user.id)
    .gte("scheduled_for", now)
    .in("status", ["pending", "confirmed", "in_progress"])
    .order("scheduled_for", { ascending: true })
    .limit(3);

  if (error) {
    console.error("Error fetching upcoming bookings:", error);
    return [];
  }

  return (data || []).map((booking: any) => ({
    id: booking.id,
    customerId: booking.customer_id,
    professionalId: booking.professional_id,
    professionalName: booking.professional?.full_name || "Unknown",
    professionalPhoto: booking.professional?.profile_picture_url || null,
    serviceName: booking.service_name,
    scheduledFor: new Date(booking.scheduled_for),
    durationHours: booking.duration_hours,
    totalAmount: booking.total_amount_cop,
    status: booking.status,
    address: booking.address,
    createdAt: new Date(booking.created_at),
  }));
}

/**
 * Fetch favorite professionals with their details (limit 4 for dashboard)
 */
export async function fetchFavoriteProfessionals(): Promise<ProfessionalSummary[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return [];
  }

  // Get favorite professional IDs
  const { data: favorites, error: favError } = await supabase
    .from("customer_favorites")
    .select("professional_id")
    .eq("user_id", session.user.id)
    .limit(4);

  if (favError || !favorites || favorites.length === 0) {
    return [];
  }

  const professionalIds = favorites.map((fav) => fav.professional_id);

  // Fetch professional details
  const { data: professionals, error: profError } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      profile_picture_url,
      bio,
      services,
      rating,
      review_count,
      completed_bookings,
      on_time_percentage
    `)
    .in("id", professionalIds)
    .eq("role", "professional");

  if (profError || !professionals) {
    return [];
  }

  return professionals.map((prof: any) => ({
    profileId: prof.id,
    fullName: prof.full_name || "Unknown",
    profilePictureUrl: prof.profile_picture_url,
    bio: prof.bio,
    services: prof.services || [],
    rating: prof.rating || 0,
    reviewCount: prof.review_count || 0,
    totalCompletedBookings: prof.completed_bookings || 0,
    onTimeRate: prof.on_time_percentage || 0,
  }));
}
