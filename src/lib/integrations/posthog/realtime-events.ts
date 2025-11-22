/**
 * PostHog Realtime Events
 *
 * Analytics tracking for Supabase Realtime connection monitoring.
 * Tracks connection health, subscription lifecycle, and performance metrics.
 *
 * Week 2: Realtime Optimization - Task 5 (PostHog Events)
 *
 * @example
 * ```typescript
 * import { realtimeEvents } from '@/lib/integrations/posthog/realtime-events';
 *
 * // Track connection state change
 * realtimeEvents.connectionStateChanged({
 *   state: 'connected',
 *   subscriptionCount: 3,
 *   reconnectAttempts: 0,
 * });
 * ```
 */

import { trackError, trackEvent } from "./utils";

/**
 * Connection state type
 */
type ConnectionState = "connected" | "connecting" | "reconnecting" | "error" | "disconnected";

/**
 * Realtime analytics events
 */
export const realtimeEvents = {
  /**
   * Track connection state changes
   */
  connectionStateChanged: (data: {
    state: ConnectionState;
    previousState?: ConnectionState;
    subscriptionCount: number;
    reconnectAttempts: number;
    latency?: number | null;
    errorCount?: number;
  }) => {
    trackEvent("realtime_connection_state_changed", {
      state: data.state,
      previous_state: data.previousState,
      subscription_count: data.subscriptionCount,
      reconnect_attempts: data.reconnectAttempts,
      latency_ms: data.latency,
      error_count: data.errorCount || 0,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track successful connection
   */
  connectionEstablished: (data: {
    subscriptionCount: number;
    reconnectAttempts: number;
    connectionTime?: number;
  }) => {
    trackEvent("realtime_connection_established", {
      subscription_count: data.subscriptionCount,
      reconnect_attempts: data.reconnectAttempts,
      connection_time_ms: data.connectionTime,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track connection failure
   */
  connectionFailed: (data: {
    error: string;
    reconnectAttempts: number;
    subscriptionCount: number;
  }) => {
    trackEvent("realtime_connection_failed", {
      error: data.error,
      reconnect_attempts: data.reconnectAttempts,
      subscription_count: data.subscriptionCount,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track reconnection attempt
   */
  reconnectionAttempted: (data: {
    attemptNumber: number;
    subscriptionCount: number;
    timeSinceDisconnect?: number;
  }) => {
    trackEvent("realtime_reconnection_attempted", {
      attempt_number: data.attemptNumber,
      subscription_count: data.subscriptionCount,
      time_since_disconnect_ms: data.timeSinceDisconnect,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track successful reconnection
   */
  reconnectionSucceeded: (data: {
    attemptNumber: number;
    subscriptionCount: number;
    totalDowntime: number;
  }) => {
    trackEvent("realtime_reconnection_succeeded", {
      attempt_number: data.attemptNumber,
      subscription_count: data.subscriptionCount,
      total_downtime_ms: data.totalDowntime,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track subscription lifecycle
   */
  subscriptionCreated: (data: {
    channelName: string;
    listenerCount: number;
    totalSubscriptions: number;
    isMultiplexed?: boolean;
  }) => {
    trackEvent("realtime_subscription_created", {
      channel_name: data.channelName,
      listener_count: data.listenerCount,
      total_subscriptions: data.totalSubscriptions,
      is_multiplexed: data.isMultiplexed,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track subscription cleanup
   */
  subscriptionRemoved: (data: {
    channelName: string;
    totalSubscriptions: number;
    wasMultiplexed?: boolean;
  }) => {
    trackEvent("realtime_subscription_removed", {
      channel_name: data.channelName,
      total_subscriptions: data.totalSubscriptions,
      was_multiplexed: data.wasMultiplexed,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track data received events
   */
  dataReceived: (data: {
    channelName: string;
    eventType: "INSERT" | "UPDATE" | "DELETE";
    table: string;
    isMultiplexed?: boolean;
  }) => {
    trackEvent("realtime_data_received", {
      channel_name: data.channelName,
      event_type: data.eventType,
      table: data.table,
      is_multiplexed: data.isMultiplexed,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track connection errors
   */
  connectionError: (
    error: Error,
    context?: {
      state?: ConnectionState;
      reconnectAttempts?: number;
      subscriptionCount?: number;
    }
  ) => {
    trackError(error, {
      error_type: "realtime_connection_error",
      state: context?.state,
      reconnect_attempts: context?.reconnectAttempts,
      subscription_count: context?.subscriptionCount,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track subscription errors
   */
  subscriptionError: (
    error: Error,
    context?: {
      channelName?: string;
      table?: string;
    }
  ) => {
    trackError(error, {
      error_type: "realtime_subscription_error",
      channel_name: context?.channelName,
      table: context?.table,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track performance metrics
   */
  performanceMetrics: (data: {
    latency: number;
    subscriptionCount: number;
    channelCount: number;
    uptime: number;
  }) => {
    trackEvent("realtime_performance_metrics", {
      latency_ms: data.latency,
      subscription_count: data.subscriptionCount,
      channel_count: data.channelCount,
      uptime_seconds: data.uptime,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track debug panel interactions
   */
  debugPanelViewed: (data: {
    state: ConnectionState;
    subscriptionCount: number;
    errorCount: number;
    healthScore: number;
  }) => {
    trackEvent("realtime_debug_panel_viewed", {
      state: data.state,
      subscription_count: data.subscriptionCount,
      error_count: data.errorCount,
      health_score: data.healthScore,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track debug panel error clearing
   */
  debugPanelErrorsCleared: (data: { errorCount: number }) => {
    trackEvent("realtime_debug_panel_errors_cleared", {
      error_count: data.errorCount,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track channel multiplexing optimization impact
   */
  multiplexingImpact: (data: {
    hookName: string;
    channelsBefore: number;
    channelsAfter: number;
    reduction: number;
    reductionPercentage: number;
  }) => {
    trackEvent("realtime_multiplexing_impact", {
      hook_name: data.hookName,
      channels_before: data.channelsBefore,
      channels_after: data.channelsAfter,
      reduction: data.reduction,
      reduction_percentage: data.reductionPercentage,
      timestamp: new Date().toISOString(),
    });
  },
};
