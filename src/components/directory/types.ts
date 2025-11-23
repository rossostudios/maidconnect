/**
 * Professional Directory Types
 *
 * Type definitions for the professional directory feature.
 */

import type { CountryCode } from "@/lib/shared/config/territories";

/**
 * Verification level for professionals
 */
export type VerificationLevel = "basic" | "standard" | "premium" | "elite" | "unverified";

/**
 * Video intro status
 */
export type IntroVideoStatus = "none" | "pending_review" | "approved" | "rejected";

/**
 * Professional data for directory listing
 */
export type DirectoryProfessional = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;

  // Location
  country: CountryCode | null;
  city: string | null;
  neighborhood: string | null;
  locationLabel: string; // Formatted "City, Country" string

  // Service info
  primaryService: string | null;
  services: string[];
  hourlyRateCents: number | null;
  currency: string;

  // Experience & availability
  experienceYears: number | null;
  languages: string[];
  isAvailableToday: boolean;

  // Ratings & reviews
  averageRating: number | null;
  totalReviews: number;
  totalBookings: number;

  // Verification
  verificationLevel: VerificationLevel;
  isBackgroundChecked: boolean;
  isDocumentsVerified: boolean;
  isInterviewCompleted: boolean;
  isReferencesVerified: boolean;

  // Video intro
  introVideoUrl: string | null;
  introVideoStatus: IntroVideoStatus;

  // Geo coordinates (for map view)
  latitude: number | null;
  longitude: number | null;
};

/**
 * Professional card display size variants
 */
export type CardSize = "sm" | "md" | "lg";

/**
 * API response for directory listing
 */
export type DirectoryResponse = {
  professionals: DirectoryProfessional[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

/**
 * Filter counts for faceted search
 */
export type FilterCounts = {
  services: Array<{ value: string; label: string; count: number }>;
  cities: Array<{ value: string; label: string; count: number }>;
  countries: Array<{ value: string; label: string; count: number }>;
  priceRange: { min: number; max: number };
  ratingDistribution: Array<{ rating: number; count: number }>;
};
