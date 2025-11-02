import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  notifyAdminDisputeFiled,
  notifyAllAdmins,
  notifyProfessionalDisputeFiled,
} from "@/lib/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * POST /api/bookings/disputes
 * Submit a dispute for a completed booking
 * Week 3-4: Dispute window messaging feature
 */
export async function POST(request: Request) {
  try {
    const { user } = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, reason, description } = body;

    // Validate input
    if (!(bookingId && reason && description)) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, reason, description" },
        { status: 400 }
      );
    }

    if (description.trim().length < 20) {
      return NextResponse.json(
        { error: "Description must be at least 20 characters" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify booking exists, belongs to user, is completed, and within 48-hour window
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        customer_id,
        professional_id,
        completed_at,
        customer_profiles:profiles!bookings_customer_id_fkey(full_name),
        professional_profiles:profiles!bookings_professional_id_fkey(full_name)
      `)
      .eq("id", bookingId)
      .eq("customer_id", user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Can only dispute completed bookings" }, { status: 400 });
    }

    if (!booking.completed_at) {
      return NextResponse.json({ error: "Booking completion time not recorded" }, { status: 400 });
    }

    // Check 48-hour window
    const completedAt = new Date(booking.completed_at);
    const now = new Date();
    const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCompletion > 48) {
      return NextResponse.json(
        { error: "Dispute window has closed (48 hours after completion)" },
        { status: 400 }
      );
    }

    // Check if dispute already exists for this booking
    const { data: existingDispute } = await supabase
      .from("booking_disputes")
      .select("id")
      .eq("booking_id", bookingId)
      .single();

    if (existingDispute) {
      return NextResponse.json(
        { error: "A dispute has already been submitted for this booking" },
        { status: 400 }
      );
    }

    // Create dispute
    const { data: dispute, error: disputeError } = await supabase
      .from("booking_disputes")
      .insert({
        booking_id: bookingId,
        customer_id: user.id,
        professional_id: booking.professional_id,
        reason,
        description: description.trim(),
        status: "pending",
      })
      .select("id, created_at")
      .single();

    if (disputeError || !dispute) {
      console.error("Error creating dispute:", disputeError);
      return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 });
    }

    // Notify professional about the dispute
    const customerName = (booking.customer_profiles as any)?.full_name || "Customer";
    await notifyProfessionalDisputeFiled(booking.professional_id, {
      id: dispute.id,
      bookingId: booking.id,
      reason,
      customerName,
    });

    // Notify all admins about new dispute requiring review
    const professionalName = (booking.professional_profiles as any)?.full_name || "Professional";
    await notifyAllAdmins(notifyAdminDisputeFiled, {
      id: dispute.id,
      bookingId: booking.id,
      reason,
      customerName,
      professionalName,
    });

    return NextResponse.json({
      success: true,
      dispute: {
        id: dispute.id,
        created_at: dispute.created_at,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/bookings/disputes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/bookings/disputes
 * Get disputes for the current user
 */
export async function GET() {
  try {
    const { user } = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // Get disputes based on user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let query = supabase
      .from("booking_disputes")
      .select(
        `
        id,
        booking_id,
        reason,
        description,
        status,
        created_at,
        updated_at,
        booking:bookings (
          id,
          service_name,
          scheduled_start,
          completed_at
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filter based on role
    if (profile?.role === "admin") {
      // Admins see all disputes
    } else if (profile?.role === "professional") {
      query = query.eq("professional_id", user.id);
    } else {
      // Customers see their own disputes
      query = query.eq("customer_id", user.id);
    }

    const { data: disputes, error } = await query;

    if (error) {
      console.error("Error fetching disputes:", error);
      return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
    }

    return NextResponse.json({ disputes: disputes || [] });
  } catch (error) {
    console.error("Error in GET /api/bookings/disputes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
