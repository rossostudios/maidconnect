/**
 * PostHog PMF (Product-Market Fit) Event Tracking - Client Side Only
 * Tracks key PMF indicators: briefs, concierge requests, retention signals
 *
 * Epic D-2: PMF Core Metrics Dashboard
 * Links to dashboard: https://us.posthog.com/project/247938/dashboard/771678
 */

import { trackEvent } from "./utils";

/**
 * Client-side PMF event tracking for dashboard insights
 */
export const pmfTracking = {
  /**
   * Track when user submits a service request brief
   * Dashboard: "Briefs Submitted (Daily Trend)" + "Brief-to-Booking Conversion"
   */
  briefSubmitted: (data: {
    serviceType: string;
    location: string;
    estimatedBudget?: number;
    urgency?: "immediate" | "flexible" | "scheduled";
  }) => {
    trackEvent("Brief Submitted", {
      service_type: data.serviceType,
      location: data.location,
      estimated_budget: data.estimatedBudget,
      urgency: data.urgency || "flexible",
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track when user requests human concierge assistance
   * Dashboard: "Concierge Requests by Type"
   */
  conciergeRequest: (data: {
    requestType: "help_with_booking" | "custom_service" | "pricing_question" | "other";
    fromPage: string;
    userMessage?: string;
  }) => {
    trackEvent("Concierge Request", {
      requestType: data.requestType,
      from_page: data.fromPage,
      has_message: !!data.userMessage,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track booking completion with repeat booking detection
   * Dashboard: "Bookings Completed (Weekly)" + "Revenue: New vs Repeat" + "60-Day Rebooking Rate"
   *
   * IMPORTANT: Call this AFTER booking completion, include isRepeatBooking and daysSinceLastBooking
   */
  bookingCompleted: (data: {
    bookingId: string;
    professionalId: string;
    serviceType: string;
    amount: number;
    currency: string;
    isRepeatBooking: boolean;
    daysSinceLastBooking?: number;
  }) => {
    trackEvent("Booking Completed", {
      booking_id: data.bookingId,
      professional_id: data.professionalId,
      service_type: data.serviceType,
      amount: data.amount,
      currency: data.currency,
      isRepeatBooking: data.isRepeatBooking,
      daysSinceLastBooking: data.daysSinceLastBooking,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track account creation for activation funnel
   * Dashboard: "Household Activation Funnel"
   */
  accountCreated: (data: { userId: string; email: string; signupMethod: string }) => {
    trackEvent("Account Created", {
      user_id: data.userId,
      email_domain: data.email.split("@")[1],
      signup_method: data.signupMethod,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Helper to identify user properties for PMF segmentation
   * Call after login or profile updates
   */
  identifyUserForPMF: (
    userId: string,
    properties: {
      email: string;
      totalBookings?: number;
      firstBookingDate?: string;
      lastBookingDate?: string;
      totalSpent?: number;
      preferredServiceTypes?: string[];
      location?: string;
    }
  ) => {
    if (typeof window === "undefined") return; // Client-side only

    const posthog = require("./client").posthog;
    if (!posthog) return;

    posthog.identify(userId, {
      email: properties.email,
      total_bookings: properties.totalBookings || 0,
      first_booking_date: properties.firstBookingDate,
      last_booking_date: properties.lastBookingDate,
      total_spent: properties.totalSpent || 0,
      preferred_service_types: properties.preferredServiceTypes,
      location: properties.location,
    });
  },
};
