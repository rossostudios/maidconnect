/**
 * Admin Notification Types
 *
 * Defines notification events and payloads for admin real-time alerts.
 * Supports toast notifications for critical platform events.
 *
 * Week 3: Real-time Features & Notifications
 */

/**
 * Notification severity levels
 */
export type NotificationSeverity = "info" | "warning" | "success" | "error";

/**
 * Notification event types
 */
export type NotificationEventType =
  | "booking_created"
  | "booking_status_changed"
  | "professional_applied"
  | "professional_status_changed"
  | "dispute_created"
  | "dispute_status_changed"
  | "user_registered"
  | "review_submitted"
  | "payment_received"
  | "payment_failed";

/**
 * Base notification structure
 */
export type AdminNotification = {
  id: string;
  type: NotificationEventType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Booking notification payload
 */
export type BookingNotification = AdminNotification & {
  type: "booking_created" | "booking_status_changed";
  metadata: {
    bookingId: string;
    userId: string;
    professionalId?: string;
    status: string;
    totalPrice: number;
    serviceName: string;
  };
};

/**
 * Professional notification payload
 */
export type ProfessionalNotification = AdminNotification & {
  type: "professional_applied" | "professional_status_changed";
  metadata: {
    professionalId: string;
    professionalName: string;
    status: string;
    profileCompleteness?: number;
  };
};

/**
 * Dispute notification payload
 */
export type DisputeNotification = AdminNotification & {
  type: "dispute_created" | "dispute_status_changed";
  metadata: {
    disputeId: string;
    bookingId: string;
    userId: string;
    professionalId: string;
    status: string;
    reason: string;
  };
};

/**
 * User notification payload
 */
export type UserNotification = AdminNotification & {
  type: "user_registered";
  metadata: {
    userId: string;
    userName: string;
    email: string;
    role: string;
  };
};

/**
 * Review notification payload
 */
export type ReviewNotification = AdminNotification & {
  type: "review_submitted";
  metadata: {
    reviewId: string;
    bookingId: string;
    userId: string;
    professionalId: string;
    rating: number;
  };
};

/**
 * Payment notification payload
 */
export type PaymentNotification = AdminNotification & {
  type: "payment_received" | "payment_failed";
  metadata: {
    paymentId: string;
    bookingId: string;
    amount: number;
    currency: string;
    status: string;
  };
};

/**
 * Union type of all notification types
 */
type TypedAdminNotification =
  | BookingNotification
  | ProfessionalNotification
  | DisputeNotification
  | UserNotification
  | ReviewNotification
  | PaymentNotification;

/**
 * Notification filter options
 */
type NotificationFilter = {
  types?: NotificationEventType[];
  severity?: NotificationSeverity[];
  since?: Date;
};

/**
 * Notification preferences
 */
type NotificationPreferences = {
  enabled: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  mutedTypes: NotificationEventType[];
};
