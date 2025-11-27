/**
 * Web Vitals Reporting
 *
 * Monitors Core Web Vitals and sends metrics to Better Stack:
 * - LCP (Largest Contentful Paint): < 2.5s (good)
 * - FID (First Input Delay): < 100ms (good)
 * - CLS (Cumulative Layout Shift): < 0.1 (good)
 * - FCP (First Contentful Paint): < 1.8s (good)
 * - TTFB (Time to First Byte): < 800ms (good)
 * - INP (Interaction to Next Paint): < 200ms (good)
 *
 * @see https://web.dev/vitals/
 */

import type { Metric } from "web-vitals";

// Web Vitals thresholds (good scores)
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint: 2.5s
  FID: 100, // First Input Delay: 100ms
  CLS: 0.1, // Cumulative Layout Shift: 0.1
  FCP: 1800, // First Contentful Paint: 1.8s
  TTFB: 800, // Time to First Byte: 800ms
  INP: 200, // Interaction to Next Paint: 200ms
} as const;

/**
 * Get rating for a metric value
 */
function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) {
    return "good";
  }

  if (name === "CLS") {
    // CLS has different scale
    if (value <= 0.1) {
      return "good";
    }
    if (value <= 0.25) {
      return "needs-improvement";
    }
    return "poor";
  }

  if (value <= threshold) {
    return "good";
  }
  if (value <= threshold * 1.5) {
    return "needs-improvement";
  }
  return "poor";
}

/**
 * Send Web Vitals to Better Stack
 * Uses sendBeacon for reliability during page unload, with fetch as fallback
 */
function sendToAnalytics(metric: Metric) {
  const token = process.env.NEXT_PUBLIC_LOGTAIL_TOKEN;
  if (!token) {
    // Silently skip in development if token not configured
    if (process.env.NODE_ENV === "development") {
      return;
    }
    console.warn("[Web Vitals] Better Stack token not configured");
    return;
  }

  const rating = getRating(metric.name, metric.value);

  const payload = {
    dt: new Date().toISOString(),
    level: rating === "poor" ? "warn" : "info",
    message: `Web Vitals: ${metric.name}`,
    context: {
      metric: metric.name,
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      // Include route information
      page: typeof window !== "undefined" ? window.location.pathname : undefined,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      // Device information
      connection:
        typeof navigator !== "undefined"
          ? (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
              ?.effectiveType
          : undefined,
      deviceMemory:
        typeof navigator !== "undefined"
          ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
          : undefined,
    },
  };

  const url = `https://in.logs.betterstack.com/api/v1/ingest?source_token=${token}`;
  const body = JSON.stringify(payload);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${Math.round(metric.value)}${metric.name === "CLS" ? "" : "ms"}`,
      rating,
      page: typeof window !== "undefined" ? window.location.pathname : "unknown",
    });
  }

  // Use sendBeacon for reliability (works during page unload)
  // Falls back to fetch if sendBeacon is unavailable or fails
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const queued = navigator.sendBeacon(url, blob);
    if (queued) {
      return; // Successfully queued
    }
    // sendBeacon failed (e.g., payload too large), fall through to fetch
  }

  // Fallback to fetch with error suppression
  // Fire-and-forget: don't await, don't let errors propagate
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Silently ignore fetch errors - web vitals are non-critical telemetry
    // Common causes: page navigation, network issues, ad blockers
  });
}

/**
 * Report Web Vitals metric
 * Call this from useReportWebVitals hook
 */
export function reportWebVitals(metric: Metric) {
  // Check if feature flag is enabled
  const featureEnabled =
    process.env.NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS === "true" ||
    process.env.NODE_ENV === "development";

  if (!featureEnabled) {
    return;
  }

  sendToAnalytics(metric);

  // Additional custom logic can go here
  // E.g., send to multiple analytics services, trigger alerts, etc.
}

/**
 * Get Web Vitals summary for current page
 * Useful for debugging
 */
function getWebVitalsSummary(): {
  metrics: Array<{ name: string; value: number; rating: string }>;
  performance: PerformanceNavigationTiming | null;
} {
  const metrics: Array<{ name: string; value: number; rating: string }> = [];

  // Get performance navigation timing
  const perfData = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (perfData) {
    // Calculate key metrics
    const ttfb = perfData.responseStart - perfData.requestStart;
    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
    const windowLoad = perfData.loadEventEnd - perfData.fetchStart;

    metrics.push(
      {
        name: "TTFB",
        value: Math.round(ttfb),
        rating: getRating("TTFB", ttfb),
      },
      {
        name: "DOM Content Loaded",
        value: Math.round(domContentLoaded),
        rating: "info",
      },
      {
        name: "Window Load",
        value: Math.round(windowLoad),
        rating: "info",
      }
    );
  }

  return {
    metrics,
    performance: perfData || null,
  };
}
