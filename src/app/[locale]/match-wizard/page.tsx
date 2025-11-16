"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MatchWizard } from "@/components/match-wizard/match-wizard";
import { isMatchWizardEnabled } from "@/lib/integrations/posthog";

/**
 * Match Wizard Page - Feature Flag Gated
 *
 * Epic G-3: Gate Match Wizard rollout with PostHog feature flags
 *
 * This page is protected by the "match_wizard_enabled" PostHog feature flag.
 * If the flag is disabled, users are redirected to the professionals listing page.
 *
 * Feature Flag: match_wizard_enabled
 * - true → Show Match Wizard
 * - false → Redirect to /professionals
 */
export default function MatchWizardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if Match Wizard is enabled via PostHog feature flag
    // This allows for gradual rollout and A/B testing
    if (!isMatchWizardEnabled()) {
      router.push("/professionals");
    }
  }, [router]);

  // Only render if feature flag is enabled
  // The useEffect above will handle redirection if disabled
  if (!isMatchWizardEnabled()) {
    return null;
  }

  return <MatchWizard />;
}
