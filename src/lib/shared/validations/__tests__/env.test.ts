import { describe, expect, it } from "vitest";
import { clientEnvSchema, serverEnvSchema } from "../env";

// ============================================================================
// SERVER ENVIRONMENT SCHEMA
// ============================================================================

describe("serverEnvSchema", () => {
  // Base valid environment for testing
  const validServerEnv = {
    NODE_ENV: "development",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-123",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key-123",
    STRIPE_SECRET_KEY: "sk_test_123456789",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123456789",
    STRIPE_WEBHOOK_SECRET: "whsec_123456789",
    RESEND_API_KEY: "re_123456789",
    NEXT_PUBLIC_BASE_URL: "https://example.com",
    NEXT_PUBLIC_APP_URL: "https://app.example.com",
    SITE_URL: "https://example.com",
    CRON_SECRET: "super-secret-cron-key-123456789",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: "vapid-public-key",
    VAPID_PRIVATE_KEY: "vapid-private-key",
    VAPID_SUBJECT: "contact@example.com",
  };

  describe("NODE_ENV", () => {
    it("accepts development", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NODE_ENV: "development",
      });
      expect(result.success).toBe(true);
    });

    it("accepts production", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NODE_ENV: "production",
      });
      expect(result.success).toBe(true);
    });

    it("accepts test", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NODE_ENV: "test",
      });
      expect(result.success).toBe(true);
    });

    it("defaults to development when not provided", () => {
      const env = { ...validServerEnv };
      env.NODE_ENV = undefined;
      const result = serverEnvSchema.safeParse(env);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe("development");
      }
    });

    it("rejects invalid values", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NODE_ENV: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Supabase credentials", () => {
    it("requires valid Supabase URL", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid Supabase URL", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      });
      expect(result.success).toBe(false);
    });

    it("requires anon key", () => {
      const env = { ...validServerEnv };
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("requires service role key", () => {
      const env = { ...validServerEnv };
      env.SUPABASE_SERVICE_ROLE_KEY = undefined;
      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });
  });

  describe("Stripe credentials", () => {
    it("requires secret key to start with sk_", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        STRIPE_SECRET_KEY: "sk_test_valid",
      });
      expect(result.success).toBe(true);
    });

    it("rejects secret key without sk_ prefix", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        STRIPE_SECRET_KEY: "invalid_key",
      });
      expect(result.success).toBe(false);
    });

    it("requires publishable key to start with pk_", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_valid",
      });
      expect(result.success).toBe(true);
    });

    it("rejects publishable key without pk_ prefix", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "invalid_key",
      });
      expect(result.success).toBe(false);
    });

    it("requires webhook secret to start with whsec_", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        STRIPE_WEBHOOK_SECRET: "whsec_test_valid",
      });
      expect(result.success).toBe(true);
    });

    it("rejects webhook secret without whsec_ prefix", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        STRIPE_WEBHOOK_SECRET: "invalid_secret",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Resend API key", () => {
    it("requires API key to start with re_", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        RESEND_API_KEY: "re_abc123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects API key without re_ prefix", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        RESEND_API_KEY: "invalid_key",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Application URLs", () => {
    it("requires valid BASE_URL", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_BASE_URL: "https://casaora.co",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid BASE_URL", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_BASE_URL: "not-a-url",
      });
      expect(result.success).toBe(false);
    });

    it("requires valid APP_URL", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_APP_URL: "https://app.casaora.co",
      });
      expect(result.success).toBe(true);
    });

    it("requires valid SITE_URL", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        SITE_URL: "https://casaora.co",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("CRON_SECRET", () => {
    it("requires minimum 20 characters", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        CRON_SECRET: "a".repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it("rejects secrets shorter than 20 characters", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        CRON_SECRET: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("VAPID credentials", () => {
    it("requires public key", () => {
      const env = { ...validServerEnv };
      env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = undefined;
      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("requires private key", () => {
      const env = { ...validServerEnv };
      env.VAPID_PRIVATE_KEY = undefined;
      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("requires valid email for VAPID_SUBJECT", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        VAPID_SUBJECT: "admin@casaora.co",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email for VAPID_SUBJECT", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        VAPID_SUBJECT: "not-an-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Optional services", () => {
    it("accepts valid Logtail tokens", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        LOGTAIL_SOURCE_TOKEN: "token_123",
        NEXT_PUBLIC_LOGTAIL_TOKEN: "public_token_123",
      });
      expect(result.success).toBe(true);
    });

    it("accepts missing Logtail tokens", () => {
      const env = { ...validServerEnv };
      env.LOGTAIL_SOURCE_TOKEN = undefined;
      env.NEXT_PUBLIC_LOGTAIL_TOKEN = undefined;
      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(true);
    });

    it("accepts valid Upstash Redis URL", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        UPSTASH_REDIS_REST_URL: "https://redis.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "token_123",
      });
      expect(result.success).toBe(true);
    });

    it("accepts missing Upstash Redis credentials", () => {
      const env = { ...validServerEnv };
      env.UPSTASH_REDIS_REST_URL = undefined;
      env.UPSTASH_REDIS_REST_TOKEN = undefined;
      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(true);
    });

    it("accepts missing Google Maps API key", () => {
      const env = { ...validServerEnv };
      env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;
      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(true);
    });

    it("accepts missing Google Analytics ID", () => {
      const env = { ...validServerEnv };
      env.NEXT_PUBLIC_GA_MEASUREMENT_ID = undefined;
      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(true);
    });
  });

  describe("Feature flags", () => {
    it("transforms 'true' string to boolean true", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS: "true",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS).toBe(true);
      }
    });

    it("transforms 'false' string to boolean false", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS: "false",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS).toBe(false);
      }
    });

    it("rejects non-boolean strings for feature flags", () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS: "yes",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all feature flags as optional", () => {
      const env = { ...validServerEnv };
      env.NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS = undefined;
      env.NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD = undefined;
      env.NEXT_PUBLIC_FEATURE_ENHANCED_TRUST_BADGES = undefined;
      env.NEXT_PUBLIC_FEATURE_LIVE_PRICE_BREAKDOWN = undefined;
      env.NEXT_PUBLIC_FEATURE_AUTO_TRANSLATE_CHAT = undefined;
      env.NEXT_PUBLIC_FEATURE_ONE_TAP_REBOOK = undefined;
      env.NEXT_PUBLIC_FEATURE_RECURRING_PLANS = undefined;

      const result = serverEnvSchema.safeParse(env);
      expect(result.success).toBe(true);
    });
  });

  describe("Complete valid environment", () => {
    it("validates complete valid server environment", () => {
      const result = serverEnvSchema.safeParse(validServerEnv);
      expect(result.success).toBe(true);
    });

    it("provides detailed error messages for invalid env", () => {
      const invalidEnv = {
        ...validServerEnv,
        STRIPE_SECRET_KEY: "invalid",
        NEXT_PUBLIC_BASE_URL: "not-a-url",
      };

      const result = serverEnvSchema.safeParse(invalidEnv);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});

// ============================================================================
// CLIENT ENVIRONMENT SCHEMA
// ============================================================================

describe("clientEnvSchema", () => {
  const validClientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-123",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123456789",
    NEXT_PUBLIC_BASE_URL: "https://example.com",
    NEXT_PUBLIC_APP_URL: "https://app.example.com",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: "vapid-public-key",
  };

  describe("required client variables", () => {
    it("validates complete valid client environment", () => {
      const result = clientEnvSchema.safeParse(validClientEnv);
      expect(result.success).toBe(true);
    });

    it("requires Supabase URL", () => {
      const env = { ...validClientEnv };
      env.NEXT_PUBLIC_SUPABASE_URL = undefined;
      const result = clientEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("requires Supabase anon key", () => {
      const env = { ...validClientEnv };
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
      const result = clientEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("requires Stripe publishable key", () => {
      const env = { ...validClientEnv };
      env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = undefined;
      const result = clientEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("requires base URL", () => {
      const env = { ...validClientEnv };
      env.NEXT_PUBLIC_BASE_URL = undefined;
      const result = clientEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("requires app URL", () => {
      const env = { ...validClientEnv };
      env.NEXT_PUBLIC_APP_URL = undefined;
      const result = clientEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it("requires VAPID public key", () => {
      const env = { ...validClientEnv };
      env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = undefined;
      const result = clientEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });
  });

  describe("optional client variables", () => {
    it("accepts optional Logtail token", () => {
      const result = clientEnvSchema.safeParse({
        ...validClientEnv,
        NEXT_PUBLIC_LOGTAIL_TOKEN: "token_123",
      });
      expect(result.success).toBe(true);
    });

    it("accepts missing Logtail token", () => {
      const result = clientEnvSchema.safeParse(validClientEnv);
      expect(result.success).toBe(true);
    });

    it("accepts optional Google Maps API key", () => {
      const result = clientEnvSchema.safeParse({
        ...validClientEnv,
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "AIza_123",
      });
      expect(result.success).toBe(true);
    });

    it("accepts optional Google Analytics ID", () => {
      const result = clientEnvSchema.safeParse({
        ...validClientEnv,
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-123456",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("client feature flags", () => {
    it("transforms string feature flags to booleans", () => {
      const result = clientEnvSchema.safeParse({
        ...validClientEnv,
        NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS: "true",
        NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD: "false",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS).toBe(true);
        expect(result.data.NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD).toBe(false);
      }
    });

    it("accepts all feature flags as optional", () => {
      const result = clientEnvSchema.safeParse(validClientEnv);
      expect(result.success).toBe(true);
    });
  });

  describe("security: no server-only variables", () => {
    it("does not include server-only keys", () => {
      const clientKeys = Object.keys(clientEnvSchema.shape);

      // Server-only keys should NOT be in client schema
      expect(clientKeys).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(clientKeys).not.toContain("STRIPE_SECRET_KEY");
      expect(clientKeys).not.toContain("STRIPE_WEBHOOK_SECRET");
      expect(clientKeys).not.toContain("RESEND_API_KEY");
      expect(clientKeys).not.toContain("CRON_SECRET");
      expect(clientKeys).not.toContain("VAPID_PRIVATE_KEY");
    });
  });
});

// ============================================================================
// SCHEMA CONSISTENCY
// ============================================================================

describe("Schema consistency between server and client", () => {
  it("client schema is subset of server schema for NEXT_PUBLIC vars", () => {
    const serverKeys = Object.keys(serverEnvSchema.shape);
    const clientKeys = Object.keys(clientEnvSchema.shape);

    // All client keys should exist in server schema
    for (const key of clientKeys) {
      expect(serverKeys).toContain(key);
    }
  });

  it("all NEXT_PUBLIC vars in server are in client", () => {
    const serverKeys = Object.keys(serverEnvSchema.shape);
    const clientKeys = Object.keys(clientEnvSchema.shape);

    const publicServerKeys = serverKeys.filter((key) => key.startsWith("NEXT_PUBLIC_"));

    for (const key of publicServerKeys) {
      expect(clientKeys).toContain(key);
    }
  });
});
