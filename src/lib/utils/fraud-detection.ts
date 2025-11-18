/**
 * Fraud Detection Utilities
 *
 * Provides automated fraud detection patterns for identifying suspicious user behavior:
 * - Booking manipulation (rapid cancellations, excessive bookings)
 * - Review manipulation (fake reviews, rating patterns)
 * - Account anomalies (duplicate accounts, suspicious pricing)
 *
 * Usage:
 * import { detectSuspiciousBookingPattern, calculateRiskScore } from '@/lib/utils/fraud-detection'
 *
 * const hasIssue = await detectSuspiciousBookingPattern(userId)
 * const riskScore = await calculateRiskScore(userId)
 */

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type FraudDetectionResult = {
  detected: boolean;
  reason?: string;
  details?: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
};

export type RiskScoreResult = {
  score: number; // 0-100, higher is riskier
  factors: Array<{
    type: string;
    weight: number;
    description: string;
  }>;
  recommendation: "monitor" | "review" | "suspend" | "ban";
};

/**
 * Detect suspicious booking patterns
 * Flags users who:
 * - Create >5 bookings then cancel all within 24 hours
 * - Book same service >10 times in 1 week
 * - Have >50% cancellation rate
 */
export async function detectSuspiciousBookingPattern(
  userId: string
): Promise<FraudDetectionResult> {
  const supabase = await createSupabaseServerClient();

  // Get all bookings for user (as customer or professional)
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, created_at, booking_date, professional_id, customer_id")
    .or(`customer_id.eq.${userId},professional_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!bookings || bookings.length === 0) {
    return { detected: false, severity: "low" };
  }

  // Pattern 1: Rapid cancellation pattern
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentBookings = bookings.filter((b) => new Date(b.created_at) > last24Hours);

  if (recentBookings.length >= 5) {
    const allCancelled = recentBookings.every(
      (b) => b.status === "cancelled" || b.status === "customer_cancelled"
    );

    if (allCancelled) {
      return {
        detected: true,
        reason: "Rapid booking and cancellation pattern detected",
        details: {
          bookingsIn24h: recentBookings.length,
          allCancelled: true,
        },
        severity: "high",
      };
    }
  }

  // Pattern 2: Excessive same-service booking
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekBookings = bookings.filter((b) => new Date(b.created_at) > oneWeekAgo);

  if (weekBookings.length >= 10) {
    // Group by professional (same service provider)
    const professionalCounts = weekBookings.reduce(
      (acc, b) => {
        const key = b.professional_id;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const maxBookingsWithSamePro = Math.max(...Object.values(professionalCounts));
    if (maxBookingsWithSamePro >= 10) {
      return {
        detected: true,
        reason: "Excessive bookings with same professional in 1 week",
        details: {
          bookingsInWeek: weekBookings.length,
          maxWithSamePro: maxBookingsWithSamePro,
        },
        severity: "medium",
      };
    }
  }

  // Pattern 3: High cancellation rate
  const totalBookings = bookings.length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled" || b.status === "customer_cancelled"
  ).length;

  const cancellationRate = cancelledBookings / totalBookings;

  if (totalBookings >= 5 && cancellationRate > 0.5) {
    return {
      detected: true,
      reason: "High cancellation rate (>50%)",
      details: {
        totalBookings,
        cancelledBookings,
        cancellationRate: Math.round(cancellationRate * 100),
      },
      severity: "medium",
    };
  }

  return { detected: false, severity: "low" };
}

/**
 * Detect review manipulation patterns
 * Flags:
 * - Professional has >80% 5-star reviews (potential fake reviews)
 * - Customer leaves only 1-star or 5-star reviews (no nuance)
 */
export async function detectReviewManipulation(
  userId: string,
  role: "customer" | "professional"
): Promise<FraudDetectionResult> {
  const supabase = await createSupabaseServerClient();

  if (role === "professional") {
    // Check professional's received reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating, created_at")
      .eq("professional_id", userId)
      .eq("status", "approved")
      .limit(100);

    if (!reviews || reviews.length < 10) {
      return { detected: false, severity: "low" };
    }

    const fiveStarReviews = reviews.filter((r) => r.rating === 5).length;
    const fiveStarRate = fiveStarReviews / reviews.length;

    if (fiveStarRate > 0.8) {
      return {
        detected: true,
        reason: "Suspiciously high 5-star review rate (>80%)",
        details: {
          totalReviews: reviews.length,
          fiveStarReviews,
          fiveStarRate: Math.round(fiveStarRate * 100),
        },
        severity: "medium",
      };
    }
  } else {
    // Check customer's given reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating, created_at")
      .eq("customer_id", userId)
      .limit(100);

    if (!reviews || reviews.length < 5) {
      return { detected: false, severity: "low" };
    }

    // Check if customer only leaves extreme ratings (1 or 5)
    const extremeRatings = reviews.filter((r) => r.rating === 1 || r.rating === 5);
    const extremeRate = extremeRatings.length / reviews.length;

    if (extremeRate > 0.9 && reviews.length >= 10) {
      return {
        detected: true,
        reason: "Customer only leaves extreme ratings (1 or 5 stars)",
        details: {
          totalReviews: reviews.length,
          extremeRatings: extremeRatings.length,
          extremeRate: Math.round(extremeRate * 100),
        },
        severity: "low",
      };
    }
  }

  return { detected: false, severity: "low" };
}

/**
 * Detect account anomalies
 * Flags:
 * - Multiple accounts with same phone/address
 * - Professional offers services at 50%+ below market rate
 */
export async function detectAccountAnomaly(userId: string): Promise<FraudDetectionResult> {
  const supabase = await createSupabaseServerClient();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_number, city, role, hourly_rate")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { detected: false, severity: "low" };
  }

  // Check for duplicate phone numbers (excluding the current user)
  if (profile.phone_number) {
    const { data: duplicatePhones } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("phone_number", profile.phone_number)
      .neq("id", userId)
      .limit(5);

    if (duplicatePhones && duplicatePhones.length > 0) {
      return {
        detected: true,
        reason: "Multiple accounts detected with same phone number",
        details: {
          duplicateCount: duplicatePhones.length,
          phoneNumber: profile.phone_number,
        },
        severity: "high",
      };
    }
  }

  // Check for suspiciously low pricing for professionals
  if (profile.role === "professional" && profile.hourly_rate) {
    // Get average market rate for same city
    const { data: marketRates } = await supabase
      .from("profiles")
      .select("hourly_rate")
      .eq("role", "professional")
      .eq("city", profile.city)
      .not("hourly_rate", "is", null)
      .limit(100);

    if (marketRates && marketRates.length >= 5) {
      const validRates = marketRates
        .map((p) => p.hourly_rate)
        .filter((r): r is number => r !== null && r > 0);

      if (validRates.length >= 5) {
        const avgMarketRate = validRates.reduce((sum, r) => sum + r, 0) / validRates.length;
        const priceDifference = ((avgMarketRate - profile.hourly_rate) / avgMarketRate) * 100;

        if (priceDifference > 50) {
          return {
            detected: true,
            reason: "Professional offers services 50%+ below market rate",
            details: {
              userRate: profile.hourly_rate,
              marketRate: Math.round(avgMarketRate),
              percentBelow: Math.round(priceDifference),
            },
            severity: "low",
          };
        }
      }
    }
  }

  return { detected: false, severity: "low" };
}

/**
 * Calculate comprehensive risk score for a user
 * Returns 0-100 score where higher = riskier
 */
export async function calculateRiskScore(userId: string): Promise<RiskScoreResult> {
  const supabase = await createSupabaseServerClient();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, created_at, email")
    .eq("id", userId)
    .single();

  if (!profile) {
    return {
      score: 0,
      factors: [],
      recommendation: "monitor",
    };
  }

  const factors: Array<{ type: string; weight: number; description: string }> = [];
  let totalScore = 0;

  // Run all fraud detection checks
  const [bookingPattern, reviewPattern, accountAnomaly] = await Promise.all([
    detectSuspiciousBookingPattern(userId),
    detectReviewManipulation(userId, profile.role as "customer" | "professional"),
    detectAccountAnomaly(userId),
  ]);

  // Weight factors based on severity
  const severityWeights = {
    critical: 40,
    high: 30,
    medium: 20,
    low: 10,
  };

  if (bookingPattern.detected) {
    const weight = severityWeights[bookingPattern.severity];
    totalScore += weight;
    factors.push({
      type: "booking_pattern",
      weight,
      description: bookingPattern.reason || "Suspicious booking activity",
    });
  }

  if (reviewPattern.detected) {
    const weight = severityWeights[reviewPattern.severity];
    totalScore += weight;
    factors.push({
      type: "review_manipulation",
      weight,
      description: reviewPattern.reason || "Suspicious review activity",
    });
  }

  if (accountAnomaly.detected) {
    const weight = severityWeights[accountAnomaly.severity];
    totalScore += weight;
    factors.push({
      type: "account_anomaly",
      weight,
      description: accountAnomaly.reason || "Account anomaly detected",
    });
  }

  // Additional risk factors

  // Account age (newer accounts are riskier)
  const accountAgeInDays = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (accountAgeInDays < 7) {
    const weight = 15;
    totalScore += weight;
    factors.push({
      type: "new_account",
      weight,
      description: "Account created less than 7 days ago",
    });
  } else if (accountAgeInDays < 30) {
    const weight = 5;
    totalScore += weight;
    factors.push({
      type: "recent_account",
      weight,
      description: "Account created less than 30 days ago",
    });
  }

  // Determine recommendation based on score
  let recommendation: "monitor" | "review" | "suspend" | "ban";

  if (totalScore >= 70) {
    recommendation = "ban";
  } else if (totalScore >= 50) {
    recommendation = "suspend";
  } else if (totalScore >= 30) {
    recommendation = "review";
  } else {
    recommendation = "monitor";
  }

  return {
    score: Math.min(totalScore, 100),
    factors,
    recommendation,
  };
}
