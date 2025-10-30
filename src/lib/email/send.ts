import { resend } from "./client";
import * as templates from "./templates";

const FROM_EMAIL = "MaidConnect <notifications@maidconnect.co>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send new booking request notification to professional
 */
export async function sendNewBookingRequestEmail(
  professionalEmail: string,
  data: {
    customerName: string;
    professionalName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    address: string;
    bookingId: string;
    amount?: string;
  }
): Promise<SendEmailResult> {
  try {
    const dashboardUrl = `${BASE_URL}/dashboard/pro?tab=bookings&booking=${data.bookingId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: professionalEmail,
      subject: `New Booking Request from ${data.customerName}`,
      html: templates.newBookingRequestEmail(data, dashboardUrl),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send new booking request email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send booking confirmation to customer
 */
export async function sendBookingConfirmedEmail(
  customerEmail: string,
  data: {
    customerName: string;
    professionalName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    address: string;
    bookingId: string;
    amount?: string;
  }
): Promise<SendEmailResult> {
  try {
    const dashboardUrl = `${BASE_URL}/dashboard/customer?tab=bookings&booking=${data.bookingId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Booking Confirmed with ${data.professionalName}`,
      html: templates.bookingConfirmedEmailForCustomer(data, dashboardUrl),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send booking confirmed email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send booking declined notification to customer
 */
export async function sendBookingDeclinedEmail(
  customerEmail: string,
  data: {
    customerName: string;
    professionalName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    address: string;
    bookingId: string;
  },
  reason?: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Booking Update - ${data.professionalName} Unable to Accept`,
      html: templates.bookingDeclinedEmailForCustomer(data, reason),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send booking declined email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send booking reminder (24 hours before service)
 */
export async function sendBookingReminderEmail(
  recipientEmail: string,
  data: {
    customerName: string;
    professionalName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    address: string;
    bookingId: string;
  },
  isForProfessional: boolean
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Reminder: Service Tomorrow - ${data.serviceName}`,
      html: templates.bookingReminderEmail(data, isForProfessional),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send booking reminder email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send message notification
 */
export async function sendMessageNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  bookingId: string,
  isForProfessional: boolean
): Promise<SendEmailResult> {
  try {
    const dashboardUrl = `${BASE_URL}/dashboard/${isForProfessional ? "pro" : "customer"}?tab=messages&booking=${bookingId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `New message from ${senderName}`,
      html: templates.messageNotificationEmail(
        recipientName,
        senderName,
        messagePreview,
        bookingId,
        dashboardUrl
      ),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send message notification email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send service completed notification
 */
export async function sendServiceCompletedEmail(
  recipientEmail: string,
  data: {
    customerName: string;
    professionalName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    address: string;
    bookingId: string;
    amount?: string;
  },
  isForProfessional: boolean
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Service Completed - ${data.serviceName}`,
      html: templates.serviceCompletedEmail(data, isForProfessional),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send service completed email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send account suspension notification
 */
export async function sendAccountSuspensionEmail(
  userEmail: string,
  userName: string,
  reason: string,
  expiresAt: string | null,
  durationDays?: number
): Promise<SendEmailResult> {
  try {
    const subject = expiresAt ? "Your Account Has Been Suspended" : "Your Account Has Been Banned";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject,
      html: templates.accountSuspendedEmail(userName, reason, expiresAt, durationDays),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send account suspension email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send account restoration notification
 */
export async function sendAccountRestorationEmail(
  userEmail: string,
  userName: string,
  liftReason: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Your Account Has Been Restored",
      html: templates.accountUnsuspendedEmail(userName, liftReason),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send account restoration email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send booking reschedule notification
 */
export async function sendBookingRescheduleEmail(
  recipientEmail: string,
  data: {
    customerName: string;
    professionalName: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    address: string;
    bookingId: string;
  },
  newDate: string,
  newTime: string,
  isForProfessional: boolean
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Booking Rescheduled - ${data.serviceName}`,
      html: templates.bookingRescheduleEmail(data, newDate, newTime, isForProfessional),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send booking reschedule email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send professional application approved notification
 */
export async function sendProfessionalApprovedEmail(
  professionalEmail: string,
  professionalName: string,
  notes?: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: professionalEmail,
      subject: "Your Professional Application Has Been Approved!",
      html: templates.professionalApplicationApprovedEmail(professionalName, notes),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send professional approved email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send professional application rejected notification
 */
export async function sendProfessionalRejectedEmail(
  professionalEmail: string,
  professionalName: string,
  rejectionReason: string,
  notes?: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: professionalEmail,
      subject: "Update on Your Professional Application",
      html: templates.professionalApplicationRejectedEmail(
        professionalName,
        rejectionReason,
        notes
      ),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send professional rejected email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send professional info requested notification
 */
export async function sendProfessionalInfoRequestedEmail(
  professionalEmail: string,
  professionalName: string,
  notes?: string
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: professionalEmail,
      subject: "Additional Information Needed for Your Application",
      html: templates.professionalInfoRequestedEmail(professionalName, notes),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send professional info requested email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
