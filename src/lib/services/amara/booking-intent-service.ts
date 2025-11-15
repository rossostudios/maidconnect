/**
 * Booking Intent Parsing Service
 *
 * Converts natural language booking requests into structured search parameters
 * using Claude's structured outputs feature.
 *
 * Examples:
 * - "I need a cleaner tomorrow in Bogotá" → { serviceType: 'cleaning', location: { city: 'Bogotá' }, ... }
 * - "Looking for someone experienced with kids" → { serviceType: 'childcare', requirements: { ... }, ... }
 */

import { type BookingIntent, bookingIntentSchema } from "@/lib/integrations/amara/schemas";
import { getStructuredOutput } from "@/lib/integrations/amara/structured-outputs";
import { trackBookingIntentParsing } from "@/lib/integrations/amara/tracking";

/**
 * Parse natural language booking request into structured parameters
 *
 * @param userMessage - Natural language booking request
 * @param locale - User's language preference ('en' or 'es')
 * @returns Structured booking intent with search parameters
 *
 * @example
 * ```typescript
 * const intent = await parseBookingIntent(
 *   "I need someone experienced with kids, speaks English, available weekends",
 *   "en"
 * );
 *
 * // Returns:
 * // {
 * //   serviceType: 'childcare',
 * //   requirements: {
 * //     languages: ['english'],
 * //     specialSkills: ['childcare'],
 * //   },
 * //   schedule: {
 * //     weekends: true,
 * //   }
 * // }
 * ```
 */
export async function parseBookingIntent(
  userMessage: string,
  locale: "en" | "es" = "en"
): Promise<BookingIntent> {
  const startTime = Date.now();
  const systemPrompt = getBookingIntentSystemPrompt(locale);

  try {
    const result = await getStructuredOutput({
      schema: bookingIntentSchema,
      systemPrompt,
      userMessage,
      model: "claude-sonnet-4-5",
      temperature: 0.3, // Low temperature for consistent parsing
    });

    // Track successful parsing
    trackBookingIntentParsing({
      success: true,
      serviceType: result.serviceType,
      hasLocation: !!result.location?.city,
      hasRequirements: !!result.requirements,
      urgency: result.urgency || "not_specified",
      locale,
      processingTimeMs: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    // Track parsing errors
    trackBookingIntentParsing({
      success: false,
      hasLocation: false,
      hasRequirements: false,
      locale,
      error: error instanceof Error ? error.message : "unknown",
      processingTimeMs: Date.now() - startTime,
    });
    throw error;
  }
}

/**
 * Convert booking intent into database query filters
 *
 * @param intent - Parsed booking intent
 * @returns Database-friendly filter object
 */
export function intentToSearchFilters(intent: BookingIntent) {
  const filters: Record<string, unknown> = {};

  // Service type filter
  if (intent.serviceType) {
    filters.serviceType = intent.serviceType;
  }

  // Location filters
  if (intent.location?.city) {
    filters.city = intent.location.city;
  }

  // Language requirements
  if (intent.requirements?.languages && intent.requirements.languages.length > 0) {
    filters.languages = intent.requirements.languages;
  }

  // Experience requirement
  if (intent.requirements?.experienceYears) {
    filters.minExperience = intent.requirements.experienceYears;
  }

  // Budget constraint
  if (intent.budget?.maxHourlyRateCop) {
    filters.maxHourlyRate = intent.budget.maxHourlyRateCop;
  }

  // Special requirements
  if (intent.requirements?.petFriendly) {
    filters.petFriendly = true;
  }

  if (intent.requirements?.backgroundCheck) {
    filters.hasBackgroundCheck = true;
  }

  // Availability filters
  if (intent.schedule?.weekends) {
    filters.availableWeekends = true;
  }

  if (intent.schedule?.weekdays) {
    filters.availableWeekdays = true;
  }

  return filters;
}

/**
 * Extract urgency level from intent for prioritization
 */
export function getIntentUrgency(intent: BookingIntent): "high" | "medium" | "low" {
  if (intent.urgency === "immediate") return "high";
  if (intent.urgency === "within_week") return "medium";
  return "low";
}

/**
 * System prompt for booking intent parsing (English)
 */
function getBookingIntentSystemPrompt(locale: "en" | "es"): string {
  if (locale === "es") {
    return `Eres un parser de intención de reserva para Casaora, una plataforma de servicios domésticos.

Tu trabajo es analizar las solicitudes de los usuarios y extraer parámetros de búsqueda estructurados.

**Tipos de Servicio:**
- cleaning: Limpieza general, limpieza profunda, limpieza de mudanza
- cooking: Preparación de comidas, chef personal
- childcare: Cuidado de niños, niñera
- elder_care: Cuidado de ancianos, asistencia médica domiciliaria
- laundry: Lavandería, planchado
- general: Asistente del hogar general

**Idiomas:**
- english: Inglés
- spanish: Español
- french: Francés
- portuguese: Portugués

**Preferencias de Horario:**
- morning: 6am-12pm
- afternoon: 12pm-6pm
- evening: 6pm-10pm
- flexible: Cualquier hora

**Urgencia:**
- immediate: Hoy o mañana
- within_week: Dentro de una semana
- flexible: Sin prisa
- planning_ahead: Planificación anticipada

Extrae TODOS los parámetros relevantes del mensaje del usuario. Si no se menciona algo, déjalo como null u opcional.`;
  }

  return `You are a booking intent parser for Casaora, a household services platform.

Your job is to analyze user requests and extract structured search parameters.

**Service Types:**
- cleaning: General cleaning, deep cleaning, move-out cleaning
- cooking: Meal preparation, personal chef
- childcare: Babysitting, nanny services
- elder_care: Elder care, home health assistance
- laundry: Laundry, ironing
- general: General household assistant

**Languages:**
- english: English
- spanish: Spanish
- french: French
- portuguese: Portuguese

**Time Preferences:**
- morning: 6am-12pm
- afternoon: 12pm-6pm
- evening: 6pm-10pm
- flexible: Any time

**Urgency:**
- immediate: Today or tomorrow
- within_week: Within the next week
- flexible: No rush
- planning_ahead: Advanced planning

Extract ALL relevant parameters from the user's message. If something is not mentioned, leave it as null or optional.

Be intelligent about inferring context:
- "experienced with kids" → childcare service + experience requirement
- "speaks English" → language requirement
- "weekends" → weekend availability
- "under $50k COP/hour" → budget constraint
- "Bogotá" → location
- "ASAP" or "urgent" → immediate urgency

Focus on accuracy and completeness.`;
}
