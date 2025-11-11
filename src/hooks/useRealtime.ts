"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

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
  const supabase = createSupabaseBrowserClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!userId) {
      return;
    }

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
          filter:
            userRole === "customer" ? `customer_id=eq.${userId}` : `professional_id=eq.${userId}`,
        },
        (_payload) => {
          onConversationUpdate?.();
        }
      )
      .subscribe((status) => {
        // Subscribe callback required for Supabase Realtime - status changes are handled internally
        if (status === "CHANNEL_ERROR") {
          console.warn("Conversations channel error");
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole, onConversationUpdate, supabase.channel, supabase.removeChannel]);

  // Subscribe to messages in the selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

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
          const newMessage = payload.new as Message;
          onNewMessage?.(newMessage);
        }
      )
      .subscribe((status) => {
        // Subscribe callback required for Supabase Realtime - status changes are handled internally
        if (status === "CHANNEL_ERROR") {
          console.warn("Messages channel error");
        }
      });

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedConversationId, onNewMessage, supabase.channel, supabase.removeChannel]);

  return {
    isConnected: channelRef.current?.state === "joined",
  };
}
