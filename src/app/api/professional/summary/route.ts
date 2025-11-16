import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET() {
  try {
    const user = await requireUser({ allowedRoles: ["professional"] });
    const supabase = await createSupabaseServerClient();

    // Fetch professional profile
    const { data: professional } = await supabase
      .from("professional_profiles")
      .select("*, profile:profiles!inner(*)")
      .eq("profile_id", user.id)
      .single();

    if (!professional) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    // Fetch bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        scheduled_start,
        service_name,
        amount_authorized,
        amount_captured,
        currency,
        created_at,
        customer:profiles!customer_id(full_name)
      `
      )
      .eq("professional_id", professional.profile_id)
      .order("scheduled_start", { ascending: false })
      .limit(15);

    // Calculate stats
    const completedBookings = bookings?.filter((b) => b.status === "completed") || [];
    const totalBookings = bookings?.length || 0;
    const completedCount = completedBookings.length;

    // Calculate acceptance rate (confirmed + completed vs all)
    const acceptedBookings =
      bookings?.filter((b) => ["confirmed", "completed"].includes(b.status)) || [];
    const acceptanceRate =
      totalBookings > 0 ? Math.round((acceptedBookings.length / totalBookings) * 100) : 0;

    // Fetch onboarding tasks
    const onboardingTasks = [
      {
        id: "profile",
        title: "Complete Your Profile",
        description: "Add your bio, services, and rate expectations",
        isComplete: !!(
          professional.bio &&
          professional.primary_services &&
          professional.rate_expectations
        ),
        href: "/dashboard/pro/profile",
      },
      {
        id: "documents",
        title: "Upload Required Documents",
        description: "Upload ID, certifications, and background check consent",
        isComplete: professional.profile?.onboarding_status === "approved",
        href: "/dashboard/pro/documents",
      },
      {
        id: "availability",
        title: "Set Your Availability",
        description: "Configure your working hours and calendar",
        isComplete: false, // Would need to check availability table
        href: "/dashboard/pro/availability",
      },
      {
        id: "portfolio",
        title: "Add Portfolio Photos",
        description: "Showcase your best work to attract clients",
        isComplete: false, // Would need to check portfolio table
        href: "/dashboard/pro/portfolio",
      },
      {
        id: "stripe",
        title: "Connect Payment Account",
        description: "Set up Stripe to receive payments",
        isComplete: !!professional.stripe_connect_account_id,
        href: "/dashboard/pro/settings",
      },
    ];

    // Get upcoming bookings (next 7 days)
    const now = new Date();
    const upcomingBookings =
      bookings
        ?.filter((b) => {
          if (!b.scheduled_start) {
            return false;
          }
          return (
            new Date(b.scheduled_start) > now && ["confirmed", "authorized"].includes(b.status)
          );
        })
        .slice(0, 7) || [];

    return NextResponse.json({
      stats: {
        rating: 4.8, // Would calculate from reviews
        completedJobs: completedCount,
        acceptanceRate,
        responseTime: "< 2h", // Would calculate from message timestamps
      },
      upcomingBookings,
      recentReviews: [], // Would fetch from reviews table
      onboardingTasks,
    });
  } catch (error) {
    console.error("Error fetching professional summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
