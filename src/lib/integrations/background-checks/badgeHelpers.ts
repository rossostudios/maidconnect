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
      return "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100";
    case "clear":
      return "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100";
    case "consider":
      return "bg-slate-900 dark:bg-slate-100/5 text-white dark:text-slate-100";
    case "suspended":
      return "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100";
    default:
      return "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400";
  }
}

/**
 * Get provider badge CSS classes
 */
export function getProviderBadge(provider: string): string {
  switch (provider.toLowerCase()) {
    case "checkr":
      return "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100";
    case "truora":
      return "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100";
    default:
      return "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400";
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
