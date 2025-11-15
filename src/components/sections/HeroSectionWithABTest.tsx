"use client";

import { getHeroVariant } from "@/lib/integrations/posthog";
import { HERO_VARIANTS } from "@/lib/shared/config/feature-flags";
import { HeroSection } from "./HeroSection";
import { HeroVariantA } from "./HeroVariantA";

/**
 * HeroSectionWithABTest - Feature Flag Wrapper
 *
 * Epic G-2: Homepage Hero A/B Test
 *
 * This component wraps the hero section with A/B test logic using PostHog feature flags.
 * It dynamically renders either the control or variant A based on the feature flag value.
 *
 * Feature Flag: hero_variant
 * - "control" → Original hero (HeroSection)
 * - "variant_a" → Speed-focused variant (HeroVariantA)
 *
 * Usage:
 * ```tsx
 * import { HeroSectionWithABTest } from "@/components/sections/HeroSectionWithABTest";
 *
 * export default function HomePage() {
 *   return <HeroSectionWithABTest />;
 * }
 * ```
 *
 * @see docs/experiments/hero-ab-test.md for A/B test design documentation
 */
export function HeroSectionWithABTest() {
  // Get the current hero variant from PostHog feature flag
  // Defaults to "control" if flag is not set or PostHog is unavailable
  const variant = getHeroVariant();

  // Render the appropriate hero component based on the variant
  if (variant === HERO_VARIANTS.VARIANT_A) {
    return <HeroVariantA />;
  }

  // Default to control (original hero)
  return <HeroSection />;
}
