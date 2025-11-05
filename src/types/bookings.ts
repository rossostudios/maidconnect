/**
 * Booking Types
 * Sprint 4: Booking Lifecycle
 */

// ============================================================================
// Enums
// ============================================================================

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

// ============================================================================
// Core Types
// ============================================================================

export type Booking = {
  id: string;
  customerId: string;
  professionalId: string;
  serviceId: string;
  pricingTierId: string | null;
  bookingNumber: string;
  status: BookingStatus;

  // Scheduling
  scheduledDate: string; // ISO date string
  scheduledStartTime: string; // HH:MM:SS format
  scheduledEndTime: string;
  actualStartTime: string | null; // ISO timestamp
  actualEndTime: string | null;

  // Location
  serviceAddressId: string | null;
  serviceAddressLine1: string | null;
  serviceAddressLine2: string | null;
  serviceAddressCity: string | null;
  servicePostalCode: string | null;
  serviceAddressCountry: string;
  locationLat: number | null;
  locationLng: number | null;

  // Pricing
  basePriceCop: number;
  tierPriceCop: number;
  addonsPriceCop: number;
  tipAmountCop: number;
  totalPriceCop: number;

  // Additional info
  customerNotes: string | null;
  professionalNotes: string | null;
  specialRequirements: string[];

  // Cancellation
  cancellationReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;

  // Ratings
  customerRating: number | null;
  customerReview: string | null;
  customerRatedAt: string | null;
  professionalRating: number | null;
  professionalReview: string | null;
  professionalRatedAt: string | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
};

export type BookingWithDetails = Booking & {
  customer?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phoneNumber: string | null;
  };
  professional?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phoneNumber: string | null;
  };
  service?: {
    id: string;
    name: string;
    description: string | null;
    categoryName: string | null;
  };
  addons?: BookingAddon[];
  statusHistory?: BookingStatusHistory[];
};

export type BookingStatusHistory = {
  id: string;
  bookingId: string;
  oldStatus: BookingStatus | null;
  newStatus: BookingStatus;
  changedBy: string;
  reason: string | null;
  createdAt: string;
};

export type BookingAddon = {
  id: string;
  bookingId: string;
  addonId: string;
  addonName: string;
  addonPriceCop: number;
  quantity: number;
  createdAt: string;
};

// ============================================================================
// Input Types
// ============================================================================

export type CreateBookingInput = {
  professionalId: string;
  serviceId: string;
  pricingTierId?: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  serviceAddressId?: string;
  serviceAddressLine1?: string;
  serviceAddressLine2?: string;
  serviceAddressCity?: string;
  servicePostalCode?: string;
  serviceAddressCountry?: string;
  locationLat?: number;
  locationLng?: number;
  // Note: Price fields removed - server calculates all prices from database for security
  customerNotes?: string;
  specialRequirements?: string[];
  addonIds?: string[];
};

export type UpdateBookingInput = {
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  serviceAddressId?: string;
  serviceAddressLine1?: string;
  serviceAddressLine2?: string;
  serviceAddressCity?: string;
  servicePostalCode?: string;
  customerNotes?: string;
  professionalNotes?: string;
  specialRequirements?: string[];
  status?: BookingStatus;
};

export type CancelBookingInput = {
  reason: string;
};

export type RateBookingInput = {
  rating: number; // 1-5
  review?: string;
};

// ============================================================================
// Summary Types
// ============================================================================

export type CustomerBookingSummary = {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpentCop: number;
  pendingRatings: number;
};

export type ProfessionalBookingSummary = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalEarnedCop: number;
  averageRating: number;
  totalRatings: number;
};

export type BookingPriceCalculation = {
  basePrice: number;
  tierPrice: number;
  addonsPrice: number;
  tipAmount: number;
  totalPrice: number;
};

// ============================================================================
// Response Types
// ============================================================================

export type CreateBookingResponse =
  | { success: true; booking: Booking }
  | { success: false; error: string };

export type UpdateBookingResponse =
  | { success: true; booking: Booking }
  | { success: false; error: string };

export type CancelBookingResponse = { success: true } | { success: false; error: string };

export type GetBookingResponse =
  | { success: true; booking: BookingWithDetails }
  | { success: false; error: string };

export type GetBookingsResponse =
  | { success: true; bookings: BookingWithDetails[] }
  | { success: false; error: string };

export type RateBookingResponse = { success: true } | { success: false; error: string };

export type GetCustomerBookingSummaryResponse =
  | { success: true; summary: CustomerBookingSummary }
  | { success: false; error: string };

export type GetProfessionalBookingSummaryResponse =
  | { success: true; summary: ProfessionalBookingSummary }
  | { success: false; error: string };

export type CheckBookingAvailabilityResponse =
  | { success: true; available: boolean }
  | { success: false; error: string };
