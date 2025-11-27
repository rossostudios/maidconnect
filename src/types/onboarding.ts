/**
 * Onboarding Checklist Types
 * Sprint 1 - Professional Experience Enhancement
 */

export type OnboardingItemId =
  | "profile_photo"
  | "services"
  | "availability"
  | "service_radius"
  | "bio"
  | "background_check"
  | "portfolio"
  | "certifications";

export type OnboardingItem = {
  id: OnboardingItemId;
  label: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
  verificationLink?: string;
};

export type OnboardingChecklist = {
  items: OnboardingItem[];
  lastUpdated: string;
};

export type OnboardingProgress = {
  completionPercentage: number;
  canAcceptBookings: boolean;
  completedItems: OnboardingItem[];
  pendingRequiredItems: OnboardingItem[];
};

/**
 * Server Action Response Types
 */
type MarkItemCompletedResponse = {
  success: boolean;
  updatedChecklist?: OnboardingChecklist;
  error?: string;
};

type GetOnboardingProgressResponse = {
  success: boolean;
  progress?: OnboardingProgress;
  error?: string;
};
