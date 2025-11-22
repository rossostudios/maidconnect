/**
 * Multiplexed Real-time Admin Statistics Hook
 *
 * Optimized version of useRealtimeDashboardStats that multiplexes 3 separate
 * realtime subscriptions into a single channel, reducing WebSocket overhead.
 *
 * **Optimization Impact:**
 * - Before: 3 separate channels (bookings, profiles-users, profiles-professionals)
 * - After: 1 multiplexed channel with 3 postgres_changes listeners
 * - Reduction: 2 fewer WebSocket channels per admin session
 *
 * Week 2: Realtime Optimization - Task 1 (Channel Multiplexing)
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { stats, isLoading } = useRealtimeAdminStats();
 *
 *   return (
 *     <div>
 *       <StatCard title="Total Bookings" value={stats.totalBookings} />
 *       <StatCard title="Active Users" value={stats.activeUsers} />
 *     </div>
 *   );
 * }
 * ```
 */

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { realtimeEvents } from "@/lib/integrations/posthog/realtime-events";
import { createSupabaseBrowserClient } from "@/lib/integrations/supabase/browserClient";
import { getConnectionManager } from "@/lib/integrations/supabase/realtime-connection-manager";

/**
 * Dashboard statistics structure
 */
export type AdminDashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  activeUsers: number;
  totalRevenue: number;
  newProfessionals: number;
  lastUpdated: string;
  sparklines: {
    bookings: { day: number; value: number }[];
    revenue: { day: number; value: number }[];
    users: { day: number; value: number }[];
    professionals: { day: number; value: number }[];
  };
};

/**
 * Booking record type
 */
type BookingRecord = {
  id: string;
  status: string;
  final_amount_captured?: number;
};

/**
 * Profile record type
 */
type ProfileRecord = {
  id: string;
  role: string;
  created_at: string;
};

/**
 * Hook options
 */
type AdminStatsOptions = {
  enabled?: boolean;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
};

/**
 * Multiplexed Real-time Admin Statistics Hook
 *
 * Subscribes to admin dashboard statistics updates using a single multiplexed
 * realtime channel instead of 3 separate channels. This reduces WebSocket
 * connection overhead and improves performance for admin sessions.
 *
 * **Channel Multiplexing Strategy:**
 * 1. Single channel: "admin-stats-{timestamp}"
 * 2. Three postgres_changes listeners on that channel:
 *    - Bookings table (all events)
 *    - Profiles table filtered by role=user (INSERT only)
 *    - Profiles table filtered by role=professional (INSERT only)
 *
 * @param options - Hook configuration
 * @returns Dashboard stats, loading state, and error
 */
export function useRealtimeAdminStats(options: AdminStatsOptions = {}) {
  const { enabled = true, dateRange } = options;
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate mock sparkline data
  const generateSparklineData = (baseValue: number, variance: number) =>
    Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      value: Math.max(0, Math.floor(baseValue + (Math.random() - 0.5) * variance)),
    }));

  // Fetch initial stats on mount
  useEffect(() => {
    if (!enabled) return;

    async function fetchInitialStats() {
      try {
        setIsLoading(true);
        const supabase = createSupabaseBrowserClient();

        // Build queries with date filtering if provided
        let bookingsQuery = supabase
          .from("bookings")
          .select("id, status", { count: "exact", head: true });

        let usersQuery = supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "user");

        let professionalsQuery = supabase
          .from("profiles")
          .select("id, created_at")
          .eq("role", "professional");

        let revenueQuery = supabase
          .from("bookings")
          .select("final_amount_captured")
          .eq("status", "completed");

        let pendingBookingsQuery = supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending");

        // Apply date filtering if a date range is selected
        if (dateRange?.from) {
          const startOfDay = new Date(dateRange.from);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(dateRange.to || dateRange.from);
          endOfDay.setHours(23, 59, 59, 999);

          const startISO = startOfDay.toISOString();
          const endISO = endOfDay.toISOString();

          bookingsQuery = bookingsQuery.gte("created_at", startISO).lte("created_at", endISO);
          usersQuery = usersQuery.gte("created_at", startISO).lte("created_at", endISO);
          professionalsQuery = professionalsQuery
            .gte("created_at", startISO)
            .lte("created_at", endISO);
          revenueQuery = revenueQuery.gte("created_at", startISO).lte("created_at", endISO);
          pendingBookingsQuery = pendingBookingsQuery
            .gte("created_at", startISO)
            .lte("created_at", endISO);
        } else {
          // Default: Last 30 days for professionals if no date selected
          professionalsQuery = professionalsQuery.gte(
            "created_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          );
        }

        // Parallel queries for better performance
        const [
          bookingsResult,
          usersResult,
          professionalsResult,
          revenueResult,
          pendingBookingsResult,
        ] = await Promise.all([
          bookingsQuery,
          usersQuery,
          professionalsQuery,
          revenueQuery,
          pendingBookingsQuery,
        ]);

        // Check for errors with detailed logging
        if (bookingsResult.error)
          throw new Error(`Failed to fetch bookings: ${bookingsResult.error.message}`);
        if (usersResult.error)
          throw new Error(`Failed to fetch users: ${usersResult.error.message}`);
        if (professionalsResult.error)
          throw new Error(`Failed to fetch professionals: ${professionalsResult.error.message}`);
        if (revenueResult.error)
          throw new Error(`Failed to fetch revenue: ${revenueResult.error.message}`);
        if (pendingBookingsResult.error)
          throw new Error(
            `Failed to fetch pending bookings: ${pendingBookingsResult.error.message}`
          );

        // Calculate total revenue
        const totalRevenue =
          revenueResult.data?.reduce((sum, b) => sum + (b.final_amount_captured || 0), 0) || 0;

        setStats({
          totalBookings: bookingsResult.count || 0,
          pendingBookings: pendingBookingsResult.count || 0,
          activeUsers: usersResult.count || 0,
          totalRevenue,
          newProfessionals: professionalsResult.data?.length || 0,
          lastUpdated: new Date().toISOString(),
          sparklines: {
            bookings: generateSparklineData(10, 5),
            revenue: generateSparklineData(500_000, 200_000),
            users: generateSparklineData(50, 10),
            professionals: generateSparklineData(5, 2),
          },
        });

        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error fetching stats";
        console.error("[Admin Stats] Failed to fetch initial stats:", {
          error: err,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
        setError(errorMessage);
        setIsLoading(false);
      }
    }

    fetchInitialStats();
  }, [enabled, dateRange]);

  // Subscribe to multiplexed realtime updates
  useEffect(() => {
    if (!(enabled && stats)) return;

    const manager = getConnectionManager();

    // Create a single multiplexed channel with 3 postgres_changes listeners
    const subscription = manager.createSubscription(`admin-stats-${Date.now()}`, (channel) => {
      // Listener 1: Bookings table (all events)
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload: RealtimePostgresChangesPayload<BookingRecord>) => {
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new;
            setStats((prev) =>
              prev
                ? {
                    ...prev,
                    totalBookings: prev.totalBookings + 1,
                    pendingBookings:
                      newRecord.status === "pending"
                        ? prev.pendingBookings + 1
                        : prev.pendingBookings,
                    lastUpdated: new Date().toISOString(),
                  }
                : prev
            );
          } else if (payload.eventType === "UPDATE") {
            const oldRecord = payload.old;
            const newRecord = payload.new;
            const oldStatus = oldRecord.status;
            const newStatus = newRecord.status;

            setStats((prev) => {
              if (!prev) return prev;

              let pendingBookings = prev.pendingBookings;

              // Handle status transitions
              if (oldStatus === "pending" && newStatus !== "pending") {
                pendingBookings = Math.max(0, pendingBookings - 1);
              } else if (oldStatus !== "pending" && newStatus === "pending") {
                pendingBookings = pendingBookings + 1;
              }

              // Handle completed bookings (add to revenue)
              let totalRevenue = prev.totalRevenue;
              if (
                oldStatus !== "completed" &&
                newStatus === "completed" &&
                newRecord.final_amount_captured
              ) {
                totalRevenue = totalRevenue + newRecord.final_amount_captured;
              }

              return {
                ...prev,
                pendingBookings,
                totalRevenue,
                lastUpdated: new Date().toISOString(),
              };
            });
          }
        }
      );

      // Listener 2: Profiles table filtered by role=user (INSERT only)
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
          filter: "role=eq.user",
        },
        (payload: RealtimePostgresChangesPayload<ProfileRecord>) => {
          const newRecord = payload.new;
          if (newRecord.role === "user") {
            setStats((prev) =>
              prev
                ? {
                    ...prev,
                    activeUsers: prev.activeUsers + 1,
                    lastUpdated: new Date().toISOString(),
                  }
                : prev
            );
          }
        }
      );

      // Listener 3: Profiles table filtered by role=professional (INSERT only)
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
          filter: "role=eq.professional",
        },
        (payload: RealtimePostgresChangesPayload<ProfileRecord>) => {
          const newRecord = payload.new;
          if (newRecord.role === "professional") {
            setStats((prev) =>
              prev
                ? {
                    ...prev,
                    newProfessionals: prev.newProfessionals + 1,
                    lastUpdated: new Date().toISOString(),
                  }
                : prev
            );
          }
        }
      );

      return channel;
    });

    console.info("[Admin Stats] Multiplexed subscription created (3 listeners on 1 channel)");

    // Track multiplexing optimization impact
    realtimeEvents.multiplexingImpact({
      hookName: "useRealtimeAdminStats",
      channelsBefore: 3,
      channelsAfter: 1,
      reduction: 2,
      reductionPercentage: 66.67,
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
      console.info("[Admin Stats] Multiplexed subscription cleaned up");
    };
  }, [enabled, stats]);

  return {
    stats,
    isLoading,
    error,
  };
}
