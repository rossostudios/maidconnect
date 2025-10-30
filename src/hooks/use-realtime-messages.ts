"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachments: string[];
  read_at: string | null;
  created_at: string;
};

type Conversation = {
  id: string;
  booking_id: string;
  customer_id: string;
  professional_id: string;
  last_message_at: string | null;
  customer_unread_count: number;
  professional_unread_count: number;
  created_at: string;
};

type UseRealtimeMessagesOptions = {
  userId: string;
  userRole: "customer" | "professional";
  selectedConversationId?: string;
  onNewMessage?: (message: Message) => void;
  onConversationUpdate?: () => void;
};

/**
 * Hook to subscribe to real-time message updates using Supabase Realtime
 * Replaces polling for instant message delivery
 */
export function useRealtimeMessages({
  userId,
  userRole,
  selectedConversationId,
  onNewMessage,
  onConversationUpdate,
}: UseRealtimeMessagesOptions) {
  const supabase = createSupabaseBrowserClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter:
            userRole === "customer" ? `customer_id=eq.${userId}` : `professional_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime] New conversation:", payload);
          onConversationUpdate?.();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter:
            userRole === "customer" ? `customer_id=eq.${userId}` : `professional_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime] Conversation updated:", payload);
          onConversationUpdate?.();
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] Conversations subscription status:", status);
      });

    channelRef.current = channel;

    return () => {
      console.log("[Realtime] Unsubscribing from conversations");
      supabase.removeChannel(channel);
    };
  }, [userId, userRole, onConversationUpdate]);

  // Subscribe to messages in the selected conversation
  useEffect(() => {
    if (!selectedConversationId) return;

    const messagesChannel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          console.log("[Realtime] New message:", payload);
          const newMessage = payload.new as Message;
          onNewMessage?.(newMessage);
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] Messages subscription status:", status);
      });

    return () => {
      console.log("[Realtime] Unsubscribing from messages");
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedConversationId, onNewMessage]);

  return {
    isConnected: channelRef.current?.state === "joined",
  };
}
