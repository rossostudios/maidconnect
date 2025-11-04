/**
 * REFACTORED VERSION - Mark messages as read
 * POST /api/messages/conversations/[id]/read
 *
 * BEFORE: 66 lines (1 handler)
 * AFTER: 52 lines (1 handler) (21% reduction)
 */

import { forbidden, notFound, ok, withAuth } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Mark all messages in a conversation as read for current user
 */
export const POST = withAuth(
  async ({ user, supabase }, _request: Request, context: RouteContext) => {
    const { id: conversationId } = await context.params;

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("customer_id, professional_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      throw notFound("Conversation not found");
    }

    if (user.id !== conversation.customer_id && user.id !== conversation.professional_id) {
      throw forbidden("Not authorized to access this conversation");
    }

    // Mark all unread messages from other user as read
    const { error: updateError } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (updateError) {
      throw new ValidationError("Failed to mark messages as read");
    }

    // Reset unread count for current user
    const isCustomer = user.id === conversation.customer_id;
    const unreadField = isCustomer ? "customer_unread_count" : "professional_unread_count";

    await supabase
      .from("conversations")
      .update({ [unreadField]: 0 })
      .eq("id", conversationId);

    return ok({ success: true });
  }
);
