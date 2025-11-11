/**
 * Admin Utility Functions (Client-Safe)
 *
 * Pure utility functions that can be used in both client and server components.
 * These functions have no dependencies on server-only APIs like cookies or headers.
 */

/**
 * Professional vetting status helper
 */
export type VettingStatus =
  | "application_pending" // Just signed up, no application submitted
  | "application_in_review" // Application submitted, awaiting admin review
  | "approved" // Documents verified, awaiting profile completion
  | "active"; // Fully onboarded and can accept bookings

export function getNextVettingStatus(currentStatus: string): VettingStatus | null {
  switch (currentStatus) {
    case "application_pending":
      return "application_in_review";
    case "application_in_review":
      return "approved";
    case "approved":
      return "active";
    default:
      return null;
  }
}

export function canProgressToStatus(currentStatus: string, targetStatus: VettingStatus): boolean {
  const statusOrder: VettingStatus[] = [
    "application_pending",
    "application_in_review",
    "approved",
    "active",
  ];

  const currentIndex = statusOrder.indexOf(currentStatus as VettingStatus);
  const targetIndex = statusOrder.indexOf(targetStatus);

  if (currentIndex === -1 || targetIndex === -1) {
    return false;
  }

  // Can only progress forward, one step at a time
  return targetIndex === currentIndex + 1;
}

/**
 * Format suspension duration for display
 */
export function formatSuspensionDuration(expiresAt?: string | null): string {
  if (!expiresAt) {
    return "Permanent";
  }

  const expires = new Date(expiresAt);
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return "Expires today";
  }
  if (diffDays === 1) {
    return "Expires tomorrow";
  }
  if (diffDays < 7) {
    return `Expires in ${diffDays} days`;
  }
  if (diffDays < 30) {
    return `Expires in ${Math.ceil(diffDays / 7)} weeks`;
  }
  return `Expires in ${Math.ceil(diffDays / 30)} months`;
}
