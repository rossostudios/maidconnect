import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/playwright/e2e",
  testMatch: "**/*.spec.ts", // Only run Playwright spec files from the reorganized folder

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs authentication before all tests
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Customer-authenticated projects
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/playwright/.auth/customer.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/playwright/.auth/customer.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/playwright/.auth/customer.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        storageState: "tests/playwright/.auth/customer.json",
      },
      dependencies: ["setup"],
    },

    // Professional-authenticated projects (for professional dashboard tests)
    {
      name: "professional-chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/playwright/.auth/professional.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "professional-firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/playwright/.auth/professional.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "professional-mobile",
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/playwright/.auth/professional.json",
      },
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
