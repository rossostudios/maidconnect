/**
 * Background Check Badge Helpers
 * Utility functions for badge styling
 */

/**
 * Get status badge CSS classes
 */
export function getStatusBadge(status: string): string {
  switch (status) {
    case "pending":
      return "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100";
    case "clear":
      return "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100";
    case "consider":
      return "bg-neutral-900 dark:bg-neutral-100/5 text-white dark:text-neutral-100";
    case "suspended":
      return "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100";
    default:
      return "bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400";
  }
}

/**
 * Get provider badge CSS classes
 */
export function getProviderBadge(provider: string): string {
  switch (provider.toLowerCase()) {
    case "checkr":
      return "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100";
    case "truora":
      return "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100";
    default:
      return "bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400";
  }
}

/**
 * Get check type display name
 */
export function getCheckTypeLabel(checkType: string): string {
  switch (checkType) {
    case "criminal":
      return "Criminal Background";
    case "identity":
      return "Identity Verification";
    case "disciplinary":
      return "Disciplinary Records";
    default:
      return checkType;
  }
}

/**
 * Get recommendation display text
 */
export function getRecommendationText(recommendation: string): string {
  switch (recommendation) {
    case "approved":
      return "✓ Approved";
    case "review_required":
      return "⚠ Review Required";
    case "rejected":
      return "✗ Rejected";
    default:
      return recommendation;
  }
}
