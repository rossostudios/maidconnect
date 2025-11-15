/**
 * PostHog Tracking for Structured Outputs
 *
 * Centralized tracking utilities for all structured output operations.
 * Monitors usage, performance, errors, and quality metrics.
 */

import { trackEvent } from "@/lib/integrations/posthog";

/**
 * Track booking intent parsing
 */
export function trackBookingIntentParsing(params: {
  success: boolean;
  serviceType?: string;
  hasLocation: boolean;
  hasRequirements: boolean;
  urgency?: string;
  locale: string;
  processingTimeMs: number;
  error?: string;
}) {
  trackEvent(params.success ? "booking_intent_parsed" : "booking_intent_parse_failed", {
    ...params,
    feature: "structured_outputs",
    useCase: "booking_intent",
  });
}

/**
 * Track document extraction
 */
export function trackDocumentExtraction(params: {
  success: boolean;
  documentType?: string;
  confidence?: number;
  hasPersonalInfo: boolean;
  hasCertifications: boolean;
  hasBackgroundCheck: boolean;
  imageType: "base64" | "url";
  processingTimeMs: number;
  warningCount?: number;
  error?: string;
}) {
  trackEvent(params.success ? "document_extracted" : "document_extraction_failed", {
    ...params,
    feature: "structured_outputs",
    useCase: "document_extraction",
    qualityTier: params.confidence
      ? params.confidence >= 90
        ? "high"
        : params.confidence >= 70
          ? "medium"
          : "low"
      : "unknown",
  });
}

/**
 * Track review sentiment analysis
 */
export function trackReviewAnalysis(params: {
  success: boolean;
  sentiment?: string;
  categoryCount?: number;
  flagCount?: number;
  actionRequired?: boolean;
  severity?: string;
  autoPublish?: boolean;
  processingTimeMs: number;
  locale: string;
  error?: string;
}) {
  trackEvent(params.success ? "review_analyzed" : "review_analysis_failed", {
    ...params,
    feature: "structured_outputs",
    useCase: "review_analysis",
  });
}

/**
 * Track professional matching
 */
export function trackProfessionalMatching(params: {
  success: boolean;
  criteriaDetected: {
    hasSkills: boolean;
    hasLanguages: boolean;
    hasExperience: boolean;
    hasPriceRange: boolean;
    hasAvailability: boolean;
  };
  matchCount?: number;
  topMatchScore?: number;
  locale: string;
  processingTimeMs: number;
  error?: string;
}) {
  trackEvent(params.success ? "professionals_matched" : "professional_matching_failed", {
    ...params,
    feature: "structured_outputs",
    useCase: "professional_matching",
  });
}

/**
 * Track analytics report generation
 */
export function trackAnalyticsReport(params: {
  success: boolean;
  periodDays?: number;
  insightCount?: number;
  criticalInsightCount?: number;
  alertCount?: number;
  format: "json" | "markdown" | "csv";
  processingTimeMs: number;
  error?: string;
}) {
  trackEvent(params.success ? "analytics_report_generated" : "analytics_report_failed", {
    ...params,
    feature: "structured_outputs",
    useCase: "analytics_reports",
  });
}

/**
 * Track structured output API usage (generic)
 */
export function trackStructuredOutputUsage(params: {
  operation: string;
  model: string;
  tokensEstimate?: number;
  success: boolean;
  processingTimeMs: number;
  error?: string;
}) {
  trackEvent("structured_output_api_call", {
    ...params,
    feature: "structured_outputs",
  });
}
