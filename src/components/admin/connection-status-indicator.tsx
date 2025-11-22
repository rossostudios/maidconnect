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
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
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
const statusInfoMap: Record<
  ConnectionState,
  {
    color: string;
    bgColor: string;
    icon: typeof Wifi01Icon;
    label: string;
  }
> = {
  connected: {
    color: "text-green-600",
    bgColor: "bg-green-500",
    icon: Wifi01Icon,
    label: "Connected",
  },
  connecting: {
    color: "text-blue-600",
    bgColor: "bg-blue-500",
    icon: Loading03Icon,
    label: "Connecting...",
  },
  reconnecting: {
    color: "text-orange-600",
    bgColor: "bg-orange-500",
    icon: Loading03Icon,
    label: "Reconnecting...",
  },
  disconnected: {
    color: "text-neutral-500",
    bgColor: "bg-neutral-400",
    icon: WifiOff02Icon,
    label: "Disconnected",
  },
  error: {
    color: "text-red-600",
    bgColor: "bg-red-500",
    icon: WifiOff02Icon,
    label: "Connection Error",
  },
};

function getStatusInfo(state: ConnectionState) {
  return statusInfoMap[state] ?? statusInfoMap.disconnected;
}

type ConnectionStatusCompactProps = {
  health: ConnectionHealth;
  statusInfo: ReturnType<typeof getStatusInfo>;
  showTooltip: boolean;
  setShowTooltip: Dispatch<SetStateAction<boolean>>;
};

function ConnectionStatusCompact({
  health,
  statusInfo,
  showTooltip,
  setShowTooltip,
}: ConnectionStatusCompactProps) {
  return (
    <div className="relative">
      <button
        aria-label={`Connection status: ${statusInfo.label}`}
        className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white transition-all hover:border-orange-500 hover:bg-orange-50"
        onBlur={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        type="button"
      >
        {health.state === "connecting" || health.state === "reconnecting" ? (
          <HugeiconsIcon className="h-5 w-5 animate-spin" icon={Loading03Icon} />
        ) : (
          <HugeiconsIcon
            className={cn("h-5 w-5 transition-colors", statusInfo.color)}
            icon={statusInfo.icon}
          />
        )}

        {/* Status Indicator Dot */}
        <span
          className={cn(
            "-right-1 -top-1 absolute h-3 w-3 rounded-full border-2 border-white",
            statusInfo.bgColor,
            health.state === "connected" && "animate-pulse"
          )}
        />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
          <p
            className={cn(
              "font-medium text-xs tracking-wider",
              statusInfo.color,
              geistSans.className
            )}
          >
            {statusInfo.label}
          </p>
          {health.subscriptionCount > 0 && (
            <p className={cn("mt-1 text-neutral-600 text-xs tracking-wide", geistSans.className)}>
              {health.subscriptionCount} active{" "}
              {health.subscriptionCount === 1 ? "subscription" : "subscriptions"}
            </p>
          )}
          {health.reconnectAttempts > 0 && (
            <p className={cn("mt-1 text-orange-600 text-xs tracking-wide", geistSans.className)}>
              Reconnect attempt {health.reconnectAttempts}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type ConnectionStatusDetailProps = {
  health: ConnectionHealth;
  statusInfo: ReturnType<typeof getStatusInfo>;
  showDetails: boolean;
};

function ConnectionStatusDetail({ health, statusInfo, showDetails }: ConnectionStatusDetailProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {health.state === "connecting" || health.state === "reconnecting" ? (
            <HugeiconsIcon className="h-5 w-5 animate-spin" icon={Loading03Icon} />
          ) : (
            <HugeiconsIcon className={cn("h-5 w-5", statusInfo.color)} icon={statusInfo.icon} />
          )}
          <h3
            className={cn(
              "font-medium text-xs tracking-wider",
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
            "h-3 w-3 rounded-full",
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
            <span className={cn("text-neutral-600 text-xs tracking-wide", geistSans.className)}>
              Active Subscriptions
            </span>
            <span className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
              {health.subscriptionCount}
            </span>
          </div>

          {/* Reconnect Attempts */}
          {health.reconnectAttempts > 0 && (
            <div className="flex items-center justify-between">
              <span className={cn("text-neutral-600 text-xs tracking-wide", geistSans.className)}>
                Reconnect Attempts
              </span>
              <span className={cn("font-medium text-orange-600 text-sm", geistSans.className)}>
                {health.reconnectAttempts}
              </span>
            </div>
          )}

          {/* Last Connected */}
          {health.lastConnected && (
            <div className="flex items-center justify-between">
              <span className={cn("text-neutral-600 text-xs tracking-wide", geistSans.className)}>
                Last Connected
              </span>
              <span className={cn("text-neutral-700 text-xs", geistSans.className)}>
                {new Date(health.lastConnected).toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Recent Errors */}
          {health.errors.length > 0 && (
            <div className="mt-3 space-y-1 border-neutral-200 border-t pt-3">
              <span className={cn("text-neutral-600 text-xs tracking-wide", geistSans.className)}>
                Recent Errors
              </span>
              {health.errors.slice(-3).map((error, index) => (
                <p
                  className={cn("text-red-600 text-xs leading-relaxed", geistSans.className)}
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

  if (compact) {
    return (
      <ConnectionStatusCompact
        health={health}
        setShowTooltip={setShowTooltip}
        showTooltip={showTooltip}
        statusInfo={statusInfo}
      />
    );
  }

  return (
    <ConnectionStatusDetail health={health} showDetails={showDetails} statusInfo={statusInfo} />
  );
}
