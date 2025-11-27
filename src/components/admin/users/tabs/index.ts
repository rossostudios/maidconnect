/**
 * User Details Tabs - Barrel Exports
 *
 * Clean module structure for admin user detail tabs
 */

// Type exports
export type {
  UserRole,
  BaseUser,
  TabId,
  TabData,
  ProfessionalMetrics,
  CustomerMetrics,
  ExtractedProfessionalData,
  ExtractedCustomerData,
  ProfessionalEarnings,
  StripeAccountStatus,
  ExtractedProfessionalFinances,
  CustomerSpending,
  ExtractedCustomerFinances,
} from "./types";

// Helper exports
export {
  DEFAULT_PROFESSIONAL_METRICS,
  DEFAULT_CUSTOMER_METRICS,
  DEFAULT_EARNINGS,
  DEFAULT_STRIPE,
  DEFAULT_SPENDING,
  extractProfessionalData,
  extractCustomerData,
  formatAvgRating,
  getVerificationStatus,
  extractProfessionalFinances,
  extractCustomerFinances,
  getStripeStatusBadgeClass,
  getStripeConnectionText,
  getStripeVerificationText,
} from "./helpers";

// Skeleton exports
export {
  OverviewSkeleton,
  ActivitySkeleton,
  FinancesSkeleton,
  ReviewsSkeleton,
} from "./skeletons";

// Shared component exports
export { DataField, MetricCard, VerificationBadge, SectionCard } from "./shared-components";

// Tab component exports
export { OverviewTab } from "./overview-tab";
export { ActivityTab } from "./activity-tab";
export { FinancesTab } from "./finances-tab";
export { ReviewsTab } from "./reviews-tab";
