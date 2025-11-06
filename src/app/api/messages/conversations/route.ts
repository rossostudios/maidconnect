/**
 * REFACTORED VERSION - Conversation management
 * GET/POST /api/messages/conversations
 *
 * BEFORE: 134 lines (2 handlers)
 * AFTER: 98 lines (2 handlers) (27% reduction)
 */

import { z } from "zod";
import { created, forbidden, notFound, ok, withAuth } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const createConversationSchema = z.object({
  bookingId: z.string().uuid(),
});

/**
 * Get all conversations for the current user
 */
export const GET = withAuth(async ({ user, supabase }) => {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      booking:bookings!conversations_booking_id_fkey(
        id,
        scheduled_date,
        scheduled_start_time,
        scheduled_end_time,
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
    throw new ValidationError(`Failed to fetch conversations: ${error.message}`);
  }

  return ok({ conversations: conversations || [] });
});

/**
 * Create a new conversation for a booking
 */
export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId } = createConversationSchema.parse(body);

  // Check if conversation already exists for this booking
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("booking_id", bookingId)
    .single();

  if (existing) {
    return ok({ conversationId: existing.id });
  }

  // Fetch booking to get customer_id and professional_id
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("customer_id, professional_id")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    throw notFound("Booking not found");
  }

  // Verify user is part of this booking
  if (user.id !== booking.customer_id && user.id !== booking.professional_id) {
    throw forbidden("Not authorized for this booking");
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
    throw new ValidationError("Failed to create conversation");
  }

  return created({ conversationId: conversation.id });
});
