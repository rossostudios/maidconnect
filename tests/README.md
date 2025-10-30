# Maidconnect Testing Suite

This directory contains end-to-end (E2E) tests for the Maidconnect platform using Playwright.

## Structure

```
tests/
├── e2e/                    # End-to-end test files
│   ├── homepage.spec.ts    # Homepage and navigation tests
│   ├── authentication.spec.ts  # Login, signup, logout tests
│   ├── booking-flow.spec.ts    # Booking creation and management
│   └── accessibility.spec.ts   # Accessibility compliance tests
└── utils/                  # Test helper functions
    └── test-helpers.ts     # Reusable test utilities
```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests with step-through
npm run test:debug

# View test report
npm run test:report
```

## Test Coverage

### Homepage Tests
- Page loading and SEO
- Hero section and CTAs
- Navigation functionality
- Cookie consent banner
- Responsive design
- Footer links

### Authentication Tests
- Signup form validation
- Login form validation
- User type selection
- Password visibility toggle
- Protected route redirection
- Error handling

### Booking Flow Tests
- Professional search and filtering
- Professional profile viewing
- Booking creation (requires auth)
- Booking management
- Payment flow (Stripe integration)

### Accessibility Tests
- Keyboard navigation
- ARIA labels and roles
- Color contrast
- Focus indicators
- Screen reader support
- Mobile responsiveness

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e` directory
2. Import test helpers from `utils/test-helpers.ts`
3. Use descriptive test names and group related tests
4. Follow the existing patterns for consistency

Example:

```typescript
import { test, expect } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

test.describe("Feature Name", () => {
  test("should do something", async ({ page }) => {
    await navigateTo(page, "/path");
    // Test assertions
  });
});
```

## Test Data

Most tests are designed to work without requiring specific test data in the database. Tests that require authenticated users or specific data are marked with `test.skip()` and can be enabled when test data is available.

## CI/CD Integration

Playwright tests are configured to run in CI environments with:
- Automatic retries (2 retries on failure)
- Screenshot capture on failure
- Trace collection for debugging
- HTML report generation

## Best Practices

1. **Use data-testid attributes** - For stable element selection
2. **Avoid timing dependencies** - Use `waitForSelector` instead of `waitForTimeout` when possible
3. **Keep tests independent** - Each test should be able to run in isolation
4. **Clean up after tests** - Reset state when needed
5. **Use meaningful assertions** - Make test failures easy to understand
6. **Group related tests** - Use `test.describe()` blocks for organization

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root. Key settings:

- **Test directory**: `./tests`
- **Base URL**: `http://localhost:3000` (dev server)
- **Browsers**: Chromium, Firefox, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Reporters**: HTML report with screenshots and traces

## Debugging

When a test fails:

1. Check the HTML report: `npm run test:report`
2. View screenshots in `test-results/` directory
3. Inspect traces for detailed timeline
4. Run specific test with `--debug` flag:
   ```bash
   npx playwright test tests/e2e/homepage.spec.ts --debug
   ```

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
