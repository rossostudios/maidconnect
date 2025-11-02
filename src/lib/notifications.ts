/**
 * Notification helper library
 * Centralized functions for sending push notifications for various events
 */

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
 */
export async function sendPushNotification(payload: NotificationPayload) {
  try {
    const response = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send notification");
    }

    return await response.json();
  } catch (error) {
    // Don't throw - notifications are nice-to-have, not critical
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
  const date = new Date(booking.scheduledStart).toLocaleDateString("en-US", {
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
  const amountFormatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(booking.amount);

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
  const amountFormatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(failure.amount);

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
  const amountFormatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(failure.amountCaptured);

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
  notificationFn: (adminId: string, ...args: any[]) => Promise<any>,
  ...args: any[]
) {
  try {
    const response = await fetch("/api/admin/users");
    if (!response.ok) return { success: false, error: "Failed to fetch admins" };

    const { admins } = await response.json();

    await Promise.all(admins.map((admin: { id: string }) => notificationFn(admin.id, ...args)));

    return { success: true };
  } catch (error) {
    // Don't throw - notifications are nice-to-have
    return { success: false, error };
  }
}
