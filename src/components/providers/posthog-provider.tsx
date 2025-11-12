"use client";

/**
 * PostHog Provider
 * Initializes PostHog and provides pageview tracking
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

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
