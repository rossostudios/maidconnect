/**
 * Booking Workflow Service - Business logic for accept/decline workflows
 *
 * Extracts common patterns from accept and decline routes
 * Handles: Status validation, payment cancellation, notification data preparation
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendBookingConfirmedEmail, sendBookingDeclinedEmail } from "@/lib/integrations/email/send";
import { stripe } from "@/lib/integrations/stripe";
import {
  notifyCustomerBookingAccepted,
  notifyCustomerBookingDeclined,
} from "@/lib/shared/notifications";
import { formatFromMinorUnits, type Currency } from "@/lib/utils/format";

export type BookingWorkflowData = {
  id: string;
  professional_id: string;
  customer_id: string;
  status: string;
  stripe_payment_intent_id?: string | null;
  scheduled_start?: string | null;
  duration_minutes?: number | null;
  service_name?: string | null;
  address?: any;
  amount_authorized?: number | null;
  currency?: string | null;
};

export type StatusUpdateResult = {
  success: boolean;
  error?: string;
};

export type PaymentCancellationResult = {
  success: boolean;
  error?: string;
};

/**
 * Validate booking can be accepted (must be "authorized")
 */
export function validateAcceptEligibility(bookingStatus: string): StatusUpdateResult {
  if (bookingStatus !== "authorized") {
    return {
      success: false,
      error: `Cannot accept booking with status: ${bookingStatus}`,
    };
  }
  return { success: true };
}

/**
 * Validate booking can be declined (must be "authorized" or "pending_payment")
 */
export function validateDeclineEligibility(bookingStatus: string): StatusUpdateResult {
  if (!["authorized", "pending_payment"].includes(bookingStatus)) {
    return {
      success: false,
      error: `Cannot decline booking with status: ${bookingStatus}`,
    };
  }
  return { success: true };
}

/**
 * Update booking to confirmed status
 */
export async function updateBookingToConfirmed(
  supabase: SupabaseClient,
  bookingId: string
): Promise<StatusUpdateResult> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to update booking status",
    };
  }

  return { success: true };
}

/**
 * Update booking to declined status
 */
export async function updateBookingToDeclined(
  supabase: SupabaseClient,
  bookingId: string
): Promise<StatusUpdateResult> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "declined",
      stripe_payment_status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to update booking status",
    };
  }

  return { success: true };
}

/**
 * Cancel Stripe payment intent
 * Returns success even if cancellation fails (non-blocking)
 */
export async function cancelPaymentIntent(
  paymentIntentId: string | null | undefined
): Promise<PaymentCancellationResult> {
  if (!paymentIntentId) {
    return { success: true }; // No payment intent to cancel
  }

  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    return { success: true };
  } catch (error) {
    // Don't fail the workflow if Stripe cancellation fails
    console.error("[booking-workflow] Failed to cancel payment intent:", error);
    return {
      success: true, // Still return success to not block booking decline
      error: "Payment cancellation failed but booking was declined",
    };
  }
}

/**
 * Format scheduled date for display
 */
export function formatScheduledDate(scheduledStart: string | null | undefined): string {
  if (!scheduledStart) {
    return "TBD";
  }
  return new Date(scheduledStart).toLocaleDateString();
}

/**
 * Format scheduled time for display
 */
export function formatScheduledTime(scheduledStart: string | null | undefined): string {
  if (!scheduledStart) {
    return "TBD";
  }
  return new Date(scheduledStart).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format duration for display
 */
export function formatDuration(durationMinutes: number | null | undefined): string {
  if (!durationMinutes) {
    return "TBD";
  }
  return `${durationMinutes} minutes`;
}

/**
 * Format address field (handles object or string types)
 */
export function formatAddress(address: any): string {
  if (!address) {
    return "Not specified";
  }

  // Handle object with formatted field
  if (typeof address === "object" && "formatted" in address) {
    return String(address.formatted);
  }

  // Handle string
  if (typeof address === "string") {
    return address;
  }

  // Fallback: stringify the object
  return JSON.stringify(address);
}

/**
 * Format currency amount for display (amounts stored in minor units/cents)
 */
export function formatAmount(
  amountAuthorized: number | null | undefined,
  currency: string | null | undefined
): string | undefined {
  if (!amountAuthorized) {
    return;
  }

  return formatFromMinorUnits(amountAuthorized, (currency || "COP") as Currency);
}

/**
 * Fetch customer and professional details for notifications
 */
export async function fetchNotificationDetails(
  supabase: SupabaseClient,
  professionalId: string,
  customerId: string
): Promise<{
  professionalName: string;
  customerName: string;
  customerEmail: string | null;
}> {
  const [{ data: professionalProfile }, { data: customerUser }] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select("full_name")
      .eq("profile_id", professionalId)
      .single(),
    supabase.auth.admin.getUserById(customerId),
  ]);

  return {
    professionalName: professionalProfile?.full_name || "Your professional",
    customerName: customerUser?.user?.user_metadata?.full_name || "there",
    customerEmail: customerUser?.user?.email || null,
  };
}

/**
 * Send acceptance notifications (email + push)
 */
export async function sendAcceptanceNotifications(
  booking: BookingWorkflowData,
  professionalName: string,
  customerName: string,
  customerEmail: string
): Promise<void> {
  const scheduledDate = formatScheduledDate(booking.scheduled_start);
  const scheduledTime = formatScheduledTime(booking.scheduled_start);
  const duration = formatDuration(booking.duration_minutes);
  const address = formatAddress(booking.address);
  const amount = formatAmount(booking.amount_authorized, booking.currency);

  // Send email and push notification in parallel
  await Promise.all([
    sendBookingConfirmedEmail(customerEmail, {
      customerName,
      professionalName,
      serviceName: booking.service_name || "Service",
      scheduledDate,
      scheduledTime,
      duration,
      address,
      bookingId: booking.id,
      amount,
    }),
    notifyCustomerBookingAccepted(booking.customer_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      professionalName,
    }),
  ]);
}

/**
 * Send decline notifications (email + push)
 */
export async function sendDeclineNotifications(
  booking: BookingWorkflowData,
  professionalName: string,
  customerName: string,
  customerEmail: string,
  reason?: string
): Promise<void> {
  const scheduledDate = formatScheduledDate(booking.scheduled_start);
  const scheduledTime = formatScheduledTime(booking.scheduled_start);
  const duration = formatDuration(booking.duration_minutes);
  const address = formatAddress(booking.address);

  // Send email and push notification in parallel
  await Promise.all([
    sendBookingDeclinedEmail(
      customerEmail,
      {
        customerName,
        professionalName,
        serviceName: booking.service_name || "Service",
        scheduledDate,
        scheduledTime,
        duration,
        address,
        bookingId: booking.id,
      },
      reason
    ),
    notifyCustomerBookingDeclined(booking.customer_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      professionalName,
    }),
  ]);
}
