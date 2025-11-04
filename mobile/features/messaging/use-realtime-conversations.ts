/**
 * Realtime Conversations Hook
 * Subscribes to conversation updates using Supabase Realtime
 */

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRealtimeConversations(userId: string | null) {
  const queryClient = useQueryClient();

  const handleConversationChange = useCallback(() => {
    // Invalidate conversations query to refetch with updated data
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }, [queryClient]);

  useEffect(() => {
    if (!userId) return;

    console.log("[realtime] Subscribing to conversations updates");

    // Subscribe to changes in conversations table
    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          const conversation = payload.new as any;

          // Only process if user is a participant
          if (
            conversation?.participant_ids &&
            Array.isArray(conversation.participant_ids) &&
            conversation.participant_ids.includes(userId)
          ) {
            console.log("[realtime] Conversation updated:", payload.eventType);
            handleConversationChange();
          }
        }
      )
      .subscribe((status) => {
        console.log("[realtime] Conversations subscription status:", status);
      });

    return () => {
      console.log("[realtime] Unsubscribing from conversations");
      supabase.removeChannel(channel);
    };
  }, [userId, handleConversationChange]);
}
