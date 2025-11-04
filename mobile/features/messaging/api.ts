import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";
import type {
  Conversation,
  ConversationRecord,
  Message,
  MessageRecord,
  SendMessageParams,
  TranslateMessageParams,
} from "./types";

/**
 * Fetch all conversations for the current user
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      booking_id,
      participant_ids,
      created_at,
      updated_at
    `
    )
    .contains("participant_ids", [userId])
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const conversations = data as ConversationRecord[];

  // For each conversation, get the last message and unread count
  const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      // Get last message
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("is_read", false)
        .neq("sender_id", userId);

      // Get other participant info
      const otherParticipantId = conv.participant_ids.find((id) => id !== userId);
      let otherParticipantName = null;

      if (otherParticipantId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", otherParticipantId)
          .single();

        otherParticipantName = profile?.full_name || null;
      }

      return {
        id: conv.id,
        bookingId: conv.booking_id,
        participantIds: conv.participant_ids,
        participantNames: [], // Not needed for mobile
        lastMessage: lastMsg?.content || null,
        lastMessageAt: lastMsg?.created_at ? new Date(lastMsg.created_at) : null,
        unreadCount: count || 0,
        otherParticipantName,
        otherParticipantId,
      } as Conversation;
    })
  );

  return enrichedConversations;
}

/**
 * Fetch messages for a specific conversation
 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      conversation_id,
      sender_id,
      content,
      translated_content,
      original_language,
      created_at,
      is_read,
      sender:profiles!messages_sender_id_fkey (
        id,
        full_name
      )
    `
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const messages = data as unknown as MessageRecord[];

  return messages.map((msg) => ({
    id: msg.id,
    conversationId: msg.conversation_id,
    senderId: msg.sender_id,
    senderName: Array.isArray(msg.sender)
      ? msg.sender[0]?.full_name || null
      : (msg.sender as any)?.full_name || null,
    content: msg.content,
    translatedContent: msg.translated_content,
    originalLanguage: msg.original_language,
    createdAt: new Date(msg.created_at),
    isRead: msg.is_read,
  }));
}

/**
 * Send a new message in a conversation
 */
export async function sendMessage({
  conversationId,
  content,
  translateTo,
}: SendMessageParams): Promise<Message> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/messages/conversations/${conversationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      content,
      translateTo,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send message");
  }

  const data = await response.json();

  return {
    id: data.id,
    conversationId: data.conversation_id,
    senderId: data.sender_id,
    senderName: null,
    content: data.content,
    translatedContent: data.translated_content,
    originalLanguage: data.original_language,
    createdAt: new Date(data.created_at),
    isRead: data.is_read,
  };
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${env.apiUrl}/api/messages/conversations/${conversationId}/read`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to mark as read");
  }
}

/**
 * Translate a message to target language
 */
export async function translateMessage({
  messageId,
  targetLanguage,
}: TranslateMessageParams): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/messages/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      messageId,
      targetLanguage,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to translate message");
  }

  const data = await response.json();
  return data.translatedContent;
}

/**
 * Get unread message count across all conversations
 */
export async function getUnreadCount(): Promise<number> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return 0;
  }

  const userId = session.user.id;

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .neq("sender_id", userId);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Create a new conversation (usually from booking or professional profile)
 */
export async function createConversation(params: {
  bookingId?: string;
  otherUserId: string;
}): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      booking_id: params.bookingId || null,
      participant_ids: [session.user.id, params.otherUserId],
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}
