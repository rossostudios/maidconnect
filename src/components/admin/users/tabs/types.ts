/**
 * User Details Tabs - Type Definitions
 *
 * Centralized types for admin user detail tabs
 */

export type UserRole = "professional" | "customer" | "admin";

export type BaseUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
};

export type TabId = "overview" | "activity" | "finances" | "reviews";

export type TabData = {
  overview?: unknown;
  activity?: unknown;
  finances?: unknown;
  reviews?: unknown;
};

// Overview Tab Types
export type ProfessionalMetrics = {
  totalBookings: number;
  completedBookings: number;
  completionRate: number;
  avgRating: number;
  totalReviews: number;
};

export type CustomerMetrics = {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  addressCount: number;
  favoritesCount: number;
};

export type ExtractedProfessionalData = {
  profile: any;
  verification: any;
  services: any[];
  metrics: ProfessionalMetrics;
} | null;

export type ExtractedCustomerData = {
  metrics: CustomerMetrics;
} | null;

// Finance Tab Types
export type ProfessionalEarnings = {
  total: number;
  pending: number;
  completed: number;
};

export type StripeAccountStatus = {
  connected: boolean;
  verified: boolean;
  account_id: string | null;
};

export type ExtractedProfessionalFinances = {
  earnings: ProfessionalEarnings;
  stripe: StripeAccountStatus;
  payouts: any[];
  transactions: any[];
} | null;

export type CustomerSpending = {
  total: number;
  averagePerBooking: number;
  thisMonth: number;
};

export type ExtractedCustomerFinances = {
  spending: CustomerSpending;
  paymentMethods: any[];
  transactions: any[];
  spendingByCategory: any[];
} | null;
