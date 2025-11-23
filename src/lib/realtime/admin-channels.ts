/**
 * Centralized Supabase Realtime Channel Configurations for Admin Dashboard
 *
 * This utility provides type-safe, reusable channel configurations for
 * PostgreSQL Change Data Capture (CDC) via Supabase Realtime.
 *
 * NO MANUAL WEBSOCKET MANAGEMENT - Uses Supabase's subscription API built
 * on PostgreSQL logical replication for optimal performance.
 */

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/**
 * Channel names for admin real-time subscriptions
 */
export const ADMIN_CHANNELS = {
  USER_SUSPENSIONS: "admin:user-suspensions",
  DISPUTES: "admin:disputes",
  PROFESSIONAL_REVIEWS: "admin:professional-reviews",
  NOTIFICATIONS: "admin:notifications",
  MODERATION_FLAGS: "admin:moderation-flags",
} as const;

/**
 * Database tables enabled for real-time in Phase 3 migrations
 */
export const REALTIME_TABLES = {
  USER_SUSPENSIONS: "user_suspensions",
  DISPUTES: "disputes",
  NOTIFICATIONS: "notifications",
  REVIEWS: "reviews",
  ADMIN_PROFESSIONAL_REVIEWS: "admin_professional_reviews",
  MODERATION_FLAGS: "moderation_flags",
} as const;

/**
 * Event types for PostgreSQL changes
 */
export type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

/**
 * Configuration for a Realtime channel subscription
 */
export type RealtimeChannelConfig = {
  channelName: string;
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
};

/**
 * Type-safe payload handlers for different table subscriptions
 */
export type UserSuspensionPayload = RealtimePostgresChangesPayload<{
  id: string;
  user_id: string;
  suspension_type: "temporary" | "permanent";
  reason: string;
  suspended_at: string;
  expires_at: string | null;
  is_active: boolean;
}>;

export type DisputePayload = RealtimePostgresChangesPayload<{
  id: string;
  booking_id: string;
  filed_by: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}>;

export type ProfessionalReviewPayload = RealtimePostgresChangesPayload<{
  id: string;
  professional_id: string;
  status: string;
  interview_scores: Record<string, number> | null;
  recommendation: "approve" | "reject" | "second_interview" | null;
  updated_at: string;
}>;

export type NotificationPayload = RealtimePostgresChangesPayload<{
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}>;

/**
 * Predefined channel configurations for common admin subscriptions
 */
export const CHANNEL_CONFIGS = {
  /**
   * Subscribe to all user suspension changes
   */
  userSuspensions: (): RealtimeChannelConfig => ({
    channelName: ADMIN_CHANNELS.USER_SUSPENSIONS,
    table: REALTIME_TABLES.USER_SUSPENSIONS,
    schema: "public",
    event: "*",
  }),

  /**
   * Subscribe to active suspensions for a specific user
   */
  userSuspensionsByUser: (userId: string): RealtimeChannelConfig => ({
    channelName: `${ADMIN_CHANNELS.USER_SUSPENSIONS}:${userId}`,
    table: REALTIME_TABLES.USER_SUSPENSIONS,
    schema: "public",
    event: "*",
    filter: `user_id=eq.${userId}`,
  }),

  /**
   * Subscribe to all dispute changes
   */
  disputes: (): RealtimeChannelConfig => ({
    channelName: ADMIN_CHANNELS.DISPUTES,
    table: REALTIME_TABLES.DISPUTES,
    schema: "public",
    event: "*",
  }),

  /**
   * Subscribe to disputes by status
   */
  disputesByStatus: (status: string): RealtimeChannelConfig => ({
    channelName: `${ADMIN_CHANNELS.DISPUTES}:${status}`,
    table: REALTIME_TABLES.DISPUTES,
    schema: "public",
    event: "*",
    filter: `status=eq.${status}`,
  }),

  /**
   * Subscribe to professional review changes
   */
  professionalReviews: (): RealtimeChannelConfig => ({
    channelName: ADMIN_CHANNELS.PROFESSIONAL_REVIEWS,
    table: REALTIME_TABLES.ADMIN_PROFESSIONAL_REVIEWS,
    schema: "public",
    event: "*",
  }),

  /**
   * Subscribe to professional reviews by status
   */
  professionalReviewsByStatus: (status: string): RealtimeChannelConfig => ({
    channelName: `${ADMIN_CHANNELS.PROFESSIONAL_REVIEWS}:${status}`,
    table: REALTIME_TABLES.ADMIN_PROFESSIONAL_REVIEWS,
    schema: "public",
    event: "*",
    filter: `status=eq.${status}`,
  }),

  /**
   * Subscribe to admin notifications
   */
  notifications: (adminUserId: string): RealtimeChannelConfig => ({
    channelName: `${ADMIN_CHANNELS.NOTIFICATIONS}:${adminUserId}`,
    table: REALTIME_TABLES.NOTIFICATIONS,
    schema: "public",
    event: "*",
    filter: `user_id=eq.${adminUserId}`,
  }),

  /**
   * Subscribe to unread notifications only
   */
  unreadNotifications: (adminUserId: string): RealtimeChannelConfig => ({
    channelName: `${ADMIN_CHANNELS.NOTIFICATIONS}:${adminUserId}:unread`,
    table: REALTIME_TABLES.NOTIFICATIONS,
    schema: "public",
    event: "*",
    filter: `user_id=eq.${adminUserId}&read=eq.false`,
  }),
} as const;

/**
 * Helper to build custom filter strings for Realtime subscriptions
 *
 * @example
 * ```ts
 * buildFilter({ status: 'pending', priority: 'high' })
 * // Returns: "status=eq.pending&priority=eq.high"
 * ```
 */
export function buildFilter(conditions: Record<string, string | number | boolean>): string {
  return Object.entries(conditions)
    .map(([key, value]) => `${key}=eq.${value}`)
    .join("&");
}

/**
 * Helper to determine if a payload is an INSERT event
 */
export function isInsertEvent<T>(
  payload: RealtimePostgresChangesPayload<T>
): payload is RealtimePostgresChangesPayload<T> & { eventType: "INSERT" } {
  return payload.eventType === "INSERT";
}

/**
 * Helper to determine if a payload is an UPDATE event
 */
export function isUpdateEvent<T>(
  payload: RealtimePostgresChangesPayload<T>
): payload is RealtimePostgresChangesPayload<T> & { eventType: "UPDATE" } {
  return payload.eventType === "UPDATE";
}

/**
 * Helper to determine if a payload is a DELETE event
 */
export function isDeleteEvent<T>(
  payload: RealtimePostgresChangesPayload<T>
): payload is RealtimePostgresChangesPayload<T> & { eventType: "DELETE" } {
  return payload.eventType === "DELETE";
}
