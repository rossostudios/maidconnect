/**
 * Realtime Connection Manager
 *
 * Manages WebSocket connections with:
 * - Automatic reconnection with exponential backoff
 * - Connection health monitoring
 * - Subscription deduplication
 * - Connection state tracking
 * - PostHog analytics integration
 *
 * Week 3: Real-time Features & Notifications - Task 5
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "./browserClient";
import { realtimeEvents } from "@/lib/integrations/posthog/realtime-events";

/**
 * Connection state
 */
export type ConnectionState =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error"
  | "reconnecting";

/**
 * Connection health metrics
 */
export type ConnectionHealth = {
  state: ConnectionState;
  lastConnected: Date | null;
  reconnectAttempts: number;
  subscriptionCount: number;
  latency: number | null;
  errors: string[];
};

/**
 * Connection event callback
 */
type ConnectionCallback = (health: ConnectionHealth) => void;

/**
 * Managed subscription
 */
type ManagedSubscription = {
  id: string;
  channel: RealtimeChannel;
  createdAt: Date;
  isActive: boolean;
};

/**
 * Realtime Connection Manager
 *
 * Singleton class that manages all WebSocket connections with automatic
 * reconnection and health monitoring.
 *
 * @example
 * ```ts
 * const manager = RealtimeConnectionManager.getInstance();
 *
 * // Listen for connection state changes
 * manager.onConnectionChange((health) => {
 *   console.log('Connection state:', health.state);
 * });
 *
 * // Create a managed subscription
 * const sub = manager.createSubscription('bookings_channel', (channel) => {
 *   channel.on('postgres_changes', { ... }, callback);
 *   return channel;
 * });
 *
 * // Check connection health
 * const health = manager.getHealth();
 * console.log('Connection healthy:', health.state === 'connected');
 * ```
 */
class RealtimeConnectionManager {
  private static instance: RealtimeConnectionManager | null = null;
  private readonly subscriptions: Map<string, ManagedSubscription> = new Map();
  private connectionState: ConnectionState = "disconnected";
  private previousConnectionState: ConnectionState | undefined = undefined;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly baseReconnectDelay = 1000; // 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastConnected: Date | null = null;
  private disconnectedAt: Date | null = null;
  private errors: string[] = [];
  private readonly callbacks: Set<ConnectionCallback> = new Set();

  private constructor() {
    this.startHealthMonitoring();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RealtimeConnectionManager {
    if (!RealtimeConnectionManager.instance) {
      RealtimeConnectionManager.instance = new RealtimeConnectionManager();
    }
    return RealtimeConnectionManager.instance;
  }

  /**
   * Register connection state change callback
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.callbacks.add(callback);
    // Immediately call with current state
    callback(this.getHealth());
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Get current connection health
   */
  getHealth(): ConnectionHealth {
    return {
      state: this.connectionState,
      lastConnected: this.lastConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptionCount: this.subscriptions.size,
      latency: null, // TODO: Implement latency measurement
      errors: [...this.errors].slice(-5), // Last 5 errors
    };
  }

  /**
   * Create a managed subscription
   *
   * Automatically handles reconnection and deduplication.
   */
  createSubscription(
    id: string,
    channelBuilder: (channel: RealtimeChannel) => RealtimeChannel
  ): { unsubscribe: () => void } {
    // Check for duplicate subscription
    if (this.subscriptions.has(id)) {
      console.warn(`Subscription "${id}" already exists. Reusing existing subscription.`);
      return {
        unsubscribe: () => this.removeSubscription(id),
      };
    }

    try {
      this.setConnectionState("connecting");

      const supabase = createSupabaseBrowserClient();
      const channel = channelBuilder(supabase.channel(id));

      // Monitor subscription status
      channel.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          const wasReconnecting = this.connectionState === "reconnecting";
          const attemptNumber = this.reconnectAttempts;

          this.setConnectionState("connected");
          this.lastConnected = new Date();

          // Track successful connection or reconnection
          if (wasReconnecting) {
            const totalDowntime = this.disconnectedAt
              ? Date.now() - this.disconnectedAt.getTime()
              : 0;

            realtimeEvents.reconnectionSucceeded({
              attemptNumber,
              subscriptionCount: this.subscriptions.size,
              totalDowntime,
            });
          } else if (attemptNumber === 0) {
            realtimeEvents.connectionEstablished({
              subscriptionCount: this.subscriptions.size,
              reconnectAttempts: attemptNumber,
            });
          }

          this.reconnectAttempts = 0;
          this.disconnectedAt = null;
          this.clearReconnectTimer();
        } else if (status === "CHANNEL_ERROR") {
          this.handleConnectionError(err?.message || "Channel subscription error");
        } else if (status === "TIMED_OUT") {
          this.handleConnectionError("Channel subscription timed out");
        } else if (status === "CLOSED") {
          this.handleDisconnection(id);
        }
      });

      // Store subscription
      this.subscriptions.set(id, {
        id,
        channel,
        createdAt: new Date(),
        isActive: true,
      });

      // Track subscription creation
      // Note: We can't easily determine listener count here, so we pass 1 as an estimate
      realtimeEvents.subscriptionCreated({
        channelName: id,
        listenerCount: 1,
        totalSubscriptions: this.subscriptions.size,
        isMultiplexed: id.includes("admin-stats") || id.includes("admin-moderation"),
      });

      this.notifyCallbacks();

      return {
        unsubscribe: () => this.removeSubscription(id),
      };
    } catch (error) {
      this.handleConnectionError(
        error instanceof Error ? error.message : "Unknown subscription error"
      );
      throw error;
    }
  }

  /**
   * Remove a subscription
   */
  private removeSubscription(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      const wasMultiplexed = id.includes("admin-stats") || id.includes("admin-moderation");

      subscription.channel.unsubscribe();
      subscription.isActive = false;
      this.subscriptions.delete(id);

      // Track subscription removal
      realtimeEvents.subscriptionRemoved({
        channelName: id,
        totalSubscriptions: this.subscriptions.size,
        wasMultiplexed,
      });

      this.notifyCallbacks();

      // If no more subscriptions, update state
      if (this.subscriptions.size === 0) {
        this.setConnectionState("disconnected");
      }
    }
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(errorMessage: string): void {
    console.error(`[RealtimeConnectionManager] Error: ${errorMessage}`);
    this.errors.push(`${new Date().toISOString()}: ${errorMessage}`);
    if (this.errors.length > 10) {
      this.errors.shift(); // Keep last 10 errors
    }

    // Track connection error
    realtimeEvents.connectionError(new Error(errorMessage), {
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      subscriptionCount: this.subscriptions.size,
    });

    // Track connection failure
    realtimeEvents.connectionFailed({
      error: errorMessage,
      reconnectAttempts: this.reconnectAttempts,
      subscriptionCount: this.subscriptions.size,
    });

    this.setConnectionState("error");
    this.scheduleReconnect();
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(subscriptionId: string): void {
    console.warn(`[RealtimeConnectionManager] Disconnected: ${subscriptionId}`);
    this.setConnectionState("disconnected");
    this.scheduleReconnect();
  }

  /**
   * Schedule automatic reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `[RealtimeConnectionManager] Max reconnect attempts (${this.maxReconnectAttempts}) reached`
      );
      this.setConnectionState("error");
      return;
    }

    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    const delay = this.baseReconnectDelay * 2 ** this.reconnectAttempts;
    this.reconnectAttempts++;

    console.log(
      `[RealtimeConnectionManager] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    // Track reconnection attempt
    const timeSinceDisconnect = this.disconnectedAt
      ? Date.now() - this.disconnectedAt.getTime()
      : undefined;

    realtimeEvents.reconnectionAttempted({
      attemptNumber: this.reconnectAttempts,
      subscriptionCount: this.subscriptions.size,
      timeSinceDisconnect,
    });

    this.setConnectionState("reconnecting");

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAllSubscriptions();
    }, delay);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Reconnect all active subscriptions
   */
  private async reconnectAllSubscriptions(): Promise<void> {
    console.log(
      `[RealtimeConnectionManager] Reconnecting ${this.subscriptions.size} subscriptions...`
    );

    for (const [id, subscription] of this.subscriptions) {
      if (subscription.isActive) {
        try {
          await subscription.channel.subscribe();
        } catch (error) {
          console.error(`[RealtimeConnectionManager] Failed to reconnect "${id}":`, error);
        }
      }
    }
  }

  /**
   * Set connection state and notify callbacks
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      const previousState = this.connectionState;
      this.previousConnectionState = previousState;
      this.connectionState = state;

      // Track disconnection timestamp
      if (state === "disconnected" || state === "error") {
        this.disconnectedAt = new Date();
      }

      // Track connection state change
      realtimeEvents.connectionStateChanged({
        state,
        previousState,
        subscriptionCount: this.subscriptions.size,
        reconnectAttempts: this.reconnectAttempts,
        errorCount: this.errors.length,
      });

      this.notifyCallbacks();
    }
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(): void {
    const health = this.getHealth();
    for (const callback of this.callbacks) {
      try {
        callback(health);
      } catch (error) {
        console.error("[RealtimeConnectionManager] Callback error:", error);
      }
    }
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      const health = this.getHealth();

      // Log health status
      console.log(
        `[RealtimeConnectionManager] Health: ${health.state}, Subscriptions: ${health.subscriptionCount}, Reconnect Attempts: ${health.reconnectAttempts}`
      );

      // If disconnected for too long, attempt reconnection
      if (
        health.state === "disconnected" &&
        health.subscriptionCount > 0 &&
        health.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.scheduleReconnect();
      }
    }, 30_000);
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Cleanup all subscriptions and stop monitoring
   */
  cleanup(): void {
    console.log(
      `[RealtimeConnectionManager] Cleaning up ${this.subscriptions.size} subscriptions...`
    );

    // Unsubscribe all
    for (const [id] of this.subscriptions) {
      this.removeSubscription(id);
    }

    // Stop monitoring
    this.stopHealthMonitoring();
    this.clearReconnectTimer();

    // Clear callbacks
    this.callbacks.clear();

    // Reset state
    this.connectionState = "disconnected";
    this.reconnectAttempts = 0;
    this.lastConnected = null;
    this.errors = [];
  }
}

/**
 * Get the global connection manager instance
 */
export function getConnectionManager(): RealtimeConnectionManager {
  return RealtimeConnectionManager.getInstance();
}
