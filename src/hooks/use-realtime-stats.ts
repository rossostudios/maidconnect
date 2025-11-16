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
export function useRealtimeDashboardStats(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial stats on mount
  useEffect(() => {
    if (!enabled) return;

    async function fetchInitialStats() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Parallel queries for better performance
        const [
          bookingsResult,
          usersResult,
          professionalsResult,
          revenueResult,
          pendingBookingsResult,
        ] = await Promise.all([
          supabase.from("bookings").select("id, status", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
          supabase
            .from("profiles")
            .select("id, created_at")
            .eq("role", "professional")
            .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from("bookings").select("amount_captured").eq("status", "completed"),
          supabase
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

        // Check for errors with detailed logging
        if (bookingsResult.error) {
          console.error("Bookings query failed:", bookingsResult.error);
          throw new Error(`Failed to fetch bookings: ${bookingsResult.error.message}`);
        }
        if (usersResult.error) {
          console.error("Users query failed:", usersResult.error);
          throw new Error(`Failed to fetch users: ${usersResult.error.message}`);
        }
        if (professionalsResult.error) {
          console.error("Professionals query failed:", professionalsResult.error);
          throw new Error(`Failed to fetch professionals: ${professionalsResult.error.message}`);
        }
        if (revenueResult.error) {
          console.error("Revenue query failed:", revenueResult.error);
          throw new Error(`Failed to fetch revenue: ${revenueResult.error.message}`);
        }
        if (pendingBookingsResult.error) {
          console.error("Pending bookings query failed:", pendingBookingsResult.error);
          throw new Error(`Failed to fetch pending bookings: ${pendingBookingsResult.error.message}`);
        }

        // Calculate total revenue
        const totalRevenue =
          revenueResult.data?.reduce((sum, b) => sum + (b.amount_captured || 0), 0) || 0;

        setStats({
          totalBookings: bookingsResult.count || 0,
          pendingBookings: pendingBookingsResult.count || 0,
          activeUsers: usersResult.count || 0,
          totalRevenue,
          newProfessionals: professionalsResult.data?.length || 0,
          lastUpdated: new Date().toISOString(),
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
  }, [enabled]);

  // Subscribe to real-time updates for bookings
  useRealtimeTable(
    "bookings",
    (payload) => {
      if (!stats) return;

      if (payload.eventType === "INSERT") {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalBookings: prev.totalBookings + 1,
                pendingBookings:
                  payload.new.status === "pending"
                    ? prev.pendingBookings + 1
                    : prev.pendingBookings,
                lastUpdated: new Date().toISOString(),
              }
            : prev
        );
      } else if (payload.eventType === "UPDATE") {
        const oldStatus = payload.old.status;
        const newStatus = payload.new.status;

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
            payload.new.amount_captured
          ) {
            totalRevenue = totalRevenue + payload.new.amount_captured;
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
      if (!stats) return;

      if (payload.eventType === "INSERT" && payload.new.role === "user") {
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
    },
    { event: "INSERT", filter: "role=eq.user", enabled }
  );

  // Subscribe to real-time updates for professionals (profiles with role='professional')
  useRealtimeTable(
    "profiles",
    (payload) => {
      if (!stats) return;

      if (payload.eventType === "INSERT" && payload.new.role === "professional") {
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
    },
    { event: "INSERT", filter: "role=eq.professional", enabled }
  );

  return {
    stats,
    isLoading,
    error,
  };
}
