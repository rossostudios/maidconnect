import { trackEvent } from "./utils";

/**
 * Conversion Tracking - Track key conversion events throughout the user journey
 */

export const conversionTracking = {
  /**
   * Brief (intake form) events
   */
  briefStarted: (props: { serviceType: string; city: string }) => {
    trackEvent("Brief Started", props);
  },

  briefStepCompleted: (props: { step: number }) => {
    trackEvent("Brief Step Completed", props);
  },

  briefCompleted: (props: { briefId: string }) => {
    trackEvent("Brief Completed", props);
  },

  /**
   * Concierge request events
   */
  conciergeRequestStarted: (props: { serviceType?: string }) => {
    trackEvent("Concierge Request Started", props);
  },

  conciergeRequestSubmitted: (props: { briefId: string; serviceType: string }) => {
    trackEvent("Concierge Request Submitted", props);
  },

  /**
   * Hero and landing page events
   */
  heroCTAClicked: (props: {
    ctaType: "start_brief" | "learn_more" | "concierge";
    location: "hero" | "banner";
    ctaText?: string;
  }) => {
    trackEvent("Hero CTA Clicked", props);
  },

  professionalsListViewed: (props: {
    totalCount: number;
    filters?: {
      serviceType?: string;
      city?: string;
      rating?: number;
      availableToday?: boolean;
    };
  }) => {
    trackEvent("Professionals List Viewed", props);
  },

  /**
   * Professional search and discovery events
   */
  professionalsSearched: (props: {
    query?: string;
    filters: {
      serviceType?: string;
      city?: string;
      rating?: number;
      availableToday?: boolean;
    };
  }) => {
    trackEvent("Professionals Searched", props);
  },

  filterApplied: (props: { filterType: string; filterValue: string }) => {
    trackEvent("Filter Applied", props);
  },

  profileViewed: (props: { professionalId: string; serviceType: string }) => {
    trackEvent("Professional Profile Viewed", props);
  },

  profileContacted: (props: { professionalId: string; method: "message" | "booking" }) => {
    trackEvent("Professional Contacted", props);
  },

  profileFavorited: (props: { professionalId: string; action: "add" | "remove" }) => {
    trackEvent("Professional Favorited", props);
  },

  /**
   * Booking flow events
   */
  bookingStarted: (props: {
    professionalId: string;
    serviceType: string;
    date: string;
    duration: number;
  }) => {
    trackEvent("Booking Started", props);
  },

  bookingSubmitted: (props: {
    bookingId: string;
    professionalId: string;
    customerId: string;
    serviceType: string;
    totalAmount: number;
    currency: string;
    duration: number;
    addons?: string[];
  }) => {
    trackEvent("Booking Submitted", {
      ...props,
      value: props.totalAmount,
    });
  },

  bookingConfirmed: (props: {
    bookingId: string;
    professionalId: string;
    customerId: string;
    totalAmount: number;
    currency: string;
  }) => {
    trackEvent("Booking Confirmed", {
      ...props,
      value: props.totalAmount,
    });
  },

  bookingCancelled: (props: {
    bookingId: string;
    cancelledBy: "customer" | "professional";
    reason?: string;
    refundAmount?: number;
  }) => {
    trackEvent("Booking Cancelled", props);
  },

  bookingCompleted: (props: {
    bookingId: string;
    professionalId: string;
    customerId: string;
    totalAmount: number;
    currency: string;
    rating?: number;
  }) => {
    trackEvent("Booking Completed", {
      ...props,
      value: props.totalAmount,
    });
  },

  bookingRescheduled: (props: {
    bookingId: string;
    oldDate: string;
    newDate: string;
    reason?: string;
  }) => {
    trackEvent("Booking Rescheduled", props);
  },

  bookingExtended: (props: {
    bookingId: string;
    additionalHours: number;
    additionalAmount: number;
  }) => {
    trackEvent("Booking Time Extended", props);
  },

  bookingDeclined: (props: { bookingId: string; professionalId: string; reason?: string }) => {
    trackEvent("Booking Declined", props);
  },

  bookingDisputeCreated: (props: { bookingId: string; disputeType: string; amount: number }) => {
    trackEvent("Booking Dispute Created", props);
  },
};
