"use client";

/**
 * PostHog Provider
 * Initializes PostHog and provides pageview tracking
 */

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { initPostHog, posthog } from "@/lib/integrations/posthog/client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

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

  return <>{children}</>;
}
