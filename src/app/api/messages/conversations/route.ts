import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Get all conversations for the current user
 * GET /api/messages/conversations
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Fetch conversations where user is either customer or professional
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        booking:bookings!inner(
          id,
          service_name,
          scheduled_start,
          scheduled_end,
          status
        ),
        customer:profiles!conversations_customer_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        professional:professional_profiles!conversations_professional_id_fkey(
          profile_id,
          profile:profiles!professional_profiles_profile_id_fkey(
            full_name,
            avatar_url
          )
        )
      `
      )
      .or(`customer_id.eq.${user.id},professional_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch conversations", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversations: conversations || [] });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

/**
 * Create a new conversation for a booking
 * POST /api/messages/conversations
 *
 * Body: { bookingId: string }
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Check if conversation already exists for this booking
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("booking_id", bookingId)
      .single();

    if (existing) {
      return NextResponse.json({ conversationId: existing.id }, { status: 200 });
    }

    // Fetch booking to get customer_id and professional_id
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("customer_id, professional_id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user is part of this booking
    if (user.id !== booking.customer_id && user.id !== booking.professional_id) {
      return NextResponse.json({ error: "Not authorized for this booking" }, { status: 403 });
    }

    // Create conversation
    const { data: conversation, error: createError } = await supabase
      .from("conversations")
      .insert({
        booking_id: bookingId,
        customer_id: booking.customer_id,
        professional_id: booking.professional_id,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
    }

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
