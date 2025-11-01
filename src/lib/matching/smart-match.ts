/**
 * Smart Professional Matching Algorithm
 * Scores professionals based on multiple criteria with weighted importance
 */

export interface MatchCriteria {
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
}

export interface Professional {
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
}

export interface MatchedProfessional extends Professional {
  matchScore: number;
  matchReasons: string[];
  distance?: number; // in km
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

/**
 * Smart matching algorithm with weighted scoring
 */
export function matchProfessionals(
  professionals: Professional[],
  criteria: MatchCriteria
): MatchedProfessional[] {
  const results: MatchedProfessional[] = professionals
    .map((professional) => {
      let score = 0;
      const reasons: string[] = [];

      // Service Type Match (Weight: 30%)
      if (criteria.serviceType) {
        if (professional.services.includes(criteria.serviceType)) {
          score += 30;
          reasons.push("Exact service match");
        }
      }

      // Location/Distance (Weight: 20%)
      if (criteria.location) {
        const distance = calculateDistance(
          criteria.location.lat,
          criteria.location.lng,
          professional.location.lat,
          professional.location.lng
        );

        if (distance <= 5) {
          score += 20;
          reasons.push("Very close");
        } else if (distance <= 10) {
          score += 15;
          reasons.push("Nearby");
        } else if (distance <= 20) {
          score += 10;
        }

        (professional as MatchedProfessional).distance = distance;
      }

      // Budget Match (Weight: 15%)
      if (criteria.budget) {
        const { min, max } = criteria.budget;
        if (professional.hourlyRate >= min && professional.hourlyRate <= max) {
          score += 15;
          reasons.push("Within budget");
        } else if (
          professional.hourlyRate < min ||
          professional.hourlyRate <= max * 1.1
        ) {
          score += 10; // Slightly over budget but close
        }
      }

      // Language Match (Weight: 15%)
      if (criteria.languages && criteria.languages.length > 0) {
        const matchedLanguages = professional.languages.filter((lang) =>
          criteria.languages?.includes(lang)
        );
        if (matchedLanguages.length === criteria.languages.length) {
          score += 15;
          reasons.push("Speaks your languages");
        } else if (matchedLanguages.length > 0) {
          score += 10;
        }
      }

      // Rating & Reviews (Weight: 10%)
      if (professional.rating >= 4.8 && professional.reviewCount >= 20) {
        score += 10;
        reasons.push("Highly rated");
      } else if (professional.rating >= 4.5) {
        score += 7;
      } else if (professional.rating >= 4.0) {
        score += 5;
      }

      // Experience (Weight: 5%)
      if (criteria.experienceLevel) {
        if (
          criteria.experienceLevel === "expert" &&
          professional.experienceYears >= 5
        ) {
          score += 5;
          reasons.push("Expert professional");
        } else if (
          criteria.experienceLevel === "intermediate" &&
          professional.experienceYears >= 2
        ) {
          score += 5;
        } else if (criteria.experienceLevel === "any") {
          score += 3;
        }
      } else {
        // Default: more experience is better
        score += Math.min(5, professional.experienceYears);
      }

      // Verification (Weight: 5%)
      if (criteria.verificationRequired) {
        if (professional.verificationLevel === "background-check") {
          score += 5;
          reasons.push("Background checked");
        } else if (professional.verificationLevel === "enhanced") {
          score += 3;
        }
      }

      // Availability (Bonus)
      if (criteria.preferredTimes && criteria.preferredTimes.length > 0) {
        const availableForPreferredTimes = criteria.preferredTimes.some(
          (time) => professional.availability[time as keyof typeof professional.availability]
        );
        if (availableForPreferredTimes) {
          score += 3;
          reasons.push("Available at preferred times");
        }
      }

      // Reliability Bonus (based on on-time rate)
      if (professional.onTimeRate >= 95) {
        score += 2;
        reasons.push("Consistently on-time");
      }

      // Response Time Bonus
      if (professional.responseTimeMinutes <= 60) {
        score += 2;
        reasons.push("Quick to respond");
      }

      return {
        ...professional,
        matchScore: Math.min(100, score),
        matchReasons: reasons,
      } as MatchedProfessional;
    })
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
