/**
 * Environment Variable Validation
 *
 * This file validates all environment variables at application startup.
 * Import this at the top of your root layout or API entry point to ensure
 * the app fails fast with clear error messages if configuration is invalid.
 *
 * @example
 * // In src/app/layout.tsx or pages/_app.tsx
 * import '@/env';
 */

import { validateEnv } from "./lib/validations/env";

// Validate environment variables at startup
// This will throw an error if any required env vars are missing or invalid
let env: ReturnType<typeof validateEnv> | null = null;

try {
  env = validateEnv();
  console.log("✅ Environment variables validated successfully");
} catch (error) {
  console.error("❌ Environment validation failed:", error);
  // In development, we want to see the error clearly
  if (process.env.NODE_ENV === "development") {
    throw error;
  }
  // In production, we still throw but the error is already logged
  throw new Error("Invalid environment configuration. Check server logs for details.");
}

// Export validated env for type-safe access throughout the app
export { env };
