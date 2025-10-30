import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Mark all messages in a conversation as read for current user
 * POST /api/messages/conversations/[id]/read
 */
export async function POST(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id: conversationId } = await context.params;

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("customer_id, professional_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (user.id !== conversation.customer_id && user.id !== conversation.professional_id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Mark all unread messages from other user as read
    const { error: updateError } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (updateError) {
      console.error("Failed to mark messages as read:", updateError);
      return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 });
    }

    // Reset unread count for current user
    const isCustomer = user.id === conversation.customer_id;
    const unreadField = isCustomer ? "customer_unread_count" : "professional_unread_count";

    await supabase
      .from("conversations")
      .update({ [unreadField]: 0 })
      .eq("id", conversationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark as read API error:", error);
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 });
  }
}
