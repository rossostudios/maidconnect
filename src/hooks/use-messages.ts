import { useCallback, useEffect, useState } from "react";
import type { Message } from "@/components/messaging/messaging-interface";

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async (convId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations/${convId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (_err) {
      // Silent fail - non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (convId: string) => {
    try {
      await fetch(`/api/messages/conversations/${convId}/read`, {
        method: "POST",
      });
    } catch (_err) {
      // Silent fail - non-critical
    }
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId, fetchMessages, markAsRead]);

  return {
    messages,
    setMessages,
    loading,
    refetch: fetchMessages,
  };
}
