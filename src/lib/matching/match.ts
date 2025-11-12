/**
 * Smart Professional Matching Algorithm
 * Scores professionals based on multiple criteria with weighted importance
 */

export type MatchCriteria = {
  serviceType?: string;
  location?: {
    lat: number;
    lng: number;
  };
  budget?: {
    min: number;
    max: number;
  };
  languages?: string[];
  preferredTimes?: string[]; // e.g., ["morning", "afternoon"]
  experienceLevel?: "any" | "beginner" | "intermediate" | "expert";
  verificationRequired?: boolean;
};

export type Professional = {
  id: string;
  services: string[];
  location: {
    lat: number;
    lng: number;
  };
  hourlyRate: number;
  languages: string[];
  rating: number;
  reviewCount: number;
  experienceYears: number;
  verificationLevel: "basic" | "enhanced" | "background-check";
  availability: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  responseTimeMinutes: number;
  onTimeRate: number;
};

export interface MatchedProfessional extends Professional {
  matchScore: number;
  matchReasons: string[];
  distance?: number; // in km
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type ScoringResult = {
  score: number;
  reasons: string[];
  distance?: number;
};

/**
 * Calculate service type match score (Weight: 30%)
 */
function scoreServiceMatch(professional: Professional, criteria: MatchCriteria): ScoringResult {
  if (criteria.serviceType && professional.services.includes(criteria.serviceType)) {
    return { score: 30, reasons: ["Exact service match"] };
  }
  return { score: 0, reasons: [] };
}

/**
 * Calculate location/distance score (Weight: 20%)
 */
function scoreLocation(professional: Professional, criteria: MatchCriteria): ScoringResult {
  if (!criteria.location) {
    return { score: 0, reasons: [] };
  }

  const distance = calculateDistance(
    criteria.location.lat,
    criteria.location.lng,
    professional.location.lat,
    professional.location.lng
  );

  if (distance <= 5) {
    return { score: 20, reasons: ["Very close"], distance };
  }
  if (distance <= 10) {
    return { score: 15, reasons: ["Nearby"], distance };
  }
  if (distance <= 20) {
    return { score: 10, reasons: [], distance };
  }

  return { score: 0, reasons: [], distance };
}

/**
 * Calculate budget match score (Weight: 15%)
 */
function scoreBudget(professional: Professional, criteria: MatchCriteria): ScoringResult {
  if (!criteria.budget) {
    return { score: 0, reasons: [] };
  }

  const { min, max } = criteria.budget;
  if (professional.hourlyRate >= min && professional.hourlyRate <= max) {
    return { score: 15, reasons: ["Within budget"] };
  }
  if (professional.hourlyRate < min || professional.hourlyRate <= max * 1.1) {
    return { score: 10, reasons: [] }; // Slightly over budget but close
  }

  return { score: 0, reasons: [] };
}

/**
 * Calculate language match score (Weight: 15%)
 */
function scoreLanguages(professional: Professional, criteria: MatchCriteria): ScoringResult {
  if (!criteria.languages || criteria.languages.length === 0) {
    return { score: 0, reasons: [] };
  }

  const matchedLanguages = professional.languages.filter((lang) =>
    criteria.languages?.includes(lang)
  );

  if (matchedLanguages.length === criteria.languages.length) {
    return { score: 15, reasons: ["Speaks your languages"] };
  }
  if (matchedLanguages.length > 0) {
    return { score: 10, reasons: [] };
  }

  return { score: 0, reasons: [] };
}

/**
 * Calculate rating & reviews score (Weight: 10%)
 */
function scoreRating(professional: Professional): ScoringResult {
  if (professional.rating >= 4.8 && professional.reviewCount >= 20) {
    return { score: 10, reasons: ["Highly rated"] };
  }
  if (professional.rating >= 4.5) {
    return { score: 7, reasons: [] };
  }
  if (professional.rating >= 4.0) {
    return { score: 5, reasons: [] };
  }
  return { score: 0, reasons: [] };
}

/**
 * Calculate experience score (Weight: 5%)
 */
function scoreExperience(professional: Professional, criteria: MatchCriteria): ScoringResult {
  if (criteria.experienceLevel) {
    if (criteria.experienceLevel === "expert" && professional.experienceYears >= 5) {
      return { score: 5, reasons: ["Expert professional"] };
    }
    if (criteria.experienceLevel === "intermediate" && professional.experienceYears >= 2) {
      return { score: 5, reasons: [] };
    }
    if (criteria.experienceLevel === "any") {
      return { score: 3, reasons: [] };
    }
    return { score: 0, reasons: [] };
  }

  // Default: more experience is better
  return { score: Math.min(5, professional.experienceYears), reasons: [] };
}

/**
 * Calculate verification score (Weight: 5%)
 */
function scoreVerification(professional: Professional, criteria: MatchCriteria): ScoringResult {
  if (!criteria.verificationRequired) {
    return { score: 0, reasons: [] };
  }

  if (professional.verificationLevel === "background-check") {
    return { score: 5, reasons: ["Background checked"] };
  }
  if (professional.verificationLevel === "enhanced") {
    return { score: 3, reasons: [] };
  }

  return { score: 0, reasons: [] };
}

/**
 * Calculate bonus scores (availability, reliability, response time)
 */
function scoreBonuses(professional: Professional, criteria: MatchCriteria): ScoringResult {
  let score = 0;
  const reasons: string[] = [];

  // Availability bonus
  if (criteria.preferredTimes && criteria.preferredTimes.length > 0) {
    const availableForPreferredTimes = criteria.preferredTimes.some(
      (time) => professional.availability[time as keyof typeof professional.availability]
    );
    if (availableForPreferredTimes) {
      score += 3;
      reasons.push("Available at preferred times");
    }
  }

  // Reliability bonus
  if (professional.onTimeRate >= 95) {
    score += 2;
    reasons.push("Consistently on-time");
  }

  // Response time bonus
  if (professional.responseTimeMinutes <= 60) {
    score += 2;
    reasons.push("Quick to respond");
  }

  return { score, reasons };
}

/**
 * Calculate total match score for a professional
 */
function scoreProfessional(
  professional: Professional,
  criteria: MatchCriteria
): MatchedProfessional {
  let totalScore = 0;
  const allReasons: string[] = [];
  let distance: number | undefined;

  const serviceResult = scoreServiceMatch(professional, criteria);
  totalScore += serviceResult.score;
  allReasons.push(...serviceResult.reasons);

  const locationResult = scoreLocation(professional, criteria);
  totalScore += locationResult.score;
  allReasons.push(...locationResult.reasons);
  distance = locationResult.distance;

  const budgetResult = scoreBudget(professional, criteria);
  totalScore += budgetResult.score;
  allReasons.push(...budgetResult.reasons);

  const languageResult = scoreLanguages(professional, criteria);
  totalScore += languageResult.score;
  allReasons.push(...languageResult.reasons);

  const ratingResult = scoreRating(professional);
  totalScore += ratingResult.score;
  allReasons.push(...ratingResult.reasons);

  const experienceResult = scoreExperience(professional, criteria);
  totalScore += experienceResult.score;
  allReasons.push(...experienceResult.reasons);

  const verificationResult = scoreVerification(professional, criteria);
  totalScore += verificationResult.score;
  allReasons.push(...verificationResult.reasons);

  const bonusResult = scoreBonuses(professional, criteria);
  totalScore += bonusResult.score;
  allReasons.push(...bonusResult.reasons);

  return {
    ...professional,
    matchScore: Math.min(100, totalScore),
    matchReasons: allReasons,
    distance,
  };
}

/**
 * Smart matching algorithm with weighted scoring
 */
export function matchProfessionals(
  professionals: Professional[],
  criteria: MatchCriteria
): MatchedProfessional[] {
  const results: MatchedProfessional[] = professionals
    .map((professional) => scoreProfessional(professional, criteria))
    .filter((match) => match.matchScore >= 40) // Minimum threshold
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by score descending

  return results;
}

/**
 * Get similar professionals based on a reference professional
 * Useful for "You might also like" recommendations
 */
export function getSimilarProfessionals(
  referencePro: Professional,
  allProfessionals: Professional[],
  limit = 5
): MatchedProfessional[] {
  const criteria: MatchCriteria = {
    serviceType: referencePro.services[0],
    location: referencePro.location,
    budget: {
      min: referencePro.hourlyRate * 0.8,
      max: referencePro.hourlyRate * 1.2,
    },
    languages: referencePro.languages,
  };

  return matchProfessionals(
    allProfessionals.filter((p) => p.id !== referencePro.id),
    criteria
  ).slice(0, limit);
}
