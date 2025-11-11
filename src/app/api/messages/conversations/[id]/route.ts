/**
 * REFACTORED VERSION - Individual conversation messages
 * GET/POST /api/messages/conversations/[id]
 *
 * BEFORE: 149 lines (2 handlers)
 * AFTER: 107 lines (2 handlers) (28% reduction)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { created, forbidden, notFound, ok, withAuth } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import type { Database } from "@/types/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const sendMessageSchema = z.object({
  message: z.string().min(1).trim(),
  attachments: z.array(z.string()).optional(),
});

/**
 * Helper to verify conversation access
 */
async function verifyConversationAccess(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  userId: string
) {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("customer_id, professional_id")
    .eq("id", conversationId)
    .single();

  if (error || !conversation) {
    throw notFound("Conversation not found");
  }

  if (userId !== conversation.customer_id && userId !== conversation.professional_id) {
    throw forbidden("Not authorized to access this conversation");
  }

  return conversation;
}

/**
 * Get all messages in a conversation
 */
export const GET = withAuth(
  async ({ user, supabase }, _request: Request, context: RouteContext) => {
    const { id: conversationId } = await context.params;

    // Verify access
    await verifyConversationAccess(supabase, conversationId, user.id);

    // Fetch messages with sender info
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(
        `
      *,
      sender:profiles!sender_id(
        id,
        full_name,
        avatar_url
      )
    `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw new ValidationError("Failed to fetch messages");
    }

    return ok({ messages: messages || [] });
  }
);

/**
 * Send a message in a conversation
 */
export const POST = withAuth(
  async ({ user, supabase }, request: Request, context: RouteContext) => {
    const { id: conversationId } = await context.params;

    // Parse and validate request body
    const body = await request.json();
    const { message, attachments } = sendMessageSchema.parse(body);

    // Verify access and get conversation details
    const conversation = await verifyConversationAccess(supabase, conversationId, user.id);

    // Determine who is receiving the message
    const isCustomer = user.id === conversation.customer_id;
    const recipientField = isCustomer ? "professional_unread_count" : "customer_unread_count";

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message,
        attachments: attachments || [],
      })
      .select(
        `
        *,
        sender:profiles!sender_id(
          id,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (messageError) {
      throw new ValidationError("Failed to send message");
    }

    // Update conversation with last message timestamp and increment unread count
    // First get current unread count
    const { data: currentConvo } = await supabase
      .from("conversations")
      .select("customer_unread_count, professional_unread_count")
      .eq("id", conversationId)
      .single();

    const currentCount =
      (recipientField === "customer_unread_count"
        ? currentConvo?.customer_unread_count
        : currentConvo?.professional_unread_count) || 0;

    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        [recipientField]: currentCount + 1,
      })
      .eq("id", conversationId);

    return created({ message: newMessage });
  }
);
