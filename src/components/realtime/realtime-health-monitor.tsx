"use client";

/**
 * Realtime Health Monitor
 *
 * Detailed health monitoring panel for admin dashboards and debugging.
 * Shows comprehensive connection health metrics, error history, and subscription details.
 *
 * Week 1: Realtime Optimization - Task 3 (Health Monitoring)
 *
 * @example
 * ```tsx
 * // In admin dashboard
 * <RealtimeHealthMonitor />
 * ```
 */

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useRealtime } from "@/lib/integrations/supabase/RealtimeProvider";
import { cn } from "@/lib/utils/core";

/**
 * Format date relative to now (e.g., "2 minutes ago")
 */
function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/**
 * Realtime Health Monitor Component
 *
 * Displays comprehensive realtime connection health information.
 */
export function RealtimeHealthMonitor() {
  const { health } = useRealtime();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Map connection states to badge variants
  const stateBadgeVariant = {
    connected: "success" as const,
    connecting: "info" as const,
    reconnecting: "warning" as const,
    error: "danger" as const,
    disconnected: "default" as const,
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-neutral-900">Realtime Connection Health</h3>
          <Badge variant={stateBadgeVariant[health.state]}>{health.state.toUpperCase()}</Badge>
        </div>

        {/* Connection Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Connection State */}
          <div className="space-y-1">
            <div className="font-medium text-neutral-500 text-sm">Status</div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  health.state === "connected" && "bg-green-500",
                  health.state === "connecting" && "animate-pulse bg-blue-500",
                  health.state === "reconnecting" && "animate-pulse bg-orange-500",
                  health.state === "error" && "bg-red-500",
                  health.state === "disconnected" && "bg-neutral-400"
                )}
              />
              <span className="font-medium text-neutral-900 text-sm">{health.state}</span>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="space-y-1">
            <div className="font-medium text-neutral-500 text-sm">Active Subscriptions</div>
            <div className="font-semibold text-neutral-900 text-xl">{health.subscriptionCount}</div>
          </div>

          {/* Reconnect Attempts */}
          <div className="space-y-1">
            <div className="font-medium text-neutral-500 text-sm">Reconnect Attempts</div>
            <div className="font-semibold text-neutral-900 text-xl">
              {health.reconnectAttempts}
              <span className="ml-1 font-normal text-neutral-500 text-sm">/ 5</span>
            </div>
          </div>

          {/* Last Connected */}
          <div className="space-y-1">
            <div className="font-medium text-neutral-500 text-sm">Last Connected</div>
            <div className="font-medium text-neutral-900 text-sm">
              {formatRelativeTime(health.lastConnected)}
            </div>
          </div>
        </div>

        {/* Warning if approaching max reconnect attempts */}
        {health.reconnectAttempts >= 3 && health.state !== "connected" && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 text-sm">
                  Connection Issues Detected
                </h4>
                <p className="mt-1 text-orange-700 text-sm">
                  Multiple reconnection attempts failed. If this persists, check your internet
                  connection or contact support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error History */}
        {health.errors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-900 text-sm">
              Recent Errors ({health.errors.length})
            </h4>
            <div className="space-y-2">
              {health.errors.slice(-3).map((error, index) => (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3" key={index}>
                  <p className="break-all font-mono text-red-900 text-sm">{error}</p>
                </div>
              ))}
              {health.errors.length > 3 && (
                <p className="text-neutral-500 text-xs">
                  + {health.errors.length - 3} more errors (showing last 3)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success message if connected */}
        {health.state === "connected" && health.errors.length === 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="font-medium text-green-900 text-sm">Connection Healthy</p>
                <p className="text-green-700 text-sm">
                  All realtime subscriptions are active and running smoothly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
