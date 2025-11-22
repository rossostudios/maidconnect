"use client";

/**
 * Connection Status Indicator
 *
 * Displays the current realtime connection health status as a visual badge.
 * Shows connection state (connected, connecting, error, etc.) and subscription count.
 *
 * Week 1: Realtime Optimization - Task 3 (Health Monitoring)
 *
 * @example
 * ```tsx
 * // In admin header or dashboard
 * <ConnectionStatusIndicator />
 * ```
 */

import { useRealtimeHealth } from "@/lib/integrations/supabase/RealtimeProvider";
import { cn } from "@/lib/utils/core";

/**
 * Connection Status Indicator Component
 *
 * Displays a badge showing the current realtime connection state.
 * Connection state tracking is handled by RealtimeConnectionManager.
 */
export function ConnectionStatusIndicator() {
  const health = useRealtimeHealth();

  // Map connection states to visual styles
  const stateStyles = {
    connected: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      dot: "bg-green-500",
      label: "Connected",
    },
    connecting: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      dot: "bg-blue-500 animate-pulse",
      label: "Connecting...",
    },
    reconnecting: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      dot: "bg-orange-500 animate-pulse",
      label: "Reconnecting...",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Connection Error",
    },
    disconnected: {
      bg: "bg-neutral-50",
      border: "border-neutral-200",
      text: "text-neutral-600",
      dot: "bg-neutral-400",
      label: "Disconnected",
    },
  };

  const style = stateStyles[health.state];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium text-sm",
        style.bg,
        style.border,
        style.text
      )}
      title={`${health.state} • ${health.subscriptionCount} active subscriptions • ${health.reconnectAttempts} reconnect attempts`}
    >
      {/* Connection status dot */}
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", style.dot)} />

      {/* Status label */}
      <span className="whitespace-nowrap">{style.label}</span>

      {/* Subscription count (only show if connected) */}
      {health.state === "connected" && health.subscriptionCount > 0 && (
        <span className="text-xs opacity-75">({health.subscriptionCount})</span>
      )}

      {/* Reconnect attempts (only show if reconnecting) */}
      {health.state === "reconnecting" && health.reconnectAttempts > 0 && (
        <span className="text-xs opacity-75">({health.reconnectAttempts}/5)</span>
      )}

      {/* Screen reader text */}
      <span className="sr-only">
        Realtime connection status: {health.state}.
        {health.subscriptionCount > 0 && ` ${health.subscriptionCount} active subscriptions.`}
        {health.reconnectAttempts > 0 && ` ${health.reconnectAttempts} reconnect attempts.`}
      </span>
    </div>
  );
}

/**
 * Compact Connection Status Dot
 *
 * Minimal version that only shows a colored dot (useful for space-constrained UIs).
 *
 * @example
 * ```tsx
 * <ConnectionStatusDot />
 * ```
 */
export function ConnectionStatusDot() {
  const health = useRealtimeHealth();

  const stateStyles = {
    connected: "bg-green-500",
    connecting: "bg-blue-500 animate-pulse",
    reconnecting: "bg-orange-500 animate-pulse",
    error: "bg-red-500",
    disconnected: "bg-neutral-400",
  };

  return (
    <span
      aria-label={`Realtime connection: ${health.state}`}
      className={cn("inline-block h-2 w-2 rounded-full", stateStyles[health.state])}
      title={`Realtime: ${health.state} (${health.subscriptionCount} subscriptions)`}
    />
  );
}
