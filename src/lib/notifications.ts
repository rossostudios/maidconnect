/**
 * Notification helper library
 * Centralized functions for sending push notifications for various events
 */

import { sendExpoNotification } from "@/lib/expo-push";
import { formatCOP, formatDate } from "@/lib/format";

type NotificationPayload = {
  userId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
};

/**
 * Send a push notification to a user
 * Sends to both web push subscriptions and mobile (Expo) push tokens
 */
export async function sendPushNotification(payload: NotificationPayload) {
  try {
    // Send to mobile devices via Expo Push Notification service
    const mobileResult = await sendExpoNotification(payload.userId, {
      title: payload.title,
      body: payload.body,
      data: {
        url: payload.url,
        tag: payload.tag,
      },
      priority: payload.requireInteraction ? "high" : "default",
    });

    // Send to web browser subscriptions (existing web-push logic)
    let webResult = { success: true, sent: 0 };
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        webResult = await response.json();
      }
    } catch (_webError) {
      // Web push is optional, don't fail if it doesn't work
    }

    return {
      success: true,
      mobile: mobileResult,
      web: webResult,
    };
  } catch (error) {
    // Don't throw - notifications are nice-to-have, not critical
    console.error("[notifications] Failed to send push notification:", error);
    return { success: false, error };
  }
}

/**
 * CUSTOMER NOTIFICATIONS
 */

export async function notifyCustomerBookingConfirmed(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    scheduledStart: string;
    professionalName: string;
  }
) {
  const date = formatDate(booking.scheduledStart, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return sendPushNotification({
    userId: customerId,
    title: "Booking Confirmed! 🎉",
    body: `Your ${booking.serviceName} with ${booking.professionalName} is confirmed for ${date}`,
    url: "/dashboard/customer#bookings",
    tag: `booking-${booking.id}`,
  });
}

export async function notifyCustomerBookingAccepted(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    professionalName: string;
  }
) {
  return sendPushNotification({
    userId: customerId,
    title: "Booking Accepted! ✅",
    body: `${booking.professionalName} accepted your ${booking.serviceName} request`,
    url: "/dashboard/customer#bookings",
    tag: `booking-${booking.id}`,
  });
}

export async function notifyCustomerBookingDeclined(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    professionalName: string;
  }
) {
  return sendPushNotification({
    userId: customerId,
    title: "Booking Declined",
    body: `${booking.professionalName} declined your ${booking.serviceName} request. Browse other professionals to rebook.`,
    url: "/professionals",
    tag: `booking-${booking.id}`,
  });
}

export async function notifyCustomerServiceStarted(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    professionalName: string;
  }
) {
  return sendPushNotification({
    userId: customerId,
    title: "Service Started",
    body: `${booking.professionalName} has checked in and started your ${booking.serviceName}`,
    url: "/dashboard/customer#bookings",
    tag: `booking-${booking.id}`,
  });
}

export async function notifyCustomerServiceCompleted(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    professionalName: string;
  }
) {
  return sendPushNotification({
    userId: customerId,
    title: "Service Completed! ✨",
    body: `${booking.professionalName} completed your ${booking.serviceName}. Please rate your experience.`,
    url: "/dashboard/customer#bookings",
    tag: `booking-${booking.id}`,
    requireInteraction: true,
  });
}

export async function notifyCustomerNewMessage(
  customerId: string,
  message: {
    senderName: string;
    preview: string;
    conversationId: string;
  }
) {
  return sendPushNotification({
    userId: customerId,
    title: `Message from ${message.senderName}`,
    body: message.preview,
    url: "/dashboard/customer#messages",
    tag: `message-${message.conversationId}`,
  });
}

export async function notifyCustomerReviewReminder(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    professionalName: string;
  }
) {
  return sendPushNotification({
    userId: customerId,
    title: "Rate Your Experience",
    body: `How was your ${booking.serviceName} with ${booking.professionalName}? Leave a review to help others.`,
    url: "/dashboard/customer#bookings",
    tag: `review-${booking.id}`,
  });
}

export async function notifyCustomerProfessionalEnRoute(
  customerId: string,
  booking: {
    bookingId: string;
    professionalName: string;
    serviceName: string;
    estimatedArrival: string;
    windowStart: string;
    windowEnd: string;
  }
) {
  // Format arrival window times
  const startTime = new Date(booking.windowStart).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = new Date(booking.windowEnd).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return sendPushNotification({
    userId: customerId,
    title: `${booking.professionalName} is on the way! 🚗`,
    body: `Your ${booking.serviceName} professional is arriving soon. Expect arrival between ${startTime} and ${endTime}.`,
    url: "/dashboard/customer#bookings",
    tag: `arriving-soon-${booking.bookingId}`,
    requireInteraction: true,
  });
}

/**
 * PROFESSIONAL NOTIFICATIONS
 */

export async function notifyProfessionalNewBooking(
  professionalId: string,
  booking: {
    id: string;
    serviceName: string;
    customerName: string;
    scheduledStart: string;
  }
) {
  const date = new Date(booking.scheduledStart).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return sendPushNotification({
    userId: professionalId,
    title: "New Booking Request! 🔔",
    body: `${booking.customerName} requested ${booking.serviceName} for ${date}`,
    url: "/dashboard/pro#bookings",
    tag: `booking-${booking.id}`,
    requireInteraction: true,
  });
}

export async function notifyProfessionalBookingCanceled(
  professionalId: string,
  booking: {
    id: string;
    serviceName: string;
    customerName: string;
    scheduledStart: string;
  }
) {
  const date = new Date(booking.scheduledStart).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return sendPushNotification({
    userId: professionalId,
    title: "Booking Canceled",
    body: `${booking.customerName} canceled ${booking.serviceName} scheduled for ${date}`,
    url: "/dashboard/pro#bookings",
    tag: `booking-${booking.id}`,
  });
}

export async function notifyProfessionalPaymentReceived(
  professionalId: string,
  booking: {
    id: string;
    serviceName: string;
    amount: number;
  }
) {
  const amountFormatted = formatCOP(booking.amount);

  return sendPushNotification({
    userId: professionalId,
    title: "Payment Received! 💰",
    body: `You received ${amountFormatted} for ${booking.serviceName}`,
    url: "/dashboard/pro#finances",
    tag: `payment-${booking.id}`,
  });
}

export async function notifyProfessionalNewMessage(
  professionalId: string,
  message: {
    senderName: string;
    preview: string;
    conversationId: string;
  }
) {
  return sendPushNotification({
    userId: professionalId,
    title: `Message from ${message.senderName}`,
    body: message.preview,
    url: "/dashboard/pro#messages",
    tag: `message-${message.conversationId}`,
  });
}

export async function notifyProfessionalReviewReceived(
  professionalId: string,
  review: {
    customerName: string;
    rating: number;
    serviceName: string;
  }
) {
  const stars = "⭐".repeat(review.rating);

  return sendPushNotification({
    userId: professionalId,
    title: "New Review Received!",
    body: `${review.customerName} rated your ${review.serviceName} ${stars} (${review.rating}/5)`,
    url: "/dashboard/pro#reviews",
    tag: `review-${Date.now()}`,
  });
}

export async function notifyProfessionalServiceReminder(
  professionalId: string,
  booking: {
    id: string;
    serviceName: string;
    customerName: string;
    scheduledStart: string;
  }
) {
  const time = new Date(booking.scheduledStart).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return sendPushNotification({
    userId: professionalId,
    title: "Service Reminder ⏰",
    body: `${booking.serviceName} with ${booking.customerName} starts in 1 hour at ${time}`,
    url: "/dashboard/pro#bookings",
    tag: `reminder-${booking.id}`,
    requireInteraction: true,
  });
}

export async function notifyProfessionalBookingRescheduled(
  professionalId: string,
  booking: {
    id: string;
    serviceName: string;
    customerName: string;
    newScheduledStart: string;
  }
) {
  const date = new Date(booking.newScheduledStart).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return sendPushNotification({
    userId: professionalId,
    title: "Booking Rescheduled 📅",
    body: `${booking.customerName} rescheduled ${booking.serviceName} to ${date}. Please confirm the new time.`,
    url: "/dashboard/pro#bookings",
    tag: `booking-${booking.id}`,
    requireInteraction: true,
  });
}

/**
 * Notify customer when a professional reschedules their booking
 */
export async function notifyCustomerBookingRescheduled(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    professionalName: string;
    newScheduledStart: string;
  }
) {
  const date = new Date(booking.newScheduledStart).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return sendPushNotification({
    userId: customerId,
    title: "Booking Rescheduled 📅",
    body: `${booking.professionalName} rescheduled your ${booking.serviceName} to ${date}.`,
    url: `/dashboard/customer/bookings/${booking.id}`,
    tag: `booking-rescheduled-${booking.id}`,
    requireInteraction: true,
  });
}

export async function notifyProfessionalDisputeFiled(
  professionalId: string,
  dispute: {
    id: string;
    bookingId: string;
    reason: string;
    customerName: string;
  }
) {
  return sendPushNotification({
    userId: professionalId,
    title: "Dispute Filed ⚠️",
    body: `${dispute.customerName} filed a dispute (${dispute.reason}). Our team will review and contact you.`,
    url: "/dashboard/pro#bookings",
    tag: `dispute-${dispute.id}`,
    requireInteraction: true,
  });
}

export async function notifyCustomerDisputeResolved(
  customerId: string,
  dispute: {
    id: string;
    bookingId: string;
    resolution: "resolved" | "dismissed";
    resolutionNotes?: string;
    serviceName: string;
  }
) {
  const isResolved = dispute.resolution === "resolved";
  return sendPushNotification({
    userId: customerId,
    title: isResolved ? "Dispute Resolved ✅" : "Dispute Update",
    body: isResolved
      ? `Your dispute for "${dispute.serviceName}" has been resolved. ${dispute.resolutionNotes ? "Check your dashboard for details." : ""}`
      : `Your dispute for "${dispute.serviceName}" has been reviewed and closed. Contact support if you have questions.`,
    url: "/dashboard/customer/disputes",
    tag: `dispute-resolved-${dispute.id}`,
    requireInteraction: true,
  });
}

export async function notifyProfessionalDisputeResolved(
  professionalId: string,
  dispute: {
    id: string;
    bookingId: string;
    resolution: "resolved" | "dismissed";
    customerName: string;
    serviceName: string;
  }
) {
  const isDismissed = dispute.resolution === "dismissed";
  return sendPushNotification({
    userId: professionalId,
    title: isDismissed ? "Dispute Dismissed ✅" : "Dispute Resolved",
    body: isDismissed
      ? `The dispute filed by ${dispute.customerName} for "${dispute.serviceName}" has been dismissed in your favor.`
      : `The dispute filed by ${dispute.customerName} for "${dispute.serviceName}" has been resolved. Check your dashboard for details.`,
    url: "/dashboard/pro#bookings",
    tag: `dispute-resolved-${dispute.id}`,
    requireInteraction: true,
  });
}

/**
 * ADMIN NOTIFICATIONS (Critical Alerts)
 */

export async function notifyAdminDisputeFiled(
  adminId: string,
  dispute: {
    id: string;
    bookingId: string;
    reason: string;
    customerName: string;
    professionalName: string;
  }
) {
  return sendPushNotification({
    userId: adminId,
    title: "🚨 New Dispute Requires Review",
    body: `${dispute.customerName} vs ${dispute.professionalName} - ${dispute.reason}. Review immediately.`,
    url: `/admin/disputes/${dispute.id}`,
    tag: `admin-dispute-${dispute.id}`,
    requireInteraction: true,
  });
}

export async function notifyAdminPaymentFailure(
  adminId: string,
  failure: {
    bookingId: string;
    professionalName: string;
    customerName: string;
    amount: number;
    errorMessage: string;
  }
) {
  const amountFormatted = formatCOP(failure.amount);

  return sendPushNotification({
    userId: adminId,
    title: "🚨 CRITICAL: Payment Capture Failed",
    body: `Failed to capture ${amountFormatted} for booking ${failure.bookingId}. ${failure.professionalName} checked out but payment failed. Manual review required.`,
    url: `/admin/bookings/${failure.bookingId}`,
    tag: `admin-payment-failure-${failure.bookingId}`,
    requireInteraction: true,
  });
}

export async function notifyAdminPaymentCapturedButDBFailed(
  adminId: string,
  failure: {
    bookingId: string;
    professionalName: string;
    customerName: string;
    amountCaptured: number;
    paymentIntentId: string;
  }
) {
  const amountFormatted = formatCOP(failure.amountCaptured);

  return sendPushNotification({
    userId: adminId,
    title: "🚨🚨 URGENT: Payment Captured, DB Update Failed",
    body: `IMMEDIATE ACTION REQUIRED: Captured ${amountFormatted} (${failure.paymentIntentId}) but booking ${failure.bookingId} status NOT updated. Manual DB fix needed now!`,
    url: `/admin/bookings/${failure.bookingId}`,
    tag: `admin-critical-${failure.bookingId}`,
    requireInteraction: true,
  });
}

/**
 * Helper function to notify all admins
 * Fetches all users with admin role and sends notification to each
 */
export async function notifyAllAdmins(
  notificationFn: (adminId: string, ...fnArgs: any[]) => Promise<any>,
  ...args: any[]
) {
  try {
    const response = await fetch("/api/admin/users");
    if (!response.ok) {
      return { success: false, error: "Failed to fetch admins" };
    }

    const { admins } = await response.json();

    await Promise.all(admins.map((admin: { id: string }) => notificationFn(admin.id, ...args)));

    return { success: true };
  } catch (error) {
    // Don't throw - notifications are nice-to-have
    return { success: false, error };
  }
}

/**
 * NEW JOB NEARBY NOTIFICATIONS (PWA Growth Feature)
 * Notifies professionals when new jobs are posted in their service area
 */

export async function notifyProfessionalNewJobNearby(
  professionalId: string,
  job: {
    serviceName: string;
    cityName: string;
    scheduledDate: string;
    estimatedPay: number;
    currency?: string;
  }
) {
  const date = new Date(job.scheduledDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const payFormatted = formatCOP(job.estimatedPay);

  return sendPushNotification({
    userId: professionalId,
    title: "New Job Nearby! 📍",
    body: `${job.serviceName} in ${job.cityName} for ${date} - ${payFormatted}. Apply now!`,
    url: "/dashboard/pro#opportunities",
    tag: `job-nearby-${Date.now()}`,
    requireInteraction: true,
  });
}

/**
 * Notify multiple professionals about a new job opportunity
 */
export async function notifyNearbyProfessionalsNewJob(
  professionalIds: string[],
  job: {
    serviceName: string;
    cityName: string;
    scheduledDate: string;
    estimatedPay: number;
    currency?: string;
  }
) {
  const results = await Promise.allSettled(
    professionalIds.map((id) => notifyProfessionalNewJobNearby(id, job))
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { successful, failed, total: professionalIds.length };
}

/**
 * REBOOK NUDGE NOTIFICATIONS (Sprint 2)
 */

export async function notifyCustomerRebookNudge(
  customerId: string,
  booking: {
    id: string;
    serviceName: string;
    professionalName: string;
    professionalId: string;
  }
) {
  return sendPushNotification({
    userId: customerId,
    title: "Ready for Your Next Service? ✨",
    body: `Book another ${booking.serviceName} with ${booking.professionalName}`,
    url: `/professionals/${booking.professionalId}?prev_booking=${booking.id}`,
    tag: `rebook-nudge-${booking.id}`,
  });
}
