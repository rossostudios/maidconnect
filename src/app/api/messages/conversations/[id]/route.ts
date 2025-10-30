import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Get all messages in a conversation
 * GET /api/messages/conversations/[id]
 */
export async function GET(request: Request, context: RouteContext) {
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
      console.error("Failed to fetch messages:", messagesError);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

/**
 * Send a message in a conversation
 * POST /api/messages/conversations/[id]
 *
 * Body: { message: string, attachments?: string[] }
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
    const body = await request.json();
    const { message, attachments } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

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

    // Determine who is receiving the message
    const isCustomer = user.id === conversation.customer_id;
    const recipientField = isCustomer ? "professional_unread_count" : "customer_unread_count";

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message: message.trim(),
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
      console.error("Failed to create message:", messageError);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Update conversation with last message timestamp and increment unread count
    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        [recipientField]: supabase.rpc("increment", { row_id: conversationId }),
      })
      .eq("id", conversationId);

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Send message API error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
