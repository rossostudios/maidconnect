"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type TypingUser = {
  id: string;
  name: string;
  typingAt: number;
};

type UseTypingIndicatorOptions = {
  conversationId: string | null;
  userId: string;
  userName: string;
  enabled?: boolean;
};

type UseTypingIndicatorReturn = {
  typingUsers: TypingUser[];
  setTyping: (isTyping: boolean) => void;
  isOtherUserTyping: boolean;
};

// Typing timeout in milliseconds (stop showing indicator after this time)
const TYPING_TIMEOUT = 3000;
// Debounce time for typing updates
const TYPING_DEBOUNCE = 500;

/**
 * Hook for managing typing indicators in conversations using Supabase Presence.
 *
 * Uses Presence channels to track real-time typing state across users.
 * Automatically handles debouncing, timeouts, and cleanup.
 */
export function useTypingIndicator({
  conversationId,
  userId,
  userName,
  enabled = true,
}: UseTypingIndicatorOptions): UseTypingIndicatorReturn {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingUpdateRef = useRef<number>(0);

  // Create Supabase client once
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Clean up typing users that have timed out
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => prev.filter((user) => now - user.typingAt < TYPING_TIMEOUT));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Set up Presence channel for the conversation
  useEffect(() => {
    if (!(conversationId && userId && enabled)) {
      return;
    }

    const channelName = `typing:${conversationId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];

        for (const [key, presences] of Object.entries(state)) {
          // Skip self
          if (key === userId) continue;

          // Get the most recent presence for this user
          const presence = presences[0] as
            | {
                user_id?: string;
                user_name?: string;
                typing?: boolean;
                typing_at?: number;
              }
            | undefined;

          if (presence?.typing && presence.typing_at) {
            users.push({
              id: presence.user_id || key,
              name: presence.user_name || "Someone",
              typingAt: presence.typing_at,
            });
          }
        }

        setTypingUsers(users);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (key === userId) return;

        const presence = newPresences[0] as
          | {
              user_id?: string;
              user_name?: string;
              typing?: boolean;
              typing_at?: number;
            }
          | undefined;

        if (presence?.typing && presence.typing_at) {
          setTypingUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== (presence.user_id || key));
            return [
              ...filtered,
              {
                id: presence.user_id || key,
                name: presence.user_name || "Someone",
                typingAt: presence.typing_at,
              },
            ];
          });
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key === userId) return;
        setTypingUsers((prev) => prev.filter((u) => u.id !== key));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track initial presence (not typing)
          await channel.track({
            user_id: userId,
            user_name: userName,
            typing: false,
            typing_at: null,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [conversationId, userId, userName, enabled, supabase]);

  // Function to update typing state
  const setTyping = useCallback(
    (isTyping: boolean) => {
      const channel = channelRef.current;
      if (!channel) return;

      const now = Date.now();

      // Debounce typing updates
      if (isTyping && now - lastTypingUpdateRef.current < TYPING_DEBOUNCE) {
        // If we're typing and already sent a recent update, just reset the timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          channel.track({
            user_id: userId,
            user_name: userName,
            typing: false,
            typing_at: null,
          });
        }, TYPING_TIMEOUT);
        return;
      }

      lastTypingUpdateRef.current = now;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTyping) {
        // Update presence to show typing
        channel.track({
          user_id: userId,
          user_name: userName,
          typing: true,
          typing_at: now,
        });

        // Set timeout to automatically stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          channel.track({
            user_id: userId,
            user_name: userName,
            typing: false,
            typing_at: null,
          });
        }, TYPING_TIMEOUT);
      } else {
        // Immediately stop typing
        channel.track({
          user_id: userId,
          user_name: userName,
          typing: false,
          typing_at: null,
        });
      }
    },
    [userId, userName]
  );

  const isOtherUserTyping = typingUsers.length > 0;

  return {
    typingUsers,
    setTyping,
    isOtherUserTyping,
  };
}
