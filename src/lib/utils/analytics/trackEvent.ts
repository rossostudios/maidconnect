/**
 * Event tracking for platform analytics and conversion funnel analysis
 *
 * Usage:
 *   await trackEvent('SearchStarted', { city: 'Bogotá', service: 'cleaning' });
 *   await trackEvent('CheckoutStarted', { pro_id: '123', amount: 50000 });
 */

import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

// Event type definitions for type safety
export type PlatformEventType =
  // Customer events
  | "SearchStarted"
  | "ProfessionalViewed"
  | "CheckoutStarted"
  | "PaymentAttempted"
  | "BookingConfirmed"
  | "ReviewSubmitted"
  // Professional events
  | "LeadReceived"
  | "LeadAccepted"
  | "LeadDeclined"
  | "JobStatusChanged"
  | "PayoutInitiated"
  // Admin/ops events
  | "Cancellation"
  | "DisputeOpened"
  | "DisputeResolved";

// Event properties by event type
export type EventProperties = {
  SearchStarted: {
    city?: string;
    service?: string;
    lat?: number;
    lng?: number;
    device?: string;
  };
  ProfessionalViewed: {
    pro_id: string;
    badges?: string[];
    price?: number;
    availability_score?: number;
  };
  CheckoutStarted: {
    pro_id: string;
    items?: string[];
    subtotal: number;
    deposit_type?: string;
  };
  PaymentAttempted: {
    method: string;
    success: boolean;
    error_code?: string;
    amount?: number;
  };
  BookingConfirmed: {
    booking_id: string;
    total: number;
    deposit_captured: boolean;
  };
  ReviewSubmitted: {
    booking_id: string;
    rating: number;
    text_len: number;
  };
  LeadReceived: {
    city?: string;
    service: string;
    price: number;
    instant_book: boolean;
  };
  LeadAccepted: {
    booking_id: string;
    response_time_minutes?: number;
  };
  LeadDeclined: {
    booking_id: string;
    reason?: string;
  };
  JobStatusChanged: {
    booking_id: string;
    from: string;
    to: string;
    trigger?: string;
  };
  PayoutInitiated: {
    payout_id: string;
    amount: number;
    method: string;
  };
  Cancellation: {
    booking_id: string;
    who_initiated: "customer" | "professional" | "system";
    reason?: string;
    refund_amount?: number;
  };
  DisputeOpened: {
    dispute_id: string;
    reason: string;
  };
  DisputeResolved: {
    dispute_id: string;
    resolution: string;
  };
};

/**
 * Track a platform event
 *
 * @param eventType - Type of event (e.g., 'SearchStarted')
 * @param properties - Event-specific data
 * @param userId - Optional user ID (auto-detected if not provided)
 * @param sessionId - Optional session ID for anonymous tracking
 * @returns Promise<void>
 */
export async function trackEvent<T extends PlatformEventType>(
  eventType: T,
  properties: EventProperties[T],
  userId?: string,
  sessionId?: string
): Promise<void> {
  try {
    const supabase = createSupabaseBrowserClient();

    // Get current user if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      finalUserId = user?.id;
    }

    // Generate or retrieve session ID
    let finalSessionId = sessionId;
    if (!finalSessionId && typeof window !== "undefined") {
      // Client-side: use session storage for anonymous tracking
      finalSessionId = sessionStorage.getItem("analytics_session_id") ?? undefined;
      if (!finalSessionId) {
        finalSessionId = crypto.randomUUID();
        sessionStorage.setItem("analytics_session_id", finalSessionId);
      }
    }

    // Insert event
    const { error } = await supabase.from("platform_events").insert({
      event_type: eventType,
      user_id: finalUserId || null,
      session_id: finalSessionId,
      properties: properties as Record<string, unknown>,
    });

    if (error) {
      console.error(`Failed to track event ${eventType}:`, error);
    }
  } catch (err) {
    // Silently fail - don't break user experience for tracking errors
    console.error(`Error tracking event ${eventType}:`, err);
  }
}

/**
 * Track multiple events in a batch (more efficient)
 */
export async function trackEvents(
  events: Array<{
    eventType: PlatformEventType;
    properties: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
  }>
): Promise<void> {
  try {
    const supabase = createSupabaseBrowserClient();

    // Get current user once for all events
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const defaultUserId = user?.id;

    // Get session ID
    let defaultSessionId: string | null = null;
    if (typeof window !== "undefined") {
      defaultSessionId = sessionStorage.getItem("analytics_session_id");
      if (!defaultSessionId) {
        defaultSessionId = crypto.randomUUID();
        sessionStorage.setItem("analytics_session_id", defaultSessionId);
      }
    }

    // Prepare batch insert
    const eventRecords = events.map((event) => ({
      event_type: event.eventType,
      user_id: event.userId || defaultUserId || null,
      session_id: event.sessionId || defaultSessionId,
      properties: event.properties,
    }));

    const { error } = await supabase.from("platform_events").insert(eventRecords);

    if (error) {
      console.error("Failed to track batch events:", error);
    }
  } catch (err) {
    console.error("Error tracking batch events:", err);
  }
}

/**
 * Get session ID (for linking events across pageviews)
 */
export function getAnalyticsSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

/**
 * Clear analytics session (on logout)
 */
export function clearAnalyticsSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("analytics_session_id");
  }
}
