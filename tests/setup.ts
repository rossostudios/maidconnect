/**
 * Global Test Setup
 *
 * This file runs before all tests via bunfig.toml's preload configuration.
 * Use it for:
 * - Setting up global test environment variables
 * - Configuring global mocks
 * - Setting up test utilities
 */

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================

// Set test environment
process.env.NODE_ENV = "test";

// Configure Next.js environment for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

// Stripe test keys
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_123";
process.env.STRIPE_SECRET_KEY = "sk_test_123";

// Disable analytics in tests
process.env.NEXT_PUBLIC_POSTHOG_KEY = "";
process.env.NEXT_PUBLIC_POSTHOG_HOST = "";

// ============================================================================
// GLOBAL MOCKS
// ============================================================================

// Mock console methods to reduce noise in test output
// Can be overridden in individual tests if needed
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: () => {},
  // Keep error and warn for debugging test failures
  error: console.error,
  warn: console.warn,
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Helper to restore console.log for specific tests
 *
 * @example
 * ```ts
 * import { restoreConsole } from '@/../tests/setup';
 *
 * describe('Debug tests', () => {
 *   beforeEach(() => {
 *     restoreConsole();
 *   });
 * });
 * ```
 */
export function restoreConsole() {
  global.console.log = console.log;
}

/**
 * Helper to suppress console output for specific tests
 */
export function suppressConsole() {
  global.console.log = () => {};
}

// ============================================================================
// CLEANUP
// ============================================================================

// Global test cleanup - runs after all tests
// Can be used to clear any global state or close connections
