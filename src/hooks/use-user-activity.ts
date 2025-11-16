/**
 * User Activity Hook
 *
 * Tracks real-time user activity including:
 * - Online admin users (presence tracking)
 * - Active customer sessions
 * - Recent booking activity
 * - System activity metrics
 *
 * Week 3: Real-time Features & Notifications
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeEvent, RealtimeSubscription } from "@/lib/integrations/supabase/realtime";
import { subscribeToPresence, subscribeToTables } from "@/lib/integrations/supabase/realtime";

/**
 * Online user presence data
 */
type PresenceUser = {
  user_id: string;
  online_at: string;
  role?: string;
  page?: string;
  [key: string]: unknown;
};

/**
 * Recent activity event
 */
type ActivityEvent = {
  id: string;
  type: "booking" | "user" | "professional" | "dispute";
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
};

/**
 * User activity statistics
 */
type UserActivityStats = {
  onlineAdmins: number;
  activeCustomers: number;
  activeProfessionals: number;
  recentBookings: number;
  recentActivity: ActivityEvent[];
  lastUpdated: string;
};

type UseUserActivityOptions = {
  enabled?: boolean;
  currentUserId?: string;
  maxActivityHistory?: number;
};

/**
 * Hook for tracking real-time user activity
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { stats, onlineUsers } = useUserActivity({
 *     currentUserId: user.id,
 *     enabled: true
 *   });
 *
 *   return (
 *     <div>
 *       <p>Online Admins: {stats.onlineAdmins}</p>
 *       <p>Active Customers: {stats.activeCustomers}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserActivity(options: UseUserActivityOptions = {}) {
  const { enabled = true, currentUserId, maxActivityHistory = 20 } = options;

  const [stats, setStats] = useState<UserActivityStats>({
    onlineAdmins: 0,
    activeCustomers: 0,
    activeProfessionals: 0,
    recentBookings: 0,
    recentActivity: [],
    lastUpdated: new Date().toISOString(),
  });

  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const presenceRef = useRef<RealtimeSubscription | null>(null);
  const activityRef = useRef<RealtimeSubscription | null>(null);

  /**
   * Format booking event as activity
   */
  const formatBookingActivity = useCallback(
    (payload: RealtimeEvent<unknown>): ActivityEvent | null => {
      const booking = payload.new as Record<string, unknown>;

      if (payload.eventType === "INSERT") {
        return {
          id: `booking_${booking.id}`,
          type: "booking",
          description: `New booking created for ${booking.service_name || "service"}`,
          timestamp: booking.created_at as string,
          metadata: {
            bookingId: booking.id,
            status: booking.status,
            totalPrice: booking.total_price_cop,
          },
        };
      }

      if (payload.eventType === "UPDATE" && booking.status === "confirmed") {
        return {
          id: `booking_confirmed_${booking.id}`,
          type: "booking",
          description: `Booking confirmed - ${booking.service_name || "service"}`,
          timestamp: booking.updated_at as string,
          metadata: {
            bookingId: booking.id,
            status: booking.status,
          },
        };
      }

      return null;
    },
    []
  );

  /**
   * Format user event as activity
   */
  const formatUserActivity = useCallback(
    (payload: RealtimeEvent<unknown>): ActivityEvent | null => {
      const profile = payload.new as Record<string, unknown>;

      if (payload.eventType === "INSERT") {
        return {
          id: `user_${profile.id}`,
          type: "user",
          description: `New user registered - ${profile.full_name || "User"}`,
          timestamp: profile.created_at as string,
          userId: profile.id as string,
          userName: profile.full_name as string,
          metadata: {
            role: profile.role,
            email: profile.email,
          },
        };
      }

      return null;
    },
    []
  );

  /**
   * Format professional event as activity
   */
  const formatProfessionalActivity = useCallback(
    (payload: RealtimeEvent<unknown>): ActivityEvent | null => {
      const profile = payload.new as Record<string, unknown>;

      if (payload.eventType === "INSERT" && profile.role === "professional") {
        return {
          id: `professional_${profile.id}`,
          type: "professional",
          description: `New professional application - ${profile.full_name || "Professional"}`,
          timestamp: profile.created_at as string,
          userId: profile.id as string,
          userName: profile.full_name as string,
          metadata: {
            status: profile.professional_status,
            onboardingStatus: profile.onboarding_status,
          },
        };
      }

      if (payload.eventType === "UPDATE" && profile.professional_status === "active") {
        return {
          id: `professional_approved_${profile.id}`,
          type: "professional",
          description: `Professional approved - ${profile.full_name || "Professional"}`,
          timestamp: profile.updated_at as string,
          userId: profile.id as string,
          userName: profile.full_name as string,
        };
      }

      return null;
    },
    []
  );

  /**
   * Format dispute event as activity
   */
  const formatDisputeActivity = useCallback(
    (payload: RealtimeEvent<unknown>): ActivityEvent | null => {
      const dispute = payload.new as Record<string, unknown>;

      if (payload.eventType === "INSERT") {
        return {
          id: `dispute_${dispute.id}`,
          type: "dispute",
          description: `New dispute created - ${dispute.reason || "Reason not specified"}`,
          timestamp: dispute.created_at as string,
          metadata: {
            disputeId: dispute.id,
            bookingId: dispute.booking_id,
            status: dispute.status,
          },
        };
      }

      return null;
    },
    []
  );

  /**
   * Add activity event to history
   */
  const addActivity = useCallback(
    (event: ActivityEvent | null) => {
      if (!event) return;

      setStats((prev) => {
        const updated = [event, ...prev.recentActivity];
        return {
          ...prev,
          recentActivity: updated.slice(0, maxActivityHistory),
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [maxActivityHistory]
  );

  /**
   * Subscribe to presence channel for online users
   */
  useEffect(() => {
    if (!(enabled && currentUserId)) return;

    presenceRef.current = subscribeToPresence("online_admins", currentUserId, {
      role: "admin",
      page: "dashboard",
    });

    // Monitor presence state changes
    const channel = presenceRef.current.channel;

    const handlePresenceSync = () => {
      const state = channel.presenceState();
      const users = Object.values(state).flat() as PresenceUser[];

      setOnlineUsers(users);
      setStats((prev) => ({
        ...prev,
        onlineAdmins: users.filter((u) => u.role === "admin").length,
        lastUpdated: new Date().toISOString(),
      }));
    };

    channel.on("presence", { event: "sync" }, handlePresenceSync);
    channel.on("presence", { event: "join" }, handlePresenceSync);
    channel.on("presence", { event: "leave" }, handlePresenceSync);

    return () => {
      if (presenceRef.current) {
        presenceRef.current.unsubscribe();
        presenceRef.current = null;
      }
    };
  }, [enabled, currentUserId]);

  /**
   * Subscribe to activity events
   */
  useEffect(() => {
    if (!enabled) return;

    activityRef.current = subscribeToTables([
      // Monitor new bookings
      {
        table: "bookings",
        event: "INSERT",
        callback: (payload) => {
          addActivity(formatBookingActivity(payload));
          setStats((prev) => ({
            ...prev,
            recentBookings: prev.recentBookings + 1,
          }));
        },
      },
      // Monitor booking confirmations
      {
        table: "bookings",
        event: "UPDATE",
        filter: "status=eq.confirmed",
        callback: (payload) => {
          addActivity(formatBookingActivity(payload));
        },
      },
      // Monitor new users
      {
        table: "profiles",
        event: "INSERT",
        filter: "role=eq.user",
        callback: (payload) => {
          addActivity(formatUserActivity(payload));
          setStats((prev) => ({
            ...prev,
            activeCustomers: prev.activeCustomers + 1,
          }));
        },
      },
      // Monitor new professionals
      {
        table: "profiles",
        event: "INSERT",
        filter: "role=eq.professional",
        callback: (payload) => {
          addActivity(formatProfessionalActivity(payload));
          setStats((prev) => ({
            ...prev,
            activeProfessionals: prev.activeProfessionals + 1,
          }));
        },
      },
      // Monitor professional approvals
      {
        table: "profiles",
        event: "UPDATE",
        filter: "professional_status=eq.active",
        callback: (payload) => {
          addActivity(formatProfessionalActivity(payload));
        },
      },
      // Monitor new disputes
      {
        table: "booking_disputes",
        event: "INSERT",
        callback: (payload) => {
          addActivity(formatDisputeActivity(payload));
        },
      },
    ]);

    return () => {
      if (activityRef.current) {
        activityRef.current.unsubscribe();
        activityRef.current = null;
      }
    };
  }, [
    enabled,
    addActivity,
    formatBookingActivity,
    formatUserActivity,
    formatProfessionalActivity,
    formatDisputeActivity,
  ]);

  return {
    stats,
    onlineUsers,
  };
}
