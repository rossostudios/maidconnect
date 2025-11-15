/**
 * Feature Flag Testing Utilities
 *
 * Utilities for testing components and features with feature flags.
 * Use in unit tests, E2E tests, and Storybook stories.
 *
 * @module posthog/testing
 */

import type { FeatureFlagKey, FeatureFlagValue } from "@/lib/shared/config/feature-flags";
import { FEATURE_FLAGS, HERO_VARIANTS } from "@/lib/shared/config/feature-flags";

/**
 * Mock feature flag state for testing
 */
export interface MockFeatureFlags {
  [key: string]: FeatureFlagValue;
}

/**
 * Default test feature flags
 * All flags disabled by default for predictable test behavior
 */
export const DEFAULT_TEST_FLAGS: MockFeatureFlags = {
  [FEATURE_FLAGS.HERO_VARIANT]: HERO_VARIANTS.CONTROL,
  [FEATURE_FLAGS.MATCH_WIZARD_ENABLED]: false,
  [FEATURE_FLAGS.ONE_TAP_REBOOK]: false,
  [FEATURE_FLAGS.ENHANCED_SEARCH]: false,
  [FEATURE_FLAGS.PREMIUM_FEATURES]: false,
  [FEATURE_FLAGS.NEW_CHECKOUT_FLOW]: false,
};

/**
 * Create mock PostHog client for testing
 *
 * @param flags - Feature flag overrides
 * @returns Mock PostHog client
 *
 * @example
 * const mockPostHog = createMockPostHog({
 *   match_wizard_enabled: true,
 *   hero_variant: 'variant_a'
 * });
 */
export function createMockPostHog(flags: MockFeatureFlags = {}) {
  const allFlags = { ...DEFAULT_TEST_FLAGS, ...flags };

  return {
    isFeatureEnabled: (key: string) => Boolean(allFlags[key]),
    getFeatureFlag: (key: string) => allFlags[key],
    getAllFlags: () => allFlags,
    reloadFeatureFlags: (callback?: () => void) => {
      callback?.();
      return Promise.resolve();
    },
    featureFlags: {
      override: (overrides: MockFeatureFlags | false) => {
        if (overrides === false) {
          Object.keys(allFlags).forEach((key) => delete allFlags[key]);
          Object.assign(allFlags, DEFAULT_TEST_FLAGS);
        } else {
          Object.assign(allFlags, overrides);
        }
      },
    },
    capture: () => {},
    identify: () => {},
    reset: () => {},
  };
}

/**
 * Create feature flag test context
 * Useful for wrapping components in tests
 *
 * @param flags - Feature flag overrides
 * @returns Mock PostHog instance and helper functions
 *
 * @example
 * const { mockPostHog, enableFlag, disableFlag } = createFeatureFlagContext({
 *   match_wizard_enabled: true
 * });
 *
 * enableFlag('one_tap_rebook');
 * disableFlag('match_wizard_enabled');
 */
export function createFeatureFlagContext(flags: MockFeatureFlags = {}) {
  const mockPostHog = createMockPostHog(flags);

  return {
    mockPostHog,
    enableFlag: (key: FeatureFlagKey) => {
      mockPostHog.featureFlags.override({ [key]: true });
    },
    disableFlag: (key: FeatureFlagKey) => {
      mockPostHog.featureFlags.override({ [key]: false });
    },
    setFlag: (key: FeatureFlagKey, value: FeatureFlagValue) => {
      mockPostHog.featureFlags.override({ [key]: value });
    },
    resetFlags: () => {
      mockPostHog.featureFlags.override(false);
    },
  };
}

/**
 * Playwright test utilities
 */

/**
 * Set feature flags in Playwright tests
 * Call this before navigating to pages that use feature flags
 *
 * @param page - Playwright page object
 * @param flags - Feature flag overrides
 *
 * @example
 * import { test } from '@playwright/test';
 * import { setPlaywrightFeatureFlags } from '@/lib/integrations/posthog/testing';
 *
 * test('hero variant A shows alternative CTA', async ({ page }) => {
 *   await setPlaywrightFeatureFlags(page, {
 *     hero_variant: 'variant_a'
 *   });
 *   await page.goto('/');
 *   // Test variant A behavior
 * });
 */
export async function setPlaywrightFeatureFlags(page: any, flags: MockFeatureFlags): Promise<void> {
  await page.addInitScript((flagsData: MockFeatureFlags) => {
    // Mock PostHog on window before page loads
    (window as any).__POSTHOG_TEST_FLAGS__ = flagsData;

    // Override PostHog methods
    const originalPostHog = (window as any).posthog;
    if (originalPostHog) {
      originalPostHog.isFeatureEnabled = (key: string) => Boolean(flagsData[key]);
      originalPostHog.getFeatureFlag = (key: string) => flagsData[key];
      originalPostHog.getAllFlags = () => flagsData;
    }
  }, flags);
}

/**
 * Storybook decorators
 */

/**
 * Feature flag decorator for Storybook stories
 * Wraps stories with mock feature flag context
 *
 * @param flags - Feature flag overrides
 * @returns Storybook decorator function
 *
 * @example
 * // In .storybook/preview.tsx or individual stories
 * export const decorators = [
 *   withFeatureFlags({
 *     match_wizard_enabled: true,
 *     hero_variant: 'variant_a'
 *   })
 * ];
 */
export function withFeatureFlags(flags: MockFeatureFlags = {}) {
  return (Story: any) => {
    // Set up mock PostHog before story renders
    if (typeof window !== "undefined") {
      const mockPostHog = createMockPostHog(flags);
      (window as any).posthog = mockPostHog;
    }

    return Story();
  };
}

/**
 * Test scenarios for common feature flag combinations
 */

/**
 * Hero A/B test scenarios
 */
export const HERO_TEST_SCENARIOS = {
  control: {
    name: "Hero Control (Original)",
    flags: { [FEATURE_FLAGS.HERO_VARIANT]: HERO_VARIANTS.CONTROL },
  },
  variantA: {
    name: "Hero Variant A",
    flags: { [FEATURE_FLAGS.HERO_VARIANT]: HERO_VARIANTS.VARIANT_A },
  },
} as const;

/**
 * Match Wizard test scenarios
 */
export const MATCH_WIZARD_TEST_SCENARIOS = {
  disabled: {
    name: "Match Wizard Disabled",
    flags: { [FEATURE_FLAGS.MATCH_WIZARD_ENABLED]: false },
  },
  enabled: {
    name: "Match Wizard Enabled",
    flags: { [FEATURE_FLAGS.MATCH_WIZARD_ENABLED]: true },
  },
} as const;

/**
 * Combined test scenarios
 */
export const COMMON_TEST_SCENARIOS = {
  allDisabled: {
    name: "All Features Disabled",
    flags: DEFAULT_TEST_FLAGS,
  },
  allEnabled: {
    name: "All Features Enabled",
    flags: {
      [FEATURE_FLAGS.HERO_VARIANT]: HERO_VARIANTS.VARIANT_A,
      [FEATURE_FLAGS.MATCH_WIZARD_ENABLED]: true,
      [FEATURE_FLAGS.ONE_TAP_REBOOK]: true,
      [FEATURE_FLAGS.ENHANCED_SEARCH]: true,
      [FEATURE_FLAGS.PREMIUM_FEATURES]: true,
      [FEATURE_FLAGS.NEW_CHECKOUT_FLOW]: true,
    },
  },
  newUserExperience: {
    name: "New User Experience",
    flags: {
      [FEATURE_FLAGS.HERO_VARIANT]: HERO_VARIANTS.VARIANT_A,
      [FEATURE_FLAGS.MATCH_WIZARD_ENABLED]: true,
      [FEATURE_FLAGS.ENHANCED_SEARCH]: true,
    },
  },
  premiumUser: {
    name: "Premium User Features",
    flags: {
      [FEATURE_FLAGS.PREMIUM_FEATURES]: true,
      [FEATURE_FLAGS.ONE_TAP_REBOOK]: true,
      [FEATURE_FLAGS.NEW_CHECKOUT_FLOW]: true,
    },
  },
} as const;

/**
 * Vitest helper functions
 */

/**
 * Mock PostHog for Vitest tests
 *
 * @param flags - Feature flag overrides
 *
 * @example
 * import { describe, it, beforeEach } from 'vitest';
 * import { mockPostHogForVitest } from '@/lib/integrations/posthog/testing';
 *
 * describe('Component with feature flags', () => {
 *   beforeEach(() => {
 *     mockPostHogForVitest({ match_wizard_enabled: true });
 *   });
 *
 *   it('shows match wizard', () => {
 *     // Test implementation
 *   });
 * });
 */
export function mockPostHogForVitest(flags: MockFeatureFlags = {}) {
  const mockPostHog = createMockPostHog(flags);

  // Mock the PostHog module
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viGlobal = (globalThis as any).vi;
  if (viGlobal) {
    viGlobal.mock("@/lib/integrations/posthog", () => ({
      isFeatureEnabled: (key: string) => mockPostHog.isFeatureEnabled(key),
      getFeatureFlag: (key: string) => mockPostHog.getFeatureFlag(key),
      getAllFeatureFlags: () => mockPostHog.getAllFlags(),
      posthog: mockPostHog,
    }));
  }

  return mockPostHog;
}

/**
 * Clear all PostHog mocks (Vitest)
 */
export function clearPostHogMocks() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viGlobal = (globalThis as any).vi;
  if (viGlobal) {
    viGlobal.clearAllMocks();
  }
}
