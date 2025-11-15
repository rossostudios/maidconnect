import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke Test Configuration
 *
 * Runs a minimal subset of critical E2E tests for:
 * - PR validation on develop branch
 * - Staging deployment verification
 * - Pre-production smoke checks
 *
 * Covers essential user flows:
 * 1. Professional search and navigation
 * 2. Authentication gates (signup/login redirects)
 * 3. Booking flow happy path (unauthenticated state)
 */
export default defineConfig({
  testDir: "./tests/playwright/e2e",

  // Only run specific critical test files for smoke suite
  testMatch: ["**/booking-flow.spec.ts", "**/professional-onboarding.spec.ts"],

  // Grep pattern to run only smoke-critical tests
  // Matches tests that cover core navigation and auth gates
  grep: /(should display search page|should require authentication|should navigate to professional signup|should redirect to login when accessing)/,

  /* Run tests in parallel for speed */
  fullyParallel: true,

  /* Fail fast on CI for quick feedback */
  forbidOnly: true,

  /* Retry failed tests once on CI */
  retries: process.env.CI ? 1 : 0,

  /* Single worker on CI for stability */
  workers: process.env.CI ? 1 : 2,

  /* Use GitHub Actions reporter on CI, list otherwise */
  reporter: process.env.CI ? "github" : "list",

  /* Shared settings */
  use: {
    /* Base URL - can be overridden for staging */
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000",

    /* Faster timeouts for smoke tests */
    actionTimeout: 10_000,
    navigationTimeout: 15_000,

    /* Minimal tracing - only on failure */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Run on Chromium only for speed (full suite covers all browsers) */
  projects: [
    {
      name: "chromium-smoke",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Timeout configuration */
  timeout: 30_000, // 30s per test (smoke tests should be fast)
  expect: {
    timeout: 5000, // 5s for assertions
  },

  /* Web server configuration */
  webServer: process.env.CI
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60 * 1000,
      },
});
