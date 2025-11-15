/**
 * PostHog Client Configuration
 * Browser-side analytics and feature flags with CSP nonce support
 *
 * Epic H-1: CSP Hardening
 * PostHog integration with nonce-based Content Security Policy
 */

import posthog from "posthog-js";

/**
 * Initialize PostHog with CSP-compliant nonce support
 * @param nonce - Optional CSP nonce for inline scripts (from middleware)
 */
export function initPostHog(nonce?: string) {
  if (typeof window === "undefined") {
    return;
  }

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

    // CSP Nonce Support - Set nonce on PostHog's external scripts
    // This allows PostHog to work with strict Content Security Policy
    prepare_external_dependency_script: (script) => {
      if (nonce) {
        script.nonce = nonce;
      }
      return script;
    },

    // CSP Nonce Support - Set nonce on PostHog's stylesheets
    prepare_external_dependency_stylesheet: (stylesheet) => {
      if (nonce) {
        stylesheet.nonce = nonce;
      }
      return stylesheet;
    },

    // Advanced features
    enable_recording_console_log: true,
    loaded: (_posthog) => {
      if (process.env.NODE_ENV === "development") {
        console.log("PostHog initialized", nonce ? "with CSP nonce" : "without nonce");
      }
    },
  });
}

export { posthog };
