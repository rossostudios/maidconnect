/**
 * Background Checks Service - Business logic for admin background check management
 *
 * Extracts transformation and grouping logic to reduce route complexity
 * Handles: Date calculations, check transformation, status determination, grouping
 */

export type CheckStatus = "pending" | "clear" | "consider" | "suspended";
export type CheckRecommendation = "approved" | "review_required" | "rejected";
export type CheckType = "criminal" | "identity" | "disciplinary";

export type BackgroundCheckResultData = {
  criminal?: {
    status?: string;
    records?: any[];
  };
  identity?: {
    status?: string;
    records?: any[];
  };
  disciplinary?: {
    status?: string;
    records?: any[];
  };
};

export type RawBackgroundCheck = {
  id: string;
  professional_id: string;
  provider: string;
  provider_check_id: string;
  status: CheckStatus;
  result_data: BackgroundCheckResultData | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
  };
};

/**
 * Calculate days waiting since check was created
 */
export function calculateDaysWaiting(createdAt: string): number {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

/**
 * Extract list of checks performed from result data
 * Returns array of check types that have data
 */
export function extractChecksPerformed(resultData: BackgroundCheckResultData | null): CheckType[] {
  if (!resultData) {
    return [];
  }

  const checksPerformed: CheckType[] = [];

  if (resultData.criminal) {
    checksPerformed.push("criminal");
  }
  if (resultData.identity) {
    checksPerformed.push("identity");
  }
  if (resultData.disciplinary) {
    checksPerformed.push("disciplinary");
  }

  return checksPerformed;
}

/**
 * Determine recommendation based on check status
 * - "clear" → "approved"
 * - "suspended" → "rejected"
 * - Other → "review_required"
 */
export function determineRecommendation(status: CheckStatus): CheckRecommendation {
  if (status === "clear") {
    return "approved";
  }
  if (status === "suspended") {
    return "rejected";
  }
  return "review_required";
}

/**
 * Build results object from result data
 * Extracts criminal, identity, and disciplinary check results
 */
function buildResultsObject(
  resultData: BackgroundCheckResultData | null,
  fallbackStatus: CheckStatus
) {
  if (!resultData) {
    return {
      criminal: undefined,
      identity: undefined,
      disciplinary: undefined,
    };
  }

  return {
    criminal: resultData.criminal
      ? {
          status: resultData.criminal.status || fallbackStatus,
          records: resultData.criminal.records || [],
        }
      : undefined,
    identity: resultData.identity
      ? {
          status: resultData.identity.status || fallbackStatus,
          records: resultData.identity.records || [],
        }
      : undefined,
    disciplinary: resultData.disciplinary
      ? {
          status: resultData.disciplinary.status || fallbackStatus,
          records: resultData.disciplinary.records || [],
        }
      : undefined,
  };
}

/**
 * Transform raw database check into component-friendly format
 * Extracts professional info, calculates metrics, determines recommendation
 */
export function transformBackgroundCheck(check: RawBackgroundCheck) {
  const daysWaiting = calculateDaysWaiting(check.created_at);
  const resultData = check.result_data || {};
  const checksPerformed = extractChecksPerformed(resultData);
  const recommendation = determineRecommendation(check.status);
  const results = buildResultsObject(resultData, check.status);

  return {
    id: check.id,
    providerCheckId: check.provider_check_id,
    provider: check.provider,
    professionalId: check.professional_id,
    status: check.status,
    checksPerformed,
    completedAt: check.completed_at,
    results,
    recommendation,
    rawData: resultData,
    createdAt: check.created_at,
    updatedAt: check.updated_at,
    professional: {
      id: check.profiles.id,
      full_name: check.profiles.full_name,
      email: check.profiles.email,
      phone: check.profiles.phone,
      city: check.profiles.city,
      country: check.profiles.country,
    },
    daysWaiting,
  };
}

/**
 * Group checks by status for dashboard display
 */
export function groupChecksByStatus(checks: any[]) {
  return {
    pending: checks.filter((check) => check.status === "pending"),
    clear: checks.filter((check) => check.status === "clear"),
    consider: checks.filter((check) => check.status === "consider"),
    suspended: checks.filter((check) => check.status === "suspended"),
  };
}

/**
 * Count checks by status
 */
export function countChecksByStatus(grouped: ReturnType<typeof groupChecksByStatus>) {
  return {
    pending: grouped.pending.length,
    clear: grouped.clear.length,
    consider: grouped.consider.length,
    suspended: grouped.suspended.length,
    total:
      grouped.pending.length +
      grouped.clear.length +
      grouped.consider.length +
      grouped.suspended.length,
  };
}
