"use client";

import { useEffect, useRef } from "react";
import { getConnectionManager } from "@/lib/integrations/supabase/realtime-connection-manager";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachments: string[];
  read_at: string | null;
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
  const manager = getConnectionManager();
  const conversationSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!userId) {
      return;
    }

    const filter =
      userRole === "customer" ? `customer_id=eq.${userId}` : `professional_id=eq.${userId}`;
    const channelId = `conversations:${userId}:${userRole}`;

    conversationSubRef.current = manager.createSubscription(channelId, (channel) =>
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversations",
            filter,
          },
          (_payload) => {
            onConversationUpdate?.();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversations",
            filter,
          },
          (_payload) => {
            onConversationUpdate?.();
          }
        )
    );

    return () => {
      conversationSubRef.current?.unsubscribe();
    };
  }, [userId, userRole, onConversationUpdate, manager]);

  // Subscribe to messages in the selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const channelId = `messages:${selectedConversationId}`;

    const subscription = manager.createSubscription(channelId, (channel) =>
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          onNewMessage?.(newMessage);
        }
      )
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversationId, onNewMessage, manager]);

  return {
    isConnected: manager.getHealth().state === "connected",
  };
}
