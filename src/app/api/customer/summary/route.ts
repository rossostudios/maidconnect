import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET() {
  try {
    const user = await requireUser({ allowedRoles: ["customer"] });
    const supabase = await createSupabaseServerClient();

    // Fetch customer's bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        scheduled_start,
        duration_minutes,
        service_name,
        amount_authorized,
        amount_captured,
        currency,
        created_at,
        completed_at,
        professional:professionals!inner(
          full_name,
          profile_id
        )
      `
      )
      .eq("customer_id", user.id)
      .order("scheduled_start", { ascending: false })
      .limit(10);

    // Fetch customer's favorites
    const { data: favorites } = await supabase
      .from("customer_favorites")
      .select("professional_id")
      .eq("customer_id", user.id);

    // Separate upcoming and recent bookings
    const now = new Date();
    const upcomingBookings =
      bookings?.filter((b) => {
        if (!b.scheduled_start) {
          return false;
        }
        return (
          new Date(b.scheduled_start) > now &&
          !["declined", "canceled", "completed"].includes(b.status)
        );
      }) || [];

    const recentBookings =
      bookings?.filter((b) => {
        if (!b.scheduled_start) {
          return true;
        }
        return (
          new Date(b.scheduled_start) <= now ||
          ["declined", "canceled", "completed"].includes(b.status)
        );
      }) || [];

    // Calculate quick stats
    const totalBookings = bookings?.length || 0;
    const completedBookings = bookings?.filter((b) => b.status === "completed").length || 0;
    const totalSpent =
      bookings
        ?.filter((b) => b.amount_captured)
        .reduce((sum, b) => sum + (b.amount_captured || 0), 0) || 0;

    return NextResponse.json({
      upcomingBookings: upcomingBookings.slice(0, 3),
      recentBookings: recentBookings.slice(0, 5),
      favoriteIds: favorites?.map((f) => f.professional_id) || [],
      quickStats: {
        totalBookings,
        completedBookings,
        totalSpent,
        favoritesCount: favorites?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching customer summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
