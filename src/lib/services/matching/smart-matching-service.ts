/**
 * Smart Professional Matching Service
 *
 * Converts natural language requirements into structured matching criteria
 * and intelligently matches customers with ideal professionals.
 *
 * Features:
 * - Natural language → database query conversion
 * - Intelligent skill inference
 * - Availability matching
 * - Distance-based filtering
 * - Multi-criteria ranking
 */

import { type MatchingCriteria, matchingCriteriaSchema } from "@/lib/integrations/amara/schemas";
import { getStructuredOutput } from "@/lib/integrations/amara/structured-outputs";
import { trackProfessionalMatching } from "@/lib/integrations/amara/tracking";

/**
 * Parse natural language requirements into structured matching criteria
 *
 * @param userQuery - Natural language description of requirements
 * @param locale - User's language preference
 * @returns Structured matching criteria
 *
 * @example
 * ```typescript
 * const criteria = await parseMatchingCriteria(
 *   "I need someone experienced with kids, speaks English, available weekends",
 *   "en"
 * );
 *
 * // Returns:
 * // {
 * //   skills: ['childcare'],
 * //   languages: ['english'],
 * //   availability: { weekends: true },
 * //   experienceYears: 2,
 * //   sortPreference: 'rating'
 * // }
 * ```
 */
export async function parseMatchingCriteria(
  userQuery: string,
  locale: "en" | "es" = "en"
): Promise<MatchingCriteria> {
  const startTime = Date.now();
  const systemPrompt = getMatchingSystemPrompt(locale);

  try {
    const result = await getStructuredOutput({
      schema: matchingCriteriaSchema,
      systemPrompt,
      userMessage: userQuery,
      model: "claude-sonnet-4-5",
      temperature: 0.2, // Low temperature for consistent parsing
    });

    // Track successful parsing
    trackProfessionalMatching({
      success: true,
      criteriaDetected: {
        hasSkills: !!result.skills && result.skills.length > 0,
        hasLanguages: !!result.languages && result.languages.length > 0,
        hasExperience: result.experienceYears !== undefined,
        hasPriceRange: !!result.priceRange,
        hasAvailability: !!result.availability,
      },
      locale,
      processingTimeMs: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    // Track parsing errors
    trackProfessionalMatching({
      success: false,
      criteriaDetected: {
        hasSkills: false,
        hasLanguages: false,
        hasExperience: false,
        hasPriceRange: false,
        hasAvailability: false,
      },
      locale,
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

/**
 * Convert matching criteria to database query filters
 *
 * @param criteria - Structured matching criteria
 * @returns Database-friendly filter object
 */
export function criteriaToFilters(criteria: MatchingCriteria) {
  const filters: Record<string, unknown> = {};

  // Skills filter
  if (criteria.skills && criteria.skills.length > 0) {
    filters.skills = criteria.skills;
  }

  // Language requirements
  if (criteria.languages && criteria.languages.length > 0) {
    filters.languages = criteria.languages;
  }

  // Experience requirement
  if (criteria.experienceYears !== undefined) {
    filters.minExperienceYears = criteria.experienceYears;
  }

  // Verification level
  if (criteria.verificationLevel && criteria.verificationLevel !== "any") {
    filters.verificationLevel = criteria.verificationLevel;
  }

  // Price range
  if (criteria.priceRange) {
    if (criteria.priceRange.minHourlyRateCop) {
      filters.minHourlyRate = criteria.priceRange.minHourlyRateCop;
    }
    if (criteria.priceRange.maxHourlyRateCop) {
      filters.maxHourlyRate = criteria.priceRange.maxHourlyRateCop;
    }
  }

  // Minimum rating
  if (criteria.minimumRating) {
    filters.minRating = criteria.minimumRating;
  }

  // Distance filter
  if (criteria.maxDistance) {
    filters.maxDistanceKm = criteria.maxDistance;
  }

  // Special requirements
  if (criteria.specialRequirements) {
    if (criteria.specialRequirements.petFriendly) {
      filters.petFriendly = true;
    }
    if (criteria.specialRequirements.backgroundCheck) {
      filters.hasBackgroundCheck = true;
    }
    if (criteria.specialRequirements.insurance) {
      filters.hasInsurance = true;
    }
    if (criteria.specialRequirements.ecoFriendly) {
      filters.usesEcoProducts = true;
    }
  }

  // Availability filters
  if (criteria.availability) {
    filters.availability = criteria.availability;
  }

  // Sort preference
  if (criteria.sortPreference) {
    filters.sortBy = criteria.sortPreference;
  }

  return filters;
}

/**
 * Calculate match score between criteria and professional
 *
 * Scores each professional (0-100) based on how well they match the criteria.
 * Higher scores = better matches.
 *
 * @example
 * ```typescript
 * const score = calculateMatchScore(criteria, professional);
 * // Returns: { score: 87, breakdown: {...} }
 * ```
 */
export function calculateMatchScore(
  criteria: MatchingCriteria,
  professional: {
    skills: string[];
    languages: string[];
    experienceYears: number;
    rating: number;
    hourlyRateCop: number;
    verificationLevel: string;
    availability?: {
      weekdays?: boolean;
      weekends?: boolean;
      evenings?: boolean;
    };
    specialCapabilities?: {
      petFriendly?: boolean;
      backgroundCheck?: boolean;
      insurance?: boolean;
      ecoFriendly?: boolean;
    };
  }
): {
  score: number;
  breakdown: {
    skills: number;
    languages: number;
    experience: number;
    rating: number;
    availability: number;
    price: number;
    special: number;
  };
} {
  const breakdown = {
    skills: 0,
    languages: 0,
    experience: 0,
    rating: 0,
    availability: 0,
    price: 0,
    special: 0,
  };

  // Skills match (30 points max)
  if (criteria.skills && criteria.skills.length > 0) {
    const matchedSkills = criteria.skills.filter((skill) =>
      professional.skills.some((pSkill) => pSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    breakdown.skills = (matchedSkills.length / criteria.skills.length) * 30;
  } else {
    breakdown.skills = 30; // No requirement = full points
  }

  // Language match (20 points max)
  if (criteria.languages && criteria.languages.length > 0) {
    const matchedLangs = criteria.languages.filter((lang) =>
      professional.languages.some((pLang) => pLang.toLowerCase() === lang.toLowerCase())
    );
    breakdown.languages = (matchedLangs.length / criteria.languages.length) * 20;
  } else {
    breakdown.languages = 20;
  }

  // Experience match (15 points max)
  if (criteria.experienceYears !== undefined) {
    if (professional.experienceYears >= criteria.experienceYears) {
      // Full points if meets requirement
      breakdown.experience = 15;
    } else {
      // Partial points if close
      breakdown.experience = (professional.experienceYears / criteria.experienceYears) * 15;
    }
  } else {
    breakdown.experience = 15;
  }

  // Rating match (15 points max)
  const minRating = criteria.minimumRating || 0;
  if (professional.rating >= minRating) {
    // Scale 0-5 rating to 0-15 points
    breakdown.rating = (professional.rating / 5) * 15;
  }

  // Availability match (10 points max)
  if (criteria.availability && professional.availability) {
    let availabilityScore = 0;
    let requiredCount = 0;

    if (criteria.availability.weekdays !== undefined) {
      requiredCount++;
      if (professional.availability.weekdays === criteria.availability.weekdays) {
        availabilityScore += 1;
      }
    }

    if (criteria.availability.weekends !== undefined) {
      requiredCount++;
      if (professional.availability.weekends === criteria.availability.weekends) {
        availabilityScore += 1;
      }
    }

    if (criteria.availability.evenings !== undefined) {
      requiredCount++;
      if (professional.availability.evenings === criteria.availability.evenings) {
        availabilityScore += 1;
      }
    }

    if (requiredCount > 0) {
      breakdown.availability = (availabilityScore / requiredCount) * 10;
    } else {
      breakdown.availability = 10;
    }
  } else {
    breakdown.availability = 10;
  }

  // Price match (5 points max)
  if (criteria.priceRange?.maxHourlyRateCop) {
    if (professional.hourlyRateCop <= criteria.priceRange.maxHourlyRateCop) {
      // Full points if within budget
      breakdown.price = 5;
    } else {
      // No points if over budget
      breakdown.price = 0;
    }
  } else {
    breakdown.price = 5;
  }

  // Special requirements (5 points max)
  if (criteria.specialRequirements && professional.specialCapabilities) {
    let specialScore = 0;
    let specialCount = 0;

    if (criteria.specialRequirements.petFriendly !== undefined) {
      specialCount++;
      if (professional.specialCapabilities.petFriendly) specialScore += 1;
    }

    if (criteria.specialRequirements.backgroundCheck !== undefined) {
      specialCount++;
      if (professional.specialCapabilities.backgroundCheck) specialScore += 1;
    }

    if (criteria.specialRequirements.insurance !== undefined) {
      specialCount++;
      if (professional.specialCapabilities.insurance) specialScore += 1;
    }

    if (criteria.specialRequirements.ecoFriendly !== undefined) {
      specialCount++;
      if (professional.specialCapabilities.ecoFriendly) specialScore += 1;
    }

    if (specialCount > 0) {
      breakdown.special = (specialScore / specialCount) * 5;
    } else {
      breakdown.special = 5;
    }
  } else {
    breakdown.special = 5;
  }

  // Calculate total score
  const score = Math.round(
    breakdown.skills +
      breakdown.languages +
      breakdown.experience +
      breakdown.rating +
      breakdown.availability +
      breakdown.price +
      breakdown.special
  );

  return { score, breakdown };
}

/**
 * System prompt for matching criteria parsing
 */
function getMatchingSystemPrompt(locale: "en" | "es"): string {
  if (locale === "es") {
    return `Eres un parser de criterios de coincidencia para Casaora, una plataforma de servicios domésticos.

Tu trabajo es convertir requisitos en lenguaje natural en criterios estructurados para buscar profesionales.

**Habilidades Comunes:**
- deep cleaning: Limpieza profunda
- eco-friendly products: Productos ecológicos
- pet care: Cuidado de mascotas
- childcare: Cuidado de niños
- cooking: Cocinar
- ironing: Planchar
- organization: Organización

**Disponibilidad:**
- weekdays: Lunes a viernes
- weekends: Sábados y domingos
- evenings: Después de las 6pm
- mornings: Antes de las 12pm
- flexible: Horario flexible

**Inferencias Inteligentes:**
- "con experiencia con niños" → childcare skill + 2+ años de experiencia
- "habla inglés" → languages: ['english']
- "fines de semana" → availability.weekends: true
- "menos de $50k/hora" → priceRange.maxHourlyRateCop: 50000
- "certificado" → verificationLevel: 'verified'

Extrae todos los criterios y haz inferencias inteligentes sobre los requisitos.`;
  }

  return `You are a matching criteria parser for Casaora, a household services platform.

Your job is to convert natural language requirements into structured criteria for finding professionals.

**Common Skills:**
- deep cleaning: Deep cleaning services
- eco-friendly products: Uses eco-friendly products
- pet care: Comfortable with pets
- childcare: Childcare, babysitting
- cooking: Meal preparation
- ironing: Ironing services
- organization: Home organization

**Availability:**
- weekdays: Monday through Friday
- weekends: Saturday and Sunday
- evenings: After 6pm
- mornings: Before 12pm
- flexible: Flexible schedule

**Intelligent Inferences:**
- "experienced with kids" → childcare skill + 2+ years experience
- "speaks English" → languages: ['english']
- "weekends" → availability.weekends: true
- "under $50k/hour" → priceRange.maxHourlyRateCop: 50000
- "certified" → verificationLevel: 'verified'
- "pet friendly" → specialRequirements.petFriendly: true

Extract all criteria and make intelligent inferences about requirements.

Be thorough and interpret context carefully.`;
}
