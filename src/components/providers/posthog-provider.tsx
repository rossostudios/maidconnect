"use client";

/**
 * PostHog Provider
 * Initializes PostHog with CSP nonce support and provides pageview tracking
 *
 * Epic H-1: CSP Hardening
 * Retrieves nonce from body data-attribute and passes to PostHog initialization
 */

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { initPostHog, posthog } from "@/lib/integrations/posthog/client";

// Component that uses useSearchParams - must be wrapped in Suspense
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track pageviews on route changes
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }

      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

type PostHogProviderProps = {
  children: React.ReactNode;
  nonce?: string;
};

export function PostHogProvider({ children, nonce }: PostHogProviderProps) {
  // Initialize PostHog on mount with CSP nonce support
  useEffect(() => {
    // Get nonce from body data-attribute if not passed as prop
    // This provides a fallback for client-side access to the nonce
    const nonceValue = nonce ?? document.body.getAttribute("data-nonce") ?? undefined;

    initPostHog(nonceValue);
  }, [nonce]);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
