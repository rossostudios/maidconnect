/**
 * User Details Tabs - Helper Functions
 *
 * Data extraction and formatting utilities for tab components
 */

import type {
  CustomerMetrics,
  CustomerSpending,
  ExtractedCustomerData,
  ExtractedCustomerFinances,
  ExtractedProfessionalData,
  ExtractedProfessionalFinances,
  ProfessionalEarnings,
  ProfessionalMetrics,
  StripeAccountStatus,
} from "./types";

// Default values
export const DEFAULT_PROFESSIONAL_METRICS: ProfessionalMetrics = {
  totalBookings: 0,
  completedBookings: 0,
  completionRate: 0,
  avgRating: 0,
  totalReviews: 0,
};

export const DEFAULT_CUSTOMER_METRICS: CustomerMetrics = {
  totalBookings: 0,
  completedBookings: 0,
  totalSpent: 0,
  addressCount: 0,
  favoritesCount: 0,
};

export const DEFAULT_EARNINGS: ProfessionalEarnings = {
  total: 0,
  pending: 0,
  completed: 0,
};

export const DEFAULT_STRIPE: StripeAccountStatus = {
  connected: false,
  verified: false,
  account_id: null,
};

export const DEFAULT_SPENDING: CustomerSpending = {
  total: 0,
  averagePerBooking: 0,
  thisMonth: 0,
};

// Overview helpers
export function extractProfessionalData(
  apiData: any,
  isProfessional: boolean
): ExtractedProfessionalData {
  if (!(isProfessional && apiData?.professional)) {
    return null;
  }
  return {
    profile: apiData.professional.profile,
    verification: apiData.professional.verification,
    services: apiData.professional.services || [],
    metrics: apiData.professional.metrics || DEFAULT_PROFESSIONAL_METRICS,
  };
}

export function extractCustomerData(apiData: any, isCustomer: boolean): ExtractedCustomerData {
  if (!(isCustomer && apiData?.customer)) {
    return null;
  }
  return {
    metrics: apiData.customer.metrics || DEFAULT_CUSTOMER_METRICS,
  };
}

export function formatAvgRating(avgRating: number): string {
  return avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "N/A";
}

export function getVerificationStatus(
  verification: any,
  field: "identity" | "documents"
): "verified" | "pending" {
  if (field === "identity") {
    return verification?.identity_verified ? "verified" : "pending";
  }
  return verification?.documents_verified ? "verified" : "pending";
}

// Finance helpers
export function extractProfessionalFinances(
  apiData: any,
  isProfessional: boolean
): ExtractedProfessionalFinances {
  if (!(isProfessional && apiData?.professional)) {
    return null;
  }
  return {
    earnings: apiData.professional.earnings || DEFAULT_EARNINGS,
    stripe: apiData.professional.stripe || DEFAULT_STRIPE,
    payouts: apiData.professional.payouts || [],
    transactions: apiData.professional.transactions || [],
  };
}

export function extractCustomerFinances(
  apiData: any,
  isCustomer: boolean
): ExtractedCustomerFinances {
  if (!(isCustomer && apiData?.customer)) {
    return null;
  }
  return {
    spending: apiData.customer.spending || DEFAULT_SPENDING,
    paymentMethods: apiData.customer.paymentMethods || [],
    transactions: apiData.customer.transactions || [],
    spendingByCategory: apiData.customer.spendingByCategory || [],
  };
}

export function getStripeStatusBadgeClass(
  isActive: boolean,
  variant: "connection" | "verification"
): string {
  const baseClasses =
    "inline-block rounded-full border px-3 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider";
  if (isActive) {
    return `${baseClasses} border-green-600 bg-green-50 text-green-900`;
  }
  if (variant === "connection") {
    return `${baseClasses} border-red-600 bg-red-50 text-red-900`;
  }
  return `${baseClasses} border-rausch-600 bg-rausch-50 text-rausch-900`;
}

export function getStripeConnectionText(connected: boolean): string {
  return connected ? "Connected" : "Not Connected";
}

export function getStripeVerificationText(verified: boolean): string {
  return verified ? "Verified" : "Pending";
}
