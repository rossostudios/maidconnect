/**
 * Arrival Alert Service - Business logic for arrival notifications
 *
 * Extracts arrival window calculation and notification logic
 * Privacy-conscious: No precise GPS exposed, only time-based windows
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyCustomerProfessionalEnRoute } from "@/lib/notifications";

export type ArrivalStatus = "scheduled" | "en_route" | "arriving_soon" | "arrived" | "in_progress";

export type ArrivalWindow = {
  status: ArrivalStatus;
  estimatedArrival: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  lastUpdate: string;
};

export type BookingArrivalData = {
  id: string;
  customer_id: string;
  professional_id: string;
  scheduled_start: string;
  check_in_time?: string | null;
  service?: { name: string } | { name: string }[];
  professional?: { full_name: string } | { full_name: string }[];
};

/**
 * Calculate minutes until scheduled start time
 */
export function calculateMinutesUntilStart(scheduledStart: Date): number {
  const now = new Date();
  return Math.floor((scheduledStart.getTime() - now.getTime()) / (1000 * 60));
}

/**
 * Calculate 30-minute arrival window centered on scheduled time
 */
export function calculateArrivalWindow(scheduledStart: Date): {
  windowStart: Date;
  windowEnd: Date;
} {
  return {
    windowStart: new Date(scheduledStart.getTime() - 15 * 60 * 1000),
    windowEnd: new Date(scheduledStart.getTime() + 15 * 60 * 1000),
  };
}

/**
 * Determine arrival status based on time until scheduled start
 */
export function determineArrivalStatus(
  minutesUntilStart: number,
  hasCheckedIn: boolean
): ArrivalStatus {
  // Service already in progress (checked in)
  if (hasCheckedIn) {
    return "in_progress";
  }

  // Professional has arrived (within 5 minutes of scheduled start)
  if (minutesUntilStart <= 5 && minutesUntilStart >= -10) {
    return "arrived";
  }

  // Arriving soon (10-30 minutes before scheduled start)
  if (minutesUntilStart > 5 && minutesUntilStart <= 30) {
    return "arriving_soon";
  }

  // En route (30-60 minutes before scheduled start)
  if (minutesUntilStart > 30 && minutesUntilStart <= 60) {
    return "en_route";
  }

  // Still scheduled (more than 60 minutes away)
  return "scheduled";
}

/**
 * Build complete arrival window response
 */
export function buildArrivalWindow(
  status: ArrivalStatus,
  scheduledStart: Date,
  _minutesUntilStart: number
): ArrivalWindow {
  const now = new Date();
  let estimatedArrival: Date | null = null;
  let windowStart: Date | null = null;
  let windowEnd: Date | null = null;

  // Set estimated arrival and windows based on status
  if (status === "arrived" || status === "arriving_soon" || status === "en_route") {
    estimatedArrival = scheduledStart;
  }

  if (status === "arriving_soon" || status === "en_route") {
    const window = calculateArrivalWindow(scheduledStart);
    windowStart = window.windowStart;
    windowEnd = window.windowEnd;
  }

  return {
    status,
    estimatedArrival: estimatedArrival?.toISOString() || null,
    windowStart: windowStart?.toISOString() || null,
    windowEnd: windowEnd?.toISOString() || null,
    lastUpdate: now.toISOString(),
  };
}

/**
 * Check if notification was already sent for this booking
 */
export async function hasNotificationBeenSent(
  supabase: SupabaseClient,
  customerId: string,
  _bookingId: string,
  notificationTag: string
): Promise<boolean> {
  const { data: sentNotification } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", customerId)
    .eq("tag", notificationTag)
    .single();

  return Boolean(sentNotification);
}

/**
 * Extract professional name from booking data
 */
export function extractProfessionalName(
  professional: { full_name: string } | { full_name: string }[] | undefined
): string {
  if (!professional) {
    return "Your professional";
  }
  const prof = Array.isArray(professional) ? professional[0] : professional;
  return prof?.full_name || "Your professional";
}

/**
 * Extract service name from booking data
 */
export function extractServiceName(
  service: { name: string } | { name: string }[] | undefined
): string {
  if (!service) {
    return "service";
  }
  const svc = Array.isArray(service) ? service[0] : service;
  return svc?.name || "service";
}

/**
 * Send arriving soon notification if not already sent
 */
export async function sendArrivingSoonNotification(
  supabase: SupabaseClient,
  booking: BookingArrivalData,
  scheduledStart: Date
): Promise<void> {
  const notificationTag = `arriving-soon-${booking.id}`;
  const alreadySent = await hasNotificationBeenSent(
    supabase,
    booking.customer_id,
    booking.id,
    notificationTag
  );

  if (alreadySent) {
    return;
  }

  const window = calculateArrivalWindow(scheduledStart);
  const professionalName = extractProfessionalName(booking.professional);
  const serviceName = extractServiceName(booking.service);

  await notifyCustomerProfessionalEnRoute(booking.customer_id, {
    bookingId: booking.id,
    professionalName,
    serviceName,
    estimatedArrival: scheduledStart.toISOString(),
    windowStart: window.windowStart.toISOString(),
    windowEnd: window.windowEnd.toISOString(),
  });
}

/**
 * Send en route notification (manual trigger from professional)
 */
export async function sendEnRouteNotification(
  booking: BookingArrivalData,
  scheduledStart: Date
): Promise<void> {
  const window = calculateArrivalWindow(scheduledStart);
  const professionalName = extractProfessionalName(booking.professional);
  const serviceName = extractServiceName(booking.service);

  await notifyCustomerProfessionalEnRoute(booking.customer_id, {
    bookingId: booking.id,
    professionalName,
    serviceName,
    estimatedArrival: scheduledStart.toISOString(),
    windowStart: window.windowStart.toISOString(),
    windowEnd: window.windowEnd.toISOString(),
  });
}
