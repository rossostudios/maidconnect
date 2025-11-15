/**
 * Type-Safe Feature Flag SDK Wrapper
 *
 * Provides typed helpers for PostHog feature flags with type safety,
 * default values, and variant support for A/B testing.
 *
 * @module posthog/feature-flags
 */

import type {
  FeatureFlagKey,
  FeatureFlagValue,
  HeroVariant,
} from "@/lib/shared/config/feature-flags";
import {
  FEATURE_FLAGS,
  getFeatureFlagMetadata,
  HERO_VARIANTS,
} from "@/lib/shared/config/feature-flags";
import { posthog } from "./client";

/**
 * Check if a feature flag is enabled (client-side only)
 *
 * @param flagKey - The feature flag key to check
 * @param defaultValue - Default value if flag is not set or server-side
 * @returns true if enabled, false otherwise
 *
 * @example
 * if (isFeatureEnabled('match_wizard_enabled')) {
 *   // Show Match Wizard UI
 * }
 */
export function isFeatureEnabled(flagKey: FeatureFlagKey, defaultValue = false): boolean {
  if (typeof window === "undefined") return defaultValue;

  const value = posthog.isFeatureEnabled(flagKey);
  return value ?? defaultValue;
}

/**
 * Get feature flag value with type safety (client-side only)
 *
 * @param flagKey - The feature flag key to get
 * @returns The flag value (string, boolean, or undefined)
 *
 * @example
 * const variant = getFeatureFlag('hero_variant');
 * if (variant === 'variant_a') {
 *   // Show variant A
 * }
 */
export function getFeatureFlag(flagKey: FeatureFlagKey): FeatureFlagValue {
  if (typeof window === "undefined") return;

  return posthog.getFeatureFlag(flagKey);
}

/**
 * Get feature flag value with default fallback
 *
 * @param flagKey - The feature flag key to get
 * @param defaultValue - Default value if flag is not set
 * @returns The flag value or default
 *
 * @example
 * const enabled = getFeatureFlagWithDefault('one_tap_rebook', false);
 */
export function getFeatureFlagWithDefault<T extends FeatureFlagValue>(
  flagKey: FeatureFlagKey,
  defaultValue: T
): T {
  if (typeof window === "undefined") return defaultValue;

  const value = posthog.getFeatureFlag(flagKey);
  return (value ?? defaultValue) as T;
}

/**
 * Get all active feature flag values (client-side only)
 *
 * @returns Object with all active feature flags and their values
 *
 * @example
 * const flags = getAllFeatureFlags();
 * console.log(flags); // { match_wizard_enabled: true, hero_variant: 'control' }
 */
export function getAllFeatureFlags(): Record<string, FeatureFlagValue> {
  if (typeof window === "undefined") return {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeFlags = (posthog as any).getAllFlags?.() || {};
  return activeFlags;
}

/**
 * Reload feature flags from PostHog (client-side only)
 * Useful after user login or when flags may have changed
 *
 * @example
 * // After user authentication
 * await reloadFeatureFlags();
 */
export async function reloadFeatureFlags(): Promise<void> {
  if (typeof window === "undefined") return;

  // PostHog's reloadFeatureFlags now returns a Promise in newer versions
  await posthog.reloadFeatureFlags();
}

/**
 * Feature flag hooks and utilities
 */

/**
 * Get hero variant for A/B testing
 *
 * @param defaultVariant - Default variant if flag is not set
 * @returns The active hero variant
 *
 * @example
 * const variant = getHeroVariant();
 * if (variant === 'variant_a') {
 *   return <HeroVariantA />;
 * }
 * return <HeroControl />;
 */
export function getHeroVariant(defaultVariant: HeroVariant = HERO_VARIANTS.CONTROL): HeroVariant {
  const variant = getFeatureFlagWithDefault(FEATURE_FLAGS.HERO_VARIANT, defaultVariant);

  // Type guard: ensure variant is a valid HeroVariant
  if (variant === HERO_VARIANTS.CONTROL || variant === HERO_VARIANTS.VARIANT_A) {
    return variant;
  }

  return defaultVariant;
}

/**
 * Check if Match Wizard is enabled for current user
 *
 * @returns true if Match Wizard is enabled
 *
 * @example
 * if (isMatchWizardEnabled()) {
 *   router.push('/match-wizard');
 * }
 */
export function isMatchWizardEnabled(): boolean {
  return isFeatureEnabled(FEATURE_FLAGS.MATCH_WIZARD_ENABLED, false);
}

/**
 * Check if one-tap rebook is enabled
 *
 * @returns true if one-tap rebook is enabled
 *
 * @example
 * if (isOneTapRebookEnabled()) {
 *   return <RebookButton />;
 * }
 */
export function isOneTapRebookEnabled(): boolean {
  return isFeatureEnabled(FEATURE_FLAGS.ONE_TAP_REBOOK, false);
}

/**
 * Feature flag utilities for testing and debugging
 */

/**
 * Override feature flags for testing (client-side only)
 * Only works in development mode
 *
 * @param overrides - Object with flag keys and override values
 *
 * @example
 * // In Storybook or tests
 * overrideFeatureFlags({
 *   match_wizard_enabled: true,
 *   hero_variant: 'variant_a'
 * });
 */
export function overrideFeatureFlags(overrides: Record<FeatureFlagKey, FeatureFlagValue>): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "development") {
    console.warn("Feature flag overrides only work in development mode");
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (posthog.featureFlags as any).override(overrides);
}

/**
 * Clear all feature flag overrides (client-side only)
 *
 * @example
 * clearFeatureFlagOverrides();
 */
export function clearFeatureFlagOverrides(): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "development") return;

  posthog.featureFlags.override(false);
}

/**
 * Get feature flag info for debugging
 *
 * @param flagKey - The feature flag key to inspect
 * @returns Object with flag metadata and current value
 *
 * @example
 * const info = getFeatureFlagInfo('hero_variant');
 * console.log(info);
 * // {
 * //   key: 'hero_variant',
 * //   name: 'Homepage Hero A/B Test',
 * //   description: '...',
 * //   currentValue: 'control',
 * //   defaultValue: 'control'
 * // }
 */
export function getFeatureFlagInfo(flagKey: FeatureFlagKey) {
  const metadata = getFeatureFlagMetadata(flagKey);
  const currentValue = getFeatureFlag(flagKey);

  return {
    ...metadata,
    currentValue,
  };
}

/**
 * Server-side feature flag utilities
 * These functions work on both client and server
 */

/**
 * Get feature flag value with metadata-based default
 * Works on both client and server
 *
 * @param flagKey - The feature flag key to get
 * @returns The flag value or metadata default
 *
 * @example
 * // Server Component
 * const enabled = getFeatureFlagOrDefault('match_wizard_enabled');
 */
export function getFeatureFlagOrDefault(flagKey: FeatureFlagKey): FeatureFlagValue {
  const metadata = getFeatureFlagMetadata(flagKey);
  const defaultValue = metadata?.defaultValue;

  if (typeof window === "undefined") {
    // Server-side: return default value
    return defaultValue;
  }

  // Client-side: get actual value
  return getFeatureFlagWithDefault(flagKey, defaultValue);
}

/**
 * Check if feature is enabled with metadata-based default
 * Works on both client and server
 *
 * @param flagKey - The feature flag key to check
 * @returns true if enabled
 *
 * @example
 * // Server Component
 * const enabled = isFeatureEnabledOrDefault('match_wizard_enabled');
 */
export function isFeatureEnabledOrDefault(flagKey: FeatureFlagKey): boolean {
  const value = getFeatureFlagOrDefault(flagKey);
  return Boolean(value);
}
