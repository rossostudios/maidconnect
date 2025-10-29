/**
 * Cancellation Policy for MaidConnect
 *
 * Defines refund percentages based on when cancellation occurs
 * relative to scheduled service time
 */

export type CancellationPolicyResult = {
  canCancel: boolean;
  refundPercentage: number;
  reason: string;
  hoursUntilService: number;
};

/**
 * Calculate refund percentage based on cancellation timing
 *
 * Policy:
 * - More than 24 hours before: 100% refund
 * - 12-24 hours before: 50% refund
 * - 4-12 hours before: 25% refund
 * - Less than 4 hours before: No refund (0%)
 * - Cannot cancel if service already started (in_progress)
 * - Cannot cancel if service completed
 */
export function calculateCancellationPolicy(
  scheduledStart: string | Date,
  currentStatus: string
): CancellationPolicyResult {
  // Cannot cancel completed or in-progress services
  if (currentStatus === "completed") {
    return {
      canCancel: false,
      refundPercentage: 0,
      reason: "Cannot cancel completed services",
      hoursUntilService: 0,
    };
  }

  if (currentStatus === "in_progress") {
    return {
      canCancel: false,
      refundPercentage: 0,
      reason: "Cannot cancel service that is already in progress",
      hoursUntilService: 0,
    };
  }

  // Calculate hours until service
  const scheduledTime = new Date(scheduledStart);
  const now = new Date();
  const millisecondsUntilService = scheduledTime.getTime() - now.getTime();
  const hoursUntilService = millisecondsUntilService / 1000 / 60 / 60;

  // Service time has passed
  if (hoursUntilService < 0) {
    return {
      canCancel: false,
      refundPercentage: 0,
      reason: "Cannot cancel past services",
      hoursUntilService,
    };
  }

  // More than 24 hours: Full refund
  if (hoursUntilService >= 24) {
    return {
      canCancel: true,
      refundPercentage: 100,
      reason: "Full refund - canceling more than 24 hours in advance",
      hoursUntilService,
    };
  }

  // 12-24 hours: 50% refund
  if (hoursUntilService >= 12) {
    return {
      canCancel: true,
      refundPercentage: 50,
      reason: "50% refund - canceling 12-24 hours in advance",
      hoursUntilService,
    };
  }

  // 4-12 hours: 25% refund
  if (hoursUntilService >= 4) {
    return {
      canCancel: true,
      refundPercentage: 25,
      reason: "25% refund - canceling 4-12 hours in advance",
      hoursUntilService,
    };
  }

  // Less than 4 hours: No refund
  return {
    canCancel: true,
    refundPercentage: 0,
    reason: "No refund - canceling less than 4 hours before service",
    hoursUntilService,
  };
}

/**
 * Calculate refund amount in cents
 */
export function calculateRefundAmount(
  authorizedAmount: number,
  refundPercentage: number
): number {
  return Math.round((authorizedAmount * refundPercentage) / 100);
}

/**
 * Get user-friendly cancellation policy description
 */
export function getCancellationPolicyDescription(): string {
  return `
Our cancellation policy:
• More than 24 hours before service: 100% refund
• 12-24 hours before service: 50% refund
• 4-12 hours before service: 25% refund
• Less than 4 hours before service: No refund

Note: Once the service has started, cancellation is not possible.
  `.trim();
}
