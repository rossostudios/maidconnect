"use client";

/**
 * useRealtimeNotifications Hook
 *
 * Subscribes to real-time notifications for admin users via Supabase Realtime.
 * Uses PostgreSQL CDC (Change Data Capture) - NOT manual WebSocket management.
 *
 * Features:
 * - Live notification count for notification bell
 * - Optional filtering for unread notifications only
 * - Optimistic UI when marking notifications as read
 * - Automatic reconnection handling
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import {
  CHANNEL_CONFIGS,
  isDeleteEvent,
  isInsertEvent,
  isUpdateEvent,
  type NotificationPayload,
} from "@/lib/realtime/admin-channels";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  read_at: string | null;
}

interface UseRealtimeNotificationsOptions {
  adminUserId: string;
  initialNotifications?: Notification[];
  unreadOnly?: boolean;
  enabled?: boolean;
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  error: Error | null;
  markAsReadOptimistic: (id: string) => void;
  markAllAsReadOptimistic: () => void;
}

/**
 * Hook to subscribe to real-time notifications for admin users
 *
 * @example
 * ```tsx
 * const { notifications, unreadCount, markAsReadOptimistic } = useRealtimeNotifications({
 *   adminUserId: 'admin-123',
 *   initialNotifications: serverData,
 *   unreadOnly: true,
 *   enabled: true
 * });
 *
 * // Optimistic UI update when marking notification as read
 * markAsReadOptimistic('notification-456');
 * await markNotificationAsReadAction('notification-456');
 * ```
 */
export function useRealtimeNotifications({
  adminUserId,
  initialNotifications = [],
  unreadOnly = false,
  enabled = true,
}: UseRealtimeNotificationsOptions): UseRealtimeNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Optimistic UI: Mark a notification as read immediately
  const markAsReadOptimistic = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true, read_at: new Date().toISOString() }
          : notification
      )
    );
  }, []);

  // Optimistic UI: Mark all notifications as read immediately
  const markAllAsReadOptimistic = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
        read_at: notification.read_at || now,
      }))
    );
  }, []);

  useEffect(() => {
    if (!(enabled && adminUserId)) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      try {
        const config = unreadOnly
          ? CHANNEL_CONFIGS.unreadNotifications(adminUserId)
          : CHANNEL_CONFIGS.notifications(adminUserId);

        channel = supabase
          .channel(config.channelName)
          .on(
            "postgres_changes",
            {
              event: config.event,
              schema: config.schema || "public",
              table: config.table,
              filter: config.filter,
            },
            (payload: NotificationPayload) => {
              handleRealtimeUpdate(payload);
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setIsConnected(true);
              setError(null);
            } else if (status === "CHANNEL_ERROR") {
              setIsConnected(false);
              setError(new Error("Failed to subscribe to real-time notifications"));
            } else if (status === "TIMED_OUT") {
              setIsConnected(false);
              setError(new Error("Notification subscription timed out"));
            }
          });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setIsConnected(false);
      }
    };

    const handleRealtimeUpdate = (payload: NotificationPayload) => {
      if (isInsertEvent(payload)) {
        // New notification created
        const newNotification = payload.new as Notification;
        setNotifications((prev) => {
          // Avoid duplicates
          if (prev.some((n) => n.id === newNotification.id)) {
            return prev;
          }
          return [newNotification, ...prev];
        });
      } else if (isUpdateEvent(payload)) {
        // Notification updated (marked as read)
        const updatedNotification = payload.new as Notification;

        // If filtering for unread only, remove read notifications
        if (unreadOnly && updatedNotification.read) {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== updatedNotification.id)
          );
        } else {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === updatedNotification.id ? updatedNotification : notification
            )
          );
        }
      } else if (isDeleteEvent(payload)) {
        // Notification deleted
        const deletedNotification = payload.old as Notification;
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== deletedNotification.id)
        );
      }
    };

    setupSubscription();

    // Cleanup function - unsubscribe when component unmounts
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setIsConnected(false);
      }
    };
  }, [adminUserId, unreadOnly, enabled]);

  // Sync initial notifications when they change
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    error,
    markAsReadOptimistic,
    markAllAsReadOptimistic,
  };
}
