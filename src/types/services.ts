/**
 * Service Management Types
 * Sprint 3: Service Management
 */

// ============================================================================
// Core Service Types
// ============================================================================

export type ServiceType = "one-time" | "recurring" | "package";
export type PricingUnit = "hour" | "day" | "job" | "week" | "month";
export type PricingAdjustmentType = "fixed" | "percentage";
export type AddonPricingType = "fixed" | "per_hour" | "per_item";

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parentCategoryId: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalService = {
  id: string;
  profileId: string;
  categoryId: string | null;

  // Service Details
  name: string;
  description: string | null;
  serviceType: ServiceType;

  // Pricing
  basePriceCop: number;
  pricingUnit: PricingUnit;

  // Duration
  estimatedDurationMinutes: number | null;
  minDurationMinutes: number | null;
  maxDurationMinutes: number | null;

  // Availability
  isActive: boolean;
  isFeatured: boolean;

  // Booking Settings
  requiresApproval: boolean;
  advanceBookingHours: number;
  maxBookingDaysAhead: number;

  // Additional Info
  requirements: string[]; // Array of requirements/notes
  includedItems: string[]; // What's included in base price

  // Metrics
  bookingCount: number;
  averageRating: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
};

export type ServicePricingTier = {
  id: string;
  serviceId: string;

  // Tier Details
  tierName: string; // e.g., 'Basic', 'Standard', 'Premium'
  tierLevel: number; // 1=Basic, 2=Standard, 3=Premium
  description: string | null;

  // Pricing
  priceCop: number;
  pricingAdjustmentType: PricingAdjustmentType;
  pricingAdjustmentValue: number;

  // Features
  features: string[]; // Array of included features
  maxAreaSqm: number | null; // For cleaning services
  maxHours: number | null; // For hourly services

  // Availability
  isActive: boolean;
  isDefault: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
};

export type ServiceAddon = {
  id: string;
  serviceId: string;

  // Add-on Details
  name: string;
  description: string | null;

  // Pricing
  priceCop: number;
  pricingType: AddonPricingType;

  // Duration Impact
  additionalDurationMinutes: number;

  // Availability
  isActive: boolean;
  isRequired: boolean;
  maxQuantity: number;

  // Display
  displayOrder: number;
  icon: string | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Input Types for Creating/Updating
// ============================================================================

export type ServiceInput = {
  name: string;
  description?: string;
  categoryId?: string;
  serviceType: ServiceType;
  basePriceCop: number;
  pricingUnit: PricingUnit;
  estimatedDurationMinutes?: number;
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  requiresApproval?: boolean;
  advanceBookingHours?: number;
  maxBookingDaysAhead?: number;
  requirements?: string[];
  includedItems?: string[];
};

type PricingTierInput = {
  tierName: string;
  tierLevel: number;
  description?: string;
  priceCop: number;
  pricingAdjustmentType?: PricingAdjustmentType;
  pricingAdjustmentValue?: number;
  features?: string[];
  maxAreaSqm?: number;
  maxHours?: number;
  isDefault?: boolean;
};

type AddonInput = {
  name: string;
  description?: string;
  priceCop: number;
  pricingType?: AddonPricingType;
  additionalDurationMinutes?: number;
  isRequired?: boolean;
  maxQuantity?: number;
  displayOrder?: number;
  icon?: string;
};

// ============================================================================
// Composite Types
// ============================================================================

export type ServiceWithDetails = ProfessionalService & {
  category: ServiceCategory | null;
  pricingTiers: ServicePricingTier[];
  addons: ServiceAddon[];
  professionalName?: string;
  professionalRating?: number;
};

export type ServicePriceCalculation = {
  basePrice: number;
  tierPrice: number;
  addonsPrice: number;
  totalPrice: number;
  estimatedDurationMinutes: number;
};

export type ServicesSummary = {
  totalServices: number;
  activeServices: number;
  featuredServices: number;
  totalBookings: number;
  averageRating: number;
};

export type ServiceByCategory = {
  serviceId: string;
  serviceName: string;
  serviceDescription: string | null;
  basePriceCop: number;
  pricingUnit: string;
  professionalId: string;
  professionalName: string;
  professionalRating: number;
  categoryName: string;
};

// ============================================================================
// Server Action Response Types
// ============================================================================

type CreateServiceResponse =
  | {
      success: true;
      service: ProfessionalService;
    }
  | {
      success: false;
      error: string;
    };

type UpdateServiceResponse =
  | {
      success: true;
      service: ProfessionalService;
    }
  | {
      success: false;
      error: string;
    };

type DeleteServiceResponse =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

type GetServicesResponse =
  | {
      success: true;
      services: ProfessionalService[];
    }
  | {
      success: false;
      error: string;
    };

type GetServiceDetailsResponse =
  | {
      success: true;
      service: ServiceWithDetails;
    }
  | {
      success: false;
      error: string;
    };

type GetServiceCategoriesResponse =
  | {
      success: true;
      categories: ServiceCategory[];
    }
  | {
      success: false;
      error: string;
    };

type CreatePricingTierResponse =
  | {
      success: true;
      tier: ServicePricingTier;
    }
  | {
      success: false;
      error: string;
    };

type CreateAddonResponse =
  | {
      success: true;
      addon: ServiceAddon;
    }
  | {
      success: false;
      error: string;
    };

type CalculateServicePriceResponse =
  | {
      success: true;
      calculation: ServicePriceCalculation;
    }
  | {
      success: false;
      error: string;
    };

type GetServicesSummaryResponse =
  | {
      success: true;
      summary: ServicesSummary;
    }
  | {
      success: false;
      error: string;
    };

type GetServicesByCategoryResponse =
  | {
      success: true;
      services: ServiceByCategory[];
      totalCount: number;
    }
  | {
      success: false;
      error: string;
    };
