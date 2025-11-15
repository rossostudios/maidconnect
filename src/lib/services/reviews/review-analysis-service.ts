/**
 * Review Sentiment Analysis Service
 *
 * Analyzes user reviews to extract sentiment, flags, and actionable insights
 * for admin moderation and professional performance monitoring.
 *
 * Features:
 * - Sentiment classification (positive/neutral/negative/mixed)
 * - Category detection (quality, punctuality, professionalism, etc.)
 * - Safety flag detection (harassment, theft, property damage, etc.)
 * - Auto-routing to moderation queue
 * - AI-generated response suggestions
 */

import { getStructuredOutput, getBatchStructuredOutput } from "@/lib/integrations/amara/structured-outputs";
import {
  reviewAnalysisSchema,
  type ReviewAnalysis,
} from "@/lib/integrations/amara/schemas";
import { trackReviewAnalysis } from "@/lib/integrations/amara/tracking";

/**
 * Analyze a single review for sentiment and flags
 *
 * @param reviewText - The review content to analyze
 * @param rating - Optional star rating (1-5) if provided by user
 * @param locale - Review language ('en' or 'es')
 * @returns Structured analysis with sentiment, categories, and flags
 *
 * @example
 * ```typescript
 * const analysis = await analyzeReview(
 *   "Maria was fantastic! Always on time and very professional.",
 *   5,
 *   "en"
 * );
 *
 * if (analysis.sentiment === "positive") {
 *   await publishReviewImmediately(reviewId);
 * }
 *
 * if (analysis.actionRequired) {
 *   await routeToModerationQueue(reviewId, analysis.severity);
 * }
 * ```
 */
export async function analyzeReview(
  reviewText: string,
  rating?: number,
  locale: "en" | "es" = "en"
): Promise<ReviewAnalysis> {
  const startTime = Date.now();
  const systemPrompt = getReviewAnalysisSystemPrompt(locale);

  const userMessage = rating
    ? `Review (${rating}/5 stars):\n\n${reviewText}`
    : `Review:\n\n${reviewText}`;

  try {
    const result = await getStructuredOutput({
      schema: reviewAnalysisSchema,
      systemPrompt,
      userMessage,
      model: "claude-sonnet-4-5",
      temperature: 0.2, // Low temperature for consistent classification
    });

    // Track successful analysis
    const { autoPublish } = shouldAutoPublish(result);
    trackReviewAnalysis({
      success: true,
      sentiment: result.sentiment,
      categoryCount: result.categories.length,
      flagCount: result.flags.length,
      actionRequired: result.actionRequired,
      severity: result.severity,
      autoPublish,
      processingTimeMs: Date.now() - startTime,
      locale,
    });

    return result;
  } catch (error) {
    // Track analysis errors
    trackReviewAnalysis({
      success: false,
      processingTimeMs: Date.now() - startTime,
      locale,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

/**
 * Analyze multiple reviews in batch
 *
 * More efficient for bulk processing (e.g., analyzing all reviews for a professional)
 *
 * @example
 * ```typescript
 * const reviews = await fetchPendingReviews();
 * const analyses = await analyzeBatchReviews(reviews);
 *
 * // Auto-publish positive reviews
 * const autoPublish = analyses.filter(a => !a.actionRequired);
 *
 * // Route flagged reviews to moderation
 * const needsReview = analyses.filter(a => a.actionRequired);
 * ```
 */
export async function analyzeBatchReviews(
  reviews: Array<{ text: string; rating?: number; locale?: "en" | "es" }>
): Promise<ReviewAnalysis[]> {
  const systemPrompt = getReviewAnalysisSystemPrompt("en");

  const configs = reviews.map((review) => ({
    schema: reviewAnalysisSchema,
    systemPrompt,
    userMessage: review.rating
      ? `Review (${review.rating}/5 stars):\n\n${review.text}`
      : `Review:\n\n${review.text}`,
    model: "claude-sonnet-4-5" as const,
    temperature: 0.2,
  }));

  return await getBatchStructuredOutput(configs);
}

/**
 * Determine if review should be auto-published or sent to moderation
 */
export function shouldAutoPublish(analysis: ReviewAnalysis): {
  autoPublish: boolean;
  reason: string;
} {
  // Never auto-publish if action is required
  if (analysis.actionRequired) {
    return {
      autoPublish: false,
      reason: `Requires admin review (severity: ${analysis.severity})`,
    };
  }

  // Never auto-publish if there are critical flags
  const criticalFlags = [
    "potential_safety_issue",
    "harassment_claim",
    "theft_allegation",
    "property_damage",
    "fraudulent_activity",
  ];

  const hasCriticalFlag = analysis.flags.some((flag) => criticalFlags.includes(flag));
  if (hasCriticalFlag) {
    return {
      autoPublish: false,
      reason: `Critical flag detected: ${analysis.flags.join(", ")}`,
    };
  }

  // Don't auto-publish very negative reviews with high severity
  if (analysis.sentiment === "negative" && analysis.severity === "high") {
    return {
      autoPublish: false,
      reason: "Negative review with high severity - requires review",
    };
  }

  // Auto-publish positive reviews with low risk
  if (
    analysis.sentiment === "positive" &&
    analysis.professionalImpact.riskLevel === "none"
  ) {
    return {
      autoPublish: true,
      reason: "Positive review with no risk",
    };
  }

  // Auto-publish neutral reviews with low risk
  if (
    (analysis.sentiment === "neutral" || analysis.sentiment === "mixed") &&
    analysis.professionalImpact.riskLevel === "none"
  ) {
    return {
      autoPublish: true,
      reason: "Neutral review with no risk",
    };
  }

  // Default to manual review for anything unclear
  return {
    autoPublish: false,
    reason: "Default to manual review for safety",
  };
}

/**
 * Generate admin notification for high-priority reviews
 */
export function shouldNotifyAdmin(analysis: ReviewAnalysis): boolean {
  // Notify for critical severity
  if (analysis.severity === "critical") return true;

  // Notify for high severity with action required
  if (analysis.severity === "high" && analysis.actionRequired) return true;

  // Notify for safety flags
  const safetyFlags = [
    "potential_safety_issue",
    "harassment_claim",
    "theft_allegation",
    "property_damage",
  ];

  return analysis.flags.some((flag) => safetyFlags.includes(flag));
}

/**
 * Get recommended admin action from analysis
 */
export function getRecommendedAction(analysis: ReviewAnalysis): {
  action: string;
  priority: "low" | "medium" | "high" | "critical";
  steps: string[];
} {
  const { suggestedAction } = analysis.professionalImpact;

  if (suggestedAction === "escalate_to_manager") {
    return {
      action: "Escalate to Manager",
      priority: "critical",
      steps: [
        "Review full booking details and timeline",
        "Contact both customer and professional",
        "Verify claims with evidence",
        "Determine if professional should be suspended",
        "Coordinate with support team for resolution",
      ],
    };
  }

  if (suggestedAction === "contact_both_parties") {
    return {
      action: "Contact Both Parties",
      priority: "high",
      steps: [
        "Reach out to customer for more details",
        "Contact professional for their perspective",
        "Review booking evidence (messages, photos)",
        "Mediate resolution if possible",
        "Decide on review publication",
      ],
    };
  }

  if (suggestedAction === "request_clarification") {
    return {
      action: "Request Clarification",
      priority: "medium",
      steps: [
        "Email customer asking for specific details",
        "Set 48-hour response deadline",
        "If clarified, re-analyze review",
        "If no response, publish with disclaimer",
      ],
    };
  }

  if (suggestedAction === "hold_for_review") {
    return {
      action: "Manual Review Required",
      priority: "medium",
      steps: [
        "Review full context of booking",
        "Check for similar reviews about this professional",
        "Verify compliance with review guidelines",
        "Approve or request edits",
      ],
    };
  }

  return {
    action: "Publish",
    priority: "low",
    steps: ["Publish review immediately", "Monitor for customer/professional responses"],
  };
}

/**
 * System prompt for review analysis
 */
function getReviewAnalysisSystemPrompt(locale: "en" | "es"): string {
  if (locale === "es") {
    return `Eres un especialista en análisis de reseñas para Casaora, una plataforma de servicios domésticos profesionales.

**Tu Trabajo:**
Analizar reseñas de clientes para:
1. Clasificar sentimiento (positivo, negativo, neutral, mixto)
2. Identificar categorías principales (calidad, puntualidad, profesionalismo, etc.)
3. Detectar banderas de seguridad o problemas críticos
4. Determinar si se requiere revisión administrativa
5. Sugerir respuestas apropiadas

**Categorías de Reseñas:**
- quality: Calidad del servicio prestado
- punctuality: Llegada a tiempo, cumplimiento de horarios
- professionalism: Comportamiento, presentación, ética
- communication: Claridad en comunicación, respuestas
- pricing: Precio justo, valor por dinero
- cleanliness: Limpieza del trabajo, orden
- safety: Seguridad, confianza, respeto de límites
- reliability: Confiabilidad, consistencia

**Banderas Críticas (Requieren Atención Inmediata):**
- potential_safety_issue: Cualquier preocupación de seguridad
- harassment_claim: Acoso de cualquier tipo
- payment_dispute: Disputas de pago, cobros incorrectos
- no_show: Profesional no se presentó
- property_damage: Daño a propiedad del cliente
- theft_allegation: Alegación de robo
- fraudulent_activity: Actividad fraudulenta

**Niveles de Severidad:**
- critical: Requiere acción inmediata (seguridad, robo, acoso)
- high: Requiere revisión urgente (daño, disputa seria)
- medium: Requiere revisión pero no urgente
- low: Informativo, no requiere acción

**Acciones Sugeridas:**
- publish_immediately: Reseña positiva sin problemas
- hold_for_review: Revisar antes de publicar
- request_clarification: Pedir más detalles al cliente
- escalate_to_manager: Escalar a gerencia
- contact_both_parties: Contactar cliente y profesional

Sé objetivo, justo y enfócate en la seguridad de la plataforma.`;
  }

  return `You are a review analysis specialist for Casaora, a professional household services platform.

**Your Job:**
Analyze customer reviews to:
1. Classify sentiment (positive, negative, neutral, mixed)
2. Identify key categories (quality, punctuality, professionalism, etc.)
3. Detect safety flags or critical issues
4. Determine if admin review is required
5. Suggest appropriate responses

**Review Categories:**
- quality: Quality of service provided
- punctuality: On-time arrival, schedule adherence
- professionalism: Behavior, presentation, ethics
- communication: Communication clarity, responsiveness
- pricing: Fair pricing, value for money
- cleanliness: Work cleanliness, tidiness
- safety: Safety, trust, boundary respect
- reliability: Dependability, consistency

**Critical Flags (Require Immediate Attention):**
- potential_safety_issue: Any safety concern
- harassment_claim: Harassment of any kind
- payment_dispute: Payment disputes, incorrect charges
- no_show: Professional didn't show up
- property_damage: Damage to customer property
- theft_allegation: Theft allegation
- fraudulent_activity: Fraudulent activity

**Severity Levels:**
- critical: Requires immediate action (safety, theft, harassment)
- high: Requires urgent review (damage, serious dispute)
- medium: Requires review but not urgent
- low: Informational, no action needed

**Suggested Actions:**
- publish_immediately: Positive review with no issues
- hold_for_review: Review before publishing
- request_clarification: Ask customer for more details
- escalate_to_manager: Escalate to management
- contact_both_parties: Contact both customer and professional

Be objective, fair, and prioritize platform safety.

**Response Suggestions:**
When suggesting responses:
- For positive reviews: Thank customer, acknowledge professional
- For negative reviews: Apologize, offer to investigate, provide resolution
- For safety issues: Take seriously, assure immediate investigation
- Keep tone professional, empathetic, and solution-oriented`;
}
