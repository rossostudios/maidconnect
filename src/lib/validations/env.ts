import { z } from "zod";

/**
 * Environment Variable Validation Schema
 *
 * Validates all required and optional environment variables at application startup.
 * This ensures the app fails fast with clear error messages if configuration is invalid.
 */

// URL validation helper
const urlSchema = z.string().url();

// Email validation helper
const emailSchema = z.string().email();

/**
 * Server-side environment variables schema
 * These are only available on the server (API routes, server components)
 */
export const serverEnvSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: urlSchema,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  // Resend (Email)
  RESEND_API_KEY: z.string().startsWith("re_"),

  // Application URLs
  NEXT_PUBLIC_BASE_URL: urlSchema,
  NEXT_PUBLIC_APP_URL: urlSchema,
  SITE_URL: urlSchema,

  // Cron Jobs
  CRON_SECRET: z.string().min(20),

  // VAPID (Push Notifications)
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: emailSchema,

  // Better Stack (Logtail)
  LOGTAIL_SOURCE_TOKEN: z.string().optional(),
  NEXT_PUBLIC_LOGTAIL_TOKEN: z.string().optional(),

  // Upstash Redis (optional - falls back to in-memory)
  UPSTASH_REDIS_REST_URL: urlSchema.optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Optional services
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Feature Flags (optional)
  NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_ENHANCED_TRUST_BADGES: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_LIVE_PRICE_BREAKDOWN: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_AUTO_TRANSLATE_CHAT: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_ONE_TAP_REBOOK: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_RECURRING_PLANS: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

/**
 * Client-side environment variables schema
 * Only NEXT_PUBLIC_* variables are available on the client
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: urlSchema,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  NEXT_PUBLIC_BASE_URL: urlSchema,
  NEXT_PUBLIC_APP_URL: urlSchema,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  NEXT_PUBLIC_LOGTAIL_TOKEN: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Feature flags
  NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_ENHANCED_TRUST_BADGES: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_LIVE_PRICE_BREAKDOWN: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_AUTO_TRANSLATE_CHAT: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_ONE_TAP_REBOOK: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  NEXT_PUBLIC_FEATURE_RECURRING_PLANS: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

// Export types for TypeScript autocomplete
type ServerEnv = z.infer<typeof serverEnvSchema>;
type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates environment variables and throws detailed error if invalid
 */
export function validateEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Invalid environment variables. Check the console for details.");
  }

  return parsed.data;
}
