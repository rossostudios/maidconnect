/**
 * PostHog Client Configuration
 * Browser-side analytics and feature flags
 */

import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!apiKey) {
    console.warn("PostHog: Missing NEXT_PUBLIC_POSTHOG_KEY");
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    person_profiles: "identified_only", // Only create profiles for identified users
    capture_pageview: false, // We'll handle pageviews manually with Next.js routing
    capture_pageleave: true,

    // Privacy & Performance
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-sensitive]",
    },

    // Autocapture settings
    autocapture: {
      css_selector_allowlist: ["[data-ph-capture]"],
    },

    // Advanced features
    enable_recording_console_log: true,
    loaded: (_posthog) => {
      if (process.env.NODE_ENV === "development") {
        console.log("PostHog initialized");
      }
    },
  });
}

export { posthog };
