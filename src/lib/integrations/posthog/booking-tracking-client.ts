/**
 * PostHog Booking Event Tracking - Client Side Only
 * Comprehensive tracking for the entire booking lifecycle
 *
 * For server-side booking tracking, use:
 * import { serverBookingTracking } from '@/lib/integrations/posthog/server';
 */

import { trackEvent } from "./utils";

/**
 * Client-side booking event tracking
 */
export const bookingTracking = {
  /**
   * Track when user starts booking process
   */
  started: (data: { serviceType: string; location?: string; source?: string }) => {
    trackEvent("Booking Started", {
      service_type: data.serviceType,
      location: data.location,
      source: data.source || "direct",
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track service selection
   */
  serviceSelected: (data: { serviceType: string; duration?: number; frequency?: string }) => {
    trackEvent("Service Selected", {
      service_type: data.serviceType,
      duration_hours: data.duration,
      frequency: data.frequency,
    });
  },

  /**
   * Track when professional is selected
   */
  professionalSelected: (data: {
    professionalId: string;
    serviceType: string;
    matchScore?: number;
  }) => {
    trackEvent("Professional Selected", {
      professional_id: data.professionalId,
      service_type: data.serviceType,
      match_score: data.matchScore,
    });
  },

  /**
   * Track booking time/date selection
   */
  timeSelected: (data: {
    date: string;
    timeSlot: string;
    leadTime?: number; // hours until booking
  }) => {
    trackEvent("Booking Time Selected", {
      booking_date: data.date,
      time_slot: data.timeSlot,
      lead_time_hours: data.leadTime,
    });
  },

  /**
   * Track when user reaches checkout
   */
  checkoutStarted: (data: { bookingId: string; amount: number; currency: string }) => {
    trackEvent("Checkout Started", {
      booking_id: data.bookingId,
      amount: data.amount,
      currency: data.currency,
    });
  },

  /**
   * Track payment method selection
   */
  paymentMethodSelected: (data: { method: string; bookingId: string }) => {
    trackEvent("Payment Method Selected", {
      payment_method: data.method,
      booking_id: data.bookingId,
    });
  },

  /**
   * Track successful booking completion
   */
  completed: (data: {
    bookingId: string;
    amount: number;
    currency: string;
    serviceType: string;
    professionalId: string;
  }) => {
    trackEvent("Booking Completed", {
      booking_id: data.bookingId,
      amount: data.amount,
      currency: data.currency,
      service_type: data.serviceType,
      professional_id: data.professionalId,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track booking confirmation (after professional accepts)
   */
  confirmed: (data: {
    bookingId: string;
    professionalId: string;
    timeToConfirmMinutes: number;
  }) => {
    trackEvent("Booking Confirmed", {
      booking_id: data.bookingId,
      professional_id: data.professionalId,
      time_to_confirm_minutes: data.timeToConfirmMinutes,
    });
  },

  /**
   * Track booking cancellation
   */
  cancelled: (data: {
    bookingId: string;
    reason?: string;
    cancelledBy: "customer" | "professional" | "admin";
    refundAmount?: number;
  }) => {
    trackEvent("Booking Cancelled", {
      booking_id: data.bookingId,
      cancellation_reason: data.reason,
      cancelled_by: data.cancelledBy,
      refund_amount: data.refundAmount,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track booking check-in
   */
  checkedIn: (data: { bookingId: string; professionalId: string; onTime: boolean }) => {
    trackEvent("Booking Checked In", {
      booking_id: data.bookingId,
      professional_id: data.professionalId,
      on_time: data.onTime,
    });
  },

  /**
   * Track booking checkout
   */
  checkedOut: (data: {
    bookingId: string;
    professionalId: string;
    actualDurationMinutes: number;
    plannedDurationMinutes: number;
  }) => {
    trackEvent("Booking Checked Out", {
      booking_id: data.bookingId,
      professional_id: data.professionalId,
      actual_duration_minutes: data.actualDurationMinutes,
      planned_duration_minutes: data.plannedDurationMinutes,
      duration_variance: data.actualDurationMinutes - data.plannedDurationMinutes,
    });
  },

  /**
   * Track booking rebook action
   */
  rebooked: (data: { originalBookingId: string; newBookingId: string; professionalId: string }) => {
    trackEvent("Booking Rebooked", {
      original_booking_id: data.originalBookingId,
      new_booking_id: data.newBookingId,
      professional_id: data.professionalId,
    });
  },
};
