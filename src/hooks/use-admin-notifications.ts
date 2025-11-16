/**
 * Admin Notifications Hook
 *
 * Provides real-time toast notifications for critical admin events.
 * Subscribes to database changes and shows instant alerts for:
 * - New bookings and status changes
 * - Professional applications
 * - Dispute creation
 * - New user registrations
 *
 * Week 3: Real-time Features & Notifications
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeEvent, RealtimeSubscription } from "@/lib/integrations/supabase/realtime";
import { subscribeToTables } from "@/lib/integrations/supabase/realtime";
import { toast } from "@/lib/toast";
import type {
  AdminNotification,
  NotificationEventType,
  NotificationSeverity,
} from "@/types/admin-notifications";

type NotificationOptions = {
  /**
   * Whether to enable notifications
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to show toast messages
   * @default true
   */
  showToasts?: boolean;

  /**
   * Maximum number of notifications to keep in history
   * @default 50
   */
  maxHistory?: number;

  /**
   * Event types to listen for (omit to listen for all)
   */
  eventTypes?: NotificationEventType[];
};

/**
 * Hook for admin real-time notifications
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { notifications, clearNotifications, unreadCount } = useAdminNotifications();
 *
 *   return (
 *     <div>
 *       <NotificationBell count={unreadCount} />
 *       {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminNotifications(options: NotificationOptions = {}) {
  const { enabled = true, showToasts = true, maxHistory = 50, eventTypes } = options;

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  /**
   * Generate notification ID
   */
  const generateId = useCallback(
    () => `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  /**
   * Determine notification severity based on event type
   */
  const getSeverity = useCallback((type: NotificationEventType): NotificationSeverity => {
    if (type === "dispute_created") return "error";
    if (type.includes("failed")) return "error";
    if (type.includes("warning")) return "warning";
    if (type.includes("success") || type.includes("completed")) return "success";
    return "info";
  }, []);

  /**
   * Format notification message based on event
   */
  const formatNotification = useCallback(
    (type: NotificationEventType, payload: Record<string, unknown>): AdminNotification => {
      const id = generateId();
      const severity = getSeverity(type);
      const timestamp = new Date().toISOString();

      switch (type) {
        case "booking_created":
          return {
            id,
            type,
            severity,
            title: "New Booking",
            message: `New booking for ${payload.serviceName || "service"} - ${payload.totalPrice} COP`,
            timestamp,
            actionUrl: `/admin/bookings/${payload.bookingId}`,
            metadata: payload,
          };

        case "booking_status_changed":
          return {
            id,
            type,
            severity,
            title: "Booking Status Changed",
            message: `Booking #${String(payload.bookingId).slice(-6)} changed to ${payload.status}`,
            timestamp,
            actionUrl: `/admin/bookings/${payload.bookingId}`,
            metadata: payload,
          };

        case "professional_applied":
          return {
            id,
            type,
            severity: "info",
            title: "New Professional Application",
            message: `${payload.professionalName || "A professional"} submitted an application`,
            timestamp,
            actionUrl: "/admin/users?role=professional&status=pending",
            metadata: payload,
          };

        case "dispute_created":
          return {
            id,
            type,
            severity: "error",
            title: "New Dispute",
            message: `Dispute created for booking #${String(payload.bookingId).slice(-6)} - ${payload.reason}`,
            timestamp,
            actionUrl: `/admin/disputes/${payload.disputeId}`,
            metadata: payload,
          };

        case "user_registered":
          return {
            id,
            type,
            severity: "success",
            title: "New User Registration",
            message: `${payload.userName || "New user"} registered as ${payload.role}`,
            timestamp,
            actionUrl: "/admin/users",
            metadata: payload,
          };

        default:
          return {
            id,
            type,
            severity,
            title: "Platform Event",
            message: `Event: ${type}`,
            timestamp,
            metadata: payload,
          };
      }
    },
    [generateId, getSeverity]
  );

  /**
   * Add notification to history and show toast
   */
  const addNotification = useCallback(
    (notification: AdminNotification) => {
      // Add to history
      setNotifications((prev) => {
        const updated = [notification, ...prev];
        return updated.slice(0, maxHistory);
      });

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast if enabled
      if (showToasts) {
        const toastMessage = `${notification.title}: ${notification.message}`;

        switch (notification.severity) {
          case "success":
            toast.success(toastMessage, 4000);
            break;
          case "error":
            toast.error(toastMessage, 5000);
            break;
          case "warning":
            toast.warning(toastMessage, 4000);
            break;
          default:
            toast.info(toastMessage, 3000);
        }
      }
    },
    [maxHistory, showToasts]
  );

  /**
   * Handle booking events
   */
  const handleBookingEvent = useCallback(
    (payload: RealtimeEvent<Record<string, unknown>>) => {
      if (payload.eventType === "INSERT") {
        const notification = formatNotification("booking_created", {
          bookingId: payload.new.id,
          userId: payload.new.user_id,
          professionalId: payload.new.professional_id,
          status: payload.new.status,
          totalPrice: payload.new.total_price_cop,
          serviceName: payload.new.service_name,
        });
        addNotification(notification);
      } else if (payload.eventType === "UPDATE") {
        // Only notify on status changes
        if (payload.old.status !== payload.new.status) {
          const notification = formatNotification("booking_status_changed", {
            bookingId: payload.new.id,
            status: payload.new.status,
          });
          addNotification(notification);
        }
      }
    },
    [formatNotification, addNotification]
  );

  /**
   * Handle professional profile events
   */
  const handleProfessionalEvent = useCallback(
    (payload: RealtimeEvent<Record<string, unknown>>) => {
      if (
        payload.eventType === "INSERT" ||
        (payload.eventType === "UPDATE" &&
          payload.old.onboarding_status !== "pending_review" &&
          payload.new.onboarding_status === "pending_review")
      ) {
        const notification = formatNotification("professional_applied", {
          professionalId: payload.new.id,
          professionalName: payload.new.full_name,
          status: payload.new.onboarding_status,
        });
        addNotification(notification);
      }
    },
    [formatNotification, addNotification]
  );

  /**
   * Handle dispute events
   */
  const handleDisputeEvent = useCallback(
    (payload: RealtimeEvent<Record<string, unknown>>) => {
      if (payload.eventType === "INSERT") {
        const notification = formatNotification("dispute_created", {
          disputeId: payload.new.id,
          bookingId: payload.new.booking_id,
          userId: payload.new.user_id,
          professionalId: payload.new.professional_id,
          status: payload.new.status,
          reason: payload.new.reason,
        });
        addNotification(notification);
      }
    },
    [formatNotification, addNotification]
  );

  /**
   * Handle user registration events
   */
  const handleUserEvent = useCallback(
    (payload: RealtimeEvent<Record<string, unknown>>) => {
      if (payload.eventType === "INSERT") {
        const notification = formatNotification("user_registered", {
          userId: payload.new.id,
          userName: payload.new.full_name,
          email: payload.new.email,
          role: payload.new.role,
        });
        addNotification(notification);
      }
    },
    [formatNotification, addNotification]
  );

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  /**
   * Subscribe to real-time events
   */
  useEffect(() => {
    if (!enabled) return;

    subscriptionRef.current = subscribeToTables([
      {
        table: "bookings",
        callback: handleBookingEvent,
        event: "*",
      },
      {
        table: "profiles",
        callback: handleProfessionalEvent,
        event: "*",
        filter: "role=eq.professional",
      },
      {
        table: "booking_disputes",
        callback: handleDisputeEvent,
        event: "INSERT",
      },
      {
        table: "profiles",
        callback: handleUserEvent,
        event: "INSERT",
      },
    ]);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [enabled, handleBookingEvent, handleProfessionalEvent, handleDisputeEvent, handleUserEvent]);

  return {
    notifications,
    unreadCount,
    clearNotifications,
    markAllAsRead,
  };
}
