/**
 * Admin User Details Tabs - Lia Design System
 *
 * Comprehensive tab-based UI for viewing professional and customer profiles
 * Features:
 * - Lazy loading per tab (data fetched only when tab is clicked)
 * - Role-aware content (Professional vs Customer views)
 * - Lia Design System compliant (Anthropic rounded corners, refined typography)
 * - Loading states with skeletons
 */

"use client";

import { Calendar03Icon, CreditCardIcon, Home09Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type definitions
type UserRole = "professional" | "customer" | "admin";

type BaseUser = {
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

type TabId = "overview" | "activity" | "finances" | "reviews";

type TabData = {
  overview?: unknown;
  activity?: unknown;
  finances?: unknown;
  reviews?: unknown;
};

type Props = {
  user: BaseUser;
  defaultTab?: TabId;
};

// Loading skeleton components
function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-neutral-200" />
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-4 w-3/4 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-4 w-5/6 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div className="rounded-lg border border-neutral-200 bg-white p-6" key={i}>
          <div className="mb-2 h-5 w-48 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function FinancesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-100" />
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div className="rounded-lg border border-neutral-200 bg-white p-6" key={i}>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-5 w-24 animate-pulse rounded-lg bg-neutral-200" />
          </div>
          <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

// --- Helper Types (extracted for complexity reduction) ---

type ProfessionalMetrics = {
  totalBookings: number;
  completedBookings: number;
  completionRate: number;
  avgRating: number;
  totalReviews: number;
};

type CustomerMetrics = {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  addressCount: number;
  favoritesCount: number;
};

type ExtractedProfessionalData = {
  profile: any;
  verification: any;
  services: any[];
  metrics: ProfessionalMetrics;
} | null;

type ExtractedCustomerData = {
  metrics: CustomerMetrics;
} | null;

// --- Helper Functions (extracted for complexity reduction) ---

const DEFAULT_PROFESSIONAL_METRICS: ProfessionalMetrics = {
  totalBookings: 0,
  completedBookings: 0,
  completionRate: 0,
  avgRating: 0,
  totalReviews: 0,
};

const DEFAULT_CUSTOMER_METRICS: CustomerMetrics = {
  totalBookings: 0,
  completedBookings: 0,
  totalSpent: 0,
  addressCount: 0,
  favoritesCount: 0,
};

function extractProfessionalData(apiData: any, isProfessional: boolean): ExtractedProfessionalData {
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

function extractCustomerData(apiData: any, isCustomer: boolean): ExtractedCustomerData {
  if (!(isCustomer && apiData?.customer)) {
    return null;
  }
  return {
    metrics: apiData.customer.metrics || DEFAULT_CUSTOMER_METRICS,
  };
}

function formatAvgRating(avgRating: number): string {
  return avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "N/A";
}

function getVerificationStatus(
  verification: any,
  field: "identity" | "documents"
): "verified" | "pending" {
  if (field === "identity") {
    return verification?.identity_verified ? "verified" : "pending";
  }
  return verification?.documents_verified ? "verified" : "pending";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- Finance Helper Types (for FinancesTab complexity reduction) ---

type ProfessionalEarnings = {
  total: number;
  pending: number;
  completed: number;
};

type StripeAccountStatus = {
  connected: boolean;
  verified: boolean;
  account_id: string | null;
};

type ExtractedProfessionalFinances = {
  earnings: ProfessionalEarnings;
  stripe: StripeAccountStatus;
  payouts: any[];
  transactions: any[];
} | null;

type CustomerSpending = {
  total: number;
  averagePerBooking: number;
  thisMonth: number;
};

type ExtractedCustomerFinances = {
  spending: CustomerSpending;
  paymentMethods: any[];
  transactions: any[];
  spendingByCategory: any[];
} | null;

// --- Finance Helper Functions ---

const DEFAULT_EARNINGS: ProfessionalEarnings = {
  total: 0,
  pending: 0,
  completed: 0,
};

const DEFAULT_STRIPE: StripeAccountStatus = {
  connected: false,
  verified: false,
  account_id: null,
};

const DEFAULT_SPENDING: CustomerSpending = {
  total: 0,
  averagePerBooking: 0,
  thisMonth: 0,
};

function extractProfessionalFinances(
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

function extractCustomerFinances(apiData: any, isCustomer: boolean): ExtractedCustomerFinances {
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

function getStripeStatusBadgeClass(
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

function getStripeConnectionText(connected: boolean): string {
  return connected ? "Connected" : "Not Connected";
}

function getStripeVerificationText(verified: boolean): string {
  return verified ? "Verified" : "Pending";
}

// Overview Tab - Lia Design System
// Professional, data-focused layout with sharp edges and clear hierarchy
// Memoized to prevent re-renders when other tabs change
const OverviewTab = memo(function OverviewTab({ user, data }: { user: BaseUser; data?: unknown }) {
  if (!data) {
    return <OverviewSkeleton />;
  }

  const isProfessional = user.role === "professional";
  const isCustomer = user.role === "customer";

  // Extract API data using helper functions
  const apiData = data as any;
  const professionalData = extractProfessionalData(apiData, isProfessional);
  const customerData = extractCustomerData(apiData, isCustomer);

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
          <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
            Profile Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            <DataField label="Email" value={user.email || "—"} />
            <DataField label="Phone" value={user.phone || "—"} />
            <DataField label="City" value={user.city || "—"} />
            <DataField label="Address" value={user.address || "—"} />
            <DataField
              label="Member Since"
              value={new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <DataField
              label="Role"
              value={
                <span className="inline-block rounded-full border border-neutral-900 bg-neutral-900 px-2 py-1 font-medium text-white text-xs tracking-wider">
                  {user.role}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* Professional-Specific Content */}
      {isProfessional && professionalData && (
        <>
          {/* Verification Status Card */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Verification Status
              </h3>
            </div>
            <div className="p-6">
              {professionalData.verification ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <VerificationBadge
                    label="Identity Verification"
                    status={getVerificationStatus(professionalData.verification, "identity")}
                  />
                  <VerificationBadge
                    label="Background Check"
                    status={professionalData.verification.background_check_status || "pending"}
                  />
                  <VerificationBadge
                    label="Documents"
                    status={getVerificationStatus(professionalData.verification, "documents")}
                  />
                </div>
              ) : (
                <p className="text-neutral-600 text-sm">No verification data available</p>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Performance Metrics
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-5">
                <MetricCard
                  label="Total Bookings"
                  value={professionalData.metrics.totalBookings.toString()}
                />
                <MetricCard
                  label="Completed"
                  value={professionalData.metrics.completedBookings.toString()}
                />
                <MetricCard
                  label="Completion Rate"
                  value={`${professionalData.metrics.completionRate}%`}
                />
                <MetricCard
                  label="Avg Rating"
                  value={formatAvgRating(professionalData.metrics.avgRating)}
                />
                <MetricCard
                  label="Total Reviews"
                  value={professionalData.metrics.totalReviews.toString()}
                />
              </div>
            </div>
          </div>

          {/* Services Offered */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Services Offered
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {professionalData.services.length > 0 ? (
                  professionalData.services.map((service: any, idx: number) => (
                    <span
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 font-medium text-neutral-900 text-sm"
                      key={service.id || idx}
                    >
                      {service.service_name || service.name || "Service"}
                    </span>
                  ))
                ) : (
                  <p className="text-neutral-600 text-sm">No services listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio/Description */}
          {professionalData.profile?.bio && (
            <div className="rounded-lg border border-neutral-200 bg-white">
              <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
                <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                  Bio
                </h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-700 leading-relaxed">{professionalData.profile.bio}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Customer-Specific Content */}
      {isCustomer && customerData && (
        <>
          {/* Customer Metrics */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Account Metrics
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-5">
                <MetricCard
                  label="Total Bookings"
                  value={customerData.metrics.totalBookings.toString()}
                />
                <MetricCard
                  label="Completed"
                  value={customerData.metrics.completedBookings.toString()}
                />
                <MetricCard
                  label="Total Spent"
                  value={formatCurrency(customerData.metrics.totalSpent)}
                />
                <MetricCard
                  label="Saved Addresses"
                  value={customerData.metrics.addressCount.toString()}
                />
                <MetricCard
                  label="Favorite Pros"
                  value={customerData.metrics.favoritesCount.toString()}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Utility Components - Lia Design System

function DataField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-2 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-600 text-xs tracking-wider">
        {label}
      </dt>
      <dd className="font-[family-name:var(--font-geist-sans)] text-neutral-900">{value}</dd>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <dt className="mb-2 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-600 text-xs tracking-wider">
        {label}
      </dt>
      <dd className="font-[family-name:var(--font-geist-sans)] font-medium text-3xl text-neutral-900 tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function VerificationBadge({ label, status }: { label: string; status: string }) {
  const statusConfig = {
    verified: { color: "bg-green-50 border-green-600 text-green-900", text: "Verified" },
    pending: { color: "bg-rausch-50 border-rausch-600 text-rausch-900", text: "Pending" },
    rejected: { color: "bg-red-50 border-red-600 text-red-900", text: "Rejected" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="mb-3 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm">
        {label}
      </p>
      <span
        className={`inline-block rounded-full border px-3 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${config.color}`}
      >
        {config.text}
      </span>
    </div>
  );
}

function _OnboardingStep({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <span className="font-[family-name:var(--font-geist-sans)] text-neutral-900">{label}</span>
      <span
        className={`inline-block rounded-full border px-3 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${
          complete
            ? "border-green-600 bg-green-50 text-green-900"
            : "border-neutral-300 bg-white text-neutral-600"
        }`}
      >
        {complete ? "Complete" : "Incomplete"}
      </span>
    </div>
  );
}

// Activity Tab - Lia Design System
// Professional-focused booking lists, portfolio, and customer addresses
// Memoized to prevent re-renders when other tabs change
const ActivityTab = memo(function ActivityTab({ user, data }: { user: BaseUser; data?: unknown }) {
  if (!data) {
    return <ActivitySkeleton />;
  }

  const isProfessional = user.role === "professional";
  const isCustomer = user.role === "customer";

  // Extract API data (from /api/admin/users/[id]/activity)
  const apiData = data as any;
  const professionalActivity =
    isProfessional && apiData?.professional
      ? {
          bookings: apiData.professional.bookings || [],
          portfolio: apiData.professional.portfolio || [],
        }
      : null;

  const customerActivity =
    isCustomer && apiData?.customer
      ? {
          bookings: apiData.customer.bookings || [],
          addresses: apiData.customer.addresses || [],
          favorites: apiData.customer.favorites || [],
        }
      : null;

  return (
    <div className="space-y-6">
      {/* Professional Content */}
      {isProfessional && professionalActivity && (
        <>
          {/* Bookings List */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Bookings
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {professionalActivity.bookings.map((booking) => (
                  <BookingCard
                    address={booking.address}
                    amount={booking.amount}
                    date={booking.date}
                    key={booking.id}
                    name={booking.customer_name}
                    service={booking.service}
                    status={booking.status as "upcoming" | "completed" | "cancelled"}
                    time={booking.time}
                    type="professional"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Gallery */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Portfolio
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {professionalActivity.portfolio.map((item) => (
                  <PortfolioCard image_url={item.image_url} key={item.id} title={item.title} />
                ))}
              </div>
              {professionalActivity.portfolio.length === 0 && (
                <p className="text-neutral-600 text-sm">No portfolio items added yet</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Customer Content */}
      {isCustomer && customerActivity && (
        <>
          {/* Bookings List */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Booking History
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {customerActivity.bookings.map((booking) => (
                  <BookingCard
                    amount={booking.amount}
                    date={booking.date}
                    key={booking.id}
                    name={booking.professional_name}
                    service={booking.service}
                    status={booking.status as "upcoming" | "completed" | "cancelled"}
                    time={booking.time}
                    type="customer"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Saved Addresses
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {customerActivity.addresses.map((address: any) => (
                  <AddressCard
                    address={address.street_address || ""}
                    city={address.city || ""}
                    is_default={address.is_default}
                    key={address.id}
                    label={address.address_type || "Address"}
                  />
                ))}
              </div>
              {customerActivity.addresses.length === 0 && (
                <p className="text-neutral-600 text-sm">No saved addresses</p>
              )}
            </div>
          </div>

          {/* Favorite Professionals */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Favorite Professionals
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {customerActivity.favorites.map((favorite: any) => (
                  <FavoriteCard
                    key={favorite.id}
                    name={favorite.name || "Unknown"}
                    services={favorite.specialties || []}
                  />
                ))}
              </div>
              {customerActivity.favorites.length === 0 && (
                <p className="text-neutral-600 text-sm">No favorite professionals</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Activity Tab Utility Components - Lia Design System

// Memoized to prevent re-renders in booking lists
const BookingCard = memo(function BookingCard({
  name,
  service,
  status,
  date,
  time,
  amount,
  address,
  type,
}: {
  name: string;
  service: string;
  status: "upcoming" | "completed" | "cancelled";
  date: string;
  time: string;
  amount: number;
  address?: string;
  type: "professional" | "customer";
}) {
  const statusConfig = {
    upcoming: { color: "bg-babu-50 border-babu-600 text-babu-900", text: "Upcoming" },
    completed: { color: "bg-green-50 border-green-600 text-green-900", text: "Completed" },
    cancelled: { color: "bg-red-50 border-red-600 text-red-900", text: "Cancelled" },
  };

  const config = statusConfig[status];

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="mb-1 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
            {type === "professional" ? `Customer: ${name}` : `Professional: ${name}`}
          </p>
          <p className="text-neutral-700 text-sm">{service}</p>
        </div>
        <span
          className={`inline-block rounded-full border px-3 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${config.color}`}
        >
          {config.text}
        </span>
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <p className="text-neutral-700">
          <span className="font-medium text-neutral-900">Date:</span> {date} at {time}
        </p>
        <p className="text-neutral-700">
          <span className="font-medium text-neutral-900">Amount:</span>{" "}
          {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(amount)}
        </p>
        {address && (
          <p className="text-neutral-700 md:col-span-2">
            <span className="font-medium text-neutral-900">Address:</span> {address}
          </p>
        )}
      </div>
    </div>
  );
});

function PortfolioCard({ image_url, title }: { image_url: string; title: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="aspect-video rounded-t-lg bg-neutral-100">
        {/* Placeholder for image - will use Next Image in real implementation */}
        <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
          {image_url}
        </div>
      </div>
      <div className="border-neutral-200 border-t p-3">
        <p className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm">
          {title}
        </p>
      </div>
    </div>
  );
}

function AddressCard({
  label,
  address,
  city,
  is_default,
}: {
  label: string;
  address: string;
  city: string;
  is_default: boolean;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
          {label}
        </p>
        {is_default && (
          <span className="inline-block rounded-full border border-rausch-600 bg-rausch-50 px-2 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-rausch-900 text-xs tracking-wider">
            Default
          </span>
        )}
      </div>
      <p className="text-neutral-700 text-sm">{address}</p>
      <p className="text-neutral-600 text-sm">{city}</p>
    </div>
  );
}

function FavoriteCard({ name, services }: { name: string; services: string[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="mb-2 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
        {name}
      </p>
      <div className="flex flex-wrap gap-2">
        {services.map((service, idx) => (
          <span
            className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-neutral-700 text-xs"
            key={idx}
          >
            {service}
          </span>
        ))}
      </div>
    </div>
  );
}

// Finances Tab - Lia Design System
// Professional earnings/payouts and customer spending/payment methods
// Memoized to prevent re-renders when other tabs change
const FinancesTab = memo(function FinancesTab({ user, data }: { user: BaseUser; data?: unknown }) {
  if (!data) {
    return <FinancesSkeleton />;
  }

  const isProfessional = user.role === "professional";
  const isCustomer = user.role === "customer";

  // Extract API data using helper functions (from /api/admin/users/[id]/finances)
  const apiData = data as any;
  const professionalFinances = extractProfessionalFinances(apiData, isProfessional);
  const customerFinances = extractCustomerFinances(apiData, isCustomer);

  return (
    <div className="space-y-6">
      {/* Professional Content */}
      {isProfessional && professionalFinances && (
        <>
          {/* Earnings Overview */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Earnings Overview
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <MetricCard
                  label="Total Earnings"
                  value={formatCurrency(professionalFinances.earnings.total)}
                />
                <MetricCard
                  label="Pending Payouts"
                  value={formatCurrency(professionalFinances.earnings.pending)}
                />
                <MetricCard
                  label="Completed Payouts"
                  value={formatCurrency(professionalFinances.earnings.completed)}
                />
              </div>
            </div>
          </div>

          {/* Stripe Account Status */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Stripe Account Status
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
                <DataField
                  label="Connection Status"
                  value={
                    <span
                      className={getStripeStatusBadgeClass(
                        professionalFinances.stripe.connected,
                        "connection"
                      )}
                    >
                      {getStripeConnectionText(professionalFinances.stripe.connected)}
                    </span>
                  }
                />
                <DataField
                  label="Verification Status"
                  value={
                    <span
                      className={getStripeStatusBadgeClass(
                        professionalFinances.stripe.verified,
                        "verification"
                      )}
                    >
                      {getStripeVerificationText(professionalFinances.stripe.verified)}
                    </span>
                  }
                />
                <DataField
                  label="Account ID"
                  value={
                    <span className="font-mono text-sm">
                      {professionalFinances.stripe.account_id}
                    </span>
                  }
                />
              </div>
            </div>
          </div>

          {/* Payout History */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Payout History
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {professionalFinances.payouts.map((payout: any) => (
                  <PayoutCard
                    amount={payout.amount}
                    date={new Date(payout.payout_date).toLocaleDateString()}
                    key={payout.id}
                    method="Bank Transfer"
                    status={payout.status as "completed" | "pending" | "failed"}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm uppercase tracking-wider">
                Recent Transactions
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {professionalFinances.transactions.map((transaction) => (
                  <TransactionCard
                    amount={transaction.amount}
                    date={transaction.date}
                    description={transaction.description}
                    key={transaction.id}
                    status={transaction.status}
                    type={transaction.type}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Customer Content */}
      {isCustomer && customerFinances && (
        <>
          {/* Spending Overview */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Spending Overview
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <MetricCard
                  label="Total Spent"
                  value={formatCurrency(customerFinances.spending.total)}
                />
                <MetricCard
                  label="Avg Per Booking"
                  value={formatCurrency(customerFinances.spending.averagePerBooking)}
                />
                <MetricCard
                  label="This Month"
                  value={formatCurrency(customerFinances.spending.thisMonth)}
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Payment Methods
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {customerFinances.paymentMethods.map((method) => (
                  <PaymentMethodCard
                    brand={method.brand}
                    expiry={method.expiry}
                    is_default={method.is_default}
                    key={method.id}
                    last4={method.last4}
                    type={method.type}
                  />
                ))}
              </div>
              {customerFinances.paymentMethods.length === 0 && (
                <p className="text-neutral-600 text-sm">No payment methods on file</p>
              )}
            </div>
          </div>

          {/* Spending by Category */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Spending by Category
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {customerFinances.spendingByCategory.map((category, idx) => (
                  <div
                    className="flex items-center justify-between border-neutral-100 border-b pb-3 last:border-0 last:pb-0"
                    key={idx}
                  >
                    <span className="font-[family-name:var(--font-geist-sans)] text-neutral-900">
                      {category.category}
                    </span>
                    <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 tabular-nums">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Recent Transactions
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {customerFinances.transactions.map((transaction) => (
                  <TransactionCard
                    amount={transaction.amount}
                    date={transaction.date}
                    description={transaction.description}
                    key={transaction.id}
                    status={transaction.status}
                    type={transaction.type}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Finances Tab Utility Components - Lia Design System

function PayoutCard({
  amount,
  status,
  date,
  method,
}: {
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  method: string;
}) {
  const statusConfig = {
    completed: { color: "bg-green-50 border-green-600 text-green-900", text: "Completed" },
    pending: { color: "bg-rausch-50 border-rausch-600 text-rausch-900", text: "Pending" },
    failed: { color: "bg-red-50 border-red-600 text-red-900", text: "Failed" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div>
        <p className="mb-1 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 tabular-nums">
          {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(amount)}
        </p>
        <p className="text-neutral-700 text-sm">
          {date} · {method}
        </p>
      </div>
      <span
        className={`inline-block rounded-full border px-3 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${config.color}`}
      >
        {config.text}
      </span>
    </div>
  );
}

function PaymentMethodCard({
  type,
  brand,
  last4,
  expiry,
  is_default,
}: {
  type: string;
  brand: string;
  last4: string;
  expiry: string;
  is_default: boolean;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
            {brand} •••• {last4}
          </span>
        </div>
        {is_default && (
          <span className="inline-block rounded-full border border-rausch-600 bg-rausch-50 px-2 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-rausch-900 text-xs tracking-wider">
            Default
          </span>
        )}
      </div>
      <p className="text-neutral-600 text-sm">Expires {expiry}</p>
    </div>
  );
}

// Memoized to prevent re-renders in transaction lists
const TransactionCard = memo(function TransactionCard({
  type,
  description,
  amount,
  date,
  status,
}: {
  type: string;
  description: string;
  amount: number;
  date: string;
  status: string;
}) {
  const isNegative = amount < 0;

  // Helper function to get type label
  const getTypeLabel = (t: string): string => {
    if (t === "booking") {
      return "Booking";
    }
    if (t === "fee") {
      return "Fee";
    }
    return "Tip";
  };

  // Helper function to get type color classes
  const getTypeColor = (t: string): string => {
    if (t === "booking") {
      return "border-babu-600 bg-babu-50 text-babu-900";
    }
    if (t === "fee") {
      return "border-red-600 bg-red-50 text-red-900";
    }
    return "border-green-600 bg-green-50 text-green-900";
  };

  const typeLabel = getTypeLabel(type);
  const typeColor = getTypeColor(type);

  return (
    <div className="flex items-center justify-between border-neutral-100 border-b pb-3 last:border-0 last:pb-0">
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`inline-block rounded-full border px-2 py-0.5 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${typeColor}`}
          >
            {typeLabel}
          </span>
          <span className="font-[family-name:var(--font-geist-sans)] text-neutral-900 text-sm">
            {description}
          </span>
        </div>
        <p className="text-neutral-600 text-xs">{date}</p>
      </div>
      <span
        className={`font-[family-name:var(--font-geist-sans)] font-medium tabular-nums ${
          isNegative ? "text-red-900" : "text-green-900"
        }`}
      >
        {isNegative ? "-" : "+"}
        {new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        }).format(Math.abs(amount))}
      </span>
    </div>
  );
});

// Reviews Tab - Lia Design System
// Professional reviews received and customer reviews given
// Memoized to prevent re-renders when other tabs change
const ReviewsTab = memo(function ReviewsTab({ user, data }: { user: BaseUser; data?: unknown }) {
  if (!data) {
    return <ReviewsSkeleton />;
  }

  const isProfessional = user.role === "professional";
  const isCustomer = user.role === "customer";

  // Extract API data
  const apiData = data as any;
  const professionalReviews =
    isProfessional && apiData?.professional
      ? {
          stats: apiData.professional.stats || {
            averageRating: 0,
            totalReviews: 0,
            responseRate: 0,
          },
          ratingBreakdown: apiData.professional.ratingBreakdown || [],
          reviews: apiData.professional.reviews || [],
        }
      : null;

  const customerReviews =
    isCustomer && apiData?.customer
      ? {
          stats: {
            averageRatingGiven: apiData.customer.stats?.averageRating || 0,
            totalReviewsGiven: apiData.customer.stats?.totalReviews || 0,
          },
          reviews: apiData.customer.reviews || [],
        }
      : null;

  return (
    <div className="space-y-6">
      {/* Professional Content */}
      {isProfessional && professionalReviews && (
        <>
          {/* Rating Overview */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Rating Overview
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <MetricCard
                  label="Average Rating"
                  value={`${professionalReviews.stats.averageRating.toFixed(1)} ★`}
                />
                <MetricCard
                  label="Total Reviews"
                  value={professionalReviews.stats.totalReviews.toString()}
                />
                <MetricCard
                  label="Response Rate"
                  value={`${professionalReviews.stats.responseRate}%`}
                />
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Rating Breakdown
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {professionalReviews.ratingBreakdown.map((item) => (
                  <RatingBreakdownBar
                    count={item.count}
                    key={item.stars}
                    stars={item.stars}
                    total={professionalReviews.stats.totalReviews}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Recent Reviews
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {professionalReviews.reviews.map((review) => (
                  <ReviewCard
                    comment={review.comment}
                    date={review.date}
                    key={review.id}
                    name={review.customer_name}
                    rating={review.rating}
                    response={review.response}
                    service={review.service}
                    type="received"
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Customer Content */}
      {isCustomer && customerReviews && (
        <>
          {/* Rating Stats */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Review Stats
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <MetricCard
                  label="Average Rating Given"
                  value={`${customerReviews.stats.averageRatingGiven.toFixed(1)} ★`}
                />
                <MetricCard
                  label="Total Reviews"
                  value={customerReviews.stats.totalReviewsGiven.toString()}
                />
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
              <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
                Reviews Given
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {customerReviews.reviews.map((review) => (
                  <ReviewCard
                    comment={review.comment}
                    date={review.date}
                    key={review.id}
                    name={review.professional_name}
                    rating={review.rating}
                    service={review.service}
                    type="given"
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Reviews Tab Utility Components - Lia Design System

function RatingBreakdownBar({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <span className="w-16 font-[family-name:var(--font-geist-sans)] text-neutral-900 text-sm">
        {stars} ★
      </span>
      <div className="h-2 flex-1 rounded-lg bg-neutral-100">
        <div className="h-full rounded-lg bg-rausch-500" style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-12 text-right font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm tabular-nums">
        {count}
      </span>
    </div>
  );
}

// Memoized to prevent re-renders in review lists
const ReviewCard = memo(function ReviewCard({
  name,
  rating,
  comment,
  date,
  service,
  response,
  type,
}: {
  name: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  response?: string | null;
  type: "received" | "given";
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="mb-1 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900">
            {type === "received" ? `From: ${name}` : `To: ${name}`}
          </p>
          <p className="text-neutral-600 text-sm">{service}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-geist-sans)] font-medium text-lg text-neutral-900 tabular-nums">
            {rating.toFixed(1)}
          </span>
          <span className="text-rausch-500 text-xl">★</span>
        </div>
      </div>

      <p className="mb-3 text-neutral-700 leading-relaxed">{comment}</p>

      <p className="text-neutral-600 text-sm">{new Date(date).toLocaleDateString()}</p>

      {response && (
        <div className="mt-4 border-rausch-500 border-l-2 bg-white py-2 pl-4">
          <p className="mb-1 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-xs tracking-wider">
            Professional Response
          </p>
          <p className="text-neutral-700 text-sm">{response}</p>
        </div>
      )}
    </div>
  );
});

/**
 * Main Tabs Component
 *
 * Features:
 * - Lazy loads data per tab (only fetches when tab is clicked)
 * - Caches fetched data to avoid redundant API calls
 * - Shows loading skeletons while data is being fetched
 * - Adapts content based on user role (professional vs customer)
 */
export function UserDetailsTabs({ user, defaultTab = "overview" }: Props) {
  const [_activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [tabData, setTabData] = useState<TabData>({});
  const [loadingTabs, setLoadingTabs] = useState<Set<TabId>>(new Set());

  // Lazy load tab data when tab is clicked
  const loadTabData = useCallback(
    async (tabId: TabId) => {
      // Skip if already loaded
      if (tabData[tabId]) {
        return;
      }

      // Skip if already loading
      if (loadingTabs.has(tabId)) {
        return;
      }

      // Mark as loading
      setLoadingTabs((prev) => new Set(prev).add(tabId));

      try {
        // Fetch data for this tab
        const response = await fetch(`/api/admin/users/${user.id}/${tabId}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${tabId} data`);
        }

        const data = await response.json();

        // Cache the data
        setTabData((prev) => ({
          ...prev,
          [tabId]: data,
        }));
      } catch (error) {
        console.error(`Error loading ${tabId} tab:`, error);
      } finally {
        // Remove from loading state
        setLoadingTabs((prev) => {
          const next = new Set(prev);
          next.delete(tabId);
          return next;
        });
      }
    },
    [user.id, tabData, loadingTabs]
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (value: string) => {
      const tabId = value as TabId;
      setActiveTab(tabId);
      loadTabData(tabId);
    },
    [loadTabData]
  );

  // Load default tab data on mount
  useState(() => {
    loadTabData(defaultTab);
  });

  const _isProfessional = user.role === "professional";

  return (
    <Tabs className="w-full" defaultValue={defaultTab} onValueChange={handleTabChange}>
      {/* Tab Navigation - Anthropic-inspired Lia Design System */}
      <TabsList className="w-full justify-start border-neutral-200 border-b bg-white">
        <TabsTrigger className="gap-2" value="overview">
          <HugeiconsIcon className="h-4 w-4" icon={Home09Icon} />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger className="gap-2" value="activity">
          <HugeiconsIcon className="h-4 w-4" icon={Calendar03Icon} />
          <span>Activity</span>
        </TabsTrigger>
        <TabsTrigger className="gap-2" value="finances">
          <HugeiconsIcon className="h-4 w-4" icon={CreditCardIcon} />
          <span>Finances</span>
        </TabsTrigger>
        <TabsTrigger className="gap-2" value="reviews">
          <HugeiconsIcon className="h-4 w-4" icon={StarIcon} />
          <span>Reviews</span>
        </TabsTrigger>
      </TabsList>

      {/* Tab Content - Each tab loads its own data */}
      <TabsContent value="overview">
        <OverviewTab data={tabData.overview} user={user} />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityTab data={tabData.activity} user={user} />
      </TabsContent>

      <TabsContent value="finances">
        <FinancesTab data={tabData.finances} user={user} />
      </TabsContent>

      <TabsContent value="reviews">
        <ReviewsTab data={tabData.reviews} user={user} />
      </TabsContent>
    </Tabs>
  );
}
