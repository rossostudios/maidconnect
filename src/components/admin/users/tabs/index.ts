/**
 * User Details Tabs - Barrel Exports
 *
 * Clean module structure for admin user detail tabs
 */

export { ActivityTab } from "./activity-tab";
export { FinancesTab } from "./finances-tab";
// Helper exports
export {
  DEFAULT_CUSTOMER_METRICS,
  DEFAULT_EARNINGS,
  DEFAULT_PROFESSIONAL_METRICS,
  DEFAULT_SPENDING,
  DEFAULT_STRIPE,
  extractCustomerData,
  extractCustomerFinances,
  extractProfessionalData,
  extractProfessionalFinances,
  formatAvgRating,
  getStripeConnectionText,
  getStripeStatusBadgeClass,
  getStripeVerificationText,
  getVerificationStatus,
} from "./helpers";
// Tab component exports
export { OverviewTab } from "./overview-tab";
export { ReviewsTab } from "./reviews-tab";
// Shared component exports
export { DataField, MetricCard, SectionCard, VerificationBadge } from "./shared-components";
// Skeleton exports
export {
  ActivitySkeleton,
  FinancesSkeleton,
  OverviewSkeleton,
  ReviewsSkeleton,
} from "./skeletons";
// Type exports
export type {
  BaseUser,
  CustomerMetrics,
  CustomerSpending,
  ExtractedCustomerData,
  ExtractedCustomerFinances,
  ExtractedProfessionalData,
  ExtractedProfessionalFinances,
  ProfessionalEarnings,
  ProfessionalMetrics,
  StripeAccountStatus,
  TabData,
  TabId,
  UserRole,
} from "./types";
