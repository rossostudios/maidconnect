"use client";

import { useMemo } from "react";
import type { FeatureFlag } from "@/lib/featureFlags";
import { getEnabledFlags, isFeatureEnabled } from "@/lib/featureFlags";

/**
 * React hook to check if a feature flag is enabled
 *
 * @param flag - Feature flag to check
 * @param userId - Optional user ID for user-specific flags
 * @returns true if feature is enabled
 *
 * @example
 * ```tsx
 * function MyComponent({ userId }: { userId: string }) {
 *   const showMatchWizard = useFeatureFlag("show_match_wizard", userId);
 *
 *   if (showMatchWizard) {
 *     return <MatchWizard />;
 *   }
 *
 *   return <TraditionalSearch />;
 * }
 * ```
 */
export function useFeatureFlag(flag: FeatureFlag, userId?: string): boolean {
  return useMemo(() => isFeatureEnabled(flag, userId), [flag, userId]);
}

/**
 * React hook to get all enabled feature flags
 * Useful for analytics and debugging
 *
 * @param userId - Optional user ID for user-specific flags
 * @returns Array of enabled feature flags
 *
 * @example
 * ```tsx
 * function DebugPanel({ userId }: { userId: string }) {
 *   const enabledFlags = useEnabledFlags(userId);
 *
 *   return (
 *     <div>
 *       <h3>Enabled Features</h3>
 *       <ul>
 *         {enabledFlags.map(flag => (
 *           <li key={flag}>{flag}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnabledFlags(userId?: string): FeatureFlag[] {
  return useMemo(() => getEnabledFlags(userId), [userId]);
}

/**
 * React hook to check multiple feature flags at once
 *
 * @param flags - Array of feature flags to check
 * @param userId - Optional user ID for user-specific flags
 * @returns Object mapping each flag to its enabled state
 *
 * @example
 * ```tsx
 * function PricingDisplay({ userId }: { userId: string }) {
 *   const flags = useFeatureFlags([
 *     "show_platform_fee",
 *     "enable_tipping",
 *     "subscription_discount_badges"
 *   ], userId);
 *
 *   return (
 *     <div>
 *       {flags.show_platform_fee && <PlatformFeeBreakdown />}
 *       {flags.enable_tipping && <TipOption />}
 *       {flags.subscription_discount_badges && <SaveWithSubscription />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureFlags(
  flags: FeatureFlag[],
  userId?: string
): Record<FeatureFlag, boolean> {
  return useMemo(() => {
    const result = {} as Record<FeatureFlag, boolean>;
    for (const flag of flags) {
      result[flag] = isFeatureEnabled(flag, userId);
    }
    return result;
  }, [flags, userId]);
}
