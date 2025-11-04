/**
 * Realtime Messages Hook
 * Subscribes to new messages using Supabase Realtime for instant updates
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Message, MessageRecord } from "./types";

export function useRealtimeMessages(conversationId: string | null, _userId: string) {
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback(
    (payload: any) => {
      const newMessage = payload.new as MessageRecord;

      // Only process if this message belongs to the current conversation
      if (!conversationId || newMessage.conversation_id !== conversationId) {
        return;
      }

      // Update messages query cache
      queryClient.setQueryData(
        ["messages", conversationId],
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) {
            return oldMessages;
          }

          // Check if message already exists (prevent duplicates)
          const exists = oldMessages.some((msg) => msg.id === newMessage.id);
          if (exists) {
            return oldMessages;
          }

          // Transform and append new message
          const transformedMessage: Message = {
            id: newMessage.id,
            conversationId: newMessage.conversation_id,
            senderId: newMessage.sender_id,
            senderName: null, // Will be populated by re-fetch or separate query
            content: newMessage.content,
            translatedContent: newMessage.translated_content,
            originalLanguage: newMessage.original_language,
            createdAt: new Date(newMessage.created_at),
            isRead: newMessage.is_read,
          };

          return [...oldMessages, transformedMessage];
        }
      );

      // Invalidate conversations list to update last message and unread count
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    [conversationId, queryClient]
  );

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    console.log(`[realtime] Subscribing to messages for conversation: ${conversationId}`);

    // Subscribe to INSERT events on the messages table
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        handleNewMessage
      )
      .subscribe((status) => {
        console.log(`[realtime] Subscription status for conversation ${conversationId}:`, status);
      });

    return () => {
      console.log(`[realtime] Unsubscribing from conversation: ${conversationId}`);
      supabase.removeChannel(channel);
    };
  }, [conversationId, handleNewMessage]);
}
