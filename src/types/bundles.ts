/**
 * Service Bundle Types
 * Sprint 1 - Professional Experience Enhancement
 */

export type BundleService = {
  serviceId: string;
  name: string;
  durationMinutes: number;
  basePriceCop: number;
};

export type ServiceBundle = {
  id: string;
  profileId: string;
  name: string;
  description: string | null;
  services: BundleService[];
  totalDurationMinutes: number;
  basePriceCop: number;
  discountPercentage: number;
  finalPriceCop: number;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Bundle Creation/Update Input
 */
type BundleInput = {
  name: string;
  description?: string;
  services: BundleService[];
  discountPercentage?: number;
};

/**
 * Bundle with Calculated Metrics
 */
type BundleWithMetrics = ServiceBundle & {
  savingsAmount: number;
  savingsPercentage: number;
  averageServiceDuration: number;
  isPopular: boolean; // true if usage_count > threshold
};

/**
 * Quick Quote from Bundle
 */
export type QuickQuote = {
  bundleId: string;
  bundleName: string;
  services: BundleService[];
  totalDurationMinutes: number;
  basePriceCop: number;
  discountPercentage: number;
  finalPriceCop: number;
  estimatedStartTime?: string;
  estimatedEndTime?: string;
};

/**
 * Server Action Response Types
 */
type CreateBundleResponse = {
  success: boolean;
  bundle?: ServiceBundle;
  error?: string;
};

type UpdateBundleResponse = {
  success: boolean;
  bundle?: ServiceBundle;
  error?: string;
};

type DeleteBundleResponse = {
  success: boolean;
  error?: string;
};

type GetBundlesResponse = {
  success: boolean;
  bundles?: ServiceBundle[];
  error?: string;
};

type GenerateQuickQuoteResponse = {
  success: boolean;
  quote?: QuickQuote;
  error?: string;
};
