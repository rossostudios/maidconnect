/**
 * Structured Output Schemas for Amara AI
 *
 * Defines Zod schemas and TypeScript types for guaranteed structured outputs
 * from Claude API using Anthropic's structured outputs feature.
 *
 * These schemas ensure consistent, type-safe AI responses for all critical
 * booking and analysis workflows.
 */

import { z } from "zod";

// ============================================================================
// 1. BOOKING INTENT PARSING
// ============================================================================

/**
 * Schema for parsing user booking intent into structured search parameters
 *
 * Used by Amara to convert natural language queries into database-friendly filters.
 * Example: "I need someone experienced with kids, speaks English, available weekends"
 */
export const bookingIntentSchema = z.object({
  serviceType: z
    .enum(["cleaning", "cooking", "childcare", "elder_care", "laundry", "general"])
    .describe("Type of household service needed"),

  location: z
    .object({
      city: z.string().optional().describe("City name (e.g., 'Bogotá', 'Medellín')"),
      neighborhood: z.string().optional().describe("Specific neighborhood if mentioned"),
    })
    .optional()
    .describe("Geographic location for the service"),

  schedule: z
    .object({
      date: z.string().optional().describe("Preferred date in YYYY-MM-DD format"),
      timePreference: z
        .enum(["morning", "afternoon", "evening", "flexible"])
        .optional()
        .describe("Preferred time of day"),
      recurring: z.boolean().optional().describe("Whether this is a recurring booking"),
      frequency: z
        .enum(["daily", "weekly", "biweekly", "monthly"])
        .optional()
        .describe("Frequency if recurring"),
      weekdays: z.boolean().optional().describe("Available on weekdays"),
      weekends: z.boolean().optional().describe("Available on weekends"),
    })
    .optional()
    .describe("Scheduling preferences"),

  requirements: z
    .object({
      languages: z
        .array(z.enum(["english", "spanish", "french", "portuguese"]))
        .optional()
        .describe("Required languages"),
      experienceYears: z.number().min(0).optional().describe("Minimum years of experience"),
      specialSkills: z
        .array(z.string())
        .optional()
        .describe("Special skills or certifications needed"),
      petFriendly: z.boolean().optional().describe("Must be comfortable with pets"),
      backgroundCheck: z.boolean().optional().describe("Must have background check"),
    })
    .optional()
    .describe("Professional requirements"),

  budget: z
    .object({
      maxHourlyRateCop: z.number().optional().describe("Maximum hourly rate in COP"),
      estimatedHours: z.number().optional().describe("Estimated hours needed"),
    })
    .optional()
    .describe("Budget constraints"),

  urgency: z
    .enum(["immediate", "within_week", "flexible", "planning_ahead"])
    .optional()
    .describe("How soon the service is needed"),

  additionalNotes: z.string().optional().describe("Any other relevant information from user"),
});

export type BookingIntent = z.infer<typeof bookingIntentSchema>;

// ============================================================================
// 2. DOCUMENT EXTRACTION (Background Checks)
// ============================================================================

/**
 * Schema for extracting structured data from professional documents
 *
 * Used for background check reports, ID scans, certifications, etc.
 */
export const documentExtractionSchema = z.object({
  documentType: z
    .enum([
      "national_id",
      "passport",
      "background_check_report",
      "certification",
      "reference_letter",
      "other",
    ])
    .describe("Type of document analyzed"),

  personalInfo: z
    .object({
      fullName: z.string().describe("Full legal name"),
      idNumber: z.string().optional().describe("National ID or passport number"),
      dateOfBirth: z.string().optional().describe("Date of birth in YYYY-MM-DD format"),
      nationality: z.string().optional().describe("Nationality"),
      address: z.string().optional().describe("Residential address"),
    })
    .optional()
    .describe("Personal identification information"),

  certifications: z
    .array(
      z.object({
        name: z.string().describe("Certification name"),
        issuer: z.string().describe("Issuing organization"),
        issueDate: z.string().optional().describe("Issue date in YYYY-MM-DD format"),
        expirationDate: z.string().optional().describe("Expiration date in YYYY-MM-DD format"),
        credentialId: z.string().optional().describe("Credential or certificate ID"),
      })
    )
    .optional()
    .describe("Professional certifications found in document"),

  backgroundCheckResults: z
    .object({
      status: z
        .enum(["clear", "conditional", "flagged", "pending"])
        .optional()
        .describe("Overall background check status"),
      criminalRecord: z.boolean().optional().describe("Criminal record found"),
      creditCheck: z.boolean().optional().describe("Credit check passed"),
      employmentVerified: z.boolean().optional().describe("Employment history verified"),
      educationVerified: z.boolean().optional().describe("Education verified"),
      flaggedIssues: z
        .array(z.string())
        .optional()
        .describe("List of any flagged issues or concerns"),
    })
    .optional()
    .describe("Background check results if document is a background report"),

  expirationDate: z.string().optional().describe("Document expiration date in YYYY-MM-DD format"),

  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("AI confidence score (0-100) in extraction accuracy"),

  extractedText: z.string().optional().describe("Raw extracted text for audit purposes"),

  warnings: z
    .array(z.string())
    .optional()
    .describe("Warnings about document quality, missing info, or inconsistencies"),
});

export type DocumentExtraction = z.infer<typeof documentExtractionSchema>;

// ============================================================================
// 3. REVIEW SENTIMENT ANALYSIS
// ============================================================================

/**
 * Schema for analyzing user reviews and generating admin insights
 *
 * Used to automatically classify and route reviews for moderation.
 */
export const reviewAnalysisSchema = z.object({
  sentiment: z
    .enum(["positive", "neutral", "negative", "mixed"])
    .describe("Overall sentiment of the review"),

  rating: z.number().min(1).max(5).describe("Inferred star rating if not explicitly stated"),

  categories: z
    .array(
      z.enum([
        "quality",
        "punctuality",
        "professionalism",
        "communication",
        "pricing",
        "cleanliness",
        "safety",
        "reliability",
      ])
    )
    .describe("Main categories discussed in review"),

  keyPoints: z
    .array(
      z.object({
        category: z.string().describe("What aspect this point relates to"),
        sentiment: z.enum(["positive", "negative", "neutral"]).describe("Sentiment of this point"),
        quote: z.string().describe("Relevant quote from review"),
      })
    )
    .describe("Key positive and negative points extracted"),

  actionRequired: z.boolean().describe("Whether admin review/action is needed"),

  severity: z
    .enum(["low", "medium", "high", "critical"])
    .describe("Severity level for admin attention"),

  flags: z
    .array(
      z.enum([
        "potential_safety_issue",
        "harassment_claim",
        "payment_dispute",
        "no_show",
        "property_damage",
        "theft_allegation",
        "fraudulent_activity",
        "exceptional_service",
        "none",
      ])
    )
    .describe("Specific flags that trigger immediate attention"),

  professionalImpact: z
    .object({
      affectsRating: z.boolean().describe("Should impact professional's rating"),
      suggestedAction: z
        .enum([
          "publish_immediately",
          "hold_for_review",
          "request_clarification",
          "escalate_to_manager",
          "contact_both_parties",
          "no_action",
        ])
        .describe("Recommended action for this review"),
      riskLevel: z
        .enum(["none", "low", "medium", "high"])
        .describe("Risk level to Casaora reputation"),
    })
    .describe("Impact assessment on professional and platform"),

  suggestedResponse: z
    .string()
    .optional()
    .describe("AI-generated suggested response for customer support"),

  language: z.enum(["en", "es", "mixed"]).describe("Language of the review"),
});

export type ReviewAnalysis = z.infer<typeof reviewAnalysisSchema>;

// ============================================================================
// 4. PROFESSIONAL MATCHING
// ============================================================================

/**
 * Schema for parsing user requirements into professional matching criteria
 *
 * Converts natural language into precise database query parameters.
 */
export const matchingCriteriaSchema = z.object({
  skills: z
    .array(z.string())
    .describe("Required skills (e.g., 'deep cleaning', 'pet care', 'eco-friendly products')"),

  languages: z
    .array(z.enum(["english", "spanish", "french", "portuguese"]))
    .describe("Required language capabilities"),

  availability: z
    .object({
      weekdays: z.boolean().describe("Available Monday-Friday"),
      weekends: z.boolean().describe("Available Saturday-Sunday"),
      evenings: z.boolean().describe("Available after 6pm"),
      mornings: z.boolean().describe("Available before 12pm"),
      flexible: z.boolean().describe("Has flexible schedule"),
    })
    .describe("Availability requirements"),

  experienceYears: z.number().min(0).describe("Minimum years of experience"),

  verificationLevel: z
    .enum(["basic", "verified", "premium", "any"])
    .optional()
    .describe("Required verification level"),

  maxDistance: z.number().optional().describe("Maximum distance in kilometers from user location"),

  priceRange: z
    .object({
      minHourlyRateCop: z.number().optional().describe("Minimum hourly rate"),
      maxHourlyRateCop: z.number().optional().describe("Maximum hourly rate"),
    })
    .optional()
    .describe("Price range filter"),

  specialRequirements: z
    .object({
      petFriendly: z.boolean().optional().describe("Comfortable with pets"),
      ownSupplies: z.boolean().optional().describe("Provides own cleaning supplies"),
      ecoFriendly: z.boolean().optional().describe("Uses eco-friendly products"),
      backgroundCheck: z.boolean().optional().describe("Has background check"),
      insurance: z.boolean().optional().describe("Has liability insurance"),
    })
    .optional()
    .describe("Special requirements"),

  preferredGender: z.enum(["male", "female", "any", "no_preference"]).optional(),

  minimumRating: z.number().min(0).max(5).optional().describe("Minimum average rating"),

  sortPreference: z
    .enum(["rating", "price_low", "price_high", "experience", "distance", "reviews_count"])
    .optional()
    .describe("How to sort matching results"),
});

export type MatchingCriteria = z.infer<typeof matchingCriteriaSchema>;

// ============================================================================
// 5. ADMIN ANALYTICS REPORTS
// ============================================================================

/**
 * Schema for generating structured admin analytics reports
 *
 * Summarizes platform data into actionable insights.
 */
export const adminAnalyticsSchema = z.object({
  reportPeriod: z
    .object({
      startDate: z.string().describe("Period start date (YYYY-MM-DD)"),
      endDate: z.string().describe("Period end date (YYYY-MM-DD)"),
    })
    .describe("Time period covered by this report"),

  metrics: z
    .object({
      bookings: z
        .object({
          total: z.number().describe("Total bookings"),
          completed: z.number().describe("Successfully completed bookings"),
          cancelled: z.number().describe("Cancelled bookings"),
          disputed: z.number().describe("Disputed bookings"),
          pendingPayment: z.number().describe("Bookings pending payment"),
        })
        .describe("Booking metrics"),

      revenue: z
        .object({
          totalCop: z.number().describe("Total revenue in COP"),
          averageBookingValueCop: z.number().describe("Average booking value"),
          growthPercentage: z.number().describe("Growth vs previous period"),
        })
        .describe("Revenue metrics"),

      professionals: z
        .object({
          active: z.number().describe("Active professionals"),
          newSignups: z.number().describe("New professional signups"),
          averageRating: z.number().describe("Average professional rating"),
          topPerformers: z
            .array(
              z.object({
                id: z.string().describe("Professional ID"),
                name: z.string().describe("Professional name"),
                bookings: z.number().describe("Number of bookings"),
                revenue: z.number().describe("Revenue generated"),
                rating: z.number().describe("Average rating"),
              })
            )
            .describe("Top 5 performing professionals"),
        })
        .describe("Professional metrics"),

      customers: z
        .object({
          active: z.number().describe("Active customers"),
          newSignups: z.number().describe("New customer signups"),
          repeatCustomerRate: z.number().describe("Percentage of repeat customers"),
          averageBookingsPerCustomer: z.number().describe("Average bookings per customer"),
        })
        .describe("Customer metrics"),
    })
    .describe("Key performance metrics"),

  insights: z
    .array(
      z.object({
        category: z
          .enum(["revenue", "growth", "quality", "retention", "operations", "marketing", "risk"])
          .describe("Insight category"),
        priority: z
          .enum(["critical", "high", "medium", "low"])
          .describe("Priority level for action"),
        observation: z.string().describe("What was observed in the data"),
        recommendation: z.string().describe("Recommended action to take"),
        expectedImpact: z
          .enum(["high", "medium", "low"])
          .optional()
          .describe("Expected impact if recommendation is implemented"),
      })
    )
    .describe("AI-generated insights and recommendations"),

  trends: z
    .object({
      popularServices: z
        .array(
          z.object({
            service: z.string().describe("Service name"),
            count: z.number().describe("Number of bookings"),
            trend: z.enum(["up", "down", "stable"]).describe("Trend direction"),
          })
        )
        .describe("Most popular services"),

      peakBookingTimes: z
        .array(
          z.object({
            timeSlot: z.string().describe("Time slot (e.g., '9am-12pm')"),
            dayOfWeek: z.string().describe("Day of week"),
            bookingCount: z.number().describe("Number of bookings"),
          })
        )
        .describe("Peak booking times"),

      locationAnalysis: z
        .array(
          z.object({
            city: z.string().describe("City name"),
            bookings: z.number().describe("Booking count"),
            averageValueCop: z.number().describe("Average booking value"),
            growth: z.number().describe("Growth percentage"),
          })
        )
        .describe("Performance by location"),
    })
    .describe("Trend analysis"),

  alerts: z
    .array(
      z.object({
        severity: z.enum(["critical", "warning", "info"]).describe("Alert severity"),
        message: z.string().describe("Alert message"),
        affectedArea: z.string().describe("Which area is affected"),
        suggestedAction: z.string().describe("What to do about it"),
      })
    )
    .optional()
    .describe("Urgent alerts requiring attention"),
});

export type AdminAnalytics = z.infer<typeof adminAnalyticsSchema>;

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const structuredSchemas = {
  bookingIntent: bookingIntentSchema,
  documentExtraction: documentExtractionSchema,
  reviewAnalysis: reviewAnalysisSchema,
  matchingCriteria: matchingCriteriaSchema,
  adminAnalytics: adminAnalyticsSchema,
} as const;
