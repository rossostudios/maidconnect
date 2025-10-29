import { resend } from './client';
import * as templates from './templates';

const FROM_EMAIL = 'MaidConnect <notifications@maidconnect.co>';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
    console.error('Failed to send new booking request email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    console.error('Failed to send booking confirmed email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    console.error('Failed to send booking declined email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    console.error('Failed to send booking reminder email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    const dashboardUrl = `${BASE_URL}/dashboard/${isForProfessional ? 'pro' : 'customer'}?tab=messages&booking=${bookingId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `New message from ${senderName}`,
      html: templates.messageNotificationEmail(recipientName, senderName, messagePreview, bookingId, dashboardUrl),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send message notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    console.error('Failed to send service completed email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
