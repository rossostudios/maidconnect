/**
 * Connection Status Indicator
 *
 * Displays real-time WebSocket connection status with:
 * - Visual status indicator (connected, connecting, disconnected, error)
 * - Connection health metrics
 * - Reconnection status
 * - Manual reconnect button
 *
 * Week 3: Real-time Features & Notifications - Task 5
 */

"use client";

import { Loading03Icon, Wifi01Icon, WifiOff02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { geistMono, geistSans } from "@/app/fonts";
import {
  type ConnectionHealth,
  type ConnectionState,
  getConnectionManager,
} from "@/lib/integrations/supabase/realtime-connection-manager";
import { cn } from "@/lib/utils";

type ConnectionStatusIndicatorProps = {
  /**
   * Show detailed health metrics
   * @default false
   */
  showDetails?: boolean;

  /**
   * Compact mode (icon only)
   * @default false
   */
  compact?: boolean;
};

/**
 * Get status color and icon
 */
function getStatusInfo(state: ConnectionState): {
  color: string;
  bgColor: string;
  icon: typeof Wifi01Icon;
  label: string;
} {
  switch (state) {
    case "connected":
      return {
        color: "text-green-600",
        bgColor: "bg-green-500",
        icon: Wifi01Icon,
        label: "Connected",
      };
    case "connecting":
      return {
        color: "text-blue-600",
        bgColor: "bg-blue-500",
        icon: Loading03Icon,
        label: "Connecting...",
      };
    case "reconnecting":
      return {
        color: "text-orange-600",
        bgColor: "bg-[#FF5200]",
        icon: Loading03Icon,
        label: "Reconnecting...",
      };
    case "disconnected":
      return {
        color: "text-neutral-500",
        bgColor: "bg-neutral-400",
        icon: WifiOff02Icon,
        label: "Disconnected",
      };
    case "error":
      return {
        color: "text-red-600",
        bgColor: "bg-red-500",
        icon: WifiOff02Icon,
        label: "Connection Error",
      };
  }
}

/**
 * Connection status indicator
 *
 * @example
 * ```tsx
 * // Compact mode (icon only) in header
 * <ConnectionStatusIndicator compact />
 *
 * // Full mode with details
 * <ConnectionStatusIndicator showDetails />
 * ```
 */
export function ConnectionStatusIndicator({
  showDetails = false,
  compact = false,
}: ConnectionStatusIndicatorProps) {
  const [health, setHealth] = useState<ConnectionHealth | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const manager = getConnectionManager();

    // Subscribe to connection changes
    const unsubscribe = manager.onConnectionChange((newHealth) => {
      setHealth(newHealth);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!health) {
    return null;
  }

  const statusInfo = getStatusInfo(health.state);

  // Compact mode - icon only
  if (compact) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          aria-label={`Connection status: ${statusInfo.label}`}
          className="group relative flex h-10 w-10 items-center justify-center border border-neutral-200 bg-white transition-all hover:border-[#FF5200] hover:bg-orange-50"
          type="button"
        >
          <HugeiconsIcon
            className={cn(
              "h-5 w-5 transition-colors",
              statusInfo.color,
              (health.state === "connecting" || health.state === "reconnecting") && "animate-spin"
            )}
            icon={statusInfo.icon}
          />

          {/* Status Indicator Dot */}
          <span
            className={cn(
              "-right-1 -top-1 absolute h-3 w-3 border-2 border-white",
              statusInfo.bgColor,
              health.state === "connected" && "animate-pulse"
            )}
          />
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-full right-0 z-50 mt-2 w-48 border border-neutral-200 bg-white p-3 shadow-lg">
            <p
              className={cn(
                "font-semibold text-xs uppercase tracking-wider",
                statusInfo.color,
                geistSans.className
              )}
            >
              {statusInfo.label}
            </p>
            {health.subscriptionCount > 0 && (
              <p
                className={cn(
                  "mt-1 text-[10px] text-neutral-600 tracking-wide",
                  geistMono.className
                )}
              >
                {health.subscriptionCount} active{" "}
                {health.subscriptionCount === 1 ? "subscription" : "subscriptions"}
              </p>
            )}
            {health.reconnectAttempts > 0 && (
              <p
                className={cn(
                  "mt-1 text-[10px] text-orange-600 tracking-wide",
                  geistMono.className
                )}
              >
                Reconnect attempt {health.reconnectAttempts}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full mode
  return (
    <div className="border border-neutral-200 bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            className={cn(
              "h-5 w-5",
              statusInfo.color,
              (health.state === "connecting" || health.state === "reconnecting") && "animate-spin"
            )}
            icon={statusInfo.icon}
          />
          <h3
            className={cn(
              "font-semibold text-xs uppercase tracking-wider",
              statusInfo.color,
              geistSans.className
            )}
          >
            {statusInfo.label}
          </h3>
        </div>

        {/* Status Indicator Dot */}
        <span
          className={cn(
            "h-3 w-3",
            statusInfo.bgColor,
            health.state === "connected" && "animate-pulse"
          )}
        />
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2 border-neutral-200 border-t pt-3">
          {/* Subscription Count */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-[10px] text-neutral-600 uppercase tracking-wide",
                geistSans.className
              )}
            >
              Active Subscriptions
            </span>
            <span className={cn("font-semibold text-neutral-900 text-sm", geistMono.className)}>
              {health.subscriptionCount}
            </span>
          </div>

          {/* Reconnect Attempts */}
          {health.reconnectAttempts > 0 && (
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-[10px] text-neutral-600 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Reconnect Attempts
              </span>
              <span className={cn("font-semibold text-orange-600 text-sm", geistMono.className)}>
                {health.reconnectAttempts}
              </span>
            </div>
          )}

          {/* Last Connected */}
          {health.lastConnected && (
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-[10px] text-neutral-600 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Last Connected
              </span>
              <span className={cn("text-[10px] text-neutral-700", geistMono.className)}>
                {new Date(health.lastConnected).toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Recent Errors */}
          {health.errors.length > 0 && (
            <div className="mt-3 space-y-1 border-neutral-200 border-t pt-3">
              <span
                className={cn(
                  "text-[10px] text-neutral-600 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Recent Errors
              </span>
              {health.errors.slice(-3).map((error, index) => (
                <p
                  className={cn("text-[10px] text-red-600 leading-relaxed", geistMono.className)}
                  key={index}
                >
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
