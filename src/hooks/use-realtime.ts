/**
 * React Hooks for Supabase Realtime
 *
 * Provides React hooks for subscribing to real-time database changes,
 * presence tracking, and broadcast messages with automatic cleanup.
 *
 * Week 3: Real-time Features & Notifications
 */

import { useEffect, useRef } from "react";
import {
  type RealtimeEvent,
  type RealtimeSubscription,
  subscribeToBroadcast,
  subscribeToPresence,
  subscribeToTable,
} from "@/lib/integrations/supabase/realtime";

/**
 * React hook for subscribing to real-time table changes
 *
 * Automatically subscribes on mount and unsubscribes on unmount.
 * Supports conditional subscription via the `enabled` option.
 *
 * @param table - The database table to subscribe to
 * @param callback - Function called when table changes occur
 * @param options - Subscription options
 *
 * @example
 * ```tsx
 * function BookingsList() {
 *   const [bookings, setBookings] = useState([]);
 *
 *   useRealtimeTable('bookings', (payload) => {
 *     if (payload.eventType === 'INSERT') {
 *       setBookings(prev => [payload.new, ...prev]);
 *     }
 *   }, { event: 'INSERT' });
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional subscription (only subscribe when user is admin)
 * function AdminDashboard({ isAdmin }: { isAdmin: boolean }) {
 *   useRealtimeTable('bookings', (payload) => {
 *     console.log('New booking:', payload.new);
 *   }, {
 *     event: 'INSERT',
 *     enabled: isAdmin
 *   });
 * }
 * ```
 */
export function useRealtimeTable<T>(
  table: string,
  callback: (payload: RealtimeEvent<T>) => void,
  options: {
    event?: "INSERT" | "UPDATE" | "DELETE" | "*";
    filter?: string;
    enabled?: boolean;
  } = {}
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Subscribe to table changes
    subscriptionRef.current = subscribeToTable<T>(table, callback, options);

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [table, enabled, options.event, options.filter, callback, options]);
}

/**
 * React hook for subscribing to real-time presence
 *
 * Tracks which users are currently active on the specified channel.
 * Automatically unsubscribes on unmount.
 *
 * @param channelName - Unique name for the presence channel
 * @param userId - Unique identifier for the current user
 * @param metadata - Additional user metadata to track
 * @param options - Hook options
 *
 * @example
 * ```tsx
 * function AdminHeader({ user }: { user: User }) {
 *   useRealtimePresence('online_admins', user.id, {
 *     role: user.role,
 *     page: 'dashboard'
 *   });
 *
 *   return <header>...</header>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional presence (only track when user is authenticated)
 * function App({ user }: { user: User | null }) {
 *   useRealtimePresence('online_users', user?.id || '', {
 *     name: user?.name
 *   }, {
 *     enabled: !!user
 *   });
 * }
 * ```
 */
export function useRealtimePresence(
  channelName: string,
  userId: string,
  metadata: Record<string, unknown> = {},
  options: { enabled?: boolean } = {}
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const { enabled = true } = options;

  useEffect(() => {
    if (!(enabled && userId)) {
      return;
    }

    // Subscribe to presence channel
    subscriptionRef.current = subscribeToPresence(channelName, userId, metadata);

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [channelName, userId, enabled, metadata]);
}

/**
 * React hook for subscribing to broadcast messages
 *
 * Listens for real-time broadcast messages on the specified channel.
 * Useful for receiving notifications or coordinating UI updates.
 *
 * @param channelName - Channel to subscribe to
 * @param event - Event name to listen for
 * @param callback - Function called when messages are received
 * @param options - Hook options
 *
 * @example
 * ```tsx
 * function NotificationCenter() {
 *   const [notifications, setNotifications] = useState([]);
 *
 *   useRealtimeBroadcast('admin_notifications', 'new_booking', (payload) => {
 *     setNotifications(prev => [payload, ...prev]);
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional broadcast (only listen when panel is open)
 * function NotificationPanel({ isOpen }: { isOpen: boolean }) {
 *   useRealtimeBroadcast('admin_notifications', 'alert', (payload) => {
 *     console.log('Alert:', payload);
 *   }, {
 *     enabled: isOpen
 *   });
 * }
 * ```
 */
export function useRealtimeBroadcast(
  channelName: string,
  event: string,
  callback: (payload: Record<string, unknown>) => void,
  options: { enabled?: boolean } = {}
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Subscribe to broadcast messages
    subscriptionRef.current = subscribeToBroadcast(channelName, event, callback);

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [channelName, event, enabled, callback]);
}
