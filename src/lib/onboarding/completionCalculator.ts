// Onboarding completion calculation helpers

type ProfessionalProfile = {
  bio?: string | null;
  years_of_experience?: number | null;
  references?: unknown;
  service_areas?: unknown[] | null;
  services?: unknown[] | null;
  default_availability?: unknown;
  portfolio_images?: unknown[] | null;
};

type OnboardingStatus = string | null | undefined;

/**
 * Configuration for onboarding steps with their point values
 */
const ONBOARDING_STEPS = {
  // Application fields (1 point each)
  application: [
    { field: "bio", points: 1, check: (p: ProfessionalProfile) => Boolean(p.bio) },
    {
      field: "years_of_experience",
      points: 1,
      check: (p: ProfessionalProfile) => Boolean(p.years_of_experience),
    },
    { field: "references", points: 1, check: (p: ProfessionalProfile) => Boolean(p.references) },
    {
      field: "service_areas",
      points: 1,
      check: (p: ProfessionalProfile) => (p.service_areas?.length ?? 0) > 0,
    },
  ],
  // Services (2 points)
  services: [
    {
      field: "services",
      points: 2,
      check: (p: ProfessionalProfile) => (p.services?.length ?? 0) > 0,
    },
  ],
  // Availability (2 points)
  availability: [
    {
      field: "default_availability",
      points: 2,
      check: (p: ProfessionalProfile) => Boolean(p.default_availability),
    },
  ],
  // Portfolio (2 points)
  portfolio: [
    {
      field: "portfolio_images",
      points: 2,
      check: (p: ProfessionalProfile) => (p.portfolio_images?.length ?? 0) > 0,
    },
  ],
} as const;

const TOTAL_POINTS = 10;

/**
 * Calculate onboarding completion percentage
 * Returns 100 if status is 'active', otherwise calculates based on completed steps
 */
export function calculateOnboardingCompletion(
  profile: ProfessionalProfile | null,
  onboardingStatus: OnboardingStatus
): number {
  // No profile = 0% completion
  if (!profile) {
    return 0;
  }

  // Active status = 100% completion
  if (onboardingStatus === "active") {
    return 100;
  }

  // Calculate completion based on completed steps
  const allSteps = [
    ...ONBOARDING_STEPS.application,
    ...ONBOARDING_STEPS.services,
    ...ONBOARDING_STEPS.availability,
    ...ONBOARDING_STEPS.portfolio,
  ];

  const completedPoints = allSteps.reduce(
    (total, step) => (step.check(profile) ? total + step.points : total),
    0
  );

  return Math.round((completedPoints / TOTAL_POINTS) * 100);
}
