/**
 * Real-time Dashboard Statistics Hook
 *
 * Provides real-time updates for admin dashboard metrics without page refresh.
 * Subscribes to database changes and updates stats instantly.
 *
 * Week 3: Real-time Features & Notifications
 */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/integrations/supabase/browserClient";
import { useRealtimeTable } from "./use-realtime";

/**
 * Dashboard statistics
 */
export type DashboardStats = {
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
 * Hook for real-time dashboard statistics
 *
 * Fetches initial stats on mount and subscribes to real-time updates.
 * Stats update automatically when database changes occur.
 *
 * @param options - Hook options
 * @returns Dashboard stats and loading state
 *
 * @example
 * ```tsx
 * function AnalyticsDashboard() {
 *   const { stats, isLoading } = useRealtimeDashboardStats();
 *
 *   if (isLoading) return <AnalyticsDashboardSkeleton />;
 *
 *   return (
 *     <div>
 *       <StatCard title="Total Bookings" value={stats.totalBookings} isLive />
 *       <StatCard title="Pending Bookings" value={stats.pendingBookings} isLive />
 *       <StatCard title="Active Users" value={stats.activeUsers} isLive />
 *     </div>
 *   );
 * }
 * ```
 */
export function useRealtimeDashboardStats(
  options: { enabled?: boolean; dateRange?: { from: Date | undefined; to: Date | undefined } } = {}
) {
  const { enabled = true, dateRange } = options;
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
    if (!enabled) {
      return;
    }

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

          // If 'to' is not selected, default to end of 'from' day (single day selection)
          // If 'to' is selected, use end of that day
          const endOfDay = new Date(dateRange.to || dateRange.from);
          endOfDay.setHours(23, 59, 59, 999);

          bookingsQuery = bookingsQuery
            .gte("created_at", startOfDay.toISOString())
            .lte("created_at", endOfDay.toISOString());
          usersQuery = usersQuery
            .gte("created_at", startOfDay.toISOString())
            .lte("created_at", endOfDay.toISOString());
          professionalsQuery = professionalsQuery
            .gte("created_at", startOfDay.toISOString())
            .lte("created_at", endOfDay.toISOString());
          revenueQuery = revenueQuery
            .gte("created_at", startOfDay.toISOString())
            .lte("created_at", endOfDay.toISOString());
          pendingBookingsQuery = pendingBookingsQuery
            .gte("created_at", startOfDay.toISOString())
            .lte("created_at", endOfDay.toISOString());
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
        if (bookingsResult.error) {
          throw new Error(`Failed to fetch bookings: ${bookingsResult.error.message}`);
        }
        if (usersResult.error) {
          throw new Error(`Failed to fetch users: ${usersResult.error.message}`);
        }
        if (professionalsResult.error) {
          throw new Error(`Failed to fetch professionals: ${professionalsResult.error.message}`);
        }
        if (revenueResult.error) {
          throw new Error(`Failed to fetch revenue: ${revenueResult.error.message}`);
        }
        if (pendingBookingsResult.error) {
          throw new Error(
            `Failed to fetch pending bookings: ${pendingBookingsResult.error.message}`
          );
        }

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
        console.error("Failed to fetch initial stats:", {
          error: err,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
        setError(errorMessage);
        setIsLoading(false);
      }
    }

    fetchInitialStats();
  }, [enabled, dateRange, generateSparklineData]);

  // Subscribe to real-time updates for bookings
  useRealtimeTable(
    "bookings",
    (payload) => {
      if (!stats) {
        return;
      }

      if (payload.eventType === "INSERT") {
        const newRecord = payload.new as { status: string };
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalBookings: prev.totalBookings + 1,
                pendingBookings:
                  newRecord.status === "pending" ? prev.pendingBookings + 1 : prev.pendingBookings,
                lastUpdated: new Date().toISOString(),
              }
            : prev
        );
      } else if (payload.eventType === "UPDATE") {
        const oldRecord = payload.old as { status: string };
        const newRecord = payload.new as { status: string; final_amount_captured?: number };
        const oldStatus = oldRecord.status;
        const newStatus = newRecord.status;

        setStats((prev) => {
          if (!prev) {
            return prev;
          }

          let pendingBookings = prev.pendingBookings;

          // Handle status transitions
          if (oldStatus === "pending" && newStatus !== "pending") {
            pendingBookings = Math.max(0, pendingBookings - 1);
          } else if (oldStatus !== "pending" && newStatus === "pending") {
            pendingBookings += 1;
          }

          // Handle completed bookings (add to revenue)
          let totalRevenue = prev.totalRevenue;
          if (
            oldStatus !== "completed" &&
            newStatus === "completed" &&
            newRecord.final_amount_captured
          ) {
            totalRevenue += newRecord.final_amount_captured;
          }

          return {
            ...prev,
            pendingBookings,
            totalRevenue,
            lastUpdated: new Date().toISOString(),
          };
        });
      }
    },
    { event: "*", enabled }
  );

  // Subscribe to real-time updates for users (profiles with role='user')
  useRealtimeTable(
    "profiles",
    (payload) => {
      if (!stats) {
        return;
      }

      if (payload.eventType === "INSERT") {
        const newRecord = payload.new as { role: string };
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
    },
    { event: "INSERT", filter: "role=eq.user", enabled }
  );

  // Subscribe to real-time updates for professionals (profiles with role='professional')
  useRealtimeTable(
    "profiles",
    (payload) => {
      if (!stats) {
        return;
      }

      if (payload.eventType === "INSERT") {
        const newRecord = payload.new as { role: string };
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
    },
    { event: "INSERT", filter: "role=eq.professional", enabled }
  );

  return {
    stats,
    isLoading,
    error,
  };
}
