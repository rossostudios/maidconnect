/**
 * Supabase Realtime Utilities
 *
 * Provides type-safe wrappers for Supabase Realtime functionality including:
 * - PostgreSQL Change Data Capture (CDC) subscriptions
 * - Presence channels for online user tracking
 * - Broadcast channels for real-time messaging
 *
 * Week 3: Real-time Features & Notifications
 * Week 1: Integrated with RealtimeConnectionManager for automatic reconnection
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "./browserClient";
import { getConnectionManager } from "./realtime-connection-manager";

/**
 * Realtime event payload from PostgreSQL CDC
 */
export type RealtimeEvent<T> = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
};

/**
 * Realtime subscription handle
 */
export type RealtimeSubscription = {
  channel: RealtimeChannel;
  unsubscribe: () => void;
};

/**
 * Subscribe to real-time changes on a specific database table
 *
 * @param table - The database table to subscribe to
 * @param callback - Function called when table changes occur
 * @param options - Subscription options
 * @returns Subscription handle with unsubscribe method
 *
 * @example
 * ```ts
 * // Subscribe to all booking inserts
 * const sub = subscribeToTable('bookings', (payload) => {
 *   console.log('New booking:', payload.new);
 * }, { event: 'INSERT' });
 *
 * // Cleanup
 * sub.unsubscribe();
 * ```
 *
 * @example
 * ```ts
 * // Subscribe to pending booking updates only
 * const sub = subscribeToTable('bookings', (payload) => {
 *   console.log('Booking updated:', payload.new);
 * }, {
 *   event: 'UPDATE',
 *   filter: 'status=eq.pending'
 * });
 * ```
 */
export function subscribeToTable<T>(
  table: string,
  callback: (payload: RealtimeEvent<T>) => void,
  options: {
    event?: "INSERT" | "UPDATE" | "DELETE" | "*";
    filter?: string; // e.g., "status=eq.pending"
    schema?: string;
  } = {}
): RealtimeSubscription {
  const { event = "*", filter, schema = "public" } = options;
  const manager = getConnectionManager();

  // Create unique channel ID based on table, event, and filter
  const channelId = filter ? `${table}_${event}_${filter}` : `${table}_${event}`;

  const subscription = manager.createSubscription(channelId, (channel) =>
    channel.on(
      "postgres_changes",
      {
        event,
        schema,
        table,
        filter,
      },
      (payload) => callback(payload as RealtimeEvent<T>)
    )
  );

  return {
    channel: subscription as unknown as RealtimeChannel, // For backward compatibility
    unsubscribe: subscription.unsubscribe,
  };
}

/**
 * Subscribe to multiple tables with a single channel
 *
 * More efficient than creating separate subscriptions when monitoring multiple tables.
 * All subscriptions share a single WebSocket connection.
 *
 * @param subscriptions - Array of table subscriptions
 * @returns Subscription handle with unsubscribe method
 *
 * @example
 * ```ts
 * const sub = subscribeToTables([
 *   {
 *     table: 'bookings',
 *     callback: (payload) => console.log('Booking:', payload.new),
 *     event: 'INSERT'
 *   },
 *   {
 *     table: 'disputes',
 *     callback: (payload) => console.log('Dispute:', payload.new),
 *     event: 'INSERT'
 *   }
 * ]);
 *
 * // Cleanup all subscriptions
 * sub.unsubscribe();
 * ```
 */
export function subscribeToTables(
  subscriptions: Array<{
    table: string;
    callback: (payload: RealtimeEvent<unknown>) => void;
    event?: "INSERT" | "UPDATE" | "DELETE" | "*";
    filter?: string;
  }>
): RealtimeSubscription {
  const manager = getConnectionManager();

  // Create unique channel ID based on subscribed tables
  const tables = subscriptions
    .map((s) => s.table)
    .sort()
    .join("_");
  const channelId = `multi_${tables}_${Date.now()}`;

  const subscription = manager.createSubscription(channelId, (channel) => {
    // Add all subscriptions to the same channel
    let configuredChannel = channel;
    for (const sub of subscriptions) {
      configuredChannel = configuredChannel.on(
        "postgres_changes",
        {
          event: sub.event || "*",
          schema: "public",
          table: sub.table,
          filter: sub.filter,
        },
        (payload) => sub.callback(payload as RealtimeEvent<unknown>)
      );
    }
    return configuredChannel;
  });

  return {
    channel: subscription as unknown as RealtimeChannel, // For backward compatibility
    unsubscribe: subscription.unsubscribe,
  };
}

/**
 * Subscribe to a presence channel to track online users
 *
 * Presence channels allow tracking which users are currently active/online.
 * Useful for showing online user counts, active admin sessions, etc.
 *
 * @param channelName - Unique name for the presence channel
 * @param userId - Unique identifier for the current user
 * @param metadata - Additional user metadata to track
 * @returns Subscription handle with unsubscribe method
 *
 * @example
 * ```ts
 * const sub = subscribeToPresence('online_admins', 'user_123', {
 *   role: 'admin',
 *   page: 'dashboard'
 * });
 *
 * // Cleanup
 * sub.unsubscribe();
 * ```
 */
export function subscribeToPresence(
  channelName: string,
  userId: string,
  metadata: Record<string, unknown> = {}
): RealtimeSubscription {
  const manager = getConnectionManager();

  // Store channel reference for presence tracking
  let channelRef: RealtimeChannel | null = null;

  const subscription = manager.createSubscription(`presence_${channelName}`, (channel) => {
    channelRef = channel;
    return channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        console.log("Presence sync:", state);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      });
  });

  // Track presence after subscription is established
  // The ConnectionManager's createSubscription handles the subscribe callback
  setTimeout(async () => {
    if (channelRef) {
      await channelRef.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        ...metadata,
      });
    }
  }, 100); // Small delay to ensure subscription is established

  return {
    channel: channelRef as RealtimeChannel, // For backward compatibility
    unsubscribe: subscription.unsubscribe,
  };
}

/**
 * Broadcast a message to all subscribers on a channel
 *
 * Useful for sending real-time messages between admins or triggering
 * UI updates across multiple admin sessions.
 *
 * @param channelName - Channel to broadcast to
 * @param event - Event name
 * @param payload - Message payload
 *
 * @example
 * ```ts
 * // Broadcast a notification to all admins
 * await broadcastToChannel('admin_notifications', 'new_booking', {
 *   bookingId: '123',
 *   message: 'New booking received'
 * });
 * ```
 */
export async function broadcastToChannel(
  channelName: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase.channel(channelName);

  await channel.subscribe();
  await channel.send({
    type: "broadcast",
    event,
    payload,
  });
}

/**
 * Subscribe to broadcast messages on a channel
 *
 * @param channelName - Channel to subscribe to
 * @param event - Event name to listen for
 * @param callback - Function called when messages are received
 * @returns Subscription handle with unsubscribe method
 *
 * @example
 * ```ts
 * const sub = subscribeToBroadcast('admin_notifications', 'new_booking', (payload) => {
 *   console.log('Notification:', payload);
 * });
 *
 * // Cleanup
 * sub.unsubscribe();
 * ```
 */
export function subscribeToBroadcast(
  channelName: string,
  event: string,
  callback: (payload: Record<string, unknown>) => void
): RealtimeSubscription {
  const manager = getConnectionManager();

  const channelId = `broadcast_${channelName}_${event}`;

  const subscription = manager.createSubscription(channelId, (channel) =>
    channel.on("broadcast", { event }, ({ payload }) => {
      callback(payload as Record<string, unknown>);
    })
  );

  return {
    channel: subscription as unknown as RealtimeChannel, // For backward compatibility
    unsubscribe: subscription.unsubscribe,
  };
}
