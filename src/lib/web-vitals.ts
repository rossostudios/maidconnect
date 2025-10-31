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
 */
async function sendToAnalytics(metric: Metric) {
  try {
    const token = process.env.NEXT_PUBLIC_LOGTAIL_TOKEN;
    if (!token) {
      console.warn("[Web Vitals] Better Stack token not configured");
      return;
    }

    const rating = getRating(metric.name, metric.value);

    const body = JSON.stringify({
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
        page: window.location.pathname,
        referrer: document.referrer,
        // Device information
        connection: (navigator as Navigator & { connection?: { effectiveType?: string } })
          .connection?.effectiveType,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      },
    });

    // Send to Better Stack
    await fetch(`https://in.logs.betterstack.com/api/v1/ingest?source_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true, // Ensure request completes even if page is closing
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: `${Math.round(metric.value)}${metric.name === "CLS" ? "" : "ms"}`,
        rating,
        page: window.location.pathname,
      });
    }
  } catch (error) {
    console.error("[Web Vitals] Failed to send metrics:", error);
  }
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
export function getWebVitalsSummary(): {
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
