import { trackEvent } from "./utils";

/**
 * Match Wizard Tracking - Track user flow through the matching wizard
 *
 * Epic G-3: Gate Match Wizard rollout with feature flags
 *
 * Events tracked:
 * 1. Match Wizard Started
 * 2. Match Wizard Step Completed (for each step)
 * 3. Match Wizard Skipped Step
 * 4. Match Wizard Completed
 * 5. Match Wizard Exited (abandoned)
 * 6. Match Selected (user clicked on a recommended professional)
 *
 * Funnel stages:
 * 1. Started → Location Step
 * 2. Service Step
 * 3. Home Details Step (optional)
 * 4. Timing & Budget Step (optional)
 * 5. Preferences Step (optional)
 * 6. Results Viewed
 * 7. Match Selected (conversion)
 */

export const matchWizardTracking = {
  /**
   * Track when user starts the Match Wizard
   */
  started: (props: { source?: "homepage" | "professionals" | "direct" }) => {
    trackEvent("Match Wizard Started", props);
  },

  /**
   * Track completion of each wizard step
   */
  stepCompleted: (props: {
    step: "location" | "service" | "home-details" | "timing-budget" | "preferences" | "results";
    stepNumber: number;
    data?: Record<string, any>;
  }) => {
    trackEvent("Match Wizard Step Completed", props);
  },

  /**
   * Track when user skips an optional step
   */
  stepSkipped: (props: {
    step: "home-details" | "timing-budget" | "preferences";
    stepNumber: number;
  }) => {
    trackEvent("Match Wizard Step Skipped", props);
  },

  /**
   * Track when user goes back to a previous step
   */
  stepBack: (props: { fromStep: string; toStep: string; currentStepNumber: number }) => {
    trackEvent("Match Wizard Step Back", props);
  },

  /**
   * Track when user completes the entire wizard (reaches results)
   */
  completed: (props: {
    totalStepsCompleted: number;
    stepsSkipped: number;
    timeSpent: number; // seconds
    finalData: {
      city?: string;
      serviceType?: string;
      budgetRange?: string;
      languagePreference?: string;
    };
  }) => {
    trackEvent("Match Wizard Completed", {
      ...props,
      value: props.totalStepsCompleted, // Use completed steps as value for goal tracking
    });
  },

  /**
   * Track when user exits the wizard without completing
   */
  exited: (props: {
    lastStep: string;
    stepNumber: number;
    progress: number; // percentage 0-100
    timeSpent: number; // seconds
  }) => {
    trackEvent("Match Wizard Exited", props);
  },

  /**
   * Track when user clicks on a recommended professional from results
   */
  matchSelected: (props: {
    professionalId: string;
    position: number; // 1-indexed position in results
    matchScore?: number; // if using scoring algorithm
    serviceType: string;
  }) => {
    trackEvent("Match Selected", {
      ...props,
      value: 1, // Successful conversion event
    });
  },

  /**
   * Track when user views results
   */
  resultsViewed: (props: { matchCount: number; filters?: Record<string, any> }) => {
    trackEvent("Match Results Viewed", props);
  },

  /**
   * Track when user restarts the wizard
   */
  restarted: (props: { fromStep: string; reason?: "unsatisfied" | "error" }) => {
    trackEvent("Match Wizard Restarted", props);
  },
};
